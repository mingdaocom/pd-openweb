import React, { useState, useEffect, Fragment } from 'react';
import { string } from 'prop-types';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import OptionList from '../components/OptionList';

const OPTIONS_DISPLAY = [
  {
    value: 11,
    text: _l('下拉菜单'),
  },
  {
    value: 9,
    text: _l('平铺'),
  },
];

export default function Dropdown({ data, onChange, globalSheetInfo, fromPortal }) {
  return (
    <Fragment>
      <SettingItem>
        <RadioGroup
          size="middle"
          checkedValue={data.type}
          data={OPTIONS_DISPLAY}
          onChange={type => {
            onChange({ type });
          }}
        />
      </SettingItem>
      <OptionList.SelectOptions
        data={data}
        globalSheetInfo={globalSheetInfo}
        onChange={onChange}
        fromPortal={fromPortal}
      />
    </Fragment>
  );
}
