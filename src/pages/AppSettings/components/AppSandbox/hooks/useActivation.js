import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { buildSandboxEnableParams } from 'src/utils/domain/app/sandbox';
import { usePolling } from 'src/utils/platform/react/polling';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

// sandboxStatus=0 表示未开启，只有 status=1（进行中）才需要轮询开启记录。
const PENDING_STATUS = 1;
const isRequestSuccess = result => result?.code === 1;
const isPending = status => status === PENDING_STATUS;

/** 管理单应用开启流程，并在异步初始化期间持续同步开启记录。 */
export default function useActivation({ status, recordId, onChange }) {
  const [enabling, setEnabling] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const requestRef = useRef(null);

  // Enable 返回记录 ID 后，以记录状态作为轮询是否继续的唯一依据。
  const fetchRecord = useCallback(async () => {
    const result = await appSandboxAjax.getEnableRecord({ id: recordId }, { silent: true });
    const record = result?.data;

    if (!isRequestSuccess(result) || !record) throw new Error('Invalid sandbox enable record');

    onChange({
      sandboxStatus: record.status,
      sandboxRecordId: record.id,
    });
    return isPending(record.status);
  }, [recordId, onChange]);
  const shouldContinue = useCallback(value => Boolean(value), []);
  const { start, stop } = usePolling({ fetcher: fetchRecord, shouldContinue });

  useEffect(() => {
    // 状态离开排队中/处理中时立即停止轮询，避免页面继续产生无效请求。
    if (isPending(status) && recordId) {
      start();
    } else {
      stop();
    }

    return stop;
  }, [status, recordId, start, stop]);

  useEffect(() => {
    return () => {
      const request = requestRef.current;

      requestRef.current = null;
      request?.abort?.();
    };
  }, []);

  const confirm = useCallback(
    settingsList => {
      // requestRef 同时承担防重复提交和卸载后忽略旧响应的职责。
      if (requestRef.current) return;

      const request = appSandboxAjax.enable(buildSandboxEnableParams(settingsList[0]), { silent: true });

      requestRef.current = request;
      setEnabling(true);

      return request
        .then(result => {
          if (requestRef.current !== request) return;

          const record = result?.record;

          if (!isRequestSuccess(result) || !record?.id) {
            alert(_l('开启应用沙盒失败，请稍后重试'), 2);
            return;
          }

          onChange({
            sandboxStatus: record.status,
            sandboxRecordId: record.id,
          });
          setSettingsVisible(false);
          return true;
        })
        .catch(_requestError => {
          if (requestRef.current === request)
            alertIfNotUnauthorized(_requestError, _l('开启应用沙盒失败，请稍后重试'), 2);
        })
        .finally(() => {
          if (requestRef.current !== request) return;

          requestRef.current = null;
          setEnabling(false);
        });
    },
    [onChange],
  );
  const openSettings = useCallback(() => setSettingsVisible(true), []);
  const closeSettings = useCallback(() => setSettingsVisible(false), []);

  return {
    confirming: enabling,
    initializing: enabling || (Boolean(recordId) && isPending(status)),
    settingsVisible,
    openSettings,
    closeSettings,
    confirm,
  };
}
