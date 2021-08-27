import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';

const RELATION_OPTIONS = [
  {
    value: 0,
    text: _l('全部'),
  },
  {
    value: 1,
    text: _l('任务'),
    isHide: () => !md.global.SysSettings.forbidSuites.includes('2')
  },
  {
    value: 2,
    text: _l('项目'),
  },
  {
    value: 3,
    text: _l('日程'),
    isHide: () => !md.global.SysSettings.forbidSuites.includes('3')
  },
  {
    value: 5,
    text: _l('申请单'),
  },
];

export default function Relation({ data, onChange }) {
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('类型')}
          <Tooltip
            title={_l(
              '管理员可以选择用户需要自由连接的类型，例：自由连接的类型为任务，成员在详情处选择自由连接的内容只能是相关的任务',
            )}
          />
        </div>
        <Dropdown
          border
          value={data.enumDefault}
          data={RELATION_OPTIONS.filter(item => item.isHide ? item.isHide() : true)}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
