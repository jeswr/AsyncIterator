export async function promisifyEventEmitter(eventEmitter) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-empty-function
    eventEmitter.on('data', () => {});
    eventEmitter.on('end', resolve);
    eventEmitter.on('error', reject);
  });
}
