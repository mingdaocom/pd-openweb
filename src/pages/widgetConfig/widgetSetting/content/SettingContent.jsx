import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import WidgetBase from '../components/WidgetBase';
import WidgetOperate from '../components/WidgetOperate';
import WidgetStyle from '../components/WidgetStyle';
import WidgetHighSetting from '../components/WidgetHighSetting';
import WidgetMobile from '../components/WidgetMobile';
import BothWayRelate from '../components/BothWayRelate';
import WidgetPermission from '../components/WidgetPermission';
import WidgetSecurity from '../components/WidgetSecurity';
import {
  HAVE_OPTION_WIDGET,
  HAVE_TABLE_STYLE_WIDGET,
  HAVE_HIGH_SETTING_WIDGET,
  HAVE_MOBILE_WIDGET,
  HAVE_MASK_WIDGET,
} from '../../config';
import { SettingCollapseWrap } from './styled';
import { supportSettingCollapse } from '../../util';

const { Panel } = Collapse;

const totalExpandKeys = ['base', 'option', 'style', 'highsetting', 'security', 'relate', 'permission', 'mobile'];

export default function SettingContent(props) {
  const {
    data: { type, enumDefault, advancedSetting = {}, controlId, dataSource = '' } = {},
    mode,
    from,
    isRecycle,
    globalSheetInfo = {},
  } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  const { mode: subListMode } = window.subListSheetConfig[controlId] || {};

  const getPanelData = () => {
    let defaultItems = [
      {
        key: 'base',
        label: _l('基础设置'),
        children: <WidgetBase {...props} />,
      },
    ];

    // 回收站只显示基础设置
    if (isRecycle) return defaultItems;

    if (_.includes(HAVE_OPTION_WIDGET, type)) {
      defaultItems.push({
        key: 'option',
        label: _l('操作设置'),
        children: <WidgetOperate {...props} />,
      });
    }
    if (_.includes(HAVE_TABLE_STYLE_WIDGET, type)) {
      defaultItems.push({
        key: 'style',
        label: _l('表格设置'),
        children: <WidgetStyle {...props} />,
      });
    }
    if (_.includes(HAVE_HIGH_SETTING_WIDGET, type) || supportSettingCollapse(props)) {
      defaultItems.push({
        key: 'highsetting',
        label: _l('高级设置'),
        children: <WidgetHighSetting {...props} />,
      });
    }
    if (
      HAVE_MASK_WIDGET.includes(type) ||
      (type === 2 && enumDefault === 2) ||
      (type === 6 && advancedSetting.showtype !== '2')
    ) {
      defaultItems.push({
        key: 'security',
        label: _l('安全'),
        children: <WidgetSecurity {...props} />,
      });
    }
    if (
      from !== 'subList' &&
      globalSheetInfo.worksheetId !== dataSource &&
      (type === 29 || (type === 34 && !dataSource.includes('-') && subListMode === 'relate'))
    ) {
      defaultItems.push({
        key: 'relate',
        label: _l('双向关联'),
        children: <BothWayRelate {...props} />,
      });
    }
    defaultItems.push({
      key: 'permission',
      label: _l('字段属性'),
      children: <WidgetPermission {...props} />,
    });
    if (
      (_.includes(HAVE_MOBILE_WIDGET, type) ||
        (type === 14 && _.get(safeParse(advancedSetting.filetype || '{}'), 'type') !== '0')) &&
      from !== 'subList'
    ) {
      defaultItems.push({
        key: 'mobile',
        label: _l('移动端设置'),
        children: <WidgetMobile {...props} />,
      });
    }
    return defaultItems;
  };

  useEffect(() => {
    const tempValue = window.localStorage.getItem(`worksheetExpand-${globalSheetInfo.worksheetId}`);
    setExpandKeys(tempValue ? safeParse(tempValue) : totalExpandKeys);
  }, [mode, controlId]);

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      onChange={value => {
        safeLocalStorageSetItem(`worksheetExpand-${globalSheetInfo.worksheetId}`, JSON.stringify(value));
        setExpandKeys(value);
      }}
    >
      {getPanelData().map(item => {
        return (
          <Panel header={item.label} key={item.key}>
            {item.children}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
}
