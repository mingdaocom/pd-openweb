var supportEmoji;

function isSupportEmoji() {
  // TODO
  if (typeof supportEmoji === 'boolean') return supportEmoji;
  var ua = window.navigator.userAgent;
  var windowsVersionMatch = ua.match(/Windows NT ([\d\.]+)/);
  if (windowsVersionMatch) {
    var windowsVersion = parseFloat(windowsVersionMatch[1]);
    if (windowsVersion < 6.2) {
      // below windows 8
      return (supportEmoji = false);
    }
  }
  var chromeVersionMatch = ua.match(/Chrome\/([\d]+)/);
  if (chromeVersionMatch && ua.indexOf('Edge') === -1) {
    var chromeVersion = parseInt(chromeVersionMatch[1], 10);
    if (chromeVersion < 44) {
      return (supportEmoji = false);
    }
  }
  return (supportEmoji = true);
}

function emojiFontFace(el) {
  if (isSupportEmoji()) return;
  try {
    require(['!style-loader!css-loader!./emojiFontFace.css'], function () {
      if (el) $(el).addClass('emojiFontFace');
    });
  } catch (e) { }
}

module.exports = emojiFontFace;
