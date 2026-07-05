import { ArrayIterator } from '../dist/asynciterator.js';

function noop() {
  // empty function to drain an iterator
}

function run(iterator) {
  return new Promise((resolve, reject) => {
    iterator.on('data', noop);
    iterator.on('error', reject);
    iterator.on('end', resolve);
  });
}

async function perf(createIterator, description) {
  const now = performance.now();
  await run(createIterator());
  console.log(description, `${(performance.now() - now).toFixed(1)}ms`);
}

function items(count) {
  return new ArrayIterator(new Array(count).fill(true).map((_, i) => i));
}

// Simulates an I/O-bound mapping, such as a network request
function fetchItem(latency) {
  return item => new Promise(resolve => setTimeout(() => resolve(item), latency));
}

(async () => {
  // I/O-bound pipeline: 64 items, 10ms of latency per item
  const count = 64, latency = 10;
  await perf(() => items(count).transform({
    transform(item, done, push) {
      fetchItem(latency)(item).then(result => {
        push(result);
        done();
      });
    },
  }), `${count} items x ${latency}ms sequential transform\t\t`);
  await perf(() => items(count).parallelMap(fetchItem(latency), { concurrency: 1 }),
    `${count} items x ${latency}ms parallelMap concurrency 1\t`);
  await perf(() => items(count).parallelMap(fetchItem(latency), { concurrency: 4 }),
    `${count} items x ${latency}ms parallelMap concurrency 4\t`);
  await perf(() => items(count).parallelMap(fetchItem(latency), { concurrency: 8 }),
    `${count} items x ${latency}ms parallelMap concurrency 8\t`);

  // Hot path without latency: overhead of concurrency 1 versus a sequential transform
  const hotCount = 1_000_000;
  await run(items(hotCount).map(item => item)); // warm-up run
  await perf(() => items(hotCount).transform({
    transform(item, done, push) {
      push(item);
      done();
    },
  }), `${hotCount.toLocaleString('en')} items sequential transform\t\t`);
  await perf(() => items(hotCount).parallelMap(item => item, { concurrency: 1 }),
    `${hotCount.toLocaleString('en')} items parallelMap concurrency 1\t`);
})();
