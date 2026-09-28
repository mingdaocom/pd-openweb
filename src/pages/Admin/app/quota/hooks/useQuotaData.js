import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import dataLimitAjax from 'src/api/dataLimit';
import workflowDataLimitAjax from 'src/pages/workflow/api/DataLimit';
import { getTranslateInfo } from 'src/utils/services/app';
import { getLimitListRequestParams, getLimitResultPatch, shouldApplyLimitResult } from '../utils';

const getInitialState = globalSize => ({
  initialLimits: [],
  limits: [],
  total: 0,
  initialTotal: 0,
  size: _.isNumber(globalSize) ? globalSize : -1,
  initialSize: _.isNumber(globalSize) ? globalSize : -1,
  appList: [],
  appIds: [],
  worksheetList: [],
  worksheetIds: [],
  pageIndex: 1,
  appPageIndex: 1,
  selectedIds: [],
  // 默认按添加时间倒序；具体接口参数由 getLimitListRequestParams 按业务类型转换。
  sortField: 'createTime',
  sortType: 0,
  batchEditVisible: false,
  resetSelectedCount: 0,
  loading: true,
});

const normalizeWorkflowLimits = data =>
  data.map(item => ({
    ...item,
    app: {
      appName: _.get(item, 'app.name'),
      appIconColor: _.get(item, 'app.iconColor'),
      appIconUrl: _.get(item, 'app.iconUrl'),
    },
  }));

const requestLimits = ({ projectId, businessType, pageIndex, entityIds, sortField, sortType }) => {
  const params = getLimitListRequestParams({ projectId, businessType, pageIndex, entityIds, sortField, sortType });
  return businessType === 4 ? workflowDataLimitAjax.GetUageLimits(params) : dataLimitAjax.getUageLimits(params);
};

export default function useQuotaData({ projectId, businessType = 1, globalSize }) {
  const [state, setQuotaState] = useState(() => getInitialState(globalSize));
  const appPromise = useRef(null);
  const appRequestId = useRef(0);
  const limitRequestId = useRef(0);
  const worksheetRequestId = useRef(0);

  const setState = useCallback(patch => {
    setQuotaState(previous => ({ ...previous, ...(typeof patch === 'function' ? patch(previous) : patch) }));
  }, []);

  const applyLimitResult = useCallback(
    (res, requestState) => {
      const list = businessType === 4 ? normalizeWorkflowLimits(res.data) : res.data;
      setState(previous =>
        getLimitResultPatch({
          list,
          total: res.total,
          append: requestState.append,
          previous,
        }),
      );
    },
    [businessType, setState],
  );

  const loadLimits = useCallback(
    (overrides = {}) => {
      const requestState = { ...state, ...overrides };
      const entityIds = businessType === 2 ? requestState.worksheetIds : requestState.appIds;
      const requestId = ++limitRequestId.current;
      setState(requestState.append ? { loadingMore: true } : { loading: true });

      return requestLimits({ projectId, businessType, entityIds, ...requestState })
        .then(res => {
          if (!shouldApplyLimitResult({ requestId, latestRequestId: limitRequestId.current })) return;
          applyLimitResult(res, requestState);
        })
        .catch(() => {
          if (!shouldApplyLimitResult({ requestId, latestRequestId: limitRequestId.current })) return;
          if (requestState.append) {
            setState({ loadingMore: false });
          } else {
            setState({ size: 0, limits: [], loading: false, loadingMore: false });
          }
        });
    },
    [applyLimitResult, businessType, projectId, setState, state],
  );

  useEffect(() => {
    const initialState = getInitialState(globalSize);
    const entityIds = businessType === 2 ? initialState.worksheetIds : initialState.appIds;
    const requestId = ++limitRequestId.current;
    requestLimits({ projectId, businessType, entityIds, ...initialState })
      .then(res => {
        if (!shouldApplyLimitResult({ requestId, latestRequestId: limitRequestId.current })) return;
        applyLimitResult(res, initialState);
      })
      .catch(() => {
        if (!shouldApplyLimitResult({ requestId, latestRequestId: limitRequestId.current })) return;
        setState({ size: 0, limits: [], loading: false, loadingMore: false });
      });
  }, [applyLimitResult, businessType, globalSize, projectId, setState]);

  useEffect(() => {
    if (!(window.platformENV.isLocal || window.platformENV.isOverseas) || businessType !== 2) return;

    dataLimitAjax.getLimitRowTotal({ projectId }).then(res => {
      setState({
        limitRowTotal:
          res.limitWorksheetRowCount >= 2147483647 ? undefined : _.floor(res.limitWorksheetRowCount / 10000, 4),
      });
    });
  }, [businessType, projectId, setState]);

  const loadAppList = useCallback(
    (overrides = {}) => {
      const requestState = { ...state, ...overrides };
      const { appPageIndex, isMoreApp, loadingApp, appList, keyword = '' } = requestState;
      if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) return;

      setState({ loadingApp: true });
      if (appPromise.current) appPromise.current.abort();
      const requestId = ++appRequestId.current;
      appPromise.current = appManagementAjax.getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageIndex: appPageIndex,
        pageSize: 50,
        keyword,
      });

      appPromise.current
        .then(({ apps = [] }) => {
          if (!shouldApplyLimitResult({ requestId, latestRequestId: appRequestId.current })) return;
          const newAppList = apps.map(item => ({ label: item.appName, value: item.appId }));
          const nextAppList = appPageIndex === 1 ? newAppList : appList.concat(newAppList);
          setState({
            appList: nextAppList,
            isMoreApp: newAppList.length >= 50,
            loadingApp: false,
            appPageIndex: appPageIndex + 1,
          });
        })
        .catch(() => {
          if (!shouldApplyLimitResult({ requestId, latestRequestId: appRequestId.current })) return;
          setState({ loadingApp: false });
        });
    },
    [projectId, setState, state],
  );

  const loadWorksheetList = useCallback(
    (appIds = []) => {
      if (businessType !== 2) return;

      const requestId = ++worksheetRequestId.current;

      if (_.isEmpty(appIds)) {
        setState({ worksheetList: [], worksheetIds: [] });
        return;
      }

      appManagementAjax.getWorksheetsUnderTheApp({ projectId, appIds, isFilterCustomPage: true }).then(res => {
        if (!shouldApplyLimitResult({ requestId, latestRequestId: worksheetRequestId.current })) return;
        const worksheetList = appIds.reduce(
          (list, appId) =>
            list.concat(
              (res[appId] || []).map(item => ({
                label: getTranslateInfo(appId, null, item.worksheetId).name || item.worksheetName,
                value: item.worksheetId,
              })),
            ),
          [],
        );
        setState(previous => ({
          worksheetList,
          worksheetIds: previous.worksheetIds.filter(id => worksheetList.find(item => item.value === id)),
        }));
      });
    },
    [businessType, projectId, setState],
  );

  return { state, setState, loadLimits, loadAppList, loadWorksheetList };
}
