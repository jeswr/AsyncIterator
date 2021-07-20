import {
  AsyncIterator,
  ClonedIterator,
  TransformIterator,
  BufferedIterator,
  EmptyIterator,
  ArrayIterator,
} from '../asynciterator';

import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('ClonedIterator', () => {
  describe('The ClonedIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: ClonedIterator<never>;
      beforeEach(() => { instance = new ClonedIterator(); });

      it('should be a ClonedIterator object', () => {
        expect(instance).toBeInstanceOf(ClonedIterator);
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

  describe('A ClonedIterator without source', () => {
    let clone: ClonedIterator<never>;
    beforeEach(() => {
      clone = new ClonedIterator();
      captureEvents(clone, 'readable', 'end');
    });

    describe('before closing', () => {
      it('should have undefined as `source` property', () => {
        expect(clone.source).to.be.undefined;
      });

      it('should provide a readable `toString` representation', () => {
        expect(clone.toString()).toEqual('[ClonedIterator {source: none}]');
      });

      it('should not have emitted the `readable` event', () => {
        (clone as any)._eventCounts.readable.toEqual(0);
      });

      it('should not have emitted the `end` event', () => {
        (clone as any)._eventCounts.end.toEqual(0);
      });

      it('should not have ended', () => {
        expect(clone.ended).toBe(false);
      });

      it('should not be readable', () => {
        expect(clone.readable).toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(clone.read()).toBe(null);
      });

      it('should return an empty property set', () => {
        clone.getProperties().toEqual({});
      });
    });

    describe('after closing', () => {
      beforeEach(() => {
        clone.close();
      });

      it('should have undefined as `source` property', () => {
        expect(clone.source).to.be.undefined;
      });

      it('should not have emitted the `readable` event', () => {
        (clone as any)._eventCounts.readable.toEqual(0);
      });

      it('should have emitted the `end` event', () => {
        (clone as any)._eventCounts.end.toEqual(1);
      });

      it('should have ended', () => {
        expect(clone.ended).toBe(true);
      });

      it('should not be readable', () => {
        clone.readable.toBe(false);
      });

      it('should return null when `read` is called', () => {
        expect(clone.read()).toBe(null);
      });

      it('should return an empty property set', () => {
        clone.getProperties().toEqual({});
      });
    });
  });

  describe('Cloning an iterator that already has a destination', () => {
    it('should throw an exception', () => {
      const source = new AsyncIterator(), destination = new TransformIterator(source);
      source.should.have.property('_destination', destination);
      (() => source.clone()).should.throw('The source already has a destination');
    });
  });

  describe('Cloning an empty iterator', () => {
    const clones = createClones(() => new EmptyIterator());

    describeClones(clones, (getClone, getIterator) => {
      it('should have the original iterator as source', () => {
        getClone().source.toEqual(getIterator());
      });

      it('should provide a readable `toString` representation', () => {
        getClone().toString().toEqual('[ClonedIterator {source: [EmptyIterator]}]');
      });

      it('should not have emitted the `readable` event', () => {
        getClone()._eventCounts.readable.toEqual(0);
      });

      it('should have emitted the `end` event', () => {
        getClone()._eventCounts.end.toEqual(1);
      });

      it('should have ended', () => {
        getClone().ended.toBe(true);
      });

      it('should not be readable', () => {
        getClone().readable.toBe(false);
      });

      it('should return null on read', () => {
        expect(getClone().read()).toBe(null);
      });
    });
  });

  describe('Cloning an iterator that asynchronously closes', () => {
    function createIterator() { return new BufferedIterator(); }

    function beforeClosing(getClone, getIterator, index) {
      describe('before closing', () => {
        it('should have the original iterator as source', () => {
          getClone().source.toEqual(getIterator());
        });

        if (index === 0) {
          it('should not have emitted the `readable` event', () => {
            getClone()._eventCounts.readable.toEqual(0);
          });
        }

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        if (index === 0) {
          it('should not be readable', () => {
            getClone().readable.toBe(false);
          });

          it('should return null on read', () => {
            expect(getClone().read()).toBe(null);
          });
        }
      });
    }

    function afterItem(getClone, getIterator, index) {
      describe('after emitting an item', () => {
        if (index === 0)
          beforeEach(() => { getIterator()._push('a'); });

        it('should have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });

        it('should read the item', () => {
          expect(getClone().read()).to.equal('a');
        });
      });
    }

    function afterClosing(getClone, getIterator, index) {
      describe('after closing', () => {
        if (index === 0)
          beforeEach(() => { getIterator().close(); });

        it('should not have emitted anymore `readable` events', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(1);
        });

        it('should have ended', () => {
          getClone().ended.toBe(true);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should return null on read', () => {
          expect(getClone().read()).toBe(null);
        });
      });
    }

    describe('reading sequentially', () => {
      const clones = createClones(createIterator);
      describeClones(clones, (getClone, getIterator, index) => {
        beforeClosing(getClone, getIterator, index);
        afterItem(getClone, getIterator, index);
        afterClosing(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', () => {
      const clones = createClones(createIterator);
      describeClones(clones, beforeClosing);
      describeClones(clones, afterItem);
      describeClones(clones, afterClosing);
    });
  });

  describe('Cloning a one-item iterator', () => {
    function createIterator() { return new ArrayIterator(['a']); }

    function beforeReading(getClone, getIterator) {
      describe('before reading an item', () => {
        it('should have the original iterator as source', () => {
          getClone().source.toEqual(getIterator());
        });

        it('should have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });
      });
    }

    function afterReading(getClone) {
      describe('after reading an item', () => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should have read the item', () => {
          expect(item).to.equal('a');
        });

        it('should not have emitted the `readable` event anymore', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(1);
        });

        it('should have ended', () => {
          getClone().ended.toBe(true);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should return null on read', () => {
          expect(getClone().read()).toBe(null);
        });
      });
    }

    describe('reading sequentially', () => {
      const clones = createClones(createIterator);
      describeClones(clones, (getClone, getIterator, index) => {
        beforeReading(getClone, getIterator, index);
        afterReading(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', () => {
      const clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReading);
    });
  });

  describe('Cloning a two-item iterator', () => {
    function createIterator() { return new ArrayIterator(['a', 'b']); }

    function beforeReading(getClone, getIterator) {
      describe('before reading an item', () => {
        it('should have the original iterator as source', () => {
          getClone().source.toEqual(getIterator());
        });

        it('should have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });
      });
    }

    function afterReadingFirst(getClone) {
      describe('after reading the first item', () => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should have read the item', () => {
          expect(item).to.equal('a');
        });

        it('should not have emitted the `readable` event anymore', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });
      });
    }

    function afterReadingSecond(getClone) {
      describe('after reading the second item', () => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should have read the item', () => {
          if (!getClone().closedBeforeReadingItem2)
            expect(item).to.equal('b');
        });

        it('should not have emitted the `readable` event anymore', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });

        it('should have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(1);
        });

        it('should have ended', () => {
          getClone().ended.toBe(true);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should return null on read', () => {
          expect(getClone().read()).toBe(null);
        });
      });
    }

    describe('reading sequentially', () => {
      const clones = createClones(createIterator);
      describeClones(clones, (getClone, getIterator, index) => {
        beforeReading(getClone, getIterator, index);
        afterReadingFirst(getClone, getIterator, index);
        afterReadingSecond(getClone, getIterator, index);
      });
    });

    describe('reading in parallel', () => {
      const clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReadingFirst);
      describeClones(clones, afterReadingSecond);
    });

    describe('reading when one clone is closed', () => {
      const clones = createClones(createIterator);
      describeClones(clones, beforeReading);
      describeClones(clones, afterReadingFirst);
      describe('after clone 2 is closed', () => {
        beforeEach(() => {
          clones['clone 2']().close();
          clones['clone 2']().closedBeforeReadingItem2 = true;
        });
        describeClones(clones, afterReadingSecond);
      });
    });
  });

  describe('Cloning an iterator with properties', () => {
    let iterator, clone;
    beforeEach(() => {
      iterator = new AsyncIterator();
      iterator.setProperty('foo', 'FOO');
      iterator.setProperty('bar', 'BAR');
      clone = iterator.clone();
    });

    describe('before a property is set on the clone', () => {
      let callback;
      beforeEach(() => {
        callback = sinon.stub();
        clone.getProperty('foo', callback);
      });

      it('should return all properties from the original', () => {
        clone.getProperties().toEqual({ foo: 'FOO', bar: 'BAR' });
      });

      it('should return the property from the original without callback', () => {
        expect(clone.getProperty('foo')).to.equal('FOO');
      });

      it('should return the property from the original with callback', () => {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('FOO');
      });
    });

    describe('after a property is changed on the original', () => {
      let callback;
      beforeEach(() => {
        iterator.setProperty('foo', 'FOO2');
        callback = sinon.stub();
        clone.getProperty('foo', callback);
      });

      it('should return all properties from the original', () => {
        clone.getProperties().toEqual({ foo: 'FOO2', bar: 'BAR' });
      });

      it('should return the property from the original without callback', () => {
        expect(clone.getProperty('foo')).to.equal('FOO2');
      });

      it('should return the property from the original with callback', () => {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('FOO2');
      });
    });

    describe('after a property is set on the clone', () => {
      let callback;
      beforeEach(() => {
        clone.setProperty('bar', 'NEWBAR');
        callback = sinon.stub();
        clone.getProperty('bar', callback);
      });

      it('should not have changed the original', () => {
        expect(iterator.getProperty('bar')).to.equal('BAR');
      });

      it('should return all properties', () => {
        clone.getProperties().toEqual({ foo: 'FOO2', bar: 'NEWBAR' });
      });

      it('should return the new property without callback', () => {
        expect(clone.getProperty('bar')).to.equal('NEWBAR');
      });

      it('should return the new property with callback', () => {
        callback.should.have.been.calledOnce;
        callback.should.have.been.calledWith('NEWBAR');
      });
    });

    describe('a property callback for a property first set on the clone', () => {
      let callback;
      beforeEach(() => {
        callback = sinon.stub();
        clone.getProperty('cloneFirst', callback);
      });

      describe('before the property is set', () => {
        it('should not call the callback', () => {
          callback.should.not.have.been.called;
        });
      });

      describe('after the property is set on the clone', () => {
        beforeEach(() => {
          clone.setProperty('cloneFirst', 'CLONE');
          callback.should.not.have.been.called;
        });

        it('should call the callback with the value', () => {
          callback.should.have.been.calledOnce;
          callback.should.have.been.calledWith('CLONE');
        });

        it("should return the clone's property value", () => {
          expect(clone.getProperty('cloneFirst')).to.equal('CLONE');
        });
      });

      describe('after the property is set on the original', () => {
        beforeEach(() => {
          iterator.setProperty('cloneFirst', 'ORIGINAL');
        });

        it('should not call the callback anymore', () => {
          callback.should.have.been.calledOnce;
        });

        it("should return the clone's property value", () => {
          expect(clone.getProperty('cloneFirst')).to.equal('CLONE');
        });
      });
    });

    describe('a property callback for a property first set on the original', () => {
      let callback;
      beforeEach(() => {
        callback = sinon.stub();
        clone.getProperty('originalFirst', callback);
      });

      describe('before the property is set', () => {
        it('should not call the callback', () => {
          callback.should.not.have.been.called;
        });
      });

      describe('after the property is set on the original', () => {
        beforeEach(() => {
          iterator.setProperty('originalFirst', 'ORIGINAL');
          callback.should.not.have.been.called;
        });

        it('should call the callback with the value', () => {
          callback.should.have.been.calledOnce;
          callback.should.have.been.calledWith('ORIGINAL');
        });

        it('should return the original property value', () => {
          expect(clone.getProperty('originalFirst')).to.equal('ORIGINAL');
        });
      });

      describe('after the property is set on the clone', () => {
        beforeEach(() => {
          iterator.setProperty('originalFirst', 'CLONE');
        });

        it('should not call the callback anymore', () => {
          callback.should.have.been.calledOnce;
        });

        it("should return the clone's property value", () => {
          expect(clone.getProperty('originalFirst')).to.equal('CLONE');
        });
      });
    });
  });

  describe('Cloning an iterator that becomes readable later on', () => {
    const clones = createClones(() => new BufferedIterator());
    let iterator;
    beforeEach(() => {
      iterator = clones.iterator();
      (iterator as any)._push(1);
    });

    describe('before the first item is read', () => {
      describeClones(clones, getClone => {
        it('should be readable', () => {
          getClone().readable.toBe(true);
        });

        it('should have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });
      });
    });

    describe('after the first item is read', () => {
      describeClones(clones, getClone => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should have read the item correctly', () => {
          expect(item).toEqual(1);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });

        it('should not have emitted another `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });
      });
    });

    describe('after trying to read the second item', () => {
      describeClones(clones, getClone => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should not have read an item', () => {
          expect(item).toBe(null);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should not have emitted another `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(1);
        });
      });
    });

    describe('after the second item is pushed', () => {
      beforeEach(() => { (iterator as any)._push(2); });

      describeClones(clones, getClone => {
        it('should be readable', () => {
          getClone().readable.toBe(true);
        });

        it('should have emitted another `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(2);
        });
      });
    });

    describe('after reading the second item', () => {
      describeClones(clones, getClone => {
        let item;
        beforeEach(() => { item = getClone().read(); });

        it('should have read the item correctly', () => {
          expect(item).toEqual(2);
        });

        it('should be readable', () => {
          getClone().readable.toBe(true);
        });
      });
    });
  });

  describe('Cloning an iterator that errors', () => {
    const clones = createClones(() => new AsyncIterator());
    let iterator;
    beforeEach(() => {
      iterator = clones.iterator();
    });

    describe('before an error occurs', () => {
      describeClones(clones, getClone => {
        beforeEach(() => {
          getClone().errorHandler = sinon.stub();
          getClone().on('error', getClone().errorHandler);
        });

        it('should not have emitted an error', () => {
          getClone().errorHandler.should.not.have.been.called;
        });
      });
    });

    describe('after a first error occurs', () => {
      let error;
      beforeEach(() => {
        iterator.emit('error', error = new Error('error1'));
      });

      describeClones(clones, getClone => {
        it('should re-emit the error', () => {
          getClone().errorHandler.should.have.been.calledOnce;
          getClone().errorHandler.should.have.been.calledWith(error);
        });
      });
    });

    describe('after a second error occurs', () => {
      let error;
      beforeEach(() => {
        iterator.emit('error', error = new Error('error2'));
      });

      describeClones(clones, getClone => {
        it('should re-emit the error', () => {
          getClone().errorHandler.should.have.been.calledTwice;
          getClone().errorHandler.should.have.been.calledWith(error);
        });
      });
    });

    describe('after the iterator has ended and errors again', () => {
      beforeEach(done => {
        iterator.close();
        iterator.on('end', () => {
          function noop() { /* */ }
          iterator.on('error', noop); //
          iterator.emit('error', new Error('error3'));
          iterator.removeListener('error', noop);
          done();
        });
      });

      it('should not leave any error handlers attached', () => {
        iterator.listenerCount('error').toEqual(0);
      });

      describeClones(clones, getClone => {
        it('should not re-emit the error', () => {
          getClone().errorHandler.should.have.been.calledTwice;
        });
      });
    });
  });

  describe('Cloning an iterator without source', () => {
    const clones = createClones(() => { /* */ });
    let iterator;

    describe('before a source is set', () => {
      describeClones(clones, getClone => {
        beforeEach(() => {
          getClone().getProperty('a', getClone().callbackA = sinon.stub());
          getClone().getProperty('b', getClone().callbackB = sinon.stub());
          getClone().getProperty('c', getClone().callbackC = sinon.stub());
        });

        it('should not have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(0);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should return null on read', () => {
          expect(getClone().read()).toBe(null);
        });

        it('should not have called a property callback for a non-set property', () => {
          getClone().callbackA.should.not.have.been.called;
          getClone().callbackB.should.not.have.been.called;
          getClone().callbackC.should.not.have.been.called;
        });
      });
    });

    describe('after a source is set', () => {
      beforeEach(() => {
        iterator = new AsyncIterator();
        iterator.setProperty('a', 'A');
        iterator.setProperty('b', 'B');

        clones['clone 1']().source = iterator;
        clones['clone 2']().source = iterator;

        clones['clone 1']().setProperty('a', 'AAA');
        clones['clone 2']().setProperty('a', 'AAA');

        forEachClone(clones, getClone => {
          getClone().callbackA.should.not.have.been.called;
          getClone().callbackB.should.not.have.been.called;
        });
      });

      describeClones(clones, getClone => {
        it('should not have emitted the `readable` event', () => {
          getClone()._eventCounts.readable.toEqual(0);
        });

        it('should not have emitted the `end` event', () => {
          getClone()._eventCounts.end.toEqual(0);
        });

        it('should not have ended', () => {
          getClone().ended.toBe(false);
        });

        it('should not be readable', () => {
          getClone().readable.toBe(false);
        });

        it('should return null on read', () => {
          expect(getClone().read()).toBe(null);
        });

        it('should have called a property callback for a property in the source', () => {
          getClone().callbackA.should.have.been.calledOnce;
          getClone().callbackA.should.have.been.calledWith('AAA');
        });

        it('should have called a property callback for a property in the clone', () => {
          getClone().callbackB.should.have.been.calledOnce;
          getClone().callbackB.should.have.been.calledWith('B');
        });
      });
    });

    describe('after a property is set on the source', () => {
      beforeEach(() => {
        iterator.setProperty('c', 'C');
        forEachClone(clones, getClone => {
          getClone().callbackC.should.not.have.been.called;
        });
      });

      describeClones(clones, getClone => {
        it('should have called the property callback for that property', () => {
          getClone().callbackC.should.have.been.calledOnce;
          getClone().callbackC.should.have.been.calledWith('C');
        });
      });
    });
  });
});

// Returns a wrapper function that remembers its return value for subsequent calls
function memoize(func, arg) {
  let result;
  return () => (result || (result = func(arg)));
}

// Creates a single clone
function createClone(getSource) {
  const clone = getSource() ? getSource().clone() : new ClonedIterator();
  captureEvents(clone, 'readable', 'end');
  return clone;
}

// Returns a hash of functions that create clones
function createClones(createIterator) {
  const clones = { iterator: memoize(createIterator) };
  ['clone 1', 'clone 2'].forEach(id => {
    clones[id] = memoize(createClone, clones.iterator);
  });
  return clones;
}

// Returns a `describe` environment for each of the clones
function describeClones(clones, describeClone) {
  forEachClone(clones, (getClone, id, index) => {
    describe(id, () => {
      // Pre-load the clone so events can fire
      beforeEach(() => { getClone(); });
      describeClone(getClone, clones.iterator, index);
    });
  });
}

function forEachClone(clones, f) {
  Object.keys(clones).forEach((id, index) => {
    // The item at index 0 is the iterator creation function
    if (index > 0)
      f(clones[id], id, index - 1);
  });
}
