import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import { getAdvanceSetting } from '../../../../../util/setting';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { ALERT_TYPE_OPTIONS } from '../../config';
import { CustomActionWrap } from '../../style';

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

  const isDisabled = _.isEmpty(safeParse(message));

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={isDisabled}
      className="SearchWorksheetDialog"
      title={_l('提示消息')}
      onCancel={() => setState({ visible: false })}
      overlayClosable={false}
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
          <div className="Gray_9e mBottom8">{_l('最多显示50个字符')}</div>
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
