import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

export const useSandboxDeployCheck = () => {
  const [checking, setChecking] = useState(true);
  const [deployed, setDeployed] = useState(false);
  const requestRef = useRef(null);

  useEffect(
    () => () => {
      const request = requestRef.current;
      requestRef.current = null;
      request?.abort?.();
    },
    [],
  );

  const checkDeploy = useCallback(() => {
    if (requestRef.current) return Promise.resolve(false);

    const request = appSandboxAjax.checkDeploy({}, { silent: true });

    requestRef.current = request;
    setChecking(true);

    return request
      .then(result => {
        if (requestRef.current !== request) return false;

        const isDeployed = Boolean(result);

        requestRef.current = null;
        setChecking(false);
        setDeployed(isDeployed);

        return isDeployed;
      })
      .catch(_requestError => {
        if (requestRef.current !== request) return false;

        requestRef.current = null;
        setChecking(false);
        setDeployed(false);
        alertIfNotUnauthorized(_requestError, _l('检查沙盒环境失败，请稍后重试'), 2);
        return false;
      });
  }, []);

  return { checking, deployed, checkDeploy };
};

/** 自动检查沙盒服务是否已部署。组织后台不再维护额外的项目级沙盒开关。 */
export const useSandboxDeployment = projectId => {
  const { checking, deployed, checkDeploy } = useSandboxDeployCheck();

  useEffect(() => {
    if (projectId) checkDeploy();
  }, [checkDeploy, projectId]);

  return { checking, deployed };
};
