export function loading(state = true, action) {
  const { type, value } = action;
  switch (type) {
    case 'UPDATE_CUSTOM_WIDGET_LOADING':
      return value;
    default:
      return state;
  }
}

export function flag(state = 'init', action) {
  const { type } = action;
  switch (type) {
    case 'REFRESH_CUSTOM_WIDGET_VIEW':
      return Math.random().toString();
    default:
      return state;
  }
}
