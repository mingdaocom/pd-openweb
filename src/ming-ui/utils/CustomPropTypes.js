export default {
  promise(prop) {
    return !!prop && (typeof prop === 'object' || typeof prop === 'function') && typeof prop.then === 'function';
  },
};
