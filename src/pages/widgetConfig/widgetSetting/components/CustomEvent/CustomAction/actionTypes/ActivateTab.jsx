import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog } from 'ming-ui';
import SelectFields from '../SelectFields';
import { CustomActionWrap } from '../../style';
import { fixedBottomWidgets } from '../../../../../util';

export default function ActivateTab(props) {
  const { actionData = {}, handleOk, allControls = [] } = props;
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

  return (
    <Dialog
      width={480}
      visible={visible}
      okDisabled={_.isEmpty(actionItems)}
      className="SearchWorksheetDialog"
      title={_l('激活标签页')}
      onCancel={() => setState({ visible: false })}
      overlayClosable={false}
      onOk={() => {
        handleOk({ ...actionData, actionType, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <div className="Gray_9e">{_l('激活显示的标签页。标签页被隐藏时，激活动作将不生效。')}</div>
        <SelectFields
          {...props}
          allControls={allControls.filter(fixedBottomWidgets).map(i => ({ ...i, relationControls: [] }))}
          actionType={actionType}
          actionItems={actionItems}
          onSelectField={value => setState({ actionItems: _.isEmpty(value) ? value : [_.last(value)] })}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
