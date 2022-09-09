import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { List, Flex, Modal, TextareaItem } from 'antd-mobile';
import { Icon } from 'ming-ui';
import { ACTION_TO_TEXT } from 'src/pages/workflow/components/ExecDialog/config';
import Signature from 'src/components/newCustomFields/widgets/Signature';
import './index.less';

export default class extends Component {
  constructor(props) {
    super(props);
    const { action, instance } = this.props;
    const backFlowNodes = (instance || {}).backFlowNodes || [];
    const { isCallBack } = (instance || {}).flowNode || {};
    let backFlowNode = '';

    if (props.action === 'overrule' && isCallBack && backFlowNodes.length) {
      backFlowNode = backFlowNodes[0].id;
    }

    this.state = {
      backFlowNodesVisible: false,
      backFlowNodes,
      backFlowNode,
      content: '',
      signature: '',
    };
  }
  handleAction = (backFlowNode = '') => {
    const { action, selectedUser, instance } = this.props;
    const { content, signature } = this.state;
    const { auth } = (instance || {}).flowNode || {};

    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = action === 'pass' && _.includes(auth.passTypeList, 1);
    const overruleContent = action === 'overrule' && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = action === 'overrule' && _.includes(auth.overruleTypeList, 1);
    const forwardAccountId = _.isArray(selectedUser) ? selectedUser.map(user => user.accountId).join(',') : selectedUser.accountId

    if (((passContent || overruleContent) && !content.trim()) || ((passSignature || overruleSignature) && !signature)) {
      alert(_l('请填写完整内容', 2));
      return;
    }

    this.props.onAction(action, content, forwardAccountId, backFlowNode, signature ? JSON.parse(signature) : undefined);
  }
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
            <Flex.Item className="title Gray">{_l('选择退回节点')}</Flex.Item>
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
                {backFlowNode === item.id ? <Icon icon="ok"/> : null}
              </Flex>
            </List.Item>
          ))}
        </div>
      </List>
    );
  }
  renderInfo() {
    const { backFlowNodes, backFlowNode, signature } = this.state;
    const { action, selectedUser, instance } = this.props;
    const currentAction = ACTION_TO_TEXT[action];
    const { isCallBack, auth } = (instance || {}).flowNode || {};
    const passSignature = action === 'pass' && _.includes(auth.passTypeList, 1);
    const overruleSignature = action === 'overrule' && _.includes(auth.overruleTypeList, 1);

    if (isCallBack && action === 'overrule' && backFlowNodes.length) {
      const node = backFlowNodes.filter(item => item.id === backFlowNode)[0];
      const { name } = node ? node : {};
      return (
        <List>
          <List.Item>
            <Flex>
              <span className="flex Gray">{_l('退回到')}</span>
              <div className="Gray_75" onClick={() => { this.setState({ backFlowNodesVisible: true }) }}>
                <span>{name}</span>
                <Icon icon="navigate_next" className="Font22"/>
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
                <img className="boderRadAll_50 mLeft10" src={selectedUser.avatar}/>
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
              <img className="boderRadAll_50 mRight10" src={selectedUser.avatar}/>
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
    if (passSignature || overruleSignature) {
      return (
        <Flex className="am-textarea-item">
          <Signature advancedSetting={{ uselast: '1' }} value={signature} onChange={signature => this.setState({ signature })} />
        </Flex>
      );
    }
  }
  renderContent() {
    const { action, onHide, instance } = this.props;
    const { content, backFlowNode, backFlowNodes } = this.state;
    const currentAction = ACTION_TO_TEXT[action];
    const { isCallBack } = (instance || {}).flowNode || {};
    const isOverruleBack = action === 'overrule' && isCallBack && backFlowNodes.length;
    return (
      <Fragment>
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
        />
        {this.renderInfo()}
        <div className="flexRow actionBtnWrapper">
          {isOverruleBack ? (
            <Fragment>
              <div
                className="flex actionBtn overrule"
                onClick={() => {
                  this.handleAction();
                }}
              >
                {_l('直接否决')}
              </div>
              <div
                className="flex actionBtn ok"
                onClick={() => { this.handleAction(backFlowNode) }}
              >
                {_l('否决并退回')}
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="flex actionBtn" onClick={onHide}>{_l('取消')}</div>
              <div
                className="flex actionBtn ok"
                onClick={() => { this.handleAction(backFlowNode) }}
              >
                {currentAction.okText}
              </div>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }
  render() {
    const { backFlowNodesVisible, signature } = this.state;
    const { visible, onHide } = this.props;
    return (
      <Modal
        popup
        visible={visible}
        onClose={onHide}
        animationType="slide-up"
      >
        <div className={cx('otherActionWrapper flexColumn', { signatureWrapper: signature })}>
          {backFlowNodesVisible ? this.renderBackFlowNodes() : this.renderContent()}
        </div>
      </Modal>
    );
  }
}
