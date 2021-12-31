export async function promisifyEventEmitter(eventEmitter) {
  return new Promise((resolve, reject) => {
    eventEmitter.on('data', () => {});
    eventEmitter.on('end', resolve);
    eventEmitter.on('error', reject);
  });
};
