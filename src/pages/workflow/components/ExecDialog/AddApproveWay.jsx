import React, { Component, Fragment } from 'react';
import { func, string } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Dialog from 'ming-ui/components/Dialog/Dialog';
import OtherAction from './OtherAction';
import 'dialogSelectUser';

export default class AddApproveWay extends Component {
  static PropTypes = {
    action: string,
    onCancel: func,
    onOk: func,
  };

  static defaultProps = {
    action: '',
    onCancel: () => {},
    onOk: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      selectedUser: {},
      action: props.action,
    };
  }

  /**
   * 加签选人层
   */
  selectUserTransfer = way => {
    const { projectId } = this.props;
    $({}).dialogSelectUser({
      title: _l('选择审批人'),
      showMoreInvite: false,
      SelectUserSettings: {
        unique: true,
        projectId: projectId,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        filterAccountIds: [md.global.Account.accountId],
        callback: user => {
          const selectedUser = user[0];
          this.setState({
            selectedUser,
            action: way,
            otherActionVisible: true,
          });
        },
      },
    });
  };

  /**
   * 切换加签方式显示状态
   */
  handleApproveVisible = (visible = false) => {
    this.setState({
      otherActionVisible: visible,
    });
  };

  onOk = paras => {
    this.setState({ otherActionVisible: false });
    this.props.onOk(paras);
  };

  render() {
    let { onCancel, onSubmit } = this.props;
    let { otherActionVisible, selectedUser, action } = this.state;
    return (
      <Fragment>
        <Dialog className="addApproveWayDialog" visible title={_l('加签方式')} footer={null} onCancel={onCancel}>
          <div className="actionWrap">
            <div
              className="action flexRow"
              onClick={() => {
                onSubmit({
                  noSave: true,
                  callback: err => {
                    if (!err) {
                      this.selectUserTransfer('after');
                    } else {
                      onCancel();
                    }
                  },
                });
              }}
            >
              <div className="text flex">{_l('通过申请后增加一位审批人')}</div>
              <Icon icon="arrow-right-border" />
            </div>
            <div className="action flexRow" onClick={() => this.selectUserTransfer('before')}>
              <div className="text flex">{_l('在我审批前增加一位审批人')}</div>
              <Icon icon="arrow-right-border" />
            </div>
          </div>
        </Dialog>
        {otherActionVisible && (
          <OtherAction
            {...this.props}
            selectedUser={selectedUser}
            action={action}
            onOk={this.onOk}
            onCancel={() => this.handleApproveVisible(false)}
          />
        )}
      </Fragment>
    );
  }
}
