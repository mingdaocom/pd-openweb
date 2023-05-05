import React, { Fragment, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ActionSheet, Modal, List, WhiteSpace } from 'antd-mobile';
import SelectUser from 'mobile/components/SelectUser';
import { MOBILE_OPERATION_LIST } from 'src/pages/workflow/components/ExecDialog/config';

const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');

class Operation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      action: '',
      selectUserVisible: false
    }
  }
  componentWillUnmount() {
    ActionSheet.close();
  }
  handleOperation = (buttonIndex) => {
    const { instance } = this.props;
    const { operationTypeList } = instance;
    const baseActionList = [3, 4, 5, 9, 18];
    const newOperationTypeList = operationTypeList[1]
      .concat(operationTypeList[0].filter(n => !baseActionList.includes(n)))
      .filter(item => ![12, 13].includes(item));
    if (newOperationTypeList[buttonIndex]) {
      const { id } = MOBILE_OPERATION_LIST[newOperationTypeList[buttonIndex]];
      if (id === 'sign') {
        const BUTTONS = [_l('通过申请后增加一位审批人'), _l('在我审批前增加一位审批人'), _l('取消')];
        const run = action => {
          this.setState({
            action,
            selectUserVisible: true,
          });
        }
        ActionSheet.showActionSheetWithOptions(
          {
            options: BUTTONS,
            cancelButtonIndex: BUTTONS.length - 1,
          },
          buttonIndex => {
            if (buttonIndex === 0) {
              run('after');
            }
            if (buttonIndex === 1) {
              run('before');
            }
          }
        );
      }
      if (id === 'transferApprove' || id === 'transfer') {
        this.setState({
          action: id,
          selectUserVisible: true
        });
      }
      if (id === 'addApprove') {
        this.setState({
          action: id,
          selectUserVisible: true
        });
      }
      if (id === 'return') {
        this.props.onUpdateAction({
          action: id,
          otherActionVisible: true,
        });
      }
    }
  }
  render() {
    const { action, selectUserVisible } = this.state;
    const { instance, sheetRow } = this.props;
    const { operationUserRange } = instance;
    const TYPES = {
      transferApprove: 6,
      addApprove: 16,
      after: 7,
      before: 7,
      transfer: 10,
    };
    const appointedAccountIds = operationUserRange ? operationUserRange[TYPES[action]] : '';
    return (
      <Fragment>
        {selectUserVisible && (
          <SelectUser
            projectId={sheetRow.projectId}
            visible={selectUserVisible}
            selectRangeOptions={appointedAccountIds ? { appointedAccountIds } : ''}
            type="user"
            onlyOne={action === 'addApprove' ? false : true}
            onClose={() => {
              this.setState({
                selectUserVisible: false,
              });
            }}
            onSave={(user) => {
              const selectedUser = action === 'addApprove' ? user : user[0];
              this.props.onUpdateAction({
                action,
                selectedUser,
                otherActionVisible: true,
              });
            }}
          />
        )}
      </Fragment>
    );
  }
}

export default Operation;
