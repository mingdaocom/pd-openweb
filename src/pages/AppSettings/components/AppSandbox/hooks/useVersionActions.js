import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { VERSION_ACTION } from 'src/components/AppSandbox/version/constants';

const ACTION_API = {
  [VERSION_ACTION.APPROVE]: appSandboxAjax.approve,
  [VERSION_ACTION.REJECT]: appSandboxAjax.reject,
  [VERSION_ACTION.WITHDRAW]: appSandboxAjax.withdraw,
  [VERSION_ACTION.UPGRADE]: appSandboxAjax.upgradeVersion,
  [VERSION_ACTION.RESTORE]: appSandboxAjax.upgradeVersion,
};

/** 统一处理版本审核、撤回、升级和恢复操作的防重与请求清理。 */
export default function useVersionActions({ appId, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const requestRef = useRef(null);

  const submit = useCallback(
    ({ action, version, rejectReason = '' }) => {
      // 详情页和确认弹层共用该 Hook，必须在请求发起前同步拦截重复操作。
      if (requestRef.current) return;

      if (action === VERSION_ACTION.REJECT && !rejectReason.trim()) {
        alert(_l('请填写应用审核不通过的理由'), 3);
        return;
      }

      const actionApi = ACTION_API[action];
      if (!actionApi) return;

      const request = actionApi(
        {
          appId: version.appId || appId,
          versionId: version.versionId,
          remark: rejectReason.trim(),
        },
        { silent: true },
      );

      requestRef.current = request;
      setSubmitting(true);

      return request
        .then(result => {
          if (requestRef.current !== request || !result) return;

          onSuccess();
          return true;
        })
        .catch(() => undefined)
        .finally(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setSubmitting(false);
        });
    },
    [appId, onSuccess],
  );

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  return { submit, submitting };
}
