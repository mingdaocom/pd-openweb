export default function createCalendar(options) {
  return import('./createCalendar').then(({ default: createCalendar }) => createCalendar(options));
}
