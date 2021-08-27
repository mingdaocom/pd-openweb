function execFunc(func, ...args) {
  if (typeof func === 'function') {
    return func.call(this, ...args);
  }
}

module.exports = {
  execFunc,
};
