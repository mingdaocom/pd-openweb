import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { List, Flex, Modal, TextareaItem, ActionSheet } from 'antd-mobile';
import { Icon, Signature } from 'ming-ui';
import { ACTION_TO_TEXT } from 'src/pages/workflow/components/ExecDialog/config';
import { verifyPassword } from 'src/util';
import VerifyPassword from 'src/pages/workflow/components/ExecDialog/components/VerifyPassword';
import delegationApi from 'src/pages/workflow/api/delegation';
import functionTemplateModal from '../FunctionTemplateModal';
import SelectUser from 'mobile/components/SelectUser';
import './index.less';
import _ from 'lodash';

export default class extends Component {
  constructor(props) {
    super(props);
    const { action, instance } = this.props;
    const backFlowNodes = (instance || {}).backFlowNodes || [];
    const { isCallBack } = (instance || {}).flowNode || {};
    const { inputType, opinions } = (instance || {}).opinionTemplate || {};
    let backFlowNode = '';
    let content = '';

    if (props.action === 'return' && isCallBack && backFlowNodes.length) {
      backFlowNode = backFlowNodes[0].id;
    }
    if (props.action === 'pass' && _.find(opinions[4], { selected: true })) {
      content = _.find(opinions[4], { selected: true }).value;
    }
    if (_.includes(['overrule', 'return'], props.action) && _.find(opinions[5], { selected: true })) {
      content = _.find(opinions[5], { selected: true }).value;
    }

    this.state = {
      backFlowNodesVisible: false,
      backFlowNodes,
      backFlowNode,
      content,
      edit: false,
      showPassword: false,
      selectedUser: [],
      entrustList: {},
      customApproveContent: content ? true : false,
    };
  }
  componentDidMount() {
    const { action, instance, projectId } = this.props;
    const { encrypt } = (instance || {}).flowNode || {};

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      verifyPassword({
        projectId,
        checkNeedAuth: true,
        fail: result => {
          this.setState({ showPassword: true, removeNoneVerification: result === 'showPassword' });
        },
      });
    }
  }
  componentWillUnmount() {
    ActionSheet.close();
  }
  handleAction = (backFlowNode = '') => {
    const { action, instance } = this.props;
    const { content, showPassword, selectedUser, entrustList } = this.state;
    const { auth, encrypt } = (instance || {}).flowNode || {};

    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const forwardAccountId = (_.isArray(selectedUser) ? selectedUser : [selectedUser])
      .map(user => {
        if (entrustList[user.accountId]) {
          return entrustList[user.accountId].trustee.accountId;
        }
        return user.accountId;
      })
      .join(',');

    if (_.includes(['transfer', 'transferApprove', 'after', 'before', 'addApprove'], action) && !forwardAccountId) {
      alert(_l('必须选择一个人员'), 2);
      return;
    }
    if (
      ((passContent || overruleContent) && !content.trim()) ||
      ((passSignature || overruleSignature) && this.signature.checkContentIsEmpty())
    ) {
      alert(_l('请填写完整内容'), 2);
      return;
    }

    const submitFun = () => {
      if (this.signature) {
        this.signature.saveSignature(signature => {
          this.props.onAction(action, content, forwardAccountId, backFlowNode, signature);
        });
      } else {
        this.props.onAction(action, content, forwardAccountId, backFlowNode, undefined);
      }
      if (this.isNoneVerification) {
        this.setState({ showPassword: false });
      }
    };

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      verifyPassword({
        password: this.password,
        closeImageValidation: true,
        isNoneVerification: this.isNoneVerification,
        checkNeedAuth: !showPassword,
        success: submitFun,
        fail: () => {
          this.setState({ showPassword: true });
        },
      });
    } else {
      submitFun();
    }
  };
  checkEntrust = users => {
    const { entrustList } = this.state;
    const { projectId } = this.props;
    delegationApi
      .getListByPrincipals({
        companyId: projectId,
        principals: users.map(item => item.accountId),
      })
      .then(data => {
        this.setState({
          entrustList: {
            ...entrustList,
            ...data,
          },
        });
      });
  };
  handleOpenTemplate = data => {
    const { instance } = this.props;
    const { opinionTemplate } = instance || {};
    functionTemplateModal({
      ...data,
      onSelect: content => this.setState({ content, customApproveContent: content ? true : false }),
      onCustom: () => {
        this.setState(
          {
            customApproveContent: true,
          },
          () => {
            this.textarea && this.textarea.focus();
          },
        );
      },
    });
  };
  handleOpenEntrust = (e, data) => {
    e.stopPropagation();
    if (_.isEmpty(data)) return;
    ActionSheet.showActionSheetWithOptions(
      {
        options: [
          <div className="flexRow alignItemsCenter">
            <div className="Gray_75 mRight10 Font13">{_l('将委托给')}</div>
            <img className="mLeft10 boderRadAll_50 selectedUser" style={{ width: 30 }} src={data.trustee.avatar} />
            <div className="mLeft10 Font15 ellipsis">{data.trustee.fullName}</div>
          </div>,
          <div className="flexRow alignItemsCenter">
            <div className="Gray_75 mRight10 Font13">{_l('委托截止')}</div>
            <div className="mLeft10 Font15">{data.endDate}</div>
          </div>,
        ],
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('%0发起了委托', data.principal.fullName)}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
      },
      buttonIndex => {},
    );
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
    const { backFlowNodes, backFlowNode, selectedUser, entrustList } = this.state;
    const { action, instance } = this.props;
    const currentAction = ACTION_TO_TEXT[action];
    const { isCallBack } = (instance || {}).flowNode || {};

    if (isCallBack && _.includes(['return'], action) && backFlowNodes.length) {
      const node = backFlowNodes.filter(item => item.id === backFlowNode)[0];
      const { name } = node ? node : {};
      return (
        <div className="itemWrap flexRow valignWrapper Gray Font13">
          <div className="bold">{_l('退回到')}</div>
          <div
            className="flex flexRow valignWrapper flexEnd mLeft30"
            onClick={() => {
              this.setState({ backFlowNodesVisible: true });
            }}
          >
            <span>{name}</span>
            <Icon icon="navigate_next" className="Gray_9e Font22" />
          </div>
        </div>
      );
    }
    if (_.includes(['transfer', 'transferApprove', 'after', 'before'], action)) {
      return (
        <div className="itemWrap flexRow valignWrapper">
          <div className="Gray Font13 bold">{currentAction.headerText}</div>
          {selectedUser.accountId ? (
            <div
              className="flex flexRow valignWrapper flexEnd mRight10 mLeft30"
              onClick={e => this.handleOpenEntrust(e, entrustList[selectedUser.accountId])}
            >
              <img className="boderRadAll_50 selectedUser" src={selectedUser.avatar} />
              <span className="mLeft10 Gray ellipsis">{selectedUser.fullname}</span>
              {!!entrustList[selectedUser.accountId] && <Icon className="Font20 mLeft10" icon="lift" />}
            </div>
          ) : (
            <div className="flex"></div>
          )}
          <Icon
            className="Gray_9e Font22"
            icon={selectedUser.accountId ? 'task-folder-charge' : 'task-add-member-circle'}
            onClick={() => this.setState({ selectUserVisible: true })}
          />
        </div>
      );
    }
    if (action === 'addApprove') {
      return (
        <Fragment>
          <div className="itemWrap flexRow valignWrapper">
            <div className="Gray Font13 bold flex">
              {selectedUser.length ? _l(`添加%0位审批人`, selectedUser.length) : currentAction.headerText}
            </div>
            <Icon
              className="Gray_9e Font22"
              icon="task-add-member-circle"
              onClick={() => this.setState({ selectUserVisible: true })}
            />
          </div>
          {selectedUser.map(data => (
            <div className="itemWrap flexRow valignWrapper">
              <div
                className="flex flexRow valignWrapper mRight10"
                onClick={e => this.handleOpenEntrust(e, entrustList[data.accountId])}
              >
                <img className="boderRadAll_50 selectedUser" src={data.avatar} />
                <span className="mLeft10 Gray ellipsis">{data.fullname}</span>
                {!!entrustList[data.accountId] && <Icon className="Font20 mLeft10" icon="lift" />}
              </div>
              <Icon
                className="Gray_9e Font20"
                icon="close"
                onClick={() => {
                  this.setState({ selectedUser: selectedUser.filter(u => u.accountId !== data.accountId) });
                }}
              />
            </div>
          ))}
        </Fragment>
      );
    }
  }
  renderSelectUser() {
    const { projectId, action, instance } = this.props;
    const { selectUserVisible, selectedUser } = this.state;
    if (selectUserVisible) {
      const TYPES = {
        transferApprove: 6,
        addApprove: 16,
        after: 7,
        before: 7,
        transfer: 10,
      };
      const { operationUserRange } = instance;
      const appointedAccountIds = operationUserRange ? operationUserRange[TYPES[action]] : '';
      return (
        <SelectUser
          projectId={projectId}
          visible={selectUserVisible}
          selectedUsers={_.isArray(selectedUser) ? selectedUser : [selectedUser]}
          selectRangeOptions={appointedAccountIds ? { appointedAccountIds } : ''}
          type="user"
          onlyOne={action === 'addApprove' ? false : true}
          onClose={() => {
            this.setState({
              selectUserVisible: false,
            });
          }}
          onSave={user => {
            const selectedUser = action === 'addApprove' ? user : user[0];
            this.setState({ selectedUser });
            this.checkEntrust(user);
          }}
        />
      );
    }
  }
  renderSignature() {
    return (
      <Fragment>
        <div className="title flexRow valignWrapper relative">
          <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
            *
          </div>
          <div className="Font13 bold flex Gray">{_l('签名')}</div>
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
    const { showPassword, removeNoneVerification } = this.state;
    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt && showPassword) {
      return (
        <Flex className="am-textarea-item">
          <div className="flex">
            <VerifyPassword
              removeNoneVerification={removeNoneVerification}
              onChange={({ password, isNoneVerification }) => {
                if (password !== undefined) this.password = password;
                if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
              }}
            />
          </div>
        </Flex>
      );
    }
  }
  renderContent() {
    const { action, onHide, instance } = this.props;
    const { content, backFlowNode, backFlowNodes, customApproveContent } = this.state;
    const currentAction = ACTION_TO_TEXT[action] || {};
    const { opinionTemplate, flowNode } = instance || {};
    const { inputType } = opinionTemplate;
    const { auth, isCallBack } = flowNode || {};
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const isSignature = passSignature || overruleSignature;
    const isAndroid = navigator.userAgent.toLowerCase().includes('android');
    let opinions = [];
    if (_.includes(['after', 'pass'], action)) {
      opinions = opinionTemplate.opinions[4];
    }
    if (_.includes(['overrule', 'return'], action)) {
      opinions = opinionTemplate.opinions[5];
    }
    return (
      <Fragment>
        <div className="flex flexColumn">
          <div className="title flexRow valignWrapper relative">
            {(passContent || overruleContent) && (
              <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                *
              </div>
            )}
            <div className="Font13 bold flex Gray">{_l('审批意见')}</div>
            {!_.isEmpty(opinions) && inputType === 1 && customApproveContent && (
              <div className="ThemeColor Font14" onClick={() => this.handleOpenTemplate({ inputType, opinions })}>
                {_l('使用模板')}
              </div>
            )}
          </div>
          {(_.includes(['pass', 'after', 'overrule', 'return'], action) && inputType === 2) ||
          (!customApproveContent && !_.isEmpty(opinions)) ? (
            <div
              className="selectTemplate flexRow valignWrapper"
              onClick={() => this.handleOpenTemplate({ inputType, opinions })}
            >
              {content ? (
                <div className="flex Font14 Gray">{content}</div>
              ) : (
                <div className="flex Font14" style={{ color: '#b3b3b3' }}>
                  {currentAction.placeholder}
                </div>
              )}
              <Icon icon="arrow-right-border" />
            </div>
          ) : (
            <TextareaItem
              className="flex"
              placeholder={currentAction.placeholder}
              autoHeight={true}
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
              ref={el => {
                this.textarea = el;
              }}
            />
          )}
        </div>
        {isSignature && this.renderSignature()}
        {this.renderVerifyPassword()}
        {this.renderInfo()}
        {this.renderSelectUser()}
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
        className="otherActionModal"
        onClose={() => {
          if (edit) return;
          onHide();
        }}
        animationType="slide-up"
      >
        <div className="otherActionWrapper flexColumn leftAlign" style={{ height: edit ? 300 : 'auto' }}>
          {backFlowNodesVisible ? this.renderBackFlowNodes() : this.renderContent()}
        </div>
      </Modal>
    );
  }
}
