import React from 'react';
import { Dialog, LoadDiv, Icon } from 'ming-ui';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import userController from 'src/api/user';
import styled from 'styled-components';

const DialogWrap = styled(Dialog)`
  .test-textarea {
    padding: 8px;
    color: #333;
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    outline: none;
    border: 1px solid #e0e0e0;
    line-height: 18px;
    height: auto;
    min-height: 90px;
    vertical-align: text-top;
    overflow-y: scroll;
    resize: none;
  }
`;

class RefuseUserJoinDia extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refuseMessage: '',
    };
  }

  componentDidMount() {
    this.area && this.area.focus();
  }

  refuseUserJoin = () => {
    const { projectId, accountIds, callback = () => {}, onCancel = () => {} } = this.props;
    const { refuseMessage } = this.state;

    userController
      .refuseUsersJoin({
        projectId,
        accountIds,
        refuseMessage,
      })
      .then(res => {
        if (res.actionResult === 1) {
          callback();
          alert(_l('拒绝成功'));
        } else {
          alert(_l('拒绝失败'), 2);
        }
        onCancel();
      })
      .catch(err => {
        alert(_l('拒绝失败'), 2);
        callback();
      });
  };

  render() {
    const { onCancel = () => {}, accountIds = [] } = this.props;
    const { refuseMessage } = this.state;

    return (
      <DialogWrap
        visible
        title={_l('拒绝用户加入')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        className="dialogRefuse"
        onCancel={onCancel}
        onOk={this.refuseUserJoin}
      >
        <div className="mBottom20 Gray">
          {_l('您共勾选了')}
          <span className="ThemeColor"> {accountIds.length} </span>
          {_l('个用户')}
        </div>
        <div className="settingItemTitle">{_l('拒绝消息')}</div>
        <textarea
          type="textarea"
          className="test-textarea mTop10"
          value={refuseMessage || ''}
          ref={area => (this.area = area)}
          onChange={e => {
            this.setState({
              refuseMessage: e.target.value,
            });
          }}
        />
      </DialogWrap>
    );
  }
}

export const refuseUserJoinFunc = props => FunctionWrap(RefuseUserJoinDia, props);
