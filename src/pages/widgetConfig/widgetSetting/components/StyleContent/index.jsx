import React, { useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import _ from 'lodash';
import WidgetConfigRuleItem from '../../../../FormSet/components/columnRules/WidgetConfigRuleItem';
import { supportSettingCollapse } from '../../../util';
import { getAdvanceSetting, handleAdvancedSettingChange, updateConfig } from '../../../util/setting';
import { SettingCollapseWrap } from '../../content/styled';
import WidgetStyle from '../WidgetStyle';
import { CardItem, WidgetItem } from './StyleContentItems';

const { Panel } = Collapse;

const getItems = props => {
  const { data = {}, status = {}, from } = props;
  const defaultItem = [];

  defaultItem.push({
    key: 'default',
    label: _l('字段'),
    children: <WidgetItem {...props} />,
  });

  if (
    _.includes([29, 51], data.type) &&
    (data.enumDefault !== 2 || !_.includes(['5', '6'], data.advancedSetting?.showtype))
  ) {
    defaultItem.push({
      key: 'card',
      label: _l('卡片'),
      children: <CardItem {...props} />,
    });
  }

  if (from !== 'subList') {
    defaultItem.push({
      key: 'rule',
      label: _l('样式规则'),
      children: (
        <WidgetConfigRuleItem
          {..._.pick(props, ['allControls', 'globalSheetInfo', 'data', 'ruleList'])}
          saveIndex={status.saveIndex}
        />
      ),
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
