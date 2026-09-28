import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { VERSION_ACTION } from 'src/components/AppSandbox/version/constants';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

// 组织后台按权限统一使用批量接口；单行操作也会转换成只包含一个版本 ID 的数组。
// approve、reject、upgradeVersion、withdraw 等单个接口仅供应用后台使用。
const createActionRequest = ({ action, projectId, versionIds, remark }) => {
  if (!versionIds.length) return;

  if (action === VERSION_ACTION.APPROVE) {
    return appSandboxAjax.batchApprove({ projectId, versionIds }, { silent: true });
  }

  if (action === VERSION_ACTION.REJECT) {
    return appSandboxAjax.batchReject({ projectId, versionIds, remark }, { silent: true });
  }

  if ([VERSION_ACTION.UPGRADE, VERSION_ACTION.RESTORE].includes(action)) {
    return appSandboxAjax.batchUpgradeVersion({ projectId, versionIds }, { silent: true });
  }
};

const getActionErrorMessage = action => {
  if (action === VERSION_ACTION.APPROVE) return _l('通过失败，请稍后重试');
  if (action === VERSION_ACTION.REJECT) return _l('驳回失败，请稍后重试');
  return _l('升级失败，请稍后重试');
};

function useReviewVersionAction({ projectId, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const requestRef = useRef(null);

  const submit = useCallback(
    ({ action, version, versionIds = [], rejectReason }) => {
      if (requestRef.current) return;

      const remark = rejectReason?.trim() || '';

      if (action === VERSION_ACTION.REJECT && !remark) {
        alert(_l('请填写应用审核不通过的理由'), 3);
        return;
      }

      // 详情弹层传 version，列表批量操作传 versionIds，最终统一成组织级批量接口的参数。
      const actionVersionIds = version ? [version.versionId] : versionIds;
      const isSingleVersionAction = Boolean(version);
      const request = createActionRequest({ action, projectId, versionIds: actionVersionIds, remark });

      if (!request) return;

      requestRef.current = request;
      setSubmitting(true);

      return request
        .then(result => {
          if (requestRef.current !== request) return;
          // 组织级批量接口约定 code === 1 才表示本次操作成功。
          if (result?.code !== 1) {
            alert(getActionErrorMessage(action), 2);
            return;
          }

          onSuccess({
            action,
            affectedCount: actionVersionIds.length,
            affectedVersionIds: actionVersionIds,
            isSingleVersionAction,
          });
        })
        .catch(_requestError => {
          if (requestRef.current === request) alertIfNotUnauthorized(_requestError, getActionErrorMessage(action), 2);
        })
        .finally(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setSubmitting(false);
        });
    },
    [onSuccess, projectId],
  );

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  return { submitting, submit };
}

export default useReviewVersionAction;
