import { compatibleMDJS } from 'src/utils/services/project';
import { getDefaultProject } from '../core/utils';

const SHOW_APP_LIST_ONLY = 2;

export function normalizeSelectedApp(app) {
  if (!app) return null;

  const normalized = {
    id: app.id || app.appId,
    name: app.name || app.appName,
    projectId: app.projectId,
  };

  return normalized.id && normalized.name ? normalized : null;
}

export function chooseMingoApp({ onChoose, onFinish = () => {} }) {
  compatibleMDJS('chooseImage', {
    knowledge: false,
    showAppList: SHOW_APP_LIST_ONLY,
    projectId: getDefaultProject().projectId,
    success: res => {
      const app = normalizeSelectedApp(res && res.app);

      try {
        if (app) onChoose(app);
      } finally {
        onFinish();
      }
    },
    cancel: onFinish,
  });
}
