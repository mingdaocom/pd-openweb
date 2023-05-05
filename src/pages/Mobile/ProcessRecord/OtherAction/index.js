import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { List, Flex, Modal, TextareaItem } from 'antd-mobile';
import { Icon, Signature } from 'ming-ui';
import { ACTION_TO_TEXT } from 'src/pages/workflow/components/ExecDialog/config';
import { verifyPassword } from 'src/util';
import VerifyPassword from 'src/pages/workflow/components/ExecDialog/components/VerifyPassword';
import './index.less';
import _ from 'lodash';

export default class extends Component {
  constructor(props) {
    super(props);
    const { action, instance } = this.props;
    const backFlowNodes = (instance || {}).backFlowNodes || [];
    const { isCallBack } = (instance || {}).flowNode || {};
    let backFlowNode = '';

    if (props.action === 'return' && isCallBack && backFlowNodes.length) {
      backFlowNode = backFlowNodes[0].id;
    }

    this.state = {
      backFlowNodesVisible: false,
      backFlowNodes,
      backFlowNode,
      content: '',
      edit: false,
    };
  }
  handleAction = (backFlowNode = '') => {
    const { action, selectedUser, instance } = this.props;
    const { content } = this.state;
    const { auth, encrypt } = (instance || {}).flowNode || {};

    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = action === 'pass' && _.includes(auth.passTypeList, 1);
    const overruleContent = action === 'overrule' && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = action === 'overrule' && _.includes(auth.overruleTypeList, 1);
    const forwardAccountId = _.isArray(selectedUser)
      ? selectedUser.map(user => user.accountId).join(',')
      : selectedUser.accountId;

    const submitFun = () => {
      if (this.signature) {
        this.signature.saveSignature(signature => {
          this.props.onAction(action, content, forwardAccountId, backFlowNode, signature);
        });
      } else {
        this.props.onAction(action, content, forwardAccountId, backFlowNode, undefined);
      }
    };

    if (
      ((passContent || overruleContent) && !content.trim()) ||
      ((passSignature || overruleSignature) && this.signature.checkContentIsEmpty())
    ) {
      alert(_l('请填写完整内容'), 2);
      return;
    }

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      verifyPassword(this.password, submitFun);
    } else {
      submitFun();
    }
  };
  renderBackFlowNodes() {
    const { backFlowNode, backFlowNodes } = this.state;
    return (
      <List
        renderHeader={() => (
          <Flex className="backFlowNodesHeader">
            <Flex.Item
              className="left"
              onClick={() => {
                this.setState({
                  backFlowNodesVisible: false,
                });
              }}
            >
              <span>{_l('取消')}</span>
            </Flex.Item>
            <Flex.Item className="Font17 Gray">{_l('选择退回节点')}</Flex.Item>
            <Flex.Item
              className={cx('right')}
              onClick={() => {
                this.setState({
                  backFlowNodesVisible: false,
                });
              }}
            >
              {_l('确认')}
            </Flex.Item>
          </Flex>
        )}
        className="popup-list"
      >
        <div className="backFlowNodesList">
          {backFlowNodes.map(item => (
            <List.Item
              key={item.id}
              onClick={() => {
                this.setState({
                  backFlowNode: item.id,
                });
              }}
            >
              <Flex>
                <span className="Gray flex">{item.name}</span>
                {backFlowNode === item.id ? <Icon icon="ok" /> : null}
              </Flex>
            </List.Item>
          ))}
        </div>
      </List>
    );
  }
  renderInfo() {
    const { backFlowNodes, backFlowNode } = this.state;
    const { action, selectedUser, instance } = this.props;
    const currentAction = ACTION_TO_TEXT[action];
    const { isCallBack } = (instance || {}).flowNode || {};

    if (isCallBack && _.includes(['return'], action) && backFlowNodes.length) {
      const node = backFlowNodes.filter(item => item.id === backFlowNode)[0];
      const { name } = node ? node : {};
      return (
        <List>
          <List.Item>
            <Flex>
              <span className="flex Gray">{_l('退回到')}</span>
              <div
                className="Gray_75"
                onClick={() => {
                  this.setState({ backFlowNodesVisible: true });
                }}
              >
                <span>{name}</span>
                <Icon icon="navigate_next" className="Font22" />
              </div>
            </Flex>
          </List.Item>
        </List>
      );
    }
    if (_.includes(['transfer', 'transferApprove'], action)) {
      return (
        <List>
          <List.Item>
            <Flex>
              <span className="flex Gray">{currentAction.headerText}</span>
              <div className="Gray_75">
                <span>{selectedUser.fullname}</span>
                <img className="boderRadAll_50 mLeft10" src={selectedUser.avatar} />
              </div>
            </Flex>
          </List.Item>
        </List>
      );
    }
    if (_.includes(['after', 'before'], action)) {
      return (
        <List>
          <List.Item>
            <Flex>
              <img className="boderRadAll_50 mRight10" src={selectedUser.avatar} />
              <span className="flex Gray">{currentAction.headerText}</span>
            </Flex>
          </List.Item>
        </List>
      );
    }
    if (action === 'addApprove') {
      return (
        <List>
          <List.Item>
            <Flex>
              <span className="flex Gray">{_l('添加%0位审批人', selectedUser.length)}</span>
            </Flex>
          </List.Item>
        </List>
      );
    }
  }
  renderSignature() {
    return (
      <Fragment>
        <div className="title Gray_75 flexRow valignWrapper">
          <div className="bold mRight3" style={{ color: '#f44336' }}>
            *
          </div>
          {_l('签名')}
        </div>
        <Flex className="am-textarea-item">
          <Signature
            ref={signature => {
              this.signature = signature;
            }}
          />
        </Flex>
      </Fragment>
    );
  }
  renderVerifyPassword() {
    const { action, instance } = this.props;
    const { encrypt } = (instance || {}).flowNode || {};
    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      return (
        <Flex className="am-textarea-item">
          <div className="flex">
            <VerifyPassword onChange={value => (this.password = value)} />
          </div>
        </Flex>
      );
    }
  }
  renderContent() {
    const { action, onHide, instance } = this.props;
    const { content, backFlowNode, backFlowNodes } = this.state;
    const currentAction = ACTION_TO_TEXT[action];
    const { auth, isCallBack } = (instance || {}).flowNode || {};
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const overruleContent = action === 'overrule' && _.includes(auth.overruleTypeList, 100);
    const passSignature = action === 'pass' && _.includes(auth.passTypeList, 1);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const isSignature = passSignature || overruleSignature;
    const isAndroid = navigator.userAgent.toLowerCase().includes('android');
    return (
      <Fragment>
        <div className="flex flexColumn">
          <div className="title Gray_75 flexRow valignWrapper">
            {(passContent || overruleContent) && (
              <div className="bold mRight3" style={{ color: '#f44336' }}>
                *
              </div>
            )}
            {_l('审批意见')}
          </div>
          <TextareaItem
            className="flex"
            placeholder={currentAction.placeholder}
            labelNumber={5}
            value={content}
            onChange={content => {
              this.setState({
                content,
              });
            }}
            onFocus={() => {
              if (isAndroid && isSignature) {
                this.setState({ edit: true });
              }
            }}
            onBlur={() => {
              if (isAndroid && isSignature) {
                this.setState({ edit: false });
              }
            }}
          />
        </div>
        {isSignature && this.renderSignature()}
        {this.renderVerifyPassword()}
        {this.renderInfo()}
        <div className="flexRow actionBtnWrapper">
          <div className="flex actionBtn" onClick={onHide}>
            {_l('取消')}
          </div>
          <div
            className="flex actionBtn ok"
            onClick={() => {
              this.handleAction(backFlowNode);
            }}
          >
            {_l('确定')}
          </div>
        </div>
      </Fragment>
    );
  }
  render() {
    const { backFlowNodesVisible, edit } = this.state;
    const { visible, onHide } = this.props;
    return (
      <Modal
        popup
        visible={visible}
        onClose={() => {
          if (edit) return;
          onHide();
        }}
        animationType="slide-up"
      >
        <div className="otherActionWrapper flexColumn" style={{ height: edit ? 300 : 'auto' }}>
          {backFlowNodesVisible ? this.renderBackFlowNodes() : this.renderContent()}
        </div>
      </Modal>
    );
  }
}
