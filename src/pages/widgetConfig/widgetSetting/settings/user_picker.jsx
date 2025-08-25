import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import { RadioGroup } from 'ming-ui';
import { DISPLAY_USER_TYPE_OPTIONS } from '../../config/setting';
import { SettingItem } from '../../styled';
import { handleAdvancedSettingChange } from '../../util/setting';
import UserConfig from '../components/WidgetHighSetting/ControlSetting/UserConfig';
import WidgetUserPermission from '../components/WidgetUserPermission';

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
          onChange={value => onChange({ enumDefault: value, unique: false })}
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
                        _.find(DISPLAY_USER_TYPE_OPTIONS, i => i.value === usertype),
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
                    data={DISPLAY_USER_TYPE_OPTIONS}
                    onChange={value =>
                      onChange(
                        handleAdvancedSettingChange(
                          { ...data, enumDefault2: 0 },
                          {
                            usertype: value,
                            dynamicsrc: '',
                            defaultfunc: '',
                            defsource: '',
                            defaulttype: '',
                            chooserange: '',
                          },
                        ),
                      )
                    }
                  />
                </SettingItem>
              )}
            </Fragment>
          )}
          <UserConfig {...props} />
          {from !== 'subList' && <WidgetUserPermission {...props} />}
        </Fragment>
      )}
    </Fragment>
  );
}
