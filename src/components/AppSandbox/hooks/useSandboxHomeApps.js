import { useEffect, useState } from 'react';
import homeAppAjax from 'src/api/homeApp';

const EMPTY_APPS = [];

/** 加载当前组织在沙盒首页可访问的应用，并隔离组织切换期间的过期响应。 */
export const useSandboxHomeApps = projectId => {
  const [appsState, setAppsState] = useState({ projectId: undefined, apps: EMPTY_APPS });
  const isCurrentProject = appsState.projectId === projectId;

  useEffect(() => {
    if (!projectId) return;

    let active = true;
    const request = homeAppAjax.getMyApp({ projectId, containsLinks: true });

    Promise.resolve(request).then(
      data => {
        if (active) setAppsState({ projectId, apps: data?.apps || EMPTY_APPS });
      },
      () => {
        if (active) setAppsState({ projectId, apps: EMPTY_APPS });
      },
    );

    return () => {
      active = false;
      request?.abort?.();
    };
  }, [projectId]);

  return {
    apps: isCurrentProject ? appsState.apps : EMPTY_APPS,
    loading: Boolean(projectId) && !isCurrentProject,
  };
};
