import React, { Fragment, useState } from 'react';
import update from 'immutability-helper';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { WHOLE_SIZE } from 'src/utils/domain/control/layout';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { DEFAULT_CONFIG } from 'src/utils/domain/control/widget';
import { enumWidgetType } from 'src/utils/domain/control/widgetTypes';
import { SettingItem } from '../../../styled';
import ConfigRelate from '../relateSheet/ConfigRelate';

const SAVE_TYPES = [2, 6, 15, 46, 9, 10, 29];

const SAVE_TYPE_OPTIONS = SAVE_TYPES.map(type => {
  const ENUM_TYPE = enumWidgetType[type];
  const info = DEFAULT_CONFIG[ENUM_TYPE] || {};
  return {
    label: info.widgetName,
    icon: getIconByType(type),
    value: type,
  };
});

const renderSaveTypeContent = option =>
  option ? (
    <div className="flexCenter">
      <Icon icon={option.icon} className="Font16 mRight6 textTertiary" />
      <span className="flex">{option.label}</span>
    </div>
  ) : null;

const renderSaveTypeOption = ({ data: option }) => renderSaveTypeContent(option);

const renderSaveTypeLabel = ({ value }) => renderSaveTypeContent(_.find(SAVE_TYPE_OPTIONS, { value }));

export default function CustomSaveConfig(props) {
  const { saveType = 2, globalSheetInfo = {}, setState } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('存储类型')}</div>
        <Select
          className="w100"
          options={SAVE_TYPE_OPTIONS}
          value={saveType}
          optionRender={renderSaveTypeOption}
          labelRender={renderSaveTypeLabel}
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
