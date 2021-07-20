import {
  AsyncIterator,
  IntegerIterator,
  range,
} from '../asynciterator';

import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('IntegerIterator', () => {
  describe('The IntegerIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: IntegerIterator;
      beforeEach(() => { instance = new IntegerIterator(); });

      it('should be an IntegerIterator object', () => {
        expect(instance).toBeInstanceOf(IntegerIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });

    describe('the result when called through `range', () => {
      let instance: IntegerIterator;
      beforeEach(() => { instance = range(); });

      it('should be an IntegerIterator object', () => {
        expect(instance).toBeInstanceOf(IntegerIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('An IntegerIterator without arguments', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (0...Infinity)]');
    });

    describe('before reading', () => {
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

    describe('when reading items', () => {
      it('should return 0 on read call 1', () => {
        expect(iterator.read()).to.equal(0);
      });

      it('should return 1 on read call 2', () => {
        expect(iterator.read()).to.equal(1);
      });

      it('should return 2 on read call 3', () => {
        expect(iterator.read()).to.equal(2);
      });

      it('should not have emitted more `readable` events', () => {
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
  });

  describe('An IntegerIterator from -5 to 10 in steps of 5', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ start: -5, end: 10, step: 5 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (-5...10)]');
    });

    describe('before reading', () => {
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

    describe('when reading items', () => {
      it('should return -5 on read call 1', () => {
        expect(iterator.read()).to.equal(-5);
      });

      it('should return 0 on read call 2', () => {
        expect(iterator.read()).to.equal(0);
      });

      it('should return 5 on read call 3', () => {
        expect(iterator.read()).to.equal(5);
      });

      it('should not have emitted more `readable` events', () => {
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

    describe('when reading the final item', () => {
      it('should return 10 on read call 4', () => {
        expect(iterator.read()).to.equal(10);
      });

      it('should not have emitted more `readable` events', () => {
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

      it('should return null on read call 5', () => {
        expect(iterator.read()).to.equal(null);
      });
    });
  });


  describe('An IntegerIterator from 10 to -5 in steps of -5', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ start: 10, end: -5, step: -5 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (10...-5)]');
    });

    describe('before reading', () => {
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

    describe('when reading items', () => {
      it('should return 10 on read call 1', () => {
        expect(iterator.read()).to.equal(10);
      });

      it('should return 5 on read call 2', () => {
        expect(iterator.read()).to.equal(5);
      });

      it('should return 0 on read call 3', () => {
        expect(iterator.read()).to.equal(0);
      });

      it('should not have emitted more `readable` events', () => {
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

    describe('when reading the final item', () => {
      it('should return -5 on read call 4', () => {
        expect(iterator.read()).to.equal(-5);
      });

      it('should not have emitted more `readable` events', () => {
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

      it('should return null on read call 5', () => {
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator starting at Infinity', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ start: Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (Infinity...Infinity)]');
    });

    describe('before reading', () => {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator starting at Infinity and counting down', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ start: Infinity, step: -1 });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (Infinity...-Infinity)]');
    });

    describe('before reading', () => {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator starting at -Infinity', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ start: -Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (-Infinity...Infinity)]');
    });

    describe('before reading', () => {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator stopping at -Infinity', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ end: -Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (0...-Infinity)]');
    });

    describe('before reading', () => {
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
        expect(iterator.read()).to.equal(null);
      });
    });
  });

  describe('An IntegerIterator with Infinity as step size', () => {
    let iterator: IntegerIterator;
    beforeEach(() => {
      iterator = new IntegerIterator({ step: Infinity });
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[IntegerIterator (0...Infinity)]');
    });

    describe('when reading items', () => {
      it('should return 0 on read call 1', () => {
        expect(iterator.read()).to.equal(0);
      });

      it('should return Infinity on read call 1', () => {
        expect(iterator.read()).to.equal(Infinity);
      });

      it('should return Infinity on read call 2', () => {
        expect(iterator.read()).to.equal(Infinity);
      });
    });
  });
});
