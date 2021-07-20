/* eslint-disable dot-notation */
import {
  AsyncIterator,
  ArrayIterator,
  fromArray,
} from '../asynciterator';

import { EventEmitter } from 'events';

describe('ArrayIterator', () => {
  describe('The ArrayIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: ArrayIterator<never>;
      beforeEach(() => { instance = new ArrayIterator(); });

      it('should be an ArrayIterator object', () => {
        expect(instance).toBeInstanceOf(ArrayIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });

    describe('the result when called through `fromArray`', () => {
      let instance: ArrayIterator<never>;
      beforeEach(() => { instance = fromArray([]); });

      it('should be an ArrayIterator object', () => {
        expect(instance).toBeInstanceOf(ArrayIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('An ArrayIterator without arguments', () => {
    let iterator: ArrayIterator<never>;
    beforeEach(() => {
      iterator = new ArrayIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
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

    it('should not have been destroyed', () => {
      expect(iterator.destroyed).toBe(false);
    });

    it('should be done', () => {
      expect(iterator.done).toBe(true);
    });

    it('should not be readable', () => {
      expect(iterator.readable).toBe(true);
    });

    it('should return null when read is called', () => {
      expect(iterator.read()).toBe(null);
    });
  });

  describe('An ArrayIterator with an empty array', () => {
    let iterator: ArrayIterator<never>;
    beforeEach(() => {
      iterator = new ArrayIterator([]);
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
    });

    it('should not have emitted the `readable` event', () => {
      expect((iterator as any)._eventCounts.readable).toEqual(0);
    });

    it('should have emitted the `end` event', () => {
      expect((iterator as any)._eventCounts.end).toEqual(0);
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

    it('should return null when read is called', () => {
      expect(iterator.read()).toBe(null);
    });

    it('should return null when read is called', () => {
      expect(iterator.read()).toBe(null);
    });
  });

  describe('An ArrayIterator with an empty array without autoStart', () => {
    let iterator: ArrayIterator<never>;
    beforeEach(() => {
      iterator = new ArrayIterator([], { autoStart: false });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
    });

    describe('before calling read', () => {
      it('should have emitted the `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
      });

      it('should no have ended', () => {
        expect(iterator.ended).toBe(false);
      });

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should not be done', () => {
        expect(iterator.done).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });

    describe('after calling read', () => {
      let result: null;
      beforeEach(() => {
        result = iterator.read();
      });

      it('should not have emitted the `readable` event anymore', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
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

      it('should have returned null', () => {
        expect(result).toBe(null);
      });

      it('should return null when read is called', () => {
        expect(iterator.read()).toBe(null);
      });
    });
  });

  describe('An ArrayIterator with a one-item array', () => {
    let iterator: ArrayIterator<number>, item: number | null;
    beforeEach(() => {
      iterator = new ArrayIterator([1]);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', () => {
      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (1)]');
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

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should not be done', () => {
        expect(iterator.done).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the first time', () => {
      beforeEach(() => { item = iterator.read(); });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
      });

      it('should read the first item of the array', () => {
        expect(item).toEqual(1);
      });

      it('should return null when read is called again', () => {
        expect(iterator.read()).toBe(null);
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
    });
  });

  describe('An ArrayIterator with a three-item array', () => {
    let iterator: ArrayIterator<number>, item: number;
    beforeEach(() => {
      iterator = new ArrayIterator([1, 2, 3]);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', () => {
      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (3)]');
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

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should not be done', () => {
        expect(iterator.done).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the first time', () => {
      beforeEach(() => { item = iterator.read(); });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (2)]');
      });

      it('should read the first item of the array', () => {
        expect(item).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
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

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the second time', () => {
      beforeEach(() => { item = iterator.read() as number; });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (1)]');
      });

      it('should read the second item of the array', () => {
        expect(item).toEqual(2);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
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

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the third time', () => {
      beforeEach(() => { item = iterator.read() as number; });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
      });

      it('should read the third item of the array', () => {
        expect(item).toEqual(3);
      });

      it('should return null when read is called again', () => {
        expect(iterator.read()).toBe(null);
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
    });
  });

  describe('An ArrayIterator with an iterable object', () => {
    let iterator: ArrayIterator<number | undefined>, item: number;
    beforeEach(() => {
      const items = [1, 2, 3];
      const iterable = {
        next: () => ({ done: items.length === 0, value: items.shift() }),
        [Symbol.iterator]: () => iterable,
      };
      iterator = new ArrayIterator(iterable);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', () => {
      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (3)]');
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

      it('should not have been destroyed', () => {
        expect(iterator.destroyed).toBe(false);
      });

      it('should not be done', () => {
        expect(iterator.done).toBe(false);
      });

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the first time', () => {
      beforeEach(() => { item = iterator.read() as number; });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (2)]');
      });

      it('should read the first item of the array', () => {
        expect(item).toEqual(1);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
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

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the second time', () => {
      beforeEach(() => { item = iterator.read() as number; });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (1)]');
      });

      it('should read the second item of the array', () => {
        expect(item).toEqual(2);
      });

      it('should not have emitted the `end` event', () => {
        expect((iterator as any)._eventCounts.end).toEqual(0);
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

      it('should be readable', () => {
        expect(iterator.readable).toBe(true);
      });
    });

    describe('after calling read for the third time', () => {
      beforeEach(() => { item = iterator.read() as number; });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[ArrayIterator (0)]');
      });

      it('should read the third item of the array', () => {
        expect(item).toEqual(3);
      });

      it('should return null when read is called again', () => {
        expect(iterator.read()).toBe(null);
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
    });
  });

  describe('An ArrayIterator with an array that is modified afterwards', () => {
    let iterator: ArrayIterator<number | string>, items: (number | null | string)[];
    beforeEach(() => {
      const array: (number | string)[] = [1, 2, 3];
      iterator = new ArrayIterator(array);

      // Modify the array
      array[0] = 'a';
      array.pop();
      array.pop();

      items = [
        iterator.read(),
        iterator.read(),
        iterator.read(),
        iterator.read(),
      ];
    });

    it('should return the original items', () => {
      items.toEqual([1, 2, 3, null]);
    });
  });

  describe('An ArrayIterator with a two-item array that is destroyed', () => {
    let iterator: ArrayIterator<number>;
    beforeEach(() => {
      iterator = new ArrayIterator([1, 2]);
      captureEvents(iterator, 'readable', 'end');
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

    it('should have an empty buffer', () => {
      expect((iterator as any)._buffer).to.be.an('undefined');
    });

    describe('after destroy has been called a second time', () => {
      beforeEach(() => { iterator.destroy(); });

      it('should not have emitted a `readable` event', () => {
        expect((iterator as any)._eventCounts.readable).toEqual(0);
      });

      it('should not have emitted the `end` event a second time', () => {
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
        expect((iterator as any)._events).not.toContain
        
        .to.not.contain.key('data');
        expect((iterator as any)._events).to.not.contain.key('readable');
        expect((iterator as any)._events).to.not.contain.key('end');
      });

      it('should have an empty buffer', () => {
        expect(iterator['_buffer']).to.be.an('undefined');
      });
    });
  });
});
