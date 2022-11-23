import preall from 'src/common/preall';
import MobileSharePreview from './shareMobile';

md.global.Config.disableKf5 = true;

export default function () {
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
}
