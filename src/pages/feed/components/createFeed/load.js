export default function createFeed(options) {
  return import('./index').then(({ default: createFeed }) => createFeed(options));
}
