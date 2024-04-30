import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { CustomActionWrap } from '../../style';
import { getAdvanceSetting } from '../../../../../util/setting';

const DISPLAY_OPTIONS = [
  {
    text: _l('新页面'),
    value: '1',
  },
  {
    text: _l('页内模态窗口'),
    value: '2',
  },
];

export default function OpenLink(props) {
  const { actionData = {}, handleOk } = props;
  const [{ advancedSetting, message, visible }, setState] = useSetState({
    message: actionData.message || '',
    advancedSetting: actionData.advancedSetting || { opentype: '1' },
    visible: true,
  });

  useEffect(() => {
    setState({
      message: actionData.message || '',
      advancedSetting: actionData.advancedSetting || { opentype: '1' },
    });
  }, []);

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={!message}
      className="SearchWorksheetDialog"
      title={_l('打开链接')}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({ ...actionData, advancedSetting, message });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SettingItem className="mTop0">
          <div className="settingItemTitle">
            {_l('链接地址')}
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
        <SettingItem>
          <div className="settingItemTitle">{_l('打开方式')}</div>
          <RadioGroup
            size="middle"
            checkedValue={advancedSetting.opentype}
            data={DISPLAY_OPTIONS}
            onChange={value => setState({ advancedSetting: { ...advancedSetting, opentype: value } })}
          />
        </SettingItem>
      </CustomActionWrap>
    </Dialog>
  );
}
