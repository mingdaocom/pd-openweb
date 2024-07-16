import React, { Fragment } from 'react';
import { Radio, Icon } from 'ming-ui';
import _ from 'lodash';
import { SwitchStyle } from './style';

export default function DetailSet(props) {
  const { appId, view, updateCurrentView } = props;
  const handleChange = value => {
    updateCurrentView({
      ...view,
      appId,
      childType: value,
      editAttrs: value === 1 ? ['childType', 'fastFilters', 'advancedSetting'] : ['childType'],
      ...(value === 1 ? { fastFilters: [], advancedSetting: { showtitle: '0' }, editAdKeys: ['showtitle'] } : {}),
    });
  };
  return (
    <Fragment>
      <Fragment>
        <div className="bold mBottom16">{_l('记录数量')}</div>
        <div className="mBottom32">
          <div className="mTop12">
            <Radio
              className=""
              text={_l('常规（多条）')}
              checked={view.childType !== 1}
              onClick={value => {
                handleChange(2);
              }}
            />
            <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
              {_l('在左侧显示卡片列表，可切换查看记录详情')}
            </div>
          </div>
          <div className="mTop16">
            <Radio
              className=""
              text={_l('仅显示详情（一条）')}
              checked={view.childType === 1}
              onClick={value => {
                handleChange(1);
              }}
            />
            <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
              {_l('显示第一条记录的详情')}
            </div>
          </div>
        </div>
      </Fragment>
      <div className="bold mBottom12">{_l('详情设置')}</div>
      <div className="configSwitch">
        <SwitchStyle className="flexRow alignItemsCenter">
          <Icon
            icon={_.get(view, 'advancedSetting.showtoolbar') !== '0' ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font28 Hand"
            onClick={() => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { showtoolbar: _.get(view, 'advancedSetting.showtoolbar') !== '0' ? '0' : '' },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['showtoolbar'],
              });
            }}
          />
          <div className="switchText InlineBlock Normal mLeft10 TxtMiddle">{_l('显示操作栏')}</div>
        </SwitchStyle>
      </div>
      <div className="configSwitch">
        <SwitchStyle className="flexRow alignItemsCenter">
          <Icon
            icon={_.get(view, 'advancedSetting.showtitle') !== '0' ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font28 Hand"
            onClick={() => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { showtitle: _.get(view, 'advancedSetting.showtitle') !== '0' ? '0' : '' },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['showtitle'],
              });
            }}
          />
          <div className="switchText InlineBlock Normal mLeft10 TxtMiddle">{_l('显示记录标题')}</div>
        </SwitchStyle>
      </div>
    </Fragment>
  );
}
