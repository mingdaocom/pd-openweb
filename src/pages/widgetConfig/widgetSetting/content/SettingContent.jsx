import React, { lazy, Suspense, useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { LoadDiv } from 'ming-ui';
import { supportSettingCollapse } from 'src/utils/domain/control/capabilities';
import { EXPAND_ITEMS } from 'src/utils/domain/control/widget';
import WorksheetReference from '../components/WorksheetReference';
import { SettingCollapseWrap } from './styled';

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

  const items = getPanelData().map(item => ({
    key: item.key,
    label: item.label,
    children: item.children,
    ...(item.key === 'base' && from !== 'subList' ? { extra: <WorksheetReference {...props} /> } : {}),
  }));

  useEffect(() => {
    setExpandKeys(totalExpandKeys);
  }, [controlId]);

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      items={items}
      onChange={value => {
        setExpandKeys(value);
      }}
    />
  );
}
