import {
  AsyncIterator,
  UnionIterator,
  ArrayIterator,
  BufferedIterator,
  EmptyIterator,
  union,
  range,
  scheduleTask,
} from '../asynciterator';

import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('UnionIterator', () => {
  describe('The UnionIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: UnionIterator<never>;
      beforeEach(() => { instance = new UnionIterator([]); });

      it('should be a UnionIterator object', () => {
        expect(instance).toBeInstanceOf(UnionIterator);
      });

      it('should be a AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });

    describe('the result when called through `union`', () => {
      let instance: UnionIterator<never>;
      beforeEach(() => { instance = union<never>([]); });

      it('should be an UnionIterator object', () => {
        expect(instance).toBeInstanceOf(UnionIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  it('should include all data from 3 sources', async () => {
    const iterator = new UnionIterator([
      range(0, 2),
      range(3, 4),
      range(5, 6),
    ]);
    (await toArray(iterator)).sort().should.eql([0, 1, 2, 3, 4, 5, 6]);
  });

  it('should include all data from 1 non-empty and 4 empty sources', async () => {
    const iterator = new UnionIterator([
      new EmptyIterator(),
      new EmptyIterator(),
      range(0, 2),
      new EmptyIterator(),
      new EmptyIterator(),
    ]);
    (await toArray(iterator)).sort().should.eql([0, 1, 2]);
  });

  describe('when constructed with an array of 0 sources', () => {
    let iterator;
    beforeEach(() => {
      const sources = [];
      iterator = new UnionIterator(sources);
    });

    it('should have ended', () => {
      expect(iterator.ended).toBe(true);
    });
  });

  describe('when constructed with an array of 0 sources without autoStart', () => {
    let iterator;
    beforeEach(() => {
      const sources = [];
      iterator = new UnionIterator(sources, { autoStart: false });
    });

    describe('before reading', () => {
      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after reading', () => {
      beforeEach(done => {
        iterator.read();
        scheduleTask(done);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });
    });
  });

  describe('when constructed with an array of 1 source', () => {
    let iterator;
    beforeEach(() => {
      const sources = [range(0, 2)];
      iterator = new UnionIterator(sources);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });
  });

  describe('when constructed with an array of 2 sources', () => {
    let iterator;
    beforeEach(() => {
      const sources = [range(0, 2), range(3, 6)];
      iterator = new UnionIterator(sources);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });
  });

  describe('when constructed with an empty iterator', () => {
    let iterator;
    beforeEach(() => {
      iterator = new UnionIterator(new EmptyIterator());
    });

    it('should have ended', () => {
      expect(iterator.ended).toBe(true);
    });
  });

  describe('when constructed with an iterator of 0 sources', () => {
    let iterator;
    beforeEach(() => {
      const sources = [];
      iterator = new UnionIterator(new ArrayIterator(sources));
    });

    it('should have ended', () => {
      expect(iterator.ended).toBe(true);
    });
  });

  describe('when constructed with an iterator of 0 sources without autoStart', () => {
    let iterator;
    beforeEach(() => {
      const sources = [];
      iterator = new UnionIterator(new ArrayIterator(sources), { autoStart: false });
    });

    describe('before reading', () => {
      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after reading', () => {
      beforeEach(done => {
        iterator.read();
        scheduleTask(done);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });
    });
  });

  describe('when constructed with an iterator of 1 source', () => {
    let iterator;
    beforeEach(() => {
      const sources = [range(0, 2)];
      iterator = new UnionIterator(new ArrayIterator(sources));
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });
  });

  describe('when constructed with an iterator of 2 sources', () => {
    let iterator;
    beforeEach(() => {
      const sources = [range(0, 2), range(3, 6)];
      iterator = new UnionIterator(new ArrayIterator(sources));
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });
  });

  describe('when the source iterator emits an error', () => {
    let callback, error;
    beforeEach(() => {
      const sources = new BufferedIterator();
      const iterator = new UnionIterator(sources);
      iterator.on('error', callback = sinon.spy());
      sources.emit('error', error = new Error('error'));
    });

    it('should emit the error', () => {
      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith(error);
    });
  });

  describe('when constructed with an iterator and with autoStart', () => {
    let iterator, sourceIterator;
    beforeEach(() => {
      const sources = [range(0, 2), range(3, 6)];
      sourceIterator = new ArrayIterator(sources);
      sinon.spy(sourceIterator, 'read');
      iterator = new UnionIterator(sourceIterator, { autoStart: true });
    });

    describe('before reading', () => {
      it('should have read the sources', () => {
        sourceIterator.read.should.have.been.called;
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should pass errors', () => {
        const callback = sinon.spy();
        const error = new Error('error');
        iterator.once('error', callback);
        sourceIterator.emit('error', error);
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith(error);
      });
    });

    describe('after reading', () => {
      let items;
      beforeEach(async () => {
        items = (await toArray(iterator)).sort();
      });

      it('should have emitted all items', () => {
        items.should.eql([0, 1, 2, 3, 4, 5, 6]);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });
    });
  });

  describe('when constructed with an iterator and without autoStart', () => {
    let iterator, sourceIterator;
    beforeEach(() => {
      const sources = [range(0, 2), range(3, 6)];
      sourceIterator = new ArrayIterator(sources);
      sinon.spy(sourceIterator, 'read');
      iterator = new UnionIterator(sourceIterator, { autoStart: false });
    });

    describe('before reading', () => {
      it('should not have read the sources', () => {
        sourceIterator.read.should.not.have.been.called;
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should pass errors', () => {
        const callback = sinon.spy();
        const error = new Error('error');
        iterator.once('error', callback);
        sourceIterator.emit('error', error);
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith(error);
      });
    });

    describe('after reading', () => {
      let items;
      beforeEach(async () => {
        items = (await toArray(iterator)).sort();
      });

      it('should have read the sources', () => {
        sourceIterator.read.should.have.been.called;
      });

      it('should have emitted all items', () => {
        items.should.eql([0, 1, 2, 3, 4, 5, 6]);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });
    });
  });

  describe('a UnionIterator with two sources', () => {
    let iterator, sources;

    beforeEach(() => {
      sources = [
        range(0, 2),
        range(3, 6),
      ];
      iterator = new UnionIterator(sources);
    });

    it('should emit an error when the first iterator emits an error', () => {
      const error = new Error('error');
      const callback = sinon.spy();
      iterator.on('error', callback);
      sources[0].emit('error', error);
      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith(error);
    });

    it('should emit an error when the second iterator emits an error', () => {
      const error = new Error('error');
      const callback = sinon.spy();
      iterator.on('error', callback);
      sources[1].emit('error', error);
      callback.should.have.been.calledOnce;
      callback.should.have.been.calledWith(error);
    });

    it('should not emit an error when no iterators emit an error', async () => {
      (await toArray(iterator)).should.be.instanceof(Array);
    });

    it('should allow the _read method to be called multiple times', () => {
      (iterator as any)._read(1, noop);
      (iterator as any)._read(1, noop);
    });

    it('should make a round-robin union of the data elements', async () => {
      (await toArray(iterator)).sort().should.eql([0, 1, 2, 3, 4, 5, 6]);
    });
  });

  describe('a UnionIterator with sources that are added dynamically', () => {
    let iterator, sources, sourceIterator;
    beforeEach(() => {
      sourceIterator = new BufferedIterator();
      iterator = new UnionIterator(sourceIterator);
      sources = [
        range(0, 2),
        range(3, 5),
        range(6, 7),
      ];
    });

    describe('before sources are added', () => {
      it('returns null on read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after one source is added', () => {
      beforeEach(() => {
        source(iterator as any)._push(sources[0]);
      });

      it('should read the whole stream', () => {
        expect(iterator.read()).to.equal(0);
        expect(iterator.read()).to.equal(1);
        expect(iterator.read()).to.equal(2);
        expect(iterator.read()).toBe(null);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });


    describe('after two streams have been added', () => {
      beforeEach(() => {
        source(iterator as any)._push(sources[1]);
        source(iterator as any)._push(sources[2]);
      });

      it('should read 2 streams in round-robin order', async () => {
        // Read 4 buffered items
        expect(iterator.read()).to.equal(3);
        expect(iterator.read()).to.equal(6);
        expect(iterator.read()).to.equal(4);
        expect(iterator.read()).to.equal(7);

        // Buffer
        await new Promise(resolve => scheduleTask(resolve));

        // Read remaining items
        expect(iterator.read()).to.equal(5);
        expect(iterator.read()).toBe(null);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after the source stream ends', () => {
      beforeEach(() => {
        source(iterator as any)._end();
      });

      it('returns null on read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });
    });
  });

  it('should end when the end event of the source stream is delayed', async () => {
    const delayed = new AsyncIterator();
    const iterator = new UnionIterator([delayed]);
    delayed.readable = true;
    scheduleTask(() => delayed.close());
    (await toArray(iterator)).should.eql([]);
  });
});

function toArray<T>(stream) {
  return new Promise<T[]>((resolve, reject) => {
    const array: T[] = [];
    stream.on('data', (data: T) => array.push(data));
    stream.on('error', reject);
    stream.on('end', () => resolve(array));
  });
}

function noop() { /* */ }
