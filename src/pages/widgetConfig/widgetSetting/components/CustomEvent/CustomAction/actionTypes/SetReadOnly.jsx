import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Checkbox, Modal, Radio } from 'ming-ui/antd-components';
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
    <Modal
      width={480}
      open={visible}
      keyboard
      okDisabled={!isAll && _.isEmpty(actionItems)}
      title={_l('设置只读/可编辑')}
      onCancel={() => setState({ visible: false })}
      className="SearchWorksheetDialog"
      mask={{ closable: false }}
      onOk={() => {
        handleOk({ ...actionData, actionType, actionItems, isAll });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SettingItem className="mTop0">
          <div className="settingItemTitle">{_l('设置为')}</div>
          <Radio.Group
            size="middle"
            value={actionType}
            options={(DISPLAY_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              return setState({
                actionType: value,
                isAll: value === '3' ? false : isAll,
              });
            }}
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
            className="mTop8"
            checked={isAll}
            onChange={event => {
              const checked = !event.target.checked;
              return setState({
                isAll: !checked,
                actionItems: checked ? actionItems : [],
              });
            }}
            size="small"
          >
            {_l('所有字段')}
          </Checkbox>
        )}
      </CustomActionWrap>
    </Modal>
  );
}
