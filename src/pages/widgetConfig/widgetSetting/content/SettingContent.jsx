import React, { useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { EXPAND_ITEMS } from '../../config/widget';
import { supportSettingCollapse } from '../../util';
import CollapseComponents from '../components/index';
import WorksheetReference from '../components/WorksheetReference';
import { SettingCollapseWrap } from './styled';

const { Panel } = Collapse;

const totalExpandKeys = EXPAND_ITEMS.map(i => i.key);

export default function SettingContent(props) {
  const { data: { controlId } = {}, from } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  const getPanelData = () => {
    const defaultItems = [];
    EXPAND_ITEMS.map(item => {
      if (supportSettingCollapse(props, item.key)) {
        const Widget = CollapseComponents[item.name];
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
          <Panel
            header={item.label}
            key={item.key}
            {...(item.key === 'base' && from !== 'subList' ? { extra: <WorksheetReference {...props} /> } : {})}
          >
            {item.children}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
}
