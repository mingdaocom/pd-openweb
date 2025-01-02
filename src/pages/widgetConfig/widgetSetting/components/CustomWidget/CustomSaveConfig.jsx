import React, { Fragment, useState } from 'react';
import { Dropdown, Icon } from 'ming-ui';
import styled from 'styled-components';
import { SettingItem } from '../../../styled';
import { enumWidgetType, getIconByType } from 'src/pages/widgetConfig/util';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import ConfigRelate from '../relateSheet/ConfigRelate';
import { WHOLE_SIZE } from '../../../config/Drag';

const SaveWrap = styled(Dropdown)`
  .Item-content {
    display: flex;
    align-items: center;
    .itemText {
      padding-left: 16px;
    }
    i {
      font-size: 16px !important;
      margin-right: 10px;
    }
  }
`;

const SAVE_TYPES = [2, 6, 15, 46, 9, 10, 29];

const getDropData = () => {
  return SAVE_TYPES.map(type => {
    const ENUM_TYPE = enumWidgetType[type];
    const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
    return {
      text: info.widgetName,
      iconName: getIconByType(type),
      value: type,
    };
  });
};

export default function CustomSaveConfig(props) {
  const { saveType = 2, globalSheetInfo = {}, setState } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('存储类型')}</div>
        <SaveWrap
          border
          showItemTitle={false}
          data={getDropData()}
          value={saveType}
          renderTitle={data => {
            return (
              <div className="flexCenter">
                <Icon icon={data.iconName} className="Font16 mRight6 Gray_9e" />
                <span className="flex">{data.text}</span>
              </div>
            );
          }}
          onChange={value => {
            if (value === saveType) return;
            if (value === 29) {
              setVisible(true);
            } else {
              setState({ saveType: value });
            }
          }}
        />
      </SettingItem>

      {visible && (
        <ConfigRelate
          {...props}
          onOk={({ sheetId, control, sheetName }) => {
            let para = { dataSource: sheetId, size: WHOLE_SIZE };
            // 关联本表
            if (sheetId === globalSheetInfo.worksheetId) {
              para = { ...para, controlName: _l('父'), enumDefault2: 0, relateSelf: true };
            } else {
              para = sheetName ? { ...para, controlName: sheetName } : para;
            }
            // 使用关联控件
            if (!_.isEmpty(control)) {
              para = update(control, { advancedSetting: { hide: { $set: '' } } });
            }
            setState({ saveType: 29, saveInfo: para });
            setVisible(false);
          }}
          deleteWidget={() => setVisible(false)}
        />
      )}
    </Fragment>
  );
}
