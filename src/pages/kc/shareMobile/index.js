import preall from 'src/common/entries/preall';
import MobileSharePreview from './shareMobile';

md.global.Config.disableKf5 = true;

export default function (projectId) {
  preall({ type: 'function' }, { allowNotLogin: true });
  window.hello = new MobileSharePreview({ projectId });
}
