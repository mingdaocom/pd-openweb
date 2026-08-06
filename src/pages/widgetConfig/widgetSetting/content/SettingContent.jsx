import React, { lazy, Suspense, useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse } from 'antd';
import { LoadDiv } from 'ming-ui';
import { EXPAND_ITEMS } from '../../config/widget';
import { supportSettingCollapse } from '../../util';
import WorksheetReference from '../components/WorksheetReference';
import { SettingCollapseWrap } from './styled';

const { Panel } = Collapse;

const totalExpandKeys = EXPAND_ITEMS.map(i => i.key);
const collapseComponents = {
  WidgetBase: lazy(() => import('../components/WidgetBase')),
  WidgetOperate: lazy(() => import('../components/WidgetOperate')),
  WidgetHighSetting: lazy(() => import('../components/WidgetHighSetting')),
  WidgetSecurity: lazy(() => import('../components/WidgetSecurity')),
  BothWayRelate: lazy(() => import('../components/BothWayRelate')),
  WidgetPermission: lazy(() => import('../components/WidgetPermission')),
  WidgetMobile: lazy(() => import('../components/WidgetMobile')),
};

export default function SettingContent(props) {
  const { data: { controlId } = {}, from } = props;
  const [expandKeys, setExpandKeys] = useState([]);

  const getPanelData = () => {
    const defaultItems = [];
    EXPAND_ITEMS.forEach(item => {
      if (supportSettingCollapse(props, item.key)) {
        const Widget = collapseComponents[item.name];
        if (!Widget) return;

        defaultItems.push({
          ...item,
          children: (
            <Suspense fallback={<LoadDiv className="mTop10" />}>
              <Widget {...props} />
            </Suspense>
          ),
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
