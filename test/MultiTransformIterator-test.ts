import {
  AsyncIterator,
  MultiTransformIterator,
  TransformIterator,
  BufferedIterator,
  EmptyIterator,
  SingletonIterator,
  ArrayIterator,
  scheduleTask,
} from '../asynciterator';

import { EventEmitter } from 'events';

describe('MultiTransformIterator', () => {
  describe('The MultiTransformIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: MultiTransformIterator<never, never>;
      beforeEach(() => { instance = new MultiTransformIterator(); });

      it('should be a MultiTransformIterator object', () => {
        expect(instance).toBeInstanceOf(MultiTransformIterator);
      });

      it('should be a TransformIterator object', () => {
        expect(instance).toBeInstanceOf(TransformIterator);
      });

      it('should be a BufferedIterator object', () => {
        expect(instance).toBeInstanceOf(BufferedIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('A MultiTransformIterator without options', () => {
    let iterator: MultiTransformIterator<string, string>, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items as they are', () => {
        expect(items).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that emit 0 items', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source, { autoStart: false });
      (iterator as any)._createTransformer = sinon.spy(() => new EmptyIterator());
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should not return any items', () => {
        items.toEqual([]);
      });

      it('should have called _createTransformer for each item', () => {
        (iterator as any)._createTransformer.should.have.callCount(6);
        (iterator as any)._createTransformer.getCall(0).args.toEqual(['a']);
        (iterator as any)._createTransformer.getCall(1).args.toEqual(['b']);
        (iterator as any)._createTransformer.getCall(2).args.toEqual(['c']);
        (iterator as any)._createTransformer.getCall(3).args.toEqual(['d']);
        (iterator as any)._createTransformer.getCall(4).args.toEqual(['e']);
        (iterator as any)._createTransformer.getCall(5).args.toEqual(['f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that synchronously emit 1 item', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(item => new SingletonIterator(`${item}1`));
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that synchronously emit 3 items', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(item => new ArrayIterator([`${item}1`, `${item}2`, `${item}3`]));
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously close', () => {
    let iterator: MultiTransformIterator<string, string>, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(() => {
        const transformer = new BufferedIterator();
        setTimeout(() => transformer.close(), 0);
        return transformer;
      });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should not return any items', () => {
        items.toEqual([]);
      });

      it('should have called _createTransformer for each item', () => {
        (iterator as any)._createTransformer.should.have.callCount(6);
        (iterator as any)._createTransformer.getCall(0).args.toEqual(['a']);
        (iterator as any)._createTransformer.getCall(1).args.toEqual(['b']);
        (iterator as any)._createTransformer.getCall(2).args.toEqual(['c']);
        (iterator as any)._createTransformer.getCall(3).args.toEqual(['d']);
        (iterator as any)._createTransformer.getCall(4).args.toEqual(['e']);
        (iterator as any)._createTransformer.getCall(5).args.toEqual(['f']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously emit 1 item', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(item => {
        const transformer = new BufferedIterator();
        scheduleTask(() => {
          (transformer as any)._push(`${item}1`);
          transformer.close();
        });
        return transformer;
      });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual(['a1', 'b1', 'c1', 'd1', 'e1', 'f1']);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that asynchronously emit 3 items', () => {
    let iterator: MultiTransformIterator<string, string>, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(item => {
        const transformer = new BufferedIterator();
        scheduleTask(() => {
          (transformer as any)._push(`${item}1`);
          (transformer as any)._push(`${item}2`);
          (transformer as any)._push(`${item}3`);
          transformer.close();
        });
        return transformer;
      });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        expect(items).toEqual([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });

  describe('A MultiTransformIterator with optional set to false', () => {
    let iterator: MultiTransformIterator<number, number>, source: ArrayIterator<number>;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new MultiTransformIterator(source, { optional: false });
      (iterator as any)._createTransformer = sinon.spy(item => {
        switch (item) {
        case 3: return new EmptyIterator();
        case 6: return null;
        default: return new SingletonIterator(`t${item}`);
        }
      });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items only', () => {
        items.toEqual(['t1', 't2', 't4', 't5']);
      });
    });
  });

  describe('A MultiTransformIterator with optional set to true', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new MultiTransformIterator(source, { optional: true });
      (iterator as any)._createTransformer = sinon.spy(item => {
        switch (item) {
        case 3: return new EmptyIterator();
        case 6: return null;
        default: return new SingletonIterator(`t${item}`);
        }
      });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items, and originals when the transformer is empty', () => {
        items.toEqual(['t1', 't2', 3, 't4', 't5', 6]);
      });
    });
  });

  describe('A MultiTransformIterator with transformers that error', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      iterator = new MultiTransformIterator(source);
      (iterator as any)._createTransformer = sinon.spy(item => {
        const transformer = new BufferedIterator();
        scheduleTask(() => {
          transformer.emit('error', new Error(`Error ${item}`));
        });
        return transformer;
      });
      captureEvents(iterator, 'error');
    });

    it('should emit `bufferSize` errors', () => {
      (iterator as any)._eventCounts.error.toEqual(4);
    });
  });

  describe('A MultiTransformIterator with a multiTransform option', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      const multiTransform = sinon.spy(item => {
        const transformer = new BufferedIterator();
        scheduleTask(() => {
          (transformer as any)._push(`${item}1`);
          (transformer as any)._push(`${item}2`);
          (transformer as any)._push(`${item}3`);
          transformer.close();
        });
        return transformer;
      });
      iterator = new MultiTransformIterator(source, { multiTransform });
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });

  describe('A MultiTransformIterator with a direct multiTransform argument', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator(['a', 'b', 'c', 'd', 'e', 'f']);
      const multiTransform = sinon.spy(item => {
        const transformer = new BufferedIterator();
        scheduleTask(() => {
          (transformer as any)._push(`${item}1`);
          (transformer as any)._push(`${item}2`);
          (transformer as any)._push(`${item}3`);
          transformer.close();
        });
        return transformer;
      });
      iterator = new MultiTransformIterator(source, multiTransform);
    });

    describe('when reading items', () => {
      const items: string[] = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual([
          'a1', 'a2', 'a3',
          'b1', 'b2', 'b3',
          'c1', 'c2', 'c3',
          'd1', 'd2', 'd3',
          'e1', 'e2', 'e3',
          'f1', 'f2', 'f3',
        ]);
      });
    });
  });
});
