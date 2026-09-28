import React, { Fragment, useEffect } from 'react';
import _ from 'lodash';
import { Radio } from 'ming-ui/antd-components';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { DISPLAY_USER_TYPE_OPTIONS } from 'src/utils/domain/control/setting';
import { SettingItem } from '../../styled';
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
        <Radio.Group
          size="middle"
          value={enumDefault}
          options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
          onChange={event =>
            onChange({
              enumDefault: event.target.value,
              unique: false,
            })
          }
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
                  <Radio.Group
                    size="middle"
                    value={usertype}
                    options={(DISPLAY_USER_TYPE_OPTIONS || []).map(({ text, ...option }) => ({
                      ...option,
                      label: text,
                    }))}
                    onChange={event =>
                      onChange(
                        handleAdvancedSettingChange(
                          {
                            ...data,
                            enumDefault2: 0,
                          },
                          {
                            usertype: event.target.value,
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
