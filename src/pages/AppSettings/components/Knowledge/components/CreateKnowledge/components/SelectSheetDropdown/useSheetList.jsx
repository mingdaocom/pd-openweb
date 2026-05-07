import { useEffect, useMemo } from 'react';
import homeAppAjax from 'src/api/homeApp';
import { getTranslateInfo } from 'src/utils/app';
import { setAllWorksheetList, setWorksheetIsLoaded } from '../../store/actions';

export function useSheetList({ appId, selectedWorksheetList = [], allWorksheetList = [], dispatch }) {
  // 如果 store 里已经有数据，直接使用
  const worksheetList = useMemo(() => {
    return allWorksheetList.length ? allWorksheetList : [];
  }, [allWorksheetList]);

  // 请求数据（只在没有缓存时请求）
  useEffect(() => {
    if (!appId) return;
    if (allWorksheetList.length) return; // 已缓存

    homeAppAjax
      .getWorksheetsByAppId({ appId, type: 0 })
      .then(data => {
        if (!data?.length) {
          setAllWorksheetList(dispatch, []);
          return;
        }

        const list = data.map(item => ({
          worksheetId: item.workSheetId,
          worksheetName: getTranslateInfo(appId, null, item.workSheetId).name || item.workSheetName,
          worksheet: item,
        }));

        setAllWorksheetList(dispatch, list);
      })
      .finally(() => {
        setWorksheetIsLoaded(dispatch, { loaded: true });
      });
  }, [appId, allWorksheetList.length, dispatch]);

  // 过滤掉已选择的工作表
  const availableList = useMemo(
    () =>
      worksheetList.filter(item => !selectedWorksheetList.some(selected => selected.worksheetId === item.worksheetId)),
    [worksheetList, selectedWorksheetList],
  );

  return {
    list: availableList,
    // worksheetMap,
    isEmpty: !availableList.length,
  };
}
