import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { CustomActionWrap } from '../../style';
import { ALERT_TYPE_OPTIONS } from '../../config';
import { getAdvanceSetting } from '../../../../../util/setting';
import cx from 'classnames';

export default function PromptMessage(props) {
  const { actionData = {}, handleOk } = props;
  const [{ advancedSetting, message, visible }, setState] = useSetState({
    message: actionData.message || '',
    advancedSetting: actionData.advancedSetting || { alerttype: '1' },
    visible: true,
  });

  useEffect(() => {
    setState({
      message: actionData.message || '',
      advancedSetting: actionData.advancedSetting || { alerttype: '1' },
    });
  }, []);

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={!message}
      className="SearchWorksheetDialog"
      title={_l('提示消息')}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({ ...actionData, advancedSetting, message });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SettingItem className="mTop0">
          <div className="settingItemTitle">{_l('提示类型')}</div>
          <div className="flexCenter">
            {ALERT_TYPE_OPTIONS.map(item => {
              return (
                <div
                  className={cx('alertContent mRight10', { active: item.value === advancedSetting.alerttype })}
                  onClick={() => {
                    setState({ advancedSetting: { ...advancedSetting, alerttype: item.value } });
                  }}
                >
                  {item.icon}
                  <span className="mLeft10">{item.text}</span>
                </div>
              );
            })}
          </div>
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">
            {_l('消息内容')}
            <span className="Red">*</span>
          </div>
          <DynamicDefaultValue
            {...props}
            data={{
              type: 2,
              advancedSetting: { defsource: message },
            }}
            hideTitle={true}
            hideSearchAndFun={true}
            propFiledVisible={true}
            onChange={newData => {
              const { defsource } = getAdvanceSetting(newData);
              setState({ message: defsource });
            }}
          />
        </SettingItem>
      </CustomActionWrap>
    </Dialog>
  );
}
