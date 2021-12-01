import React, { Fragment, Component } from 'react';
import { withRouter } from 'react-router-dom';
import { ActionSheet, Modal, List, WhiteSpace } from 'antd-mobile';
import SelectUser from 'src/pages/Mobile/components/SelectUser';
import { OPERATION_LIST } from 'src/pages/workflow/components/ExecDialog/config';

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
    const { instance, onClose } = this.props;
    const { operationTypeList } = instance;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    if (newOperationTypeList[buttonIndex]) {
      const { id } = OPERATION_LIST[newOperationTypeList[buttonIndex]];
      if (id === 'sign') {
        onClose();
        const BUTTONS = [_l('通过申请后增加一位审批人'), _l('在我审批前增加一位审批人'), _l('取消')];
        const run = action => {
          this.setState({
            action,
            selectUserVisible: true,
          });
          onClose();
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
        onClose();
      }
      if (id === 'addApprove') {
        this.setState({
          action: id,
          selectUserVisible: true
        });
        onClose();
      }
    }
  }
  render() {
    const { action, selectUserVisible } = this.state;
    const { visible, instance, rowId, worksheetId, sheetRow, onClose } = this.props;
    const { operationTypeList, app } = instance;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    const buttons = newOperationTypeList.map(item => {
      return OPERATION_LIST[item].text;
    });

    return (
      <Fragment>
        <Modal
          popup
          animationType="slide-up"
          className="actionSheetModal"
          visible={visible}
          onClose={onClose}
        >
          <List className="mobileActionSheetList">
            <div className="actionHandleList">
              {isWeLink ? null : (
                <List.Item
                  onClick={() => {
                    this.props.history.push(
                      `/mobile/discuss/${app.id}/${worksheetId}/null/${rowId}?processRecord`,
                    );
                  }}
                >
                  {_l('查看讨论')}
                </List.Item>
              )}
              {
                buttons.map((item, index) => (
                  <List.Item key={index} onClick={() => { this.handleOperation(index) }}>{item}</List.Item>
                ))
              }
            </div>
            <WhiteSpace size="sm" />
            <List.Item onClick={onClose}>
              {_l('取消')}
            </List.Item>
          </List>
        </Modal>
        {selectUserVisible && (
          <SelectUser
            projectId={sheetRow.projectId}
            visible={selectUserVisible}
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
