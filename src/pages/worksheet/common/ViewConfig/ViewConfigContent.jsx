import React from 'react';
import cx from 'classnames';
import { get } from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/utils/domain/worksheet/constants';
import { BatchSet } from './components';
import { viewTypeConfig } from './config';
import { isDevCustomView } from './helpers';
import ViewConfigSetting from './ViewConfigSetting';

// 这些配置项内部需要占满可视高度，外层容器同步加 H100。
const FULL_HEIGHT_TABS = ['Submit', 'Filter'];

// 这些配置项自带标题或采用特殊布局，外层不再重复渲染通用标题栏。
const HIDDEN_TITLE_TABS = [
  'MobileSet',
  'FastFilter',
  'NavGroup',
  'RecordColor',
  'ActionSet',
  'Submit',
  'Filter',
  'GroupSet',
];

function ViewContentTitle({ data, onHideBatch, onShowBatch, showBatch, viewProps, viewSetting }) {
  const { view = {} } = viewProps;

  if (HIDDEN_TITLE_TABS.includes(data.type)) {
    return null;
  }

  return (
    <div className="viewSetTitle flexRow">
      <div className="flex">
        {data.type === 'Setting' ? VIEW_TYPE_ICON.find(o => o.id === VIEW_DISPLAY_TYPE[view.viewType])?.txt : data.name}
        {isDevCustomView(view) && ['ParameterSet'].includes(viewSetting) && (
          <div className="textSecondary Font13 mTop4 Normal">{_l('插件发布后将作为使用者的视图配置')}</div>
        )}
      </div>
      {(view.viewType === 0 || (view.viewType === 2 && get(view, 'advancedSetting.hierarchyViewType') === '3')) &&
        viewSetting === 'Show' && (
          <span className="Hand Font14 batchSetBtn" onClick={onShowBatch}>
            <Icon icon="format_paint" />
            <span className="mLeft5 Normal">{_l('编辑列样式')}</span>
          </span>
        )}
      {showBatch && <BatchSet {...viewProps} onClose={onHideBatch} visible={showBatch} />}
    </div>
  );
}

// 负责右侧配置区域的通用标题、滚动容器和当前 tab 内容装配。
export default function ViewConfigContent({
  formatColumnsListForControlsWithoutHide,
  onChangeCustomView,
  onChangeViewSetting,
  onHideBatch,
  onShowBatch,
  showBatch,
  viewProps,
  viewSetting,
}) {
  const data = viewTypeConfig.find(item => item.type === viewSetting) || {};
  const content = (
    <div className={cx('viewContentCon', { H100: FULL_HEIGHT_TABS.includes(data.type) })}>
      <ViewContentTitle
        data={data}
        onHideBatch={onHideBatch}
        onShowBatch={onShowBatch}
        showBatch={showBatch}
        viewProps={viewProps}
        viewSetting={viewSetting}
      />
      <ViewConfigSetting
        formatColumnsListForControlsWithoutHide={formatColumnsListForControlsWithoutHide}
        onChangeCustomView={onChangeCustomView}
        onChangeViewSetting={onChangeViewSetting}
        viewProps={viewProps}
        viewSetting={viewSetting}
      />
    </div>
  );

  return !['PluginSettings'].includes(viewSetting) ? (
    <ScrollView className="viewContent flex">{content}</ScrollView>
  ) : (
    <div className="viewContent flex contentCon flexColumn">{content}</div>
  );
}
