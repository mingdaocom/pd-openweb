import { getRequest } from 'src/util';
var request = getRequest();

var MatchApp = {};

MatchApp.options = {
  downloadPage: '/network',
  appProtocol: 'mingdao://',
  url: '',
};
MatchApp.init = function (opts) {
  MatchApp.options = $.extend(MatchApp.options, opts);

  if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
    if (!MatchApp.options.url) {
      var encrypeAccount = request['username'];
      var encrypePassword = request['password'];
      if (encrypeAccount && encrypePassword) {
        MatchApp.options.url = 'app.mingdao.com/login?username=' + encrypeAccount + '&password=' + encrypePassword;
      }
      window.location.href =
        MatchApp.options.downloadPage +
        '?appUrl=' +
        encodeURIComponent(MatchApp.options.appProtocol + MatchApp.options.url);
    } else {
      window.location.href = MatchApp.options.url;
    }
  } else if (navigator.userAgent.match(/android/i)) {
    window.location.href = MatchApp.options.appProtocol + MatchApp.options.url;
    if (location.pathname.indexOf(MatchApp.options.downloadPage) === -1) {
      window.setTimeout(function () {
        window.location.href = MatchApp.options.downloadPage;
      }, 1000);
    }
  } else {
    window.location.href = MatchApp.options.downloadPage;
  }
};

export default MatchApp;
