import React, { useState } from 'react';
import cx from 'classnames';
import { Menu, MenuItem, Dialog, Support } from 'ming-ui';
import { DEFAULT_INTRO_LINK } from '../../config';
import { WidgetIntroWrap } from '../../styled';
import { DEFAULT_CONFIG } from '../../config/widget';
import { enumWidgetType, getWidgetInfo } from '../../util';
import { WHOLE_SIZE } from '../../config/Drag';
import { Tooltip } from 'antd';

const SWITCH_ENUM = {
  2: 'RICH_TEXT',
  9: 'MULTI_SELECT',
  10: 'FLAT_MENU',
  11: 'MULTI_SELECT',
  29: 'SUB_LIST',
  41: 'TEXT',
};

const CAN_SWITCH_FIELD = [2, 3, 4, 6, 5, 7, 9, 11, 15, 16, 26, 27];

const getWidgetInfoByType = type => {
  const nextType = SWITCH_ENUM[type] || 'TEXT';
  return DEFAULT_CONFIG[nextType] || {};
};

export default function WidgetIntro(props) {
  const { data = {}, from, onChange } = props;
  const { type, controlId, sourceControl = {}, enumDefault2 } = data;
  const { icon, widgetName, intro, moreIntroLink } = getWidgetInfo(type);
  const [visible, setVisible] = useState(false);
  const getSwitchEnum = () => {
    // 汇总字段
    if (type === 37) {
      return DEFAULT_CONFIG[enumWidgetType[enumDefault2]];
    }
    // 他表字段
    if (type === 30) {
      if (_.isEmpty(sourceControl) || !_.includes(CAN_SWITCH_FIELD, sourceControl.type)) return;
      return DEFAULT_CONFIG[enumWidgetType[sourceControl.type]];
    }
    return DEFAULT_CONFIG[SWITCH_ENUM[type]];
  };

  const switchType = () => {
    setVisible(false);

    if (type === 2) {
      onChange({ type: 41, size: WHOLE_SIZE, advancedSetting: { defsource: '' } });
      return;
    }
    // 他表字段
    if (type === 30) {
      onChange({
        ...sourceControl,
        attribute: 0,
      });
      return;
    }
    // 多选转单选 需要将默认选中设为一个
    if (type === 10) {
      const defaultChecked = JSON.parse(data.default || '[]');
      onChange({ type: 9, default: JSON.stringify(defaultChecked.slice(0, 1)) });
      return;
    }
    // 下拉转多选需要设置排列方式
    if (type === 11) {
      onChange({ type: 10, size: WHOLE_SIZE, advancedSetting: { direction: '0' } });
      return;
    }
    if (type === 37) {
      onChange({ type: enumDefault2 });
      return;
    }
    // 富文本
    if (type === 41 && controlId) {
      Dialog.confirm({
        title: _l('变更字段类型'),
        description: _l('将富文本变更为普通文本后，文本样式、图片等信息将丢失。你确定要进行变更吗？'),
        okText: _l('确定'),
        onOk: () => {
          onChange({ type: 2 });
        },
      });
      return;
    }
    if (type === 29) {
      Dialog.confirm({
        title: _l('将关联记录字段转为子表字段'),
        description: _l(
          '转为子表字段后，原关联记录字段中配置的筛选条件，以及与关联视图相关的权限、排序方式、自定义动作将被清除。',
        ),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            type: 34,
            size: WHOLE_SIZE,
          });
        },
      });
      return;
    }
    onChange({ type: enumWidgetType[SWITCH_ENUM[type]] });
  };

  const isAllowSwitch = () => {
    if (type === 29 && from === 'subList') return false;
    return _.includes([2, 9, 10, 11, 27, 29, 30, 37, 41], type);
  };

  const switchControl = getSwitchEnum();

  return (
    <WidgetIntroWrap>
      <div className="title relative">
        <i className={cx('icon Font20', `icon-${icon}`)} />
        <span>{widgetName}</span>
        <Tooltip placement={'bottom'} title={intro} className="Gray_9e">
          <span
            className="iconWrap pointer"
            onClick={() => {
              window.open(moreIntroLink || DEFAULT_INTRO_LINK);
            }}
          >
            <i className="icon-help Font16"></i>
          </span>
        </Tooltip>
        {isAllowSwitch() && !_.isEmpty(switchControl) && (
          <div className="introSwitch">
            <span data-tip={_l('变更类型')} onClick={() => setVisible(true)}>
              <i className="icon icon-swap_horiz pointer Font22" />
            </span>
            <Menu className={cx('introSwitchMenu', { Hidden: !visible })} onClickAway={() => setVisible(false)}>
              <MenuItem
                onClick={() => switchType(type)}
                icon={<i className={cx('icon', `icon-${switchControl.icon}`)} />}
              >
                {switchControl.widgetName}
              </MenuItem>
            </Menu>
          </div>
        )}
      </div>
      {/* {from !== 'subList' && (
        <div className="introText">
          {intro}
          {moreIntroLink && <Support type={3} href={moreIntroLink} text={_l('帮助')} />}
        </div>
      )} */}
    </WidgetIntroWrap>
  );
}
