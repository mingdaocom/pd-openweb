import React, { Fragment } from 'react';
import { Tooltip } from 'antd';
import { Dropdown } from 'ming-ui';
import { RELATION_OPTIONS } from '../../config/setting';
import { SettingItem } from '../../styled';

export default function Relation({ data, onChange }) {
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('类型')}
          <Tooltip
            autoCloseDelay={0}
            title={_l(
              '管理员可以选择用户需要自由连接的类型，例：自由连接的类型为任务，成员在详情处选择自由连接的内容只能是相关的任务',
            )}
          />
        </div>
        <Dropdown
          border
          value={data.enumDefault}
          data={RELATION_OPTIONS.filter(item => (item.isHide ? item.isHide() : true))}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
    </Fragment>
  );
}
