import { useEffect, useMemo, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { isSandboxSupportedProject } from 'src/utils/domain/app/sandbox';

/** 套餐支持时直接放行；仅在套餐不支持时查询组织是否已有沙盒数据。 */
export const checkSandboxProjectAccess = projectId => {
  if (!projectId) return Promise.resolve(false);
  if (isSandboxSupportedProject(projectId)) return Promise.resolve(true);

  const request = appSandboxAjax.checkProjectDataExists({ projectId }, { silent: true });
  const promise = Promise.resolve(request).then(Boolean, () => false);

  promise.abort = () => request?.abort?.();
  return promise;
};

/** 获取单个组织的沙盒访问状态。低版本组织仅在已有沙盒数据时可访问。 */
export const useSandboxProjectAccess = projectId => {
  const sandboxSupported = isSandboxSupportedProject(projectId);
  const [accessState, setAccessState] = useState({ projectId: undefined, hasData: false });
  const accessChecked = sandboxSupported || accessState.projectId === projectId;

  useEffect(() => {
    if (!projectId || sandboxSupported) return;

    let active = true;
    const request = checkSandboxProjectAccess(projectId);

    request.then(hasData => {
      if (active) setAccessState({ projectId, hasData });
    });

    return () => {
      active = false;
      request?.abort?.();
    };
  }, [projectId, sandboxSupported]);

  return {
    checking: Boolean(projectId) && !accessChecked,
    canAccess: Boolean(projectId) && (sandboxSupported || (accessChecked && accessState.hasData)),
    sandboxSupported,
  };
};

/** 过滤可访问沙盒的组织；套餐不支持的组织按需并行检查存量数据。 */
export const useAccessibleSandboxProjects = (projects = []) => {
  const unsupportedProjects = useMemo(
    () => projects.filter(project => !isSandboxSupportedProject(project.projectId)),
    [projects],
  );
  const unsupportedProjectKey = unsupportedProjects.map(project => project.projectId).join(',');
  const [accessState, setAccessState] = useState({ projectKey: '', projectIds: [] });

  useEffect(() => {
    if (!unsupportedProjects.length) return;

    let active = true;
    const requests = unsupportedProjects.map(project => checkSandboxProjectAccess(project.projectId));

    Promise.all(requests).then(results => {
      if (!active) return;

      setAccessState({
        projectKey: unsupportedProjectKey,
        projectIds: unsupportedProjects.filter((project, index) => results[index]).map(project => project.projectId),
      });
    });

    return () => {
      active = false;
      requests.forEach(request => request?.abort?.());
    };
  }, [unsupportedProjectKey, unsupportedProjects]);

  const existingProjectIds =
    accessState.projectKey === unsupportedProjectKey ? new Set(accessState.projectIds) : new Set();
  const accessibleProjects = projects.filter(
    project => isSandboxSupportedProject(project.projectId) || existingProjectIds.has(project.projectId),
  );

  return {
    projects: accessibleProjects,
    checking: Boolean(unsupportedProjects.length) && accessState.projectKey !== unsupportedProjectKey,
  };
};
