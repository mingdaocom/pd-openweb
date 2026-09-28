export function isUnauthorizedError(error) {
  return [error?.status, error?.response?.status, error?.errorCode].some(status => Number(status) === 401);
}

export function alertIfNotUnauthorized(error, ...args) {
  if (!isUnauthorizedError(error)) {
    return alert(...args);
  }
}
