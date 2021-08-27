/* eslint-disable prefer-rest-params,prefer-spread */
/*
 * Currently it's simply a jQuery promise wrapper.
 */

/* eslint-disable prefer-rest-params,prefer-spread */
/*
 * Currently it's simply a jQuery promise wrapper.
 */

/* eslint-disable prefer-rest-params,prefer-spread */
/*
 * Currently it's simply a jQuery promise wrapper.
 */

/* eslint-disable prefer-rest-params,prefer-spread */
/*
 * Currently it's simply a jQuery promise wrapper.
 */

const Promise = function () {
  return $.Deferred();
};

Promise.resolve = function () {
  const d = $.Deferred();
  return d.resolve.apply(d, arguments);
};

Promise.reject = function () {
  const d = $.Deferred();
  return d.reject.apply(d, arguments);
};

module.exports = Promise;
