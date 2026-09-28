import React from 'react';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import userController from 'src/api/user';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';

const DialogWrap = styled(Modal)`
  .test-textarea {
    padding: 8px;
    color: var(--color-text-title);
    box-sizing: border-box;
    width: 100%;
    border-radius: 3px;
    outline: none;
    border: 1px solid var(--color-border-secondary);
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
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('拒绝失败'), 2);
        callback();
      });
  };

  render() {
    const { onCancel = () => {}, accountIds = [] } = this.props;
    const { refuseMessage } = this.state;

    return (
      <DialogWrap
        open
        mask={{ closable: true }}
        keyboard
        title={_l('拒绝用户加入')}
        okText={_l('确定')}
        cancelText={_l('取消')}
        className="dialogRefuse"
        onCancel={onCancel}
        onOk={this.refuseUserJoin}
      >
        <div className="mBottom20 textPrimary">
          {_l('您共勾选了')}
          <span className="colorPrimary"> {accountIds.length} </span>
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

export function useRefuseUserJoinDialog() {
  return useFunctionWrapComponent(RefuseUserJoinDia);
}
