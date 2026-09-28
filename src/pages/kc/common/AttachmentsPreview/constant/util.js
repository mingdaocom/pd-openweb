import qs from 'query-string';

/**
 * 拆分文件名
 * @param  {} fullname
 * @return {
 *   name: 'name',
 *   ext: 'ext',
 * }
 */
export function splitFileName(fullname) {
  let name;

  if (fullname[0] === '.') {
    name = '.' + fullname.slice(1).match(/.*(?=\.)|.*/)[0];
  } else {
    name = fullname.match(/.*(?=\.)|.*/)[0];
  }

  const ext = fullname.replace(name, '').slice(1);
  return {
    name,
    ext,
  };
}

/**
 * 去掉url search和hash参数
 * @param  string url
 * @retun  steing  url
 */
export function getUrlNoSearch(url) {
  if (url.indexOf('?') > -1) {
    url = url.slice(0, url.indexOf('?'));
  }

  if (url.indexOf('#') > -1) {
    url = url.slice(0, url.indexOf('#'));
  }

  return url;
}

export function urlAddParams(originurl, value) {
  if (!originurl) return '';
  // 如果是带 token 的链接，换参数会导致 token 失效。所以直接返回
  if (originurl.indexOf('token=') > -1) return originurl;
  const origin = originurl.split('?')[0];
  const query = qs.parse(originurl.replace(origin, '').slice(1));
  return value
    ? origin + '?' + qs.stringify(Object.assign(query, value)).replace(/=&/g, '&').replace(/=$/g, '')
    : origin;
}
