import {
  AsyncIterator,
  EmptyIterator,
  empty,
} from '../dist/asynciterator.js';

import { EventEmitter } from 'events';

describe('EmptyIterator', () => {
  describe('The EmptyIterator function', () => {
    describe('the result when called with `new`', () => {
      let instance;
      before(() => { instance = new EmptyIterator(); });

      it('should be an EmptyIterator object', () => {
        instance.should.be.an.instanceof(EmptyIterator);
      });

      it('should be an AsyncIterator object', () => {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });

    describe('the result when called through `.empty`', () => {
      let instance;
      before(() => { instance = empty(); });

      it('should be an EmptyIterator object', () => {
        instance.should.be.an.instanceof(EmptyIterator);
      });

      it('should be an AsyncIterator object', () => {
        instance.should.be.an.instanceof(AsyncIterator);
      });

      it('should be an EventEmitter object', () => {
        instance.should.be.an.instanceof(EventEmitter);
      });
    });
  });

  describe('An EmptyIterator without arguments', () => {
    let iterator;
    before(() => {
      iterator = new EmptyIterator();
      captureEvents(iterator, 'readable', 'end');
    });

    it('should provide a readable `toString` representation', () => {
      iterator.toString().should.equal('[EmptyIterator]');
    });

    it('should not have emitted the `readable` event', () => {
      iterator._eventCounts.readable.should.equal(0);
    });

    it('should have emitted the `end` event', () => {
      iterator._eventCounts.end.should.equal(1);
    });

    it('should have ended', () => {
      iterator.ended.should.be.true;
    });

    it('should not be readable', () => {
      iterator.readable.should.be.false;
    });

    it('should return null when read is called', () => {
      expect(iterator.read()).to.be.null;
    });
  });

  describe('An EmptyIterator should not emit until read from', () => {
    it('no awaiting', async () => {
      const iterator = new EmptyIterator();
      await expect(await promisifyEventEmitter(iterator)).to.be.undefined;
    });

    it('awaiting undefined', async () => {
      const iterator = new EmptyIterator();
      await undefined;
      await expect(await promisifyEventEmitter(iterator)).to.be.undefined;
    });

    it('awaiting promise', async () => {
      const iterator = new EmptyIterator();
      await Promise.resolve();
      await expect(await promisifyEventEmitter(iterator)).to.be.undefined;
    });
  });
});

export async function promisifyEventEmitter(eventEmitter) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-empty-function
    eventEmitter.on('data', () => {});
    eventEmitter.on('end', resolve);
    eventEmitter.on('error', reject);
  });
}
