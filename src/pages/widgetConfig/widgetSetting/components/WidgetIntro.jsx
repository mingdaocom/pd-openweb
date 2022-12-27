import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import { Menu, MenuItem, Dialog, Support } from 'ming-ui';
import { DEFAULT_INTRO_LINK } from '../../config';
import { WidgetIntroWrap } from '../../styled';
import { DEFAULT_CONFIG, DEFAULT_DATA, WIDGETS_TO_API_TYPE_ENUM } from '../../config/widget';
import { enumWidgetType, getWidgetInfo } from '../../util';
import { handleAdvancedSettingChange } from '../../util/setting';
import { WHOLE_SIZE } from '../../config/Drag';
import { Tooltip } from 'antd';
import _ from 'lodash';

const SWITCH_ENUM = {
  2: ['EMAIL', 'MOBILE_PHONE', 'AUTO_ID', 'CRED', 'SEARCH', 'RICH_TEXT'], // 文本
  3: ['TEXT'], // 电话
  4: ['TEXT'], // 电话
  5: ['TEXT'], // 邮箱
  6: ['MONEY', 'SCORE'], // 数值
  7: ['TEXT'], // 证件
  8: ['NUMBER'], // 金额
  9: ['MULTI_SELECT'], // 单选
  10: ['FLAT_MENU'], // 多选
  11: ['MULTI_SELECT'], // 单选
  28: ['NUMBER'], // 等级
  29: ['SUB_LIST'], // 关联记录
  30: item =>
    (item.strDefault || '10').split('')[0] !== '1' && item.sourceControlId
      ? [enumWidgetType[_.get(item, 'sourceControl.type')]]
      : [], // 他表字段
  31: ['NUMBER', 'MONEY', 'SCORE'], // 公式---数值计算
  32: ['TEXT'], // 文本组合
  37: item => [enumWidgetType[item.enumDefault2]], // 汇总
  38: item => (item.enumDefault === 2 ? ['DATE'] : ['NUMBER']), // 公式日期计算
  33: ['TEXT'], // 自动编号
  41: ['TEXT'], // 富文本
  50: ['TEXT'], // api查询
};

export default function WidgetIntro(props) {
  const { data = {}, from, onChange } = props;
  const { type, controlId, sourceControl = {}, enumDefault2, advancedSetting } = data;
  const { icon, widgetName, intro, moreIntroLink } = getWidgetInfo(type);
  const [visible, setVisible] = useState(false);
  const [switchList, setSwitchList] = useState([]);

  useEffect(() => {
    let newList = ((_.includes([30, 37, 38], type) ? SWITCH_ENUM[type](data) : SWITCH_ENUM[type]) || []).filter(i => i);
    newList = newList.map(i => ({ ...DEFAULT_CONFIG[i], type: i }));
    setSwitchList(newList);
  }, [controlId, data]);

  const switchType = info => {
    setVisible(false);
    let newData = DEFAULT_DATA[info.type] || {};

    if (_.isEmpty(newData)) return;

    newData = _.omit(newData, ['controlName']);
    newData.type = WIDGETS_TO_API_TYPE_ENUM[info.type];

    if (info.type === 'DATE' || info.type === 'DATE_TIME') {
      newData = { ...newData, enumDefault: 0, unit: '' };
    }

    if (type === 6 || type === 8) {
      // 转金额或数值保留前后缀
      if (_.includes(['MONEY', 'NUMBER'], info.type)) {
        newData = handleAdvancedSettingChange(newData, _.pick(advancedSetting, ['prefix', 'suffix']));
      }
      onChange(newData);
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
      onChange({ type: 10, advancedSetting: { direction: '0' } });
      return;
    }

    // 关联记录
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

    // 他表字段
    if (type === 30) {
      onChange({
        ..._.omit(sourceControl, ['controlId']),
        attribute: 0,
      });
      return;
    }

    // 汇总
    if (type === 37) {
      onChange({
        ...newData,
        dataSource: '',
        sourceControlId: '',
      });
      return;
    }

    // 公式
    if (type === 31 || type === 38) {
      Dialog.confirm({
        title: _l('变更字段类型'),
        description: _l(
          '此为不可逆操作，将公式变更为%0后，公式计算方式将丢失，保存后无法再转换为公式类型。你确定要进行变更吗？',
          info.widgetName,
        ),
        okText: _l('确定'),
        onOk: () => {
          onChange({
            ...newData,
            unit: type === 38 ? '' : newData.unit,
            dataSource: '',
            sourceControlId: '',
          });
        },
      });
      return;
    }

    // 富文本
    if (type === 41 && controlId) {
      Dialog.confirm({
        title: _l('变更字段类型'),
        description: _l('将富文本变更为普通文本后，文本样式、图片等信息将丢失。你确定要进行变更吗？'),
        okText: _l('确定'),
        onOk: () => {
          onChange(newData);
        },
      });
      return;
    }

    onChange(newData);
  };

  const isAllowSwitch = () => {
    if (type === 29 && from === 'subList') return false;
    return switchList.length > 0;
  };

  return (
    <WidgetIntroWrap>
      <div className="title relative">
        <i className={cx('icon Font20', `icon-${icon}`)} />
        <span>{widgetName}</span>
        <Tooltip placement={'bottom'} title={intro}>
          <span style={{ marginLeft: '3px' }}>
            <Support
              type={3}
              href={moreIntroLink || DEFAULT_INTRO_LINK}
              text={<i className="icon-help Font16 Gray_9e"></i>}
            />
          </span>
        </Tooltip>
        {isAllowSwitch() && (
          <div className="introSwitch">
            <span data-tip={_l('变更类型')} onClick={() => setVisible(true)}>
              <i className="icon icon-swap_horiz pointer Font22" />
            </span>
            <Menu className={cx('introSwitchMenu', { Hidden: !visible })} onClickAway={() => setVisible(false)}>
              {switchList.map(i => {
                return (
                  <MenuItem
                    onClick={() => switchType(i)}
                    icon={<i className={cx('icon TxtMiddle', `icon-${i.icon}`)} />}
                  >
                    {i.widgetName}
                  </MenuItem>
                );
              })}
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
