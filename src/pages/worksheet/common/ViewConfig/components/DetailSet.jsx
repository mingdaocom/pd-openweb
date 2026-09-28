import React, { Fragment } from 'react';
import _ from 'lodash';
import { Radio, Switch } from 'ming-ui/antd-components';

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
              checked={view.childType !== 1}
              onChange={() => {
                handleChange(2);
              }}
              title={_l('常规（多条）')}
            >
              {_l('常规（多条）')}
            </Radio>
            <div className="txt textSecondary mTop8 mLeft30">{_l('在左侧显示卡片列表，可切换查看记录详情')}</div>
          </div>
          <div className="mTop16">
            <Radio
              className=""
              checked={view.childType === 1}
              onChange={() => {
                handleChange(1);
              }}
              title={_l('仅显示详情（一条）')}
            >
              {_l('仅显示详情（一条）')}
            </Radio>
            <div className="txt textSecondary mTop8 mLeft30">{_l('显示第一条记录的详情')}</div>
          </div>
        </div>
      </Fragment>
      <div className="bold mBottom12">{_l('详情设置')}</div>
      <div className="configSwitch">
        <div className="flexRow alignItemsCenter viewConfigSwitchRow">
          <Switch
            size="mini"
            checked={_.get(view, 'advancedSetting.showtoolbar') !== '0'}
            onChange={() => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { showtoolbar: _.get(view, 'advancedSetting.showtoolbar') !== '0' ? '0' : '' },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['showtoolbar'],
              });
            }}
          />
          <div className="InlineBlock Normal mLeft12 TxtMiddle">{_l('显示操作栏')}</div>
        </div>
      </div>
      <div className="configSwitch">
        <div className="flexRow alignItemsCenter viewConfigSwitchRow">
          <Switch
            size="mini"
            checked={_.get(view, 'advancedSetting.showtitle') !== '0'}
            onChange={() => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { showtitle: _.get(view, 'advancedSetting.showtitle') !== '0' ? '0' : '' },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['showtitle'],
              });
            }}
          />
          <div className="InlineBlock Normal mLeft12 TxtMiddle">{_l('显示记录标题')}</div>
        </div>
      </div>
      <div className="configSwitch">
        <div className="flexRow alignItemsCenter viewConfigSwitchRow">
          <Switch
            size="mini"
            checked={_.get(view, 'advancedSetting.closesidebar') === '1'}
            onChange={() => {
              updateCurrentView({
                ...view,
                appId,
                advancedSetting: { closesidebar: _.get(view, 'advancedSetting.closesidebar') !== '1' ? '1' : '' },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['closesidebar'],
              });
            }}
          />
          <div className="InlineBlock Normal mLeft12 TxtMiddle">{_l('关闭侧边栏')}</div>
        </div>
      </div>
    </Fragment>
  );
}
