export default function (arr) {
  const obj = {};
  if (!arr) {
    return obj;
  }
  for (let i = arr.length - 1; i >= 0; i--) {
    obj[arr[i]] = arr[i];
  }
  return obj;
}
