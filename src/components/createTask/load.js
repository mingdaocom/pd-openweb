export default function createTask(options) {
  return import('./createTask').then(({ default: createTask }) => createTask(options));
}
