import {
  AsyncIterator,
  EmptyIterator,
  empty,
} from '../asynciterator';

import { EventEmitter } from 'events';
import { expect } from 'chai';

describe('EmptyIterator', () => {
  describe('The EmptyIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance: EmptyIterator<never>;
      beforeEach(() => { instance = new EmptyIterator(); });

      it('should be an EmptyIterator object', () => {
        expect(instance).toBeInstanceOf(EmptyIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });

    describe('the result when called through `.empty`', () => {
      let instance: EmptyIterator<never>;
      beforeEach(() => { instance = empty(); });

      it('should be an EmptyIterator object', () => {
        expect(instance).toBeInstanceOf(EmptyIterator);
      });

      it('should be an AsyncIterator object', () => {
        expect(instance).toBeInstanceOf(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        expect(instance).toBeInstanceOf(EventEmitter);
      });
    });
  });

  describe('An EmptyIterator without arguments', () => {
    let iterator: EmptyIterator<never>;
    beforeEach(() => {
      iterator = new EmptyIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      expect(iterator.toString()).toEqual('[EmptyIterator]');
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
});
