/**
 * 包装可中止的请求函数，使同名请求再次执行前中止上一次请求。
 */
export function wrapAjax(func) {
  const cache = {};

  return (...args) => {
    if (cache[func.name]) {
      cache[func.name].abort();
    }

    cache[func.name] = func(...args);
    return cache[func.name];
  };
}
