import preall from 'src/common/entries/preall';
import MobileSharePreview from './shareMobile';

export default function (projectId) {
  preall({ type: 'function' }, { allowNotLogin: true });
  window.hello = new MobileSharePreview({ projectId });
}
