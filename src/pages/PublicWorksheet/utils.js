import qs from 'query-string';
const userAgent = navigator.userAgent;

function getBrowserInfo() {
  let browser = _l('未知');
  const browsers = [
    ['Android', /Android\s([0-9\.]+)/],
    ['iOS', /Version\/([0-9\._]+).*Mobile.*Safari.*/],
    ['Firefox', /Firefox\/([0-9\.]+)(?:\s|$)/],
    ['Opera', /Opera\/([0-9\.]+)(?:\s|$)/],
    ['Opera', /OPR\/([0-9\.]+)(:?\s|$)$/],
    ['Edge', /(Edge|Edg)\/([0-9\._]+)/],
    ['IE', /Trident\/7\.0.*rv\:([0-9\.]+)\).*Gecko$/],
    ['IE', /MSIE\s([0-9\.]+);.*Trident\/[4-7].0/],
    ['IE', /MSIE\s(7\.0)/],
    ['Safari', /Version\/([0-9\._]+).*Safari/],
    ['Chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9\.]+)(:?\s|$)/],
  ];
  for (let i = 0; i < browsers.length; i++) {
    if (browsers[i][1].test(userAgent)) {
      browser = browsers[i][0];
      break;
    }
  }
  return browser;
}

function getDeviceInfo() {
  var OS = navigator.platform;
  if (userAgent.indexOf('Android') > -1) {
    return 'Android';
  }
  if (userAgent.indexOf('iPhone') > -1) {
    return 'iPhone';
  }
  if (userAgent.indexOf('Mac') > -1) {
    return 'Mac';
  }
  if (OS === 'Win32' || OS === 'Windows') {
    return 'Windows';
  } else {
    return _l('未知');
  }
}

function getSystemInfo() {
  var OS = navigator.platform;
  if (userAgent.indexOf('Android') > -1) {
    return 'Android';
  } else if (userAgent.indexOf('iPhone') > -1) {
    return 'iOS';
  } else if (OS === 'Win32' || OS === 'Windows') {
    return 'Windows';
  } else if (OS === 'Mac68K' || OS === 'MacPPC' || OS === 'Macintosh' || OS === 'MacIntel') {
    return 'Mac OS';
  } else if (OS === 'X11') {
    return 'Unix';
  } else if (String(OS).indexOf('Linux') > -1) {
    return 'Linux';
  } else {
    return _l('未知');
  }
}

function getSource() {
  const queryStart = location.href.indexOf('?');
  if (queryStart < 0) {
    return;
  }
  const query = qs.parse(location.href.slice(location.href.indexOf('?') + 1));
  return decodeURIComponent(query.source);
}

export function getInfo() {
  return {
    browser: getBrowserInfo(),
    device: getDeviceInfo(),
    system: getSystemInfo(),
    source: getSource(),
  };
}
