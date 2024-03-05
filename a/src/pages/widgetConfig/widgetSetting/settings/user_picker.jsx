import React, { Fragment, useEffect } from 'react';
import { RadioGroup } from 'ming-ui';
import { SettingItem } from '../../styled';
import { handleAdvancedSettingChange } from '../../util/setting';
import Components from '../components';
import _ from 'lodash';

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

export default function UserPicker(props) {
  const { from, data, onChange, enableState, fromExcel } = props;
  const { enumDefault, advancedSetting = {}, controlId } = data;
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
        <div className="settingItemTitle">{_l('选择方式')}</div>
        <RadioGroup
          size="middle"
          checkedValue={enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => onChange({ enumDefault: value })}
        />
      </SettingItem>
      {fromExcel ? null : (
        <Fragment>
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
          {from !== 'subList' && <Components.WidgetUserPermission {...props} />}
        </Fragment>
      )}
    </Fragment>
  );
}
