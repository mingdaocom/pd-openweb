import React from 'react';
import _ from 'lodash';
import { permitList } from 'src/utils/domain/control/formEnum';
import { filterHidedControls } from 'src/utils/domain/control/sort';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { getGroupControlId } from 'src/utils/domain/worksheet/helpers';
import { WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/utils/domain/worksheet/view';
import {
  ActionSet,
  Controls,
  DebugConfig,
  EnvParams,
  FastFilter,
  FieldDeclaration,
  GroupSet,
  MobileSet,
  NavGroup,
  ParameterSet,
  PluginSettings,
  RecordColor,
  Show,
  Sort,
  SubmitConfig,
  TableSet,
  UrlParams,
  ViewFilter,
} from './components';
import { isDevCustomView } from './helpers';
import ViewConfigBaseSetting, { ViewCardSet } from './ViewConfigBaseSetting';

// 左侧菜单项到具体配置组件的映射集中放在这里，ViewConfig 主容器只负责状态和组装。
export default function ViewConfigSetting({
  formatColumnsListForControlsWithoutHide,
  onChangeCustomView,
  onChangeViewSetting,
  viewProps,
  viewSetting,
}) {
  const {
    onShowCreateCustomBtn,
    worksheetId,
    appId,
    projectId,
    columns = [],
    view = {},
    refreshFn,
    btnList,
    viewId,
    sheetSwitchPermit,
    worksheetControls = [],
    updateCurrentView,
  } = viewProps;

  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);

  switch (viewSetting) {
    case 'ActionSet':
      return (
        <ActionSet
          worksheetControls={worksheetControls}
          isSheetView={VIEW_DISPLAY_TYPE[view.viewType] === 'sheet'}
          onShowCreateCustomBtn={onShowCreateCustomBtn}
          worksheetId={worksheetId}
          appId={appId}
          projectId={projectId}
          viewId={viewId}
          refreshFn={refreshFn}
          btnList={btnList}
          updateCurrentView={updateCurrentView}
          view={view}
        />
      );
    case 'Filter':
      return <ViewFilter {...viewProps} />;
    case 'Sort':
      return <Sort {...viewProps} />;
    case 'Controls':
      return <Controls {...viewProps} formatColumnsListForControls={formatColumnsListForControlsWithoutHide} />;
    case 'MobileSet':
      return (
        <MobileSet
          {...viewProps}
          worksheetControls={
            isShowWorkflowSys
              ? worksheetControls
              : worksheetControls.filter(c => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, c.controlId))
          }
          isShowWorkflowSys={isShowWorkflowSys}
          coverColumns={filterHidedControls(columns, view.controls, false).filter(
            c => !!c.controlName && !_.includes([45], c.type),
          )}
        />
      );
    case 'FastFilter':
      return <FastFilter {...viewProps} />;
    case 'NavGroup':
      return <NavGroup {...viewProps} />;
    case 'RecordColor':
      return <RecordColor {...viewProps} />;
    case 'Show':
      return <Show {...viewProps} />;
    case 'urlParams':
      return <UrlParams {...viewProps} />;
    case 'PluginSettings':
      return <PluginSettings {...viewProps} onUpdateTab={onChangeViewSetting} onChangeView={onChangeCustomView} />;
    case 'ParameterSet':
      return <ParameterSet {...viewProps} onChangeView={onChangeCustomView} />;
    case 'FieldDeclaration':
      return <FieldDeclaration {...viewProps} />;
    case 'Submit':
      return <SubmitConfig {...viewProps} onChangeView={onChangeCustomView} />;
    case 'CardSet':
      return (
        <div className="mTop24">
          <ViewCardSet viewProps={viewProps} />
        </div>
      );
    case 'TableSet':
      return (
        <div className="mTop24">
          <TableSet {..._.pick(viewProps, ['appId', 'view', 'updateCurrentView'])} />
        </div>
      );
    case 'GroupSet': {
      const groupControlId = getGroupControlId(view);
      const groupControl = _.find(columns, { controlId: groupControlId });

      return (
        <GroupSet
          {...viewProps}
          forBoard={VIEW_DISPLAY_TYPE[view.viewType] === 'board'}
          hideSort={VIEW_DISPLAY_TYPE[view.viewType] === 'board' && ![9, 10, 11, 28].includes(groupControl?.type)}
        />
      );
    }

    case 'EnvParams':
      return <EnvParams {...viewProps} />;
    default:
      if (VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView(view)) {
        return <DebugConfig {...viewProps} onChangeView={onChangeCustomView} />;
      }

      return <ViewConfigBaseSetting viewProps={viewProps} onChangeCustomView={onChangeCustomView} />;
  }
}
