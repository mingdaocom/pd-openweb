import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import _ from 'lodash';
import ErrorBoundary from 'ming-ui/components/ErrorBoundary';
import pluginAjax from 'src/api/plugin.js';
import { formatAdvancedSettingByNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import { SideNav } from './components';
import { formatColumnsListForControlsWithoutHide, getDefaultViewSetting, getViewSettingOnViewChange } from './helpers';
import ViewConfigContent from './ViewConfigContent';

function ViewConfigCon(props) {
  const {
    appId,
    refreshFn,
    rowId,
    setViewConfigTab,
    updateCurrentView,
    updateCurrentViewState,
    view = {},
    viewConfigTab,
    viewId,
    worksheetId,
  } = props;
  // 按旧 class 组件行为，按钮列表只在配置面板首次挂载时刷新一次。
  const initialRefresh = useRef({ appId, refreshFn, rowId, worksheetId });
  const prevViewId = useRef(viewId);
  const [viewSetting, setViewSetting] = useState(() => getDefaultViewSetting(view));
  const [showBatch, setShowBatch] = useState(false);
  const showBatchSet = useCallback(() => setShowBatch(true), []);
  const hideBatchSet = useCallback(() => setShowBatch(false), []);

  useEffect(() => {
    const {
      appId: initialAppId,
      refreshFn: initialRefreshFn,
      rowId: initialRowId,
      worksheetId: initialWorksheetId,
    } = initialRefresh.current;

    initialRefreshFn(initialWorksheetId, initialAppId, '', initialRowId);
  }, []);

  useLayoutEffect(() => {
    if (prevViewId.current === viewId) {
      return;
    }

    if (viewConfigTab) {
      setViewConfigTab('');
    }

    setViewSetting(getViewSettingOnViewChange(view, viewConfigTab));
    prevViewId.current = viewId;
  }, [setViewConfigTab, view, viewConfigTab, viewId]);

  const editPlugin = useCallback(
    data => {
      const { pluginInfo = {}, viewId: currentViewId } = view;
      const { id, source = 0 } = pluginInfo;

      pluginAjax
        .edit({
          id, // 插件id
          source,
          viewId: currentViewId,
          appId,
          ...data,
        })
        .then(res => {
          updateCurrentViewState({
            pluginInfo: res,
          });
        });
    },
    [appId, updateCurrentViewState, view],
  );

  const onChangeCustomView = useCallback(
    (data, isPlugin, others) => {
      if (isPlugin) {
        editPlugin(data);
        return;
      }

      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['advancedSetting'],
        ...others,
        advancedSetting: formatAdvancedSettingByNavfilters(view, _.omit({ ...data }, 'navfilters')),
      });
    },
    [appId, editPlugin, updateCurrentView, view],
  );

  return (
    <div className="viewSetBox">
      <SideNav
        {...props}
        viewSetting={viewSetting}
        formatColumnsListForControlsWithoutHide={formatColumnsListForControlsWithoutHide}
        onChangeType={setViewSetting}
      />
      <ViewConfigContent
        formatColumnsListForControlsWithoutHide={formatColumnsListForControlsWithoutHide}
        onChangeCustomView={onChangeCustomView}
        onChangeViewSetting={setViewSetting}
        onHideBatch={hideBatchSet}
        onShowBatch={showBatchSet}
        showBatch={showBatch}
        viewProps={props}
        viewSetting={viewSetting}
      />
    </div>
  );
}

export default ErrorBoundary.wrap(ViewConfigCon);
