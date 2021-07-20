import {
  AsyncIterator,
  SingletonIterator,
  single,
} from '../asynciterator';

import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('SingletonIterator', () => {
  describe('The SingletonIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: SingletonIterator<null>;
      beforeEach(() => { instance = new SingletonIterator(null); });

      it('should be a SingletonIterator object', () => {
        expect(instance).toBeInstanceOf(SingletonIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });

    describe('the result when called through `single`', () => {
      let instance: SingletonIterator<never>;
      beforeEach(() => { instance = single(); });

      it('should be a SingletonIterator object', () => {
        expect(instance).toBeInstanceOf(SingletonIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('An SingletonIterator without item', () => {
    let iterator: SingletonIterator<null>;
    beforeEach(() => {
      iterator = new SingletonIterator(null);
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[SingletonIterator]');
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

  describe('An SingletonIterator with an item', () => {
    let iterator: SingletonIterator<number>, item: number | null;
    beforeEach(() => {
      iterator = new SingletonIterator(1);
      captureEvents(iterator, 'readable', 'end');
    });

    describe('before calling read', () => {
      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[SingletonIterator (1)]');
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

    describe('after calling read for the first time', () => {
      beforeEach(() => { item = iterator.read(); });

      it('should provide a readable `toString` representation', () => {
        expect(iterator.toString()).toEqual('[SingletonIterator]');
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

      it('should not be readable', () => {
        expect(iterator.readable).toBe(false);
      });
    });
  });
});
