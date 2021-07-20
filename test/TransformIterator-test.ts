import {
  AsyncIterator,
  BufferedIterator,
  EmptyIterator,
  ArrayIterator,
  TransformIterator,
  wrap,
  scheduleTask,
} from '../asynciterator';

import { EventEmitter } from 'events';

describe('TransformIterator', () => {
  describe('The TransformIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: TransformIterator<never, never>;
      beforeEach(() => { instance = new TransformIterator(); });

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

    describe('the result when called through `wrap`', () => {
      let instance: TransformIterator<unknown, unknown>;
      beforeEach(() => { instance = wrap(new EventEmitter()); });

      it('should be an TransformIterator object', () => {
        expect(instance).toBeInstanceOf(TransformIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('A TransformIterator', () => {
    it('disallows setting a falsy object as source', () => {
      const iterator = new TransformIterator();
      // @ts-expect-error
      expect(() => { iterator.source = null; }).toThrowError('Invalid source: null');
    });

    it('disallows setting an object without `read` function as source', () => {
      const iterator = new TransformIterator();
      // @ts-expect-error
      expect(() => { iterator.source = { read: 1, on() { /* */ } }; })
        .toThrowError('Invalid source: [object Object]');
    });

    it('disallows setting an object without `on` function as source', () => {
      const iterator = new TransformIterator();
      // @ts-expect-error
      expect(() => { iterator.source = { on: 1, read() { /* */ } }; })
        .toThrowError('Invalid source: [object Object]');
    });

    it('disallows setting another source after one has been set', () => {
      const iterator = new TransformIterator();
      iterator.source = new EmptyIterator();
      expect(() => { iterator.source = new EmptyIterator(); })
        .toThrowError('The source cannot be changed after it has been set');
    });

    it('allows setting the source through the first argument', () => {
      const source = new EmptyIterator(),
            iterator = new TransformIterator(source);
      expect(iterator.source).toEqual(source);
    });

    it('allows setting the source through an options hash as first argument', () => {
      const source = new EmptyIterator(),
            iterator = new TransformIterator({ source });
      expect(iterator.source).toEqual(source);
    });

    it('allows setting the source through an options hash as second argument', () => {
      const source = new EmptyIterator(),
            iterator = new TransformIterator(null, { source });
      expect(iterator.source).toEqual(source);
    });

    it('gives precedence to a source as first argument', () => {
      const sourceA = new EmptyIterator(),
            sourceB = new EmptyIterator(),
            iterator = new TransformIterator(sourceA, { source: sourceB });
      expect(iterator.source).toEqual(sourceA);
    });

    it('does not allow setting a source that already has a destination', () => {
      const source = new EmptyIterator(),
            iteratorA = new TransformIterator(),
            iteratorB = new TransformIterator();
      expect(() => { iteratorA.source = source; }).not.toThrowError();
      expect(() => { iteratorB.source = source; })
        .toThrowError('The source already has a destination');
    });
  });

  describe('A TransformIterator without source', () => {
    let iterator;
    beforeEach(() => {
      iterator = new TransformIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach closing', () => {
      it('should have undefined as `source` property', () => {
        expect(iterator.source).to.be.undefined;
      });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });

    describe('after closing', () => {
      beforeEach(() => {
        iterator.close();
      });

      it('should have undefined as `source` property', () => {
        expect(iterator.source).to.be.undefined;
      });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator initialized with an empty source', () => {
    let iterator, source;
    beforeEach(() => {
      iterator = new TransformIterator(source = new EmptyIterator());
      captureEvents(iterator, 'readable', 'end');
      expect(source._events).to.not.contain.key('data');
      expect(source._events).to.not.contain.key('readable');
      expect(source._events).to.not.contain.key('end');
    });

    it('should expose the source in the `source` property', () => {
      iterator.source.toEqual(source);
    });

    it('should not have emitted the `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(1);
    });

    it('should have ended', () => {
      expect(iterator.ended).toBe(true);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(false);
    });

    it('should return null when read is called', () => {
      expect(iterator.read()).toBe(null);
    });
  });

  describe('A TransformIterator initialized with a source that ends asynchronously', () => {
    let iterator, source;
    beforeEach(() => {
      iterator = new TransformIterator(source = new AsyncIterator());
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach the source ends', () => {
      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });

    describe('when the source emits a `readable` event (but does not actually contain items)', () => {
      beforeEach(() => { source.emit('readable'); });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });

    describe('after the source ends', () => {
      beforeEach(() => { source.close(); });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with a one-item source', () => {
    let iterator, source;
    beforeEach(() => {
      iterator = new TransformIterator(source = new ArrayIterator(['a']));
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
    });

    describe('beforeEach reading an item', () => {
      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not leave `readable` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'readable').toEqual(0);
      });

      it('should not leave `end` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'end').toEqual(0);
      });

      it('should remove itself as destination from the source', () => {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that synchronously transforms a two-item source', () => {
    let iterator, source;
    beforeEach(() => {
      iterator = new TransformIterator(source = new ArrayIterator(['a', 'b', 'c']));
      (iterator as any)._transform = function (item, done) {
        this._push(`${item}1`);
        this._push(`${item}2`);
        done();
      };
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
    });

    describe('beforeEach reading an item', () => {
      it('should have called `read` on the source', () => {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading one item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the transformed item', () => {
        expect(item).toEqual('a1');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading the remaining items', () => {
      const items = [];
      beforeEach(() => {
        for (let i = 0; i < 5; i++)
          items.push(iterator.read());
      });

      it('should have read the transformed items', () => {
        items.toEqual(['a2', 'b1', 'b2', 'c1', 'c2']);
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not leave `readable` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'readable').toEqual(0);
      });

      it('should not leave `end` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'end').toEqual(0);
      });

      it('should remove itself as destination from the source', () => {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that asynchronously transforms a two-item source', () => {
    let iterator, source;
    beforeEach(() => {
      iterator = new TransformIterator(source = new ArrayIterator(['a', 'b', 'c']));
      (iterator as any)._transform = function (item, done) {
        scheduleTask(() => {
          (iterator as any)._push(`${item}1`);
          (iterator as any)._push(`${item}2`);
          done();
        });
      };
      captureEvents(iterator, 'readable', 'end');
      sinon.spy(source, 'read');
      // intentionally break source cleanup to verify whether destination does it
      source._terminate = function () { this._changeState(AsyncIterator.ENDED); };
    });

    describe('beforeEach reading an item', () => {
      it('should have called `read` on the source', () => {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading one item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the transformed item', () => {
        expect(item).toEqual('a1');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading the remaining items', () => {
      const items = [];
      beforeEach(() => {
        for (let i = 0; i < 5; i++)
          items.push(iterator.read());
      });

      it('should have read the transformed items', () => {
        items.toEqual(['a2', 'b1', 'b2', 'c1', 'c2']);
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not leave `readable` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'readable').toEqual(0);
      });

      it('should not leave `end` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'end').toEqual(0);
      });

      it('should remove itself as destination from the source', () => {
        source.should.not.have.key('_destination');
      });
    });
  });

  describe('A TransformIterator that synchronously transforms a three-item source but asynchronously completes', () => {
    let iterator, source;
    beforeEach(() => {
      let i = 0;
      source = new ArrayIterator(['a', 'b', 'c']);
      iterator = new TransformIterator(source);
      (iterator as any)._transform = sinon.spy(function (item, done) {
        this._push(item + (++i));
        scheduleTask(done);
      });
    });

    describe('when reading items', () => {
      const items = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should execute the transform function on all items in order', () => {
        items.toEqual(['a1', 'b2', 'c3']);
      });

      it('should have called _transform once for each item', () => {
        (iterator as any)._transform.should.have.been.calledThrice;
      });

      it('should have called _transform function with the iterator as `this`', () => {
        (iterator as any)._transform.alwaysCalledOn(iterator).toBe(true);
      });
    });
  });

  describe('A TransformIterator with a promise to a source', () => {
    let iterator, source, sourcePromise, resolvePromise;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sourcePromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      sinon.spy(source, 'read');
      sinon.spy(sourcePromise, 'then');
      iterator = new TransformIterator(sourcePromise);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach the promise resolves', () => {
      it('should have called `then` on the promise', () => {
        sourcePromise.then.should.have.been.calledOnce;
      });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });
    });

    describe('after the promise resolves', () => {
      beforeEach(() => resolvePromise(source));

      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with a promise and without autoStart', () => {
    let iterator, source, sourcePromise, resolvePromise;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sourcePromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      sinon.spy(source, 'read');
      sinon.spy(sourcePromise, 'then');
      iterator = new TransformIterator(sourcePromise, { autoStart: false });
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach the promise resolves', () => {
      it('does not allow setting another source', () => {
        (() => { iterator.source = {}; })
          .should.throw('The source cannot be changed after it has been set');
      });

      it('should not have called `then` on the promise', () => {
        sourcePromise.then.should.not.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should not have returned an item', () => {
        expect(item).toBe(null);
      });

      it('should have called `then` on the promise', () => {
        sourcePromise.then.should.have.been.calledOnce;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });
    });

    describe('after the promise resolves', () => {
      beforeEach(() => resolvePromise(source));

      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(2);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(2);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with a promise that is rejected', () => {
    let iterator, error, errorHandler;
    beforeEach(() => {
      error = new Error('source creation error');
      const rejected = Promise.resolve().then(() => { throw error; });
      iterator = new TransformIterator(rejected);
      iterator.on('error', errorHandler = sinon.stub());
    });

    it('should emit the error', () => {
      errorHandler.should.have.been.calledOnce;
      errorHandler.should.have.been.calledWith(error);
    });
  });

  describe('A TransformIterator with a promise that resolves after closing', () => {
    let iterator, source, sourcePromise, resolvePromise;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sourcePromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      sinon.spy(source, 'read');
      sinon.spy(sourcePromise, 'then');
      iterator = new TransformIterator(sourcePromise);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('after closing and resolving', () => {
      beforeEach(() => {
        iterator.close();
        resolvePromise(source);
      });

      it('should not have called read on the source', () => {
        source.read.should.not.have.been.called;
      });
    });

    describe('after calling read', () => {
      beforeEach(() => { iterator.read(); });

      it('should not have called read on the source', () => {
        source.read.should.not.have.been.called;
      });
    });
  });

  describe('A TransformIterator with a source creation function', () => {
    let iterator, source, createSource;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sinon.spy(source, 'read');
      createSource = sinon.spy(() => source);
      iterator = new TransformIterator(createSource);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('after construction', () => {
      it('should have called the creation function', () => {
        createSource.should.have.been.calledOnce;
      });

      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('does not allow setting another source', () => {
        (() => { iterator.source = {}; })
          .should.throw('The source cannot be changed after it has been set');
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with a source creation function returning a promise', () => {
    let iterator, source, createSource, sourcePromise, resolvePromise;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sinon.spy(source, 'read');
      sourcePromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      createSource = sinon.spy(() => sourcePromise);
      iterator = new TransformIterator(createSource);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach the source is created', () => {
      it('should have called the creation function', () => {
        createSource.should.have.been.calledOnce;
      });

      it('should not have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('does not allow setting another source', () => {
        (() => { iterator.source = {}; })
          .should.throw('The source cannot be changed after it has been set');
      });
    });

    describe('after the promise resolves', () => {
      beforeEach(() => resolvePromise(source));

      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with a source creation function and without autoStart', () => {
    let iterator, source, createSource, sourcePromise, resolvePromise;
    beforeEach(() => {
      source = new ArrayIterator(['a']);
      sinon.spy(source, 'read');
      sourcePromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      createSource = sinon.spy(() => sourcePromise);
      iterator = new TransformIterator({ autoStart: false, source: createSource });
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach the promise resolves', () => {
      it('does not allow setting another source', () => {
        (() => { iterator.source = {}; })
          .should.throw('The source cannot be changed after it has been set');
      });

      it('should not have called the function', () => {
        createSource.should.not.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should not have returned an item', () => {
        expect(item).toBe(null);
      });

      it('should have called the function', () => {
        createSource.should.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });
    });

    describe('after the promise resolves', () => {
      beforeEach(() => resolvePromise(source));

      it('should have called `read` on the source', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(2);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after reading an item', () => {
      let item;
      beforeEach(() => { item = iterator.read(); });

      it('should have read the original item', () => {
        expect(item).toEqual('a');
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(2);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('A TransformIterator with destroySource set to its default', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3]);
      iterator = new TransformIterator(source, { autoStart: false });
    });

    describe('after being closed', () => {
      beforeEach(done => {
        iterator.read();
        iterator.close();
        iterator.on('end', done);
      });

      it('should have destroyed the source', () => {
        expect(source).to.have.property('destroyed', true);
      });
    });
  });

  describe('A TransformIterator with destroySource set to false', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3]);
      iterator = new TransformIterator(source, { autoStart: false, destroySource: false });
    });

    describe('after being closed', () => {
      beforeEach(done => {
        iterator.read();
        iterator.close();
        iterator.on('end', done);
      });

      it('should not have destroyed the source', () => {
        expect(source).to.have.property('destroyed', false);
      });
    });
  });

  describe('A TransformIterator with a source that errors', () => {
    let iterator, source, errorHandler;
    beforeEach(() => {
      source = new AsyncIterator();
      iterator = new TransformIterator(source);
      iterator.on('error', errorHandler = sinon.stub());
    });

    describe('beforeEach an error occurs', () => {
      it('should not have emitted any error', () => {
        errorHandler.should.not.have.been.called;
      });
    });

    describe('after a first error occurs', () => {
      let error1;
      beforeEach(() => {
        errorHandler.reset();
        source.emit('error', error1 = new Error('error1'));
      });

      it('should re-emit the error', () => {
        errorHandler.should.have.been.calledOnce;
        errorHandler.should.have.been.calledWith(error1);
      });
    });

    describe('after a second error occurs', () => {
      let error2;
      beforeEach(() => {
        errorHandler.reset();
        source.emit('error', error2 = new Error('error2'));
      });

      it('should re-emit the error', () => {
        errorHandler.should.have.been.calledOnce;
        errorHandler.should.have.been.calledWith(error2);
      });
    });

    describe('after the source has ended and errors again', () => {
      beforeEach(done => {
        errorHandler.reset();
        source.close();
        iterator.on('end', () => {
          function noop() { /* */ }
          source.on('error', noop); // avoid triggering the default error handler
          source.emit('error', new Error('error3'));
          source.removeListener('error', noop);
          done();
        });
      });

      it('should not re-emit the error', () => {
        errorHandler.should.not.have.been.called;
      });

      it('should not leave any error handlers attached', () => {
        source.listenerCount('error').toEqual(0);
      });
    });
  });

  describe('A TransformIterator that skips many items', () => {
    let iterator, source, i = 1;
    beforeEach(() => {
      source = new AsyncIterator();
      source.read = sinon.spy(() => i++);
      iterator = new TransformIterator(source);
      (iterator as any)._transform = function (item, done) {
        if (item % 10 === 0)
          this._push(item);
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach reading an item', () => {
      it('should have called `read` on the source', () => {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after reading a first item', () => {
      let item;
      beforeEach(() => {
        item = iterator.read();
      });

      it('should read the correct item', () => {
        expect(item).toEqual(10);
      });

      it('should have called `read` on the source until it had sufficient items', () => {
        source.read.should.have.callCount(50);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after reading a second item', () => {
      let item;
      beforeEach(() => {
        item = iterator.read();
      });

      it('should read the correct item', () => {
        expect(item).toEqual(20);
      });

      it('should have called `read` on the source until it had sufficient items', () => {
        source.read.should.have.callCount(60);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });
  });

  describe('A TransformIterator that closes during the tranformation', () => {
    let iterator, source;
    beforeEach(() => {
      source = new AsyncIterator();
      source.read = sinon.spy(() => 1);
      iterator = new TransformIterator(source);
      (iterator as any)._transform = function (item, done) {
        this._push(item);
        this.close();
        done();
      };
      captureEvents(iterator, 'readable', 'end');
    });

    describe('beforeEach reading an item', () => {
      it('should have called `read` on the source', () => {
        source.read.should.have.been.called;
      });

      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });
    });

    describe('after reading a first item', () => {
      let item;
      beforeEachEach(() => {
        item = iterator.read();
      });

      it('should read the correct item', () => {
        expect(item).toEqual(1);
      });

      it('should have called `read` on the source only once', () => {
        source.read.should.have.been.calledOnce;
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not leave `readable` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'readable').toEqual(0);
      });

      it('should not leave `end` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'end').toEqual(0);
      });

      it('should not leave `error` listeners on the source', () => {
        EventEmitter.listenerCount(source, 'error').toEqual(0);
      });
    });
  });

  describe('A TransformIterator with optional set to false', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new TransformIterator(source, { optional: false });
      (iterator as any)._transform = function (item, done) {
        if (item % 3 !== 0)
          this._push(`t${item}`);
        done();
      };
    });

    describe('when reading items', () => {
      const items = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return items not transformed into null', () => {
        items.toEqual(['t1', 't2', 't4', 't5']);
      });
    });
  });

  describe('A TransformIterator with optional set to true', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new TransformIterator(source, { optional: true });
      (iterator as any)._transform = function (item, done) {
        if (item % 3 !== 0)
          this._push(`t${item}`);
        done();
      };
    });

    describe('when reading items', () => {
      const items = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items, or if none, the item itself', () => {
        items.toEqual(['t1', 't2', 3, 't4', 't5', 6]);
      });
    });
  });

  describe('A TransformIterator that pushes via the callback', () => {
    let iterator, source;
    beforeEach(() => {
      source = new ArrayIterator([1, 2, 3, 4, 5, 6]);
      iterator = new TransformIterator(source);
      (iterator as any)._transform = function (item, done, push) {
        push(`t${item}`);
        done();
      };
    });

    describe('when reading items', () => {
      const items = [];
      beforeEach(done => {
        iterator.on('data', item => { items.push(item); });
        iterator.on('end', done);
      });

      it('should return the transformed items', () => {
        items.toEqual(['t1', 't2', 't3', 't4', 't5', 't6']);
      });
    });
  });

  describe('Two transformers in sequence with autostart', () => {
    let source, transform1, transform2, callback;
    beforeEach(() => {
      source = new ArrayIterator([]);
      transform1 = new TransformIterator(source);
      transform2 = new TransformIterator(transform1);
      callback = sinon.spy();
      transform2.on('end', callback);
    });

    describe('beforeEach attaching a data listener', () => {
      it('should have emitted the end event', () => {
        callback.should.have.been.called;
      });
    });
  });

  describe('Two transformers in sequence without autostart', () => {
    let source, transform1, transform2, callback;
    beforeEach(() => {
      source = new ArrayIterator([]);
      transform1 = new TransformIterator(source, { autoStart: false });
      transform2 = new TransformIterator(transform1, { autoStart: false });
      callback = jest.spyOn();
      transform2.on('end', callback);
    });

    describe('beforeEach attaching a data listener', () => {
      it('should not have emitted the end event', () => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    describe('after attaching a data listener', () => {
      beforeEach(() => {
        transform2.on('data', sinon.spy());
      });

      it('should have emitted the end event', () => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });
});
