import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Segmented, Tooltip } from 'ming-ui/antd-components';
import { MaxNavW, MinNavW } from 'src/pages/worksheet/common/ViewConfig/config.js';
import MobileConfig from './MobileConfig';
import SearchConfig from './SearchConfig';

const NAV_LAYER_OPTIONS = ['1', '2', '3', '4', '5'];

export default function NavGroupAdvancedSettings({
  filterData = {},
  navGroup,
  view,
  worksheetControls,
  navwidth,
  usenav,
  appnavtype,
  setNavWidth,
  updateAdvancedSetting,
  updateCurrentView,
}) {
  const updateWidth = event => {
    const value = event.target.value.trim();
    localStorage.removeItem(`navGroupWidth_${view.viewId}`);
    updateAdvancedSetting({ navwidth: value < MinNavW ? MinNavW : value > MaxNavW ? MaxNavW : value });
    event.stopPropagation();
  };

  return (
    <React.Fragment>
      {((filterData.type === 29 && navGroup.viewId) || filterData.type === 35) && (
        <React.Fragment>
          <div className="commonConfigItem Font13 mTop24 bold mTop4">{_l('默认展开层级')}</div>
          <Segmented
            block
            className="mTop8"
            options={NAV_LAYER_OPTIONS}
            value={_.get(view, 'advancedSetting.navlayer') || '1'}
            onChange={navlayer => updateAdvancedSetting({ navlayer })}
          />
        </React.Fragment>
      )}
      <div className="title mTop30 textPrimary Bold">{_l('默认宽度')}</div>
      <div className="Relative navWidth mTop8">
        <Input
          type="number"
          className="flex w100 pRight30"
          value={navwidth}
          placeholder={_l('请输入')}
          onChange={e => setNavWidth(e.target.value)}
          onKeyDown={event => {
            if (event.keyCode === 13) {
              updateWidth(event);
            }
          }}
          onBlur={updateWidth}
        />
        <span className="Absolute unit textTertiary">px</span>
      </div>
      {filterData.type === 29 && (
        <SearchConfig
          controls={
            (worksheetControls.find(control => control.controlId === navGroup.controlId) || {}).relationControls || []
          }
          data={view.advancedSetting}
          onChange={advancedSetting => updateAdvancedSetting({ ...advancedSetting })}
        />
      )}
      <h6 className="mTop30 Font13 Bold">{_l('其他')}</h6>
      <div className="mTop13 flexRow alignItemsCenter">
        <Checkbox
          className="checkBox"
          checked={String(usenav) === '1'}
          onChange={() => updateAdvancedSetting({ usenav: String(usenav) === '1' ? '0' : '1' })}
        >
          {_l('创建记录时，以选中列表作为默认值')}
        </Checkbox>
        <Tooltip
          placement="bottom"
          title={
            <span>
              {_l(
                '如：在商品表中以商品类型（生鲜、副食、饮料等）作为筛选列表时，如果当前选中了饮料分类，则创建记录时商品类型默认为饮料。',
              )}
            </span>
          }
        >
          <div className="Hand InlineFlex alignItemsCenter">
            <Icon icon="help" className="textTertiary helpIcon Font18" />
          </div>
        </Tooltip>
      </div>
      {view.viewType === 0 && (
        <MobileConfig
          value={appnavtype}
          filterData={filterData}
          onChange={advancedSetting => {
            updateCurrentView({
              ...view,
              advancedSetting,
              editAttrs: ['advancedSetting'],
              editAdKeys: Object.keys(advancedSetting),
            });
          }}
          advancedSetting={view.advancedSetting}
        />
      )}
    </React.Fragment>
  );
}
