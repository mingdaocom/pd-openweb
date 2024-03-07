import React, { useEffect, useState } from 'react';
import { Collapse } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import Components from '../components';
import { EXPAND_ITEMS } from '../../config/widget';
import { SettingCollapseWrap } from './styled';
import { supportSettingCollapse } from '../../util';
import _ from 'lodash';

const { Panel } = Collapse;

const totalExpandKeys = EXPAND_ITEMS.map(i => i.key);

export default function SettingContent(props) {
  const { data: { controlId } = {}, mode } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  const getPanelData = () => {
    const defaultItems = [];
    EXPAND_ITEMS.map(item => {
      if (supportSettingCollapse(props, item.key)) {
        const Widget = Components[item.name];
        defaultItems.push({
          ...item,
          children: <Widget {...props} />,
        });
      }
    });
    return defaultItems;
  };

  useEffect(() => {
    setExpandKeys(totalExpandKeys);
  }, [controlId]);

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      onChange={value => {
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
