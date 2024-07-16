import React from 'react';
import { Dropdown } from 'ming-ui';
import _ from 'lodash';

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
      <div className="Gray_75 mTop8 flex">{_l('每隔一段时间后自动刷新当前视图')}</div>
      <div className="commonConfigItem mTop12 mBottom32">
        <Dropdown
          className="w100"
          border
          value={_.get(view, 'advancedSetting.refreshtime') || '0'}
          data={[
            {
              text: _l('关闭'),
              value: '0',
            },
            // {
            //   text: _l('10秒'),
            //   value: '10',
            // },
            {
              text: _l('30秒'),
              value: '30',
            },
            {
              text: _l('1分钟'),
              value: '60',
            },
            {
              text: _l('2分钟'),
              value: '120',
            },
            {
              text: _l('3分钟'),
              value: '180',
            },
            {
              text: _l('4分钟'),
              value: '240',
            },
            {
              text: _l('5分钟'),
              value: '300',
            },
          ]}
          onChange={value => {
            handleChange({ refreshtime: value });
          }}
        />
      </div>
    </React.Fragment>
  );
}
