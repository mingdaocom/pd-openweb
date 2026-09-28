import { useCallback, useEffect, useRef, useState } from 'react';
import appSandboxAjax from 'src/api/appSandbox';
import { SANDBOX_LIST_ORDER } from 'src/utils/domain/app/sandbox';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { VERSION_LIST_PAGE_SIZE } from '../constants';

const noop = () => {};

const UPGRADE_POLL_INTERVAL = 3000;

/** 分页加载当前应用的版本，并保留接口原始字段供列表和详情使用。 */
export default function useVersions({ appId, onChange = noop }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadFailed, setLoadFailed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const versionsRef = useRef([]);
  const loadingRef = useRef(true);
  const onChangeRef = useRef(onChange);
  const upgradingVersionId = versions[0]?.upgrading ? versions[0].versionId : undefined;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  /** 同步列表及其外部派生状态。 */
  const updateVersions = useCallback(nextVersions => {
    versionsRef.current = nextVersions;
    setVersions(nextVersions);
    onChangeRef.current(nextVersions);
  }, []);

  const updateVersionPollingStatus = useCallback(
    (versionId, { upgrading, status }) => {
      const nextVersions = versionsRef.current.map(version =>
        version.versionId === versionId
          ? { ...version, upgrading: Boolean(upgrading), status: status ?? version.status }
          : version,
      );

      updateVersions(nextVersions);
    },
    [updateVersions],
  );
  const refresh = useCallback(() => {
    versionsRef.current = [];
    loadingRef.current = true;
    setVersions([]);
    setTotal(0);
    setLoadFailed(false);
    setLoading(true);
    setPageIndex(1);
    setRefreshKey(current => current + 1);
  }, []);
  const loadMore = useCallback(() => {
    if (loadingRef.current || (!loadFailed && versionsRef.current.length >= total)) return;

    loadingRef.current = true;
    setLoading(true);
    if (loadFailed) {
      setLoadFailed(false);
      setRefreshKey(current => current + 1);
      return;
    }

    setPageIndex(current => current + 1);
  }, [loadFailed, total]);

  useEffect(() => {
    let canceled = false;
    const request = appSandboxAjax.getByAppId(
      {
        appId,
        statuses: [],
        createAccountIds: [],
        order: SANDBOX_LIST_ORDER.DESC,
        pageIndex,
        pageSize: VERSION_LIST_PAGE_SIZE,
      },
      { silent: true },
    );

    request
      .then(result => {
        if (canceled) return;

        const pageVersions = result?.data || [];
        const loadedVersions = pageIndex === 1 ? [] : versionsRef.current;
        const versionMap = new Map(loadedVersions.map(version => [version.versionId, version]));

        pageVersions.forEach(version => versionMap.set(version.versionId, version));
        const nextVersions = [...versionMap.values()];

        updateVersions(nextVersions);
        setTotal(result?.total || 0);
        setLoadFailed(false);
        loadingRef.current = false;
        setLoading(false);
      })
      .catch(_requestError => {
        if (canceled) return;

        loadingRef.current = false;
        setLoading(false);
        setLoadFailed(true);
        alertIfNotUnauthorized(_requestError, _l('获取沙盒版本失败，请稍后重试'), 2);
      });

    return () => {
      canceled = true;
      request?.abort?.();
    };
  }, [appId, pageIndex, refreshKey, updateVersions]);

  // GetByAppId 标记升级中的版本后，按版本轮询 Get，仅同步该行的 upgrading 和 status 字段。
  useEffect(() => {
    if (!upgradingVersionId) return;

    let canceled = false;
    let request = null;
    let timer = null;

    const scheduleNext = () => {
      if (canceled) return;

      timer = setTimeout(pollVersion, UPGRADE_POLL_INTERVAL);
    };

    const pollVersion = () => {
      if (canceled || request) return;

      request = appSandboxAjax.get({ versionId: upgradingVersionId }, { silent: true });

      const currentRequest = request;

      currentRequest
        .then(result => {
          if (canceled || request !== currentRequest) return;

          const nextVersion = result?.data || result;

          if (!nextVersion?.versionId) {
            scheduleNext();
            return;
          }

          updateVersionPollingStatus(upgradingVersionId, nextVersion);
          if (nextVersion.upgrading) {
            scheduleNext();
          }
        })
        .catch(scheduleNext)
        .finally(() => {
          if (request === currentRequest) {
            request = null;
          }
        });
    };

    scheduleNext();

    return () => {
      canceled = true;
      clearTimeout(timer);
      request?.abort?.();
      timer = null;
      request = null;
    };
  }, [updateVersionPollingStatus, upgradingVersionId]);

  return {
    versions,
    loading,
    loadMore,
    refresh,
  };
}
