import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import { fixedBottomWidgets } from 'src/utils/domain/control/editorLayout';
import { CustomActionWrap } from '../../style';
import SelectFields from '../SelectFields';

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
    <Modal
      width={480}
      open={visible}
      keyboard
      okDisabled={_.isEmpty(actionItems)}
      className="SearchWorksheetDialog"
      title={_l('激活标签页')}
      onCancel={() => setState({ visible: false })}
      mask={{ closable: false }}
      onOk={() => {
        handleOk({ ...actionData, actionType, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        <div className="textTertiary">{_l('激活显示的标签页。标签页被隐藏时，激活动作将不生效。')}</div>
        <SelectFields
          {...props}
          allControls={allControls.filter(fixedBottomWidgets).map(i => ({ ...i, relationControls: [] }))}
          actionType={actionType}
          actionItems={actionItems}
          onSelectField={value => setState({ actionItems: _.isEmpty(value) ? value : [_.last(value)] })}
        />
      </CustomActionWrap>
    </Modal>
  );
}
