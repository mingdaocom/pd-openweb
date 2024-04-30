import preall from 'src/common/preall';
import MobileSharePreview from './shareMobile';

md.global.Config.disableKf5 = true;

export default function () {
  preall({ type: 'function' }, { allowNotLogin: true });
  window.hello = new MobileSharePreview();
}
