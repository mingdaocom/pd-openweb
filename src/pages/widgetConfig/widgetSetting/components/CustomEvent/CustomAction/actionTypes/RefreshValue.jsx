import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import { CustomActionWrap } from '../../style';
import SelectFields from '../SelectFields';

export default function RefreshValue(props) {
  const { actionData = {}, handleOk, allControls } = props;
  const selectControls = allControls
    .filter(
      item =>
        (item.type === 30 && (item.strDefault || '').split('')[0] !== '1') ||
        _.includes([31, 32, 37, 38, 53], item.type),
    )
    .map(i => ({ ...i, sectionId: '' }));
  const [{ actionItems, visible }, setState] = useSetState({
    actionItems: actionData.actionItems || [],
    visible: true,
  });

  useEffect(() => {
    setState({
      actionItems: actionData.actionItems || [],
    });
  }, []);

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={_.isEmpty(actionItems)}
      className="SearchWorksheetDialog"
      title={_l('刷新字段值')}
      onCancel={() => setState({ visible: false })}
      overlayClosable={false}
      onOk={() => {
        handleOk({ ...actionData, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <SelectFields
          {...props}
          className="mTop0"
          allControls={selectControls}
          actionType="1"
          actionItems={actionItems}
          onSelectField={value => setState({ actionItems: value })}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
