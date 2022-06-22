import React, { Fragment, useEffect } from 'react';
import { RadioGroup } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem } from '../../styled';
import { WHOLE_SIZE } from '../../config/Drag';
import { handleAdvancedSettingChange } from '../../util/setting';

const DISPLAY_OPTIONS = [
  {
    text: _l('单选'),
    value: 0,
  },
  {
    text: _l('多选'),
    value: 1,
  },
];
const DISPLAY_TYPE_OPTIONS = [
  {
    text: _l('常规'),
    value: '1',
  },
  {
    text: _l('外部门户'),
    value: '2',
  },
];
const ADVANCE_SETTING = [
  {
    value: 1,
    children: (
      <span>
        {_l('作为成员')}
        <Tooltip placement="bottom" title={_l('加入的人员允许查看记录')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
  {
    value: 2,
    children: (
      <span>
        {_l('作为记录拥有者')}
        <Tooltip placement="bottom" title={_l('加入的人员可以管理记录')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
  {
    value: 0,
    children: (
      <span>
        {_l('仅用于记录人员数据')}
        <Tooltip placement="bottom" title={_l('加入的人员将仅作为数据记录，不会授予任何权限')}>
          <i className="icon-help Gray_9e Font16 mLeft5"></i>
        </Tooltip>
      </span>
    ),
  },
];
export default function UserPicker({ from, data, onChange, enableState }) {
  const { enumDefault, userPermission, advancedSetting = {}, controlId } = data;
  const { usertype } = advancedSetting;
  const isSaved = controlId && !controlId.includes('-');
  useEffect(() => {
    if (!usertype) {
      onChange(handleAdvancedSettingChange(data, { usertype: '1' }));
    }
  }, [controlId]);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('数量')}</div>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      {enableState && (
        <Fragment>
          {isSaved ? (
            <SettingItem>
              <span>
                {_l('成员类型')}
                <span className="mLeft8 Bold">
                  {_.get(
                    _.find(DISPLAY_TYPE_OPTIONS, i => i.value === usertype),
                    'text',
                  )}
                </span>
              </span>
            </SettingItem>
          ) : (
            <SettingItem>
              <div className="settingItemTitle">{_l('成员类型')}</div>
              <RadioGroup
                size="middle"
                checkedValue={usertype}
                data={DISPLAY_TYPE_OPTIONS}
                onChange={value =>
                  onChange(
                    handleAdvancedSettingChange(data, {
                      usertype: value,
                      dynamicsrc: '',
                      defaultfunc: '',
                      defsource: '',
                      defaulttype: '',
                    }),
                  )
                }
              />
            </SettingItem>
          )}
        </Fragment>
      )}
      {from !== 'subList' && (
        <SettingItem>
          <div className="settingItemTitle">{_l('权限')}</div>
          <RadioGroup
            vertical
            size="middle"
            data={ADVANCE_SETTING}
            checkedValue={userPermission}
            onChange={value =>
              onChange({
                userPermission: value,
                noticeItem: Number(_.includes([2], value)),
              })
            }
          />
        </SettingItem>
      )}
    </Fragment>
  );
}
