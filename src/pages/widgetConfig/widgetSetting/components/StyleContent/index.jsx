import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { SettingCollapseWrap } from '../../content/styled';
import { isSheetDisplay, supportSettingCollapse } from '../../../util';
import WidgetStyle from '../WidgetStyle';
import { CardItem, WidgetItem } from './StyleContentItems';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../util/setting';

const { Panel } = Collapse;

const getItems = props => {
  const { data = {} } = props;
  const defaultItem = [];

  if (!isSheetDisplay(data)) {
    defaultItem.push({
      key: 'default',
      label: _l('字段'),
      children: <WidgetItem {...props} />,
    });
  }

  if (_.includes([29, 51], data.type) && !isSheetDisplay(data)) {
    defaultItem.push({
      key: 'card',
      label: _l('卡片'),
      children: <CardItem {...props} />,
    });
  }

  if (supportSettingCollapse(props, 'style')) {
    defaultItem.push({
      key: 'table',
      label: _l('表格'),
      children: <WidgetStyle {...props} />,
    });
  }
  return defaultItem;
};

export default function StyleCardContent(props) {
  const { data = {}, onChange } = props;
  const items = getItems(props);
  const totalKeys = items.map(i => i.key);
  const [expandKeys, setExpandKeys] = useState(totalKeys);

  useEffect(() => {
    setExpandKeys(totalKeys);
    const cardTitleStyle = getAdvanceSetting(data, 'cardtitlestyle');
    const cardValueStyle = getAdvanceSetting(data, 'cardvaluestyle');
    // 查询记录--聚合表默认强调值
    if (
      _.get(cardTitleStyle, 'direction') !== '2' &&
      data.type === 51 &&
      _.get(data, 'advancedSetting.querytype') === '1'
    ) {
      onChange(
        handleAdvancedSettingChange(data, {
          cardtitlestyle: JSON.stringify({ ...cardTitleStyle, direction: '2' }),
          cardvaluestyle: JSON.stringify({
            ...cardValueStyle,
            size: '3',
            style: updateConfig({
              config: cardValueStyle.style,
              value: '1',
              index: 0,
            }),
          }),
        }),
      );
    }
  }, [data.controlId]);

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      items={items}
      onChange={value => setExpandKeys(value)}
    >
      {items.map(item => {
        return (
          <Panel header={item.label} key={item.key}>
            {item.children}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
}
