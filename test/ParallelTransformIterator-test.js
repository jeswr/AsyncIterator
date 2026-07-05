import {
  AsyncIterator,
  BufferedIterator,
  TransformIterator,
  ParallelTransformIterator,
  EmptyIterator,
  fromArray,
} from '../dist/asynciterator.js';

import { EventEmitter } from 'events';

// Resolves with the given value after the given delay
function delayed(value, ms) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// Rejects with the given error after the given delay
function delayedError(error, ms) {
  return new Promise((resolve, reject) => setTimeout(() => reject(error), ms));
}

describe('ParallelTransformIterator', () => {
  describe('The ParallelTransformIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance;
      before(() => { instance = new ParallelTransformIterator(); });

      it('should be a ParallelTransformIterator object', () => {
        instance.should.be.an.instanceof(ParallelTransformIterator);
      });

      it('should be a TransformIterator object', () => {
        instance.should.be.an.instanceof(TransformIterator);
      });

      it('should be a BufferedIterator object', () => {
        instance.should.be.an.instanceof(BufferedIterator);
      });

      it('should be an AsyncIterator object', () => {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called through `parallelMap`', () => {
      let instance;
      before(() => { instance = fromArray([1, 2, 3]).parallelMap(item => Promise.resolve(item)); });

      it('should be a ParallelTransformIterator object', () => {
        instance.should.be.an.instanceof(ParallelTransformIterator);
      });

      it('should be an AsyncIterator object', () => {
        instance.should.be.an.instanceof(AsyncIterator);
      });
    });
  });

  describe('A ParallelTransformIterator', () => {
    describe('without mapping function', () => {
      it('should emit the source items unchanged', async () => {
        const iterator = new ParallelTransformIterator(fromArray([1, 2, 3]));
        (await iterator.toArray()).should.deep.equal([1, 2, 3]);
      });
    });

    describe('with an asynchronous mapping function', () => {
      it('should emit the mapped items', async () => {
        const iterator = fromArray([1, 2, 3, 4])
          .parallelMap(item => Promise.resolve(item * 2));
        (await iterator.toArray()).should.deep.equal([2, 4, 6, 8]);
      });

      it('should emit items in source order despite unequal mapping delays', async () => {
        const items = [...new Array(16).keys()];
        const iterator = fromArray(items)
          .parallelMap(item => delayed(item, (item * 7) % 13), { concurrency: 4 });
        (await iterator.toArray()).should.deep.equal(items);
      });

      it('should support a synchronously returning mapping function', async () => {
        const iterator = fromArray([1, 2, 3])
          .parallelMap(item => item * 10);
        (await iterator.toArray()).should.deep.equal([10, 20, 30]);
      });

      it('should support a `this` pointer for the mapping function', async () => {
        const self = { factor: 3 };
        const iterator = fromArray([1, 2, 3])
          .parallelMap(function (item) { return Promise.resolve(item * this.factor); }, {}, self);
        (await iterator.toArray()).should.deep.equal([3, 6, 9]);
      });

      it('should skip items that map to `null`', async () => {
        const iterator = fromArray([1, 2, 3, 4])
          .parallelMap(item => Promise.resolve(item % 2 === 0 ? item : null));
        (await iterator.toArray()).should.deep.equal([2, 4]);
      });

      it('should emit the original item for `null` mappings when optional', async () => {
        const iterator = new ParallelTransformIterator(fromArray([1, 2, 3]), {
          map: item => Promise.resolve(item === 2 ? null : item * 10),
          optional: true,
        });
        (await iterator.toArray()).should.deep.equal([10, 2, 30]);
      });
    });

    describe('created with the mapping function as options', () => {
      it('should emit the mapped items', async () => {
        const iterator = new ParallelTransformIterator(fromArray([1, 2, 3]),
          item => Promise.resolve(item + 1));
        (await iterator.toArray()).should.deep.equal([2, 3, 4]);
      });
    });

    describe('created with only an options object', () => {
      it('should emit the mapped items once a source is set', async () => {
        const iterator = new ParallelTransformIterator({ map: item => Promise.resolve(item + 1) });
        iterator.source = fromArray([1, 2, 3]);
        (await iterator.toArray()).should.deep.equal([2, 3, 4]);
      });
    });

    describe('created with a promise to a source', () => {
      it('should emit the mapped items', async () => {
        const iterator = new ParallelTransformIterator(Promise.resolve(fromArray([1, 2, 3])),
          { map: item => Promise.resolve(item * 2) });
        (await iterator.toArray()).should.deep.equal([2, 4, 6]);
      });
    });

    describe('with an empty source', () => {
      it('should end without calling the mapping function', async () => {
        let calls = 0;
        const iterator = new EmptyIterator()
          .parallelMap(item => { calls++; return Promise.resolve(item); });
        (await iterator.toArray()).should.deep.equal([]);
        calls.should.equal(0);
      });

      it('should end on an empty array source', async () => {
        const iterator = fromArray([]).parallelMap(item => Promise.resolve(item));
        (await iterator.toArray()).should.deep.equal([]);
      });
    });

    describe('without autoStart', () => {
      it('should not start mapping until read', async () => {
        let calls = 0;
        const iterator = new ParallelTransformIterator(fromArray([1, 2, 3]), {
          autoStart: false,
          map: item => { calls++; return Promise.resolve(item); },
        });
        await delayed(null, 10);
        calls.should.equal(0);
        (await iterator.toArray()).should.deep.equal([1, 2, 3]);
        calls.should.equal(3);
      });
    });
  });

  describe('The concurrency of a ParallelTransformIterator', () => {
    it('should default to 4', () => {
      new ParallelTransformIterator().concurrency.should.equal(4);
    });

    it('should be settable through the constructor', () => {
      new ParallelTransformIterator(null, { concurrency: 7 }).concurrency.should.equal(7);
    });

    it('should truncate fractional values', () => {
      const iterator = new ParallelTransformIterator();
      iterator.concurrency = 3.7;
      iterator.concurrency.should.equal(3);
    });

    it('should allow a minimum of 1', () => {
      const iterator = new ParallelTransformIterator();
      iterator.concurrency = 0;
      iterator.concurrency.should.equal(1);
      iterator.concurrency = -37;
      iterator.concurrency.should.equal(1);
    });

    it('should default to 4 on invalid values', () => {
      const iterator = new ParallelTransformIterator(null, { concurrency: 2 });
      iterator.concurrency = NaN;
      iterator.concurrency.should.equal(4);
    });

    it('should allow Infinity', () => {
      const iterator = new ParallelTransformIterator();
      iterator.concurrency = Infinity;
      iterator.concurrency.should.equal(Infinity);
    });

    it('should not change when set to the same value', () => {
      const iterator = new ParallelTransformIterator();
      iterator.concurrency = 4;
      iterator.concurrency.should.equal(4);
    });

    it('should be changeable while the iterator is open', async () => {
      const iterator = fromArray([...new Array(6).keys()])
        .parallelMap(item => delayed(item, 10), { concurrency: 1 });
      await delayed(null, 5);
      iterator.concurrency = 6;
      iterator.concurrency.should.equal(6);
      (await iterator.toArray()).should.deep.equal([0, 1, 2, 3, 4, 5]);
    });
  });

  describe('A ParallelTransformIterator running mappings concurrently', () => {
    it('should run no more mappings than the concurrency limit', async () => {
      let active = 0, maxActive = 0;
      const iterator = fromArray([...new Array(8).keys()])
        .parallelMap(async item => {
          maxActive = Math.max(maxActive, ++active);
          const result = await delayed(item, 15);
          active--;
          return result;
        }, { concurrency: 4 });
      (await iterator.toArray()).should.deep.equal([...new Array(8).keys()]);
      maxActive.should.equal(4);
    });

    it('should run mappings one at a time with a concurrency of 1', async () => {
      let active = 0, maxActive = 0;
      const items = [...new Array(6).keys()];
      const iterator = fromArray(items)
        .parallelMap(async item => {
          maxActive = Math.max(maxActive, ++active);
          const result = await delayed(item * 2, 5);
          active--;
          return result;
        }, { concurrency: 1 });
      (await iterator.toArray()).should.deep.equal(items.map(item => item * 2));
      maxActive.should.equal(1);
    });

    it('should map all available items simultaneously with a concurrency of Infinity', async () => {
      let active = 0, maxActive = 0;
      const iterator = fromArray([...new Array(6).keys()])
        .parallelMap(async item => {
          maxActive = Math.max(maxActive, ++active);
          const result = await delayed(item, 15);
          active--;
          return result;
        }, { concurrency: Infinity });
      (await iterator.toArray()).should.deep.equal([...new Array(6).keys()]);
      maxActive.should.equal(6);
    });

    it('should overlap mapping delays instead of serializing them', async () => {
      const start = Date.now();
      const iterator = fromArray([...new Array(8).keys()])
        .parallelMap(item => delayed(item, 15), { concurrency: 8 });
      (await iterator.toArray()).should.deep.equal([...new Array(8).keys()]);
      // Sequential execution would take at least 8 * 15ms = 120ms
      (Date.now() - start).should.be.below(100);
    });

    it('should not map further ahead than the buffer and concurrency allow', async () => {
      let calls = 0;
      const iterator = fromArray([...new Array(100).keys()])
        .parallelMap(item => { calls++; return Promise.resolve(item); });
      // Wait without reading, so only the buffer and the concurrency slots may fill
      await delayed(null, 20);
      calls.should.be.at.most(8);
      (await iterator.toArray()).should.have.length(100);
      calls.should.equal(100);
    });
  });

  describe('A ParallelTransformIterator with erroring mappings', () => {
    it('should emit a rejection at the position of the erroring item', done => {
      const settled = [];
      const iterator = fromArray([0, 1, 2, 3, 4])
        .parallelMap(item => {
          if (item === 2)
            return delayedError(new Error('mapping error'), 1);
          return delayed(item, 30 - item * 5).then(result => {
            settled.push(item);
            return result;
          });
        }, { concurrency: 5 });
      const items = [];
      iterator.on('data', item => { items.push(item); });
      iterator.on('error', error => {
        error.should.have.property('message', 'mapping error');
        // The error may only be emitted after all preceding mappings have settled
        settled.should.include(0);
        settled.should.include(1);
      });
      iterator.on('end', () => {
        items.should.deep.equal([0, 1, 3, 4]);
        done();
      });
    });

    it('should emit an error when the mapping function throws synchronously', done => {
      const iterator = fromArray([0, 1, 2])
        .parallelMap(item => {
          if (item === 1)
            throw new Error('synchronous error');
          return Promise.resolve(item);
        });
      const items = [];
      iterator.on('data', item => { items.push(item); });
      iterator.on('error', error => {
        error.should.have.property('message', 'synchronous error');
      });
      iterator.on('end', () => {
        items.should.deep.equal([0, 2]);
        done();
      });
    });

    it('should speculatively map items beyond an erroring item', done => {
      const mapped = [];
      const iterator = fromArray([0, 1, 2, 3])
        .parallelMap(item => {
          mapped.push(item);
          if (item === 0)
            return delayedError(new Error('early error'), 1);
          return delayed(item, 10);
        }, { concurrency: 4 });
      iterator.on('error', () => { /* the iterator continues after an error */ });
      iterator.on('end', () => {
        // All items were passed to the mapping function, despite the error on the first
        mapped.should.deep.equal([0, 1, 2, 3]);
        done();
      });
      iterator.on('data', () => { /* drain */ });
    });

    it('should stop mapping new items when closed from an error listener', done => {
      let calls = 0;
      const iterator = fromArray([...new Array(8).keys()])
        .parallelMap(item => {
          calls++;
          if (item === 0)
            return delayedError(new Error('first error'), 1);
          return delayed(item, 20);
        }, { concurrency: 2 });
      captureEvents(iterator, 'data', 'end');
      iterator.on('error', () => { iterator.close(); });
      setTimeout(() => {
        calls.should.equal(2);
        iterator.ended.should.be.true;
        done();
      }, 60);
    });
  });

  describe('A ParallelTransformIterator that is destroyed', () => {
    it('should ignore mappings that settle afterwards', done => {
      const rejections = [];
      const onRejection = error => { rejections.push(error); };
      process.on('unhandledRejection', onRejection);

      const iterator = fromArray([...new Array(6).keys()])
        .parallelMap(item => item === 0 ? delayedError(new Error('late error'), 20) : delayed(item, 20),
          { concurrency: 4 });
      captureEvents(iterator, 'data', 'error', 'end');
      setTimeout(() => { iterator.destroy(); }, 5);
      setTimeout(() => {
        process.removeListener('unhandledRejection', onRejection);
        rejections.should.have.length(0);
        iterator.destroyed.should.be.true;
        iterator._eventCounts.data.should.equal(0);
        iterator._eventCounts.error.should.equal(0);
        iterator._eventCounts.end.should.equal(0);
        done();
      }, 60);
    });

    it('should destroy its source by default', done => {
      const source = fromArray([...new Array(100).keys()]);
      const iterator = source.parallelMap(item => delayed(item, 10));
      setTimeout(() => { iterator.destroy(); }, 5);
      setTimeout(() => {
        source.done.should.be.true;
        done();
      }, 30);
    });
  });
});
