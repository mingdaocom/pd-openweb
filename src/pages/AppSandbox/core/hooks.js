import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import projectAjax from 'src/api/project';
import processVersionAjax from 'src/pages/workflow/api/processVersion';

const buildBatchPublishParams = (projectId, versions) => ({
  projectId,
  items: versions.map(({ app, version, description, fileUrl }) => ({
    appId: app.appId,
    versionNo: version,
    description: description.trim(),
    fileUrl: fileUrl || '',
  })),
});

/** 组织沙盒首页批量发布应用版本，并统一管理请求生命周期。 */
export function useBatchPublish(projectId) {
  const [publishing, setPublishing] = useState(false);
  const requestRef = useRef(null);

  const publish = useCallback(
    versions => {
      if (!projectId || !versions.length || requestRef.current) return;

      const request = appSandboxAjax.batchPublish(buildBatchPublishParams(projectId, versions), { silent: true });

      requestRef.current = request;
      setPublishing(true);

      return request
        .then(result => requestRef.current === request && result?.code === 1)
        .catch(() => false)
        .finally(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setPublishing(false);
        });
    },
    [projectId],
  );

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  return { publish, publishing };
}

/** 打开额度抽屉时复用组织后台接口加载当前沙盒环境额度。 */
export function useSandboxQuota(projectId) {
  const [state, setState] = useState({ projectId: '', data: null, loading: false, error: false });
  const requestRef = useRef(null);

  const cancelQuota = useCallback(() => {
    const currentRequest = requestRef.current;

    requestRef.current = null;
    currentRequest?.requests.forEach(request => request?.abort?.());
  }, []);

  const loadQuota = useCallback(() => {
    if (!projectId) return Promise.resolve(false);
    if (requestRef.current) return requestRef.current.promise;

    const requests = [
      projectAjax.getProjectLicenseSupportInfo({ projectId, onlyNormal: true, onlyUsage: false }, { silent: true }),
      projectAjax.getProjectLicenseSupportInfo({ projectId, onlyNormal: false, onlyUsage: true }, { silent: true }),
      processVersionAjax.getProcessUseCount({ companyId: projectId }, { silent: true }),
    ];
    const currentRequest = { requests, promise: null };

    requestRef.current = currentRequest;
    setState({ projectId, data: null, loading: true, error: false });

    currentRequest.promise = Promise.all(requests)
      .then(([baseData, usageData, workflowData]) => {
        if (requestRef.current !== currentRequest) return false;

        setState({
          projectId,
          data: { ...baseData, ...usageData, ...workflowData },
          loading: false,
          error: false,
        });
        return true;
      })
      .catch(() => {
        if (requestRef.current !== currentRequest) return false;

        setState({ projectId, data: null, loading: false, error: true });
        return false;
      })
      .finally(() => {
        if (requestRef.current === currentRequest) requestRef.current = null;
      });

    return currentRequest.promise;
  }, [projectId]);

  useEffect(() => cancelQuota, [cancelQuota, projectId]);

  const isCurrentProject = state.projectId === projectId;

  return {
    data: isCurrentProject ? state.data : null,
    loading: isCurrentProject && state.loading,
    error: isCurrentProject && state.error,
    loadQuota,
    cancelQuota,
  };
}
