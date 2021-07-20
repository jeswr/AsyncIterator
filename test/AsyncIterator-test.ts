import {
  AsyncIterator,
  OPEN,
  CLOSED,
  ENDED,
  DESTROYED,
  scheduleTask,
} from '../asynciterator';

import { EventEmitter } from 'events';

describe('AsyncIterator', () => {
  describe('The AsyncIterator module', () => {
    describe('is a function', () => {
      expect(AsyncIterator).toBeInstanceOf(Function);
    });
  });

  describe('The AsyncIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: AsyncIterator<never>;
      beforeEach(() => { instance = new AsyncIterator(); });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('A default AsyncIterator instance', () => {
    let iterator: AsyncIterator<never>;
    beforeEach(() => {
      iterator = new AsyncIterator();
      captureEvents(iterator, 'data', 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[AsyncIterator]');
    });

    it('should not have emitted the `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should not have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(0);
    });

    it('should return null when trying to read', () => {
      expect(iterator.read()).toBe(null);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });

    it('should not have been destroyed', () => {
      expect(iterator.destroyed).toBe(false);
    });

    it('should not be done', () => {
      expect(iterator.done).toBe(false);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(false);
    });

    describe('when readable is set to a truthy value', () => {
      beforeEach(() => { iterator.readable = 'a'; });

      it('should have emitted a `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have true as readable value', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('when readable is set to a falsy value', () => {
      beforeEach(() => { iterator.readable = null; });

      it('should not have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have false as readable value', () => {
        expect(iterator.readable).toBe(false);
      });
    });

    describe('after close has been called', () => {
      beforeEach(() => { iterator.close(); });

      it('should not have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should be done', () => {
        expect(iterator.done).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('cannot be made readable again', () => {
        iterator.readable = true;
        expect(iterator.readable).toBe(false);
      });

      it('should return null when trying to read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not have any listeners for data, readable, or end', () => {
        expect((iterator as any)._events).to.not.contain.key('data');
        expect((iterator as any)._events).to.not.contain.key('readable');
        expect((iterator as any)._events).to.not.contain.key('end');
      });
    });

    describe('after destroy has been called', () => {
      beforeEach(() => { iterator.destroy(); });

      it('should not have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should be done', () => {
        expect(iterator.done).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('cannot be made readable again', () => {
        iterator.readable = true;
        expect(iterator.readable).toBe(false);
      });

      it('should return null when trying to read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not have any listeners for data, readable, or end', () => {
        expect((iterator as any)._events).to.not.contain.key('data');
        expect((iterator as any)._events).to.not.contain.key('readable');
        expect((iterator as any)._events).to.not.contain.key('end');
      });
    });

    describe('after close has been called a second time', () => {
      beforeEach(() => { iterator.close(); });

      it('should not have emitted another `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event a second time', () => {
        expect((iterator as any)._eventCounts.end).toEqual(1);
      });

      it('should have ended', () => {
        expect(iterator.ended).toBe(true);
      });

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should be done', () => {
        expect(iterator.done).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when trying to read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not have any listeners for data, readable, or end', () => {
        expect((iterator as any)._events).to.not.contain.key('data');
        expect((iterator as any)._events).to.not.contain.key('readable');
        expect((iterator as any)._events).to.not.contain.key('end');
      });
    });
  });

  describe('A default AsyncIterator instance', () => {
    let iterator: AsyncIterator<never>;
    beforeEach(() => {
      iterator = new AsyncIterator();
    });

    describe('when in OPEN state', () => {
      it('cannot transition to OPEN state', () => {
        expect((iterator as any)._changeState(OPEN)).toBe(false);
      });

      it('can transition to CLOSED state', () => {
        expect((iterator as any)._changeState(CLOSED)).toBe(true);
      });
    });

    describe('when in CLOSED state', () => {
      beforeEach(() => {
        (iterator as any)._changeState(CLOSED);
      });

      it('cannot transition to CLOSED state', () => {
        expect((iterator as any)._changeState(CLOSED)).toBe(false);
      });

      it('can transition to ENDED state', () => {
        expect((iterator as any)._changeState(ENDED)).toBe(true);
      });
    });

    describe('when in ENDED state', () => {
      beforeEach(() => {
        (iterator as any)._changeState(ENDED);
      });

      it('cannot transition to ENDED state', () => {
        expect((iterator as any)._changeState(ENDED)).toBe(false);
      });

      it('cannot transition to DESTROYED state', () => {
        expect((iterator as any)._changeState(DESTROYED)).toBe(false);
      });
    });
  });

  describe('A default AsyncIterator instance that is destroyed', () => {
    let iterator: AsyncIterator<never>;
    beforeEach(() => {
      iterator = new AsyncIterator();
      captureEvents(iterator, 'data', 'readable', 'end');
      iterator.destroy();
    });

    it('should not have emitted a `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should not have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(0);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });

    it('should have been destroyed', () => {
      expect(iterator.destroyed).toBe(true);
    });

    it('should be done', () => {
      expect(iterator.done).toBe(true);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(false);
    });

    it('cannot be made readable again', () => {
      iterator.readable = true;
      expect(iterator.readable).toBe(false);
    });

    it('should return null when trying to read', () => {
      expect(iterator.read()).toBe(null);
    });

    it('should not have any listeners for data, readable, or end', () => {
      expect((iterator as any)._events).to.not.contain.key('data');
      expect((iterator as any)._events).to.not.contain.key('readable');
      expect((iterator as any)._events).to.not.contain.key('end');
    });

    describe('after destroy has been called a second time', () => {
      beforeEach(() => { iterator.destroy(); });

      it('should not have emitted a `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should still not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should not have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should have been destroyed', () => {
        expect(iterator.destroyed).toBe(true);
      });

      it('should be done', () => {
        expect(iterator.done).toBe(true);
      });

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });

      it('should return null when trying to read', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should not have any listeners for data, readable, or end', () => {
        expect((iterator as any)._events).to.not.contain.key('data');
        expect((iterator as any)._events).to.not.contain.key('readable');
        expect((iterator as any)._events).to.not.contain.key('end');
      });
    });
  });

  describe('A default AsyncIterator instance that is destroyed with a given error', () => {
    let iterator: AsyncIterator<never>, err;
    beforeEach(() => {
      iterator = new AsyncIterator();
      err = new Error('Some error');
      captureEvents(iterator, 'data', 'readable', 'end', 'error');
      iterator.destroy(err);
    });

    it('should not have emitted a `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should not have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(0);
    });

    it('should have emitted the `error` event', () => {
      (iterator as any)._eventCounts.error.toEqual(1);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });

    it('should have been destroyed', () => {
      expect(iterator.destroyed).toBe(true);
    });

    it('should be done', () => {
      expect(iterator.done).toBe(true);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(false);
    });

    it('cannot be made readable again', () => {
      iterator.readable = true;
      expect(iterator.readable).toBe(false);
    });

    it('should return null when trying to read', () => {
      expect(iterator.read()).toBe(null);
    });

    it('should not have any listeners for data, readable, or end', () => {
      expect((iterator as any)._events).to.not.contain.key('data');
      expect((iterator as any)._events).to.not.contain.key('readable');
      expect((iterator as any)._events).to.not.contain.key('end');
    });
  });

  describe('A default AsyncIterator instance that is destroyed asynchronously', () => {
    let iterator: AsyncIterator<never>;
    beforeEach(() => {
      iterator = new AsyncIterator();
      captureEvents(iterator, 'data', 'readable', 'end');
      (iterator as any)._destroy = (error, callback) => scheduleTask(callback);
      iterator.destroy();
    });

    it('should not have emitted a `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should not have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(0);
    });

    it('should not have ended', () => {
      expect(iterator.ended).toBe(false);
    });

    it('should have been destroyed', () => {
      expect(iterator.destroyed).toBe(true);
    });

    it('should be done', () => {
      expect(iterator.done).toBe(true);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(false);
    });

    it('cannot be made readable again', () => {
      iterator.readable = true;
      expect(iterator.readable).toBe(false);
    });

    it('should return null when trying to read', () => {
      expect(iterator.read()).toBe(null);
    });

    it('should not have any listeners for data, readable, or end', () => {
      expect((iterator as any)._events).to.not.contain.key('data');
      expect((iterator as any)._events).to.not.contain.key('readable');
      expect((iterator as any)._events).to.not.contain.key('end');
    });
  });

  describe('An AsyncIterator instance without items', () => {
    let iterator: AsyncIterator<never>, dataListener;
    beforeEach(() => {
      iterator = new AsyncIterator();
    });

    describe('after a data listener is attached', () => {
      beforeEach(() => {
        iterator.on('data', dataListener = sinon.spy());
      });

      it('should not have emitted the `data` event', () => {
        dataListener.should.not.have.been.called;
      });
    });

    describe('after the iterator has ended', () => {
      beforeEach(() => {
        iterator.close();
      });

      it('should not have emitted the `data` event', () => {
        dataListener.should.not.have.been.called;
      });
    });
  });

  describe('An AsyncIterator instance with 1 item', () => {
    let iterator: AsyncIterator<never>, dataListener;
    beforeEach(() => {
      const items = [1];
      iterator = new AsyncIterator();
      iterator.readable = true;
      iterator.read = () => items.shift() || iterator.close() || null;
    });

    describe('after a data listener is attached', () => {
      beforeEach(() => {
        iterator.on('data', dataListener = sinon.spy());
      });

      it('should have emitted the `data` event with the item', () => {
        dataListener.should.have.been.calledOnce;
        dataListener.should.have.been.calledWith(1);
      });
    });

    describe('after the iterator has been closed', () => {
      it('should not have emitted another `data` event', () => {
        dataListener.should.have.been.calledOnce;
      });
    });
  });

  describe('An AsyncIterator instance to which items are added', () => {
    const items = [];
    let iterator, dataListener1, dataListener2;
    beforeEach(() => {
      iterator = new AsyncIterator();
      iterator.readable = true;
      iterator.read = sinon.spy(() => items.shift() || null);
    });

    describe('after two items are added', () => {
      beforeEach(() => {
        items.push(1, 2);
        iterator.emit('readable');
      });

      it('should not have called `read`', () => {
        iterator.read.should.not.have.been.called;
      });
    });

    describe('after a `data` listener is attached', () => {
      beforeEach(() => {
        iterator.on('data', dataListener1 = sinon.spy());
      });

      it('should have emitted the `data` event for both items', () => {
        dataListener1.should.have.callCount(2);
        dataListener1.getCall(0).args[0].toEqual(1);
        dataListener1.getCall(1).args[0].toEqual(2);
      });

      it('should have called `read` for both items, plus one check afterwards', () => {
        expect(iterator.read).toHaveBeenCalledTimes(2 + 1);
      });

      it('should only have one `readable` listener', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(1);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });

    describe('after a second `data` listener is attached', () => {
      beforeEach(() => {
        iterator.on('data', dataListener2 = sinon.spy());
      });

      it('should not emit `data` events on either listener', () => {
        dataListener1.should.have.callCount(2);
        dataListener2.should.have.callCount(0);
      });

      it('should not have called `read` more', () => {
        expect(iterator.read).toHaveBeenCalledTimes(3);
      });

      it('should only have one `readable` listener', () => {
        expect(EventEmitter.listenerCount(iterator, 'readable')).toEqual(1);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });

    describe('after two more data items are added', () => {
      beforeEach(() => {
        items.push(3, 4);
        iterator.emit('readable');
      });

      it('should have emitted the `data` event for both items', () => {
        dataListener1.should.have.callCount(4);
        dataListener1.getCall(2).args[0].toEqual(3);
        dataListener1.getCall(3).args[0].toEqual(4);
        dataListener2.should.have.callCount(2);
        dataListener2.getCall(0).args[0].toEqual(3);
        dataListener2.getCall(1).args[0].toEqual(4);
      });

      it('should have called `read` for all four items, plus two checks afterwards', () => {
        expect(iterator.read).toHaveBeenCalledTimes(4 + 2);
      });
    });

    describe('after the two listeners are removed and two new items are added', () => {
      beforeEach(() => {
        iterator.removeListener('data', dataListener1);
        iterator.removeListener('data', dataListener2);

        items.push(5, 6);
        iterator.emit('readable');
      });

      it('should not have called `read` anymore', () => {
        expect(iterator.read).toHaveBeenCalledTimes(4 + 2);
      });

      it('should not be listening for the `readable` event anymore', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });
    });

    describe('after the `data` listeners are attached again', () => {
      beforeEach(() => {
        iterator.on('data', dataListener1);
        iterator.on('data', dataListener2);
      });

      it('should have emitted the `data` event for both new items', () => {
        dataListener1.should.have.callCount(6);
        dataListener1.getCall(4).args[0].toEqual(5);
        dataListener1.getCall(5).args[0].toEqual(6);
        dataListener2.should.have.callCount(4);
        dataListener2.getCall(2).args[0].toEqual(5);
        dataListener2.getCall(3).args[0].toEqual(6);
      });

      it('should have called `read` for all six items, plus three checks afterwards', () => {
        expect(iterator.read).toHaveBeenCalledTimes(6 + 3);
      });

      it('should only have one `readable` listener', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(1);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });

    describe('after the iterator is closed', () => {
      beforeEach(() => {
        iterator.close();
      });

      it('should not have listeners for the `data` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `readable` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });
  });

  describe('An AsyncIterator instance to which 2 items are added an will be destroyed', () => {
    const items = [];
    let iterator, dataListener;
    beforeEach(() => {
      iterator = new AsyncIterator();
      iterator.readable = true;
      iterator.read = sinon.spy(() => items.shift() || null);

      items.push(1, 2);
      iterator.emit('readable');
    });

    describe('after the iterator is destroyed', () => {
      beforeEach(() => {
        iterator.on('data', dataListener = sinon.spy());
        iterator.destroy();
      });

      it('should not have emitted the `data` event for both items', () => {
        dataListener.should.have.callCount(0);
      });

      it('should not have listeners for the `data` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `readable` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });
  });

  describe('An AsyncIterator instance to which 2 items are added an will be destroyed with an error', () => {
    const items = [];
    let iterator, err, dataListener, errorListener;
    beforeEach(() => {
      iterator = new AsyncIterator();
      iterator.readable = true;
      iterator.read = sinon.spy(() => items.shift() || null);

      items.push(1, 2);
      iterator.emit('readable');
    });

    describe('after the iterator is destroyed with an error', () => {
      beforeEach(() => {
        err = new Error('My error');
        iterator.on('data', dataListener = sinon.spy());
        iterator.on('error', errorListener = sinon.spy());
        iterator.destroy(err);
      });

      it('should not have emitted the `data` event for both items', () => {
        dataListener.should.have.callCount(0);
      });

      it('should have emitted the `error` event', () => {
        errorListener.should.have.callCount(1);
      });

      it('should not have listeners for the `data` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `readable` event', () => {
        EventEmitter.listenerCount(iterator, 'readable').toEqual(0);
      });

      it('should not be listening for the `newListener` event', () => {
        EventEmitter.listenerCount(iterator, 'newListener').toEqual(0);
      });
    });
  });

  describe('An AsyncIterator with properties', () => {
    let iterator;
    beforeEach(() => {
      iterator = new AsyncIterator();
    });

    describe('when getProperties is called', () => {
      describe('beforeEach any property is set', () => {
        it('should return an empty object', () => {
          expect(iterator.getProperties()).to.deep.equal({});
        });
      });

      describe('when the return value is modified', () => {
        beforeEach(() => {
          const properties = iterator.getProperties();
          properties.a = 'A';
          properties.b = 'B';
        });

        it('should still return an empty object', () => {
          expect(iterator.getProperties()).to.deep.equal({});
        });
      });

      describe('after a property is set', () => {
        beforeEach(() => {
          iterator.setProperty('test', 'xyz');
        });
        it('should return an object with the properties', () => {
          expect(iterator.getProperties()).to.deep.equal({
            test: 'xyz',
          });
        });
      });

      describe('after the property is changed', () => {
        beforeEach(() => {
          iterator.setProperty('test', 'abc');
        });

        it('should return an object with the new properties', () => {
          expect(iterator.getProperties()).to.deep.equal({
            test: 'abc',
          });
        });
      });

      describe('after multiple properties are set', () => {
        beforeEach(() => {
          iterator.setProperties({ test: 'def', test2: 'ghi' });
        });

        it('should return an object with the new properties', () => {
          expect(iterator.getProperties()).to.deep.equal({
            test:  'def',
            test2: 'ghi',
          });
        });
      });
    });

    describe('when getProperty is called without callback', () => {
      describe('beforeEach the property is set', () => {
        it('should return undefined', () => {
          expect(iterator.getProperty('foo')).to.be.undefined;
        });
      });

      describe('after the property is set', () => {
        beforeEach(() => {
          iterator.setProperty('foo', 'FOO');
        });

        it('should return value of the property', () => {
          expect(iterator.getProperty('foo')).to.equal('FOO');
        });
      });

      describe('after the property is changed', () => {
        beforeEach(() => {
          iterator.setProperty('foo', 'FOOFOO');
        });

        it('should return new value of the property', () => {
          expect(iterator.getProperty('foo')).to.equal('FOOFOO');
        });
      });
    });

    describe('when getProperty is called with a callback', () => {
      let result, callback;
      beforeEach(() => {
        callback = sinon.stub();
        result = iterator.getProperty('bar', callback);
      });

      describe('beforeEach the property is set', () => {
        it('should return undefined', () => {
          expect(result).to.be.undefined;
        });

        it('should not call the callback', () => {
          callback.should.not.have.been.called;
        });
      });

      describe('after the property is set', () => {
        beforeEach(() => {
          iterator.setProperty('bar', 'BAR');
          callback.should.not.have.been.called;
        });

        it('should call the callback with the value', () => {
          callback.should.have.been.calledOnce;
          callback.should.have.been.calledWith('BAR');
        });

        describe('if a new callback is attached', () => {
          let newCallback;
          beforeEach(() => {
            newCallback = sinon.stub();
            result = iterator.getProperty('bar', newCallback);
            newCallback.should.not.have.been.called;
          });

          it('should call the callback with the value', () => {
            newCallback.should.have.been.calledOnce;
            newCallback.should.have.been.calledWith('BAR');
          });
        });
      });

      describe('after the property is changed', () => {
        beforeEach(() => {
          iterator.setProperty('bar', 'BARBAR');
        });

        it('should not call the callback anymore', () => {
          callback.should.have.been.calledOnce;
        });

        describe('if a new callback is attached', () => {
          let newCallback;
          beforeEach(() => {
            newCallback = sinon.stub();
            result = iterator.getProperty('bar', newCallback);
            newCallback.should.not.have.been.called;
          });

          it('should call the callback with the value', () => {
            newCallback.should.have.been.calledOnce;
            newCallback.should.have.been.calledWith('BARBAR');
          });
        });
      });
    });

    describe('when getProperty is called multiple times with a callback', () => {
      const callbacks = [];
      let result;
      beforeEach(() => {
        for (let i = 0; i < 5; i++) {
          callbacks[i] = sinon.stub();
          result = iterator.getProperty('bax', callbacks[i]);
        }
      });

      describe('beforeEach the property is set', () => {
        it('should return undefined', () => {
          expect(result).to.be.undefined;
        });

        it('should not call any callback', () => {
          for (let i = 0; i < callbacks.length; i++)
            callbacks[i].should.not.have.been.called;
        });
      });

      describe('after the property is set', () => {
        beforeEach(() => {
          iterator.setProperty('bax', 'BAX');
          for (let i = 0; i < callbacks.length; i++)
            callbacks[i].should.not.have.been.called;
        });

        it('should call the callbacks with the value', () => {
          for (let i = 0; i < callbacks.length; i++) {
            callbacks[i].should.have.been.calledOnce;
            callbacks[i].should.have.been.calledWith('BAX');
          }
        });

        it('should call the callbacks in order', () => {
          for (let i = 1; i < callbacks.length; i++)
            callbacks[i].should.have.been.calledAfter(callbacks[i - 1]);
        });

        describe('if a new callback is attached', () => {
          let callback;
          beforeEach(() => {
            callback = sinon.stub();
            result = iterator.getProperty('bax', callback);
            callback.should.not.have.been.called;
          });

          it('should call the callback with the value', () => {
            callback.should.have.been.calledOnce;
            callback.should.have.been.calledWith('BAX');
          });
        });
      });

      describe('after the property is changed', () => {
        beforeEach(() => {
          iterator.setProperty('bax', 'BAXBAX');
        });

        it('should not call any callback anymore', () => {
          for (let i = 0; i < callbacks.length; i++)
            callbacks[i].should.have.been.calledOnce;
        });

        describe('if a new callback is attached', () => {
          let callback;
          beforeEach(() => {
            callback = sinon.stub();
            result = iterator.getProperty('bax', callback);
            callback.should.not.have.been.called;
          });

          it('should call the callback with the value', () => {
            callback.should.have.been.calledOnce;
            callback.should.have.been.calledWith('BAXBAX');
          });
        });
      });
    });

    describe('when copyProperties is called', () => {
      let source;
      beforeEach(() => {
        source = new AsyncIterator();
        source.setProperties({ a: 'A', b: 'B', c: 'C' });
        iterator.copyProperties(source, ['a', 'c']);
      });

      it('should copy the given properties', () => {
        expect(iterator.getProperty('a')).to.equal('A');
        expect(iterator.getProperty('c')).to.equal('C');
      });

      it('should not copy other properties', () => {
        expect(iterator.getProperty('b')).to.be.undefined;
      });
    });
  });

  describe('The AsyncIterator#each function', () => {
    it('should be a function', () => {
      expect(AsyncIterator.prototype.forEach).to.be.a('function');
    });

    describe('called on an empty iterator', () => {
      let iterator, callback, result;
      beforeEach(() => {
        iterator = new AsyncIterator();
        callback = sinon.stub();
        result = iterator.forEach(callback);
      });

      it('should return undefined', () => {
        expect(result).to.be.undefined;
      });

      it('should not invoke the callback', () => {
        callback.should.not.have.been.called;
      });
    });

    describe('called on an iterator with two items', () => {
      let iterator, callback, result;
      beforeEach(() => {
        let i = 0;
        iterator = new AsyncIterator();
        iterator.readable = true;
        iterator.read = () => i++ < 2 ? i : null;
        callback = sinon.stub();
        result = iterator.forEach(callback);
      });

      it('should return undefined', () => {
        expect(result).to.be.undefined;
      });

      it('should invoke the callback twice', () => {
        callback.should.have.been.calledTwice;
      });

      it('should send the first item in the first call', () => {
        callback.getCall(0).args.toEqual([1]);
      });

      it('should send the second item in the first call', () => {
        callback.getCall(1).args.toEqual([2]);
      });

      it('should call the callback with the iterator as `this`', () => {
        callback.alwaysCalledOn(iterator).toBe(true);
      });
    });

    describe('called on an iterator with two items and a `this` argument', () => {
      const self = {};
      let iterator, callback, result;
      beforeEach(() => {
        let i = 0;
        iterator = new AsyncIterator();
        iterator.readable = true;
        iterator.read = () => i++ < 2 ? i : null;
        callback = sinon.stub();
        result = iterator.forEach(callback, self);
      });

      it('should return undefined', () => {
        expect(result).to.be.undefined;
      });

      it('should invoke the callback twice', () => {
        callback.should.have.been.calledTwice;
      });

      it('should send the first item in the first call', () => {
        callback.getCall(0).args.toEqual([1]);
      });

      it('should send the second item in the first call', () => {
        callback.getCall(1).args.toEqual([2]);
      });

      it('should call the callback with the argument as `this`', () => {
        callback.alwaysCalledOn(self).toBe(true);
      });
    });
  });
});
