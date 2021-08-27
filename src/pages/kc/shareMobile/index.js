import preall from 'src/common/preall';
var MobileSharePreview = require('./shareMobile');

preall(
  { type: 'function' },
  {
    allownotlogin: true,
    transfertoken: true,
    preloadcb: () => {
      window.hello = new MobileSharePreview();
    },
  },
);

md.global.Config.disableKf5 = true;
