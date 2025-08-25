import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Checkbox, Dialog, RadioGroup } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import { CustomActionWrap } from '../../style';
import SelectFields from '../SelectFields';

const DISPLAY_OPTIONS = [
  {
    text: _l('只读'),
    value: '4',
  },
  {
    text: _l('可编辑'),
    value: '3',
  },
];

export default function SetReadOnly(props) {
  const { actionData = {}, handleOk } = props;
  const [{ actionType, actionItems, isAll, visible }, setState] = useSetState({
    actionType: actionData.actionType,
    actionItems: actionData.actionItems || [],
    isAll: actionData.isAll || false,
    visible: true,
  });

  useEffect(() => {
    setState({
      actionType: actionData.actionType,
      actionItems: actionData.actionItems || [],
      isAll: actionData.isAll || false,
    });
  }, []);

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={!isAll && _.isEmpty(actionItems)}
      title={_l('设置只读/可编辑')}
      onCancel={() => setState({ visible: false })}
      className="SearchWorksheetDialog"
      overlayClosable={false}
      onOk={() => {
        handleOk({ ...actionData, actionType, actionItems, isAll });
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
            onChange={value => setState({ actionType: value, isAll: value === '3' ? false : isAll })}
          />
        </SettingItem>

        <SelectFields
          {...props}
          disabled={isAll}
          actionType={actionType}
          actionItems={actionItems}
          onSelectField={value => setState({ actionItems: value })}
        />
        {actionType === '4' && (
          <Checkbox
            size="small"
            className="mTop8"
            checked={isAll}
            onClick={checked => setState({ isAll: !checked, actionItems: checked ? actionItems : [] })}
            text={_l('所有字段')}
          />
        )}
      </CustomActionWrap>
    </Dialog>
  );
}
