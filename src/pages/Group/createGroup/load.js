export default function createGroup(options) {
  return import('./index').then(({ default: createGroup }) => createGroup(options));
}
