import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import SelectFields from '../SelectFields';
import { CustomActionWrap } from '../../style';
import { getNewDropDownData } from '../../../../../../FormSet/components/columnRules/config';

const DISPLAY_OPTIONS = [
  {
    text: _l('显示'),
    value: '1',
  },
  {
    text: _l('隐藏'),
    value: '2',
  },
];

export default function ShowOrHide(props) {
  const { actionData = {}, allControls, handleOk } = props;
  const [{ actionType, actionItems, visible }, setState] = useSetState({
    actionType: actionData.actionType,
    actionItems: actionData.actionItems || [],
    visible: true,
  });

  useEffect(() => {
    setState({
      actionType: actionData.actionType,
      actionItems: actionData.actionItems || [],
    });
  }, []);

  const filterControls = getNewDropDownData(allControls, actionType);

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={_.isEmpty(actionItems)}
      className="SearchWorksheetDialog"
      title={_l('显示/隐藏')}
      onCancel={() => setState({ visible: false })}
      onOk={() => {
        handleOk({ ...actionData, actionType, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SettingItem className="mTop0">
          <div className="settingItemTitle">{_l('设置为')}</div>
          <RadioGroup
            size="middle"
            checkedValue={actionType}
            data={DISPLAY_OPTIONS}
            onChange={value => setState({ actionType: value })}
          />
        </SettingItem>

        <SelectFields
          {...props}
          allControls={filterControls}
          actionType={actionType}
          actionItems={actionItems}
          onSelectField={value => setState({ actionItems: value })}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
