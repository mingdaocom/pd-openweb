import React from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import { REFRESH_TIME_OPTIONS } from '../config';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

export default function RefreshTime(props) {
  const { appId, view, updateCurrentView } = props;

  const handleChange = (obj, editAttrs) => {
    if (editAttrs) {
      updateCurrentView({
        ...view,
        appId,
        ...obj,
        editAttrs,
      });
    } else {
      updateCurrentView({
        ...view,
        appId,
        advancedSetting: obj,
        editAttrs: ['advancedSetting'],
        editAdKeys: Object.keys(obj),
      });
    }
  };

  return (
    <React.Fragment>
      <div className="commonConfigItem Font13 bold mTop32">{_l('自动刷新')}</div>
      <div className="textSecondary mTop8 flex">{_l('每隔一段时间后自动刷新当前视图')}</div>
      <div className="commonConfigItem mTop12 mBottom32">
        <Select
          className="w100"
          value={_.get(view, 'advancedSetting.refreshtime') || '0'}
          options={REFRESH_TIME_OPTIONS}
          fieldNames={SELECT_FIELD_NAMES}
          onChange={value => {
            handleChange({ refreshtime: value });
          }}
        />
      </div>
    </React.Fragment>
  );
}
