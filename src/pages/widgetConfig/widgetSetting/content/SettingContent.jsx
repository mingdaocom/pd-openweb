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
  const { data: { type, controlId } = {}, mode, globalSheetInfo = {} } = props;
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
    const tempValue = safeParse(window.localStorage.getItem(`worksheetExpand-${globalSheetInfo.worksheetId}`) || '[]');
    if (_.includes([29, 34, 35, 51], type) && !_.includes(tempValue, 'base')) {
      tempValue.push('base');
    }
    setExpandKeys(!_.isEmpty(tempValue) ? tempValue : totalExpandKeys);
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
