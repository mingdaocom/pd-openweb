import { useCallback, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import appManagementAjax from 'src/api/appManagement';
import worksheetAjax from 'src/api/worksheet';
import { getTranslateInfo } from 'src/utils/app';

// 获取表信息
export const useSheetInfo = ({ worksheetId, saveIndex = 0, setConfigLoading, ...rest }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useSetState({});
  useEffect(() => {
    if (!worksheetId || loading) return;
    setLoading(true);
    if (_.isFunction(setConfigLoading)) setConfigLoading({ getLoading: true });
    worksheetAjax
      .getWorksheetInfo({ worksheetId, getTemplate: true, getViews: true, ...rest })
      .then(res => {
        const { views, template, appTimeZone, appId } = res;
        res.name = getTranslateInfo(appId, null, worksheetId).name || res.name;
        const noAuth = res.resultCode === 1 && ![2, 4, 6].includes(res.roleType);
        setData({
          info: res,
          views,
          noAuth,
          controls: _.get(template, 'controls') || [],
        });
        !_.isUndefined(appTimeZone) && (window[`timeZone_${appId}`] = appTimeZone);

        if (noAuth && _.isFunction(setConfigLoading)) {
          setConfigLoading({ getLoading: false });
        }

        //清理缓存时间
        window.clearLocalDataTime({ requestData: { worksheetId }, clearSpecificKey: 'Worksheet_GetWorksheetInfo' });
        window.clearLocalDataTime({ requestData: { worksheetId }, clearSpecificKey: 'Worksheet_GetQueryBySheetId' });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [worksheetId, saveIndex]);
  return { loading, data };
};

export const useFocus = () => {
  const ref = useRef(null);
  const setFocus = () => {
    if (ref.current) {
      ref.current.focus();
    }
  };
  return { ref, setFocus };
};

// 获取节点的位置
export const useRect = () => {
  const [rect, setRect] = useState({});
  const ref = useCallback(node => {
    if (node) {
      setRect(node.getBoundingClientRect());
    }
  }, []);
  return [rect, ref];
};

export const useGetApps = (para, dep = []) => {
  const [apps, setApps] = useState([]);
  useEffect(() => {
    appManagementAjax.getAppForManager(para).then(data => {
      setApps(data);
    });
  }, dep);
  return [apps];
};

// 获取选项集
export const useGetOptionList = (para, dep = []) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    appManagementAjax.getAppForManager(para).then(data => {
      setList(data);
    });
  }, dep);
  return list;
};
