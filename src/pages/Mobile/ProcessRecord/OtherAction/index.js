import React, { Component, Fragment } from 'react';
import { ActionSheet, Popup, TextArea } from 'antd-mobile';
import _ from 'lodash';
import { Icon, Signature, VerifyPasswordInput } from 'ming-ui';
import delegationApi from 'src/pages/workflow/api/delegation';
import instanceAJAX from 'src/pages/workflow/api/instance';
import AttachmentFiles, { UploadFileWrapper } from 'mobile/components/AttachmentFiles';
import SelectUser from 'mobile/components/SelectUser';
import verifyPassword from 'src/components/verifyPassword';
import { ACTION_TO_TEXT } from 'src/pages/workflow/components/ExecDialog/config';
import functionTemplateModal from '../FunctionTemplateModal';
import './index.less';

export default class extends Component {
  constructor(props) {
    super(props);
    const { instance } = this.props;
    const backFlowNodes = (instance || {}).backFlowNodes || [];
    const { opinions = [] } = (instance || {}).opinionTemplate || {};
    let backNodeId = '';
    let content = '';

    if (props.action === 'return' && backFlowNodes.length) {
      backNodeId = backFlowNodes[0].id;
    }
    if (props.action === 'taskRevoke') {
      backNodeId = _.get(instance, 'allowTaskRevokeBackNodeId') || '';
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
      backNodeId,
      content,
      edit: false,
      showPassword: false,
      selectedUser: [],
      entrustList: {},
      customApproveContent: content ? true : false,
      files: [],
      countersignType: 1,
      opinionList: [],
      nextUserRange: {},
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

    this.getOperationDetail();
  }

  componentWillUnmount() {
    this.actionHandler && this.actionHandler.close();
  }

  /**
   * 获取历史意见列表
   */
  getOperationDetail() {
    const { instanceId, workId } = this.props;
    instanceAJAX.getOperationDetail({ id: instanceId, workId }).then(res => {
      const userIds = _.flatten(_.map(res.nextUserRange));
      this.setState({
        opinionList: res.workItems,
        nextUserRange: res.nextUserRange,
        selectedUser: userIds.length === 1 ? [{ accountId: userIds[0] }] : [],
      });
    });
  }

  handleAction = () => {
    const { action, instance, projectId } = this.props;
    const {
      content,
      showPassword,
      selectedUser,
      entrustList,
      files,
      backNodeId = '',
      countersignType,
      nextUserRange,
    } = this.state;
    const { auth, encrypt } = (instance || {}).flowNode || {};

    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const attachments = files.length ? JSON.stringify(files) : '';
    const selectedUsers = _.isArray(selectedUser) ? selectedUser : [selectedUser];
    const forwardAccountId = selectedUsers
      .map(user => {
        if (entrustList[user.accountId]) {
          return entrustList[user.accountId].trustee.accountId;
        }
        return user.accountId;
      })
      .join(',');

    const nextApprovalUser = {};

    if (_.keys(nextUserRange).length) {
      nextApprovalUser[_.keys(nextUserRange)[0]] = selectedUsers.map(o => o.accountId);
    }

    if (_.includes(['transfer', 'transferApprove', 'after', 'before', 'addApprove'], action) && !forwardAccountId) {
      alert(_l('必须选择一个人员'), 2);
      return;
    }

    if (action === 'pass' && !!_.flatten(_.map(nextUserRange)).length && !selectedUsers.length) {
      alert(_l('必须指定下一节点审批人'), 2);
      return;
    }

    if (
      ((passContent || overruleContent) && !content.trim()) ||
      ((passSignature || overruleSignature) && this.signature.checkContentIsEmpty())
    ) {
      alert(_l('请填写完整内容'), 2);
      return;
    }

    const parameter = {
      action,
      content,
      forwardAccountId,
      backNodeId,
      files: attachments,
      countersignType,
      nextUserRange: nextApprovalUser,
    };

    const submitFun = () => {
      if (this.signature) {
        this.signature.saveSignature(signature => {
          this.props.onAction({
            ...parameter,
            signature,
          });
        });
      } else {
        this.props.onAction({
          ...parameter,
          signature: undefined,
        });
      }
      if (this.isNoneVerification) {
        this.setState({ showPassword: false });
      }
    };

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      if (showPassword && (!this.password || !this.password.trim())) {
        alert(_l('请输入密码'), 3);
        return;
      }
      verifyPassword({
        projectId,
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
    functionTemplateModal({
      ...data,
      onSelect: content => this.setState({ content, customApproveContent: content ? true : false }),
      onCustom: () => {
        this.setState({ customApproveContent: true }, () => {
          this.textarea && this.textarea.focus();
        });
      },
    });
  };
  handleOpenEntrust = (e, data) => {
    e.stopPropagation();
    if (_.isEmpty(data)) return;
    this.actionHandler = ActionSheet.show({
      actions: [
        {
          key: 1,
          text: (
            <div className="flexRow alignItemsCenter">
              <div className="Gray_75 mRight10 Font13">{_l('将委托给')}</div>
              <img className="mLeft10 boderRadAll_50 selectedUser" style={{ width: 30 }} src={data.trustee.avatar} />
              <div className="mLeft10 Font15 ellipsis">{data.trustee.fullName}</div>
            </div>
          ),
        },
        {
          key: 1,
          text: (
            <div className="flexRow alignItemsCenter">
              <div className="Gray_75 mRight10 Font13">{_l('委托截止')}</div>
              <div className="mLeft10 Font15">{data.endDate}</div>
            </div>
          ),
        },
      ],
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('%0发起了委托', data.principal.fullName)}</span>
          <div className="closeIcon" onClick={() => this.actionHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: () => {
        this.actionHandler.close();
      },
    });
  };
  renderBackFlowNodes() {
    const { backNodeId, backFlowNodes } = this.state;
    return (
      <div className="flexColumn">
        <div className="backFlowNodesHeader flexRow alignItemsCenter pAll10">
          <div
            className="left"
            onClick={() => {
              this.setState({
                backFlowNodesVisible: false,
              });
            }}
          >
            <span>{_l('取消')}</span>
          </div>
          <div className="flex Font17 Gray TxtCenter">{_l('选择退回节点')}</div>
          <div
            className="right"
            onClick={() => {
              this.setState({
                backFlowNodesVisible: false,
              });
            }}
          >
            {_l('确认')}
          </div>
        </div>
        <div className="backFlowNodesList pTop10" style={{ borderTop: '1px solid #e9e9e9' }}>
          {backFlowNodes.map(item => (
            <div
              className="flexRow alignItemsCenter flex pAll10"
              key={item.id}
              onClick={() => {
                this.setState({
                  backNodeId: item.id,
                });
              }}
            >
              <span className="Gray flex">{item.name}</span>
              {backNodeId === item.id ? <Icon icon="ok" /> : null}
            </div>
          ))}
        </div>
      </div>
    );
  }
  renderInfo() {
    const { backFlowNodes, backNodeId, selectedUser } = this.state;
    const { action } = this.props;
    const currentAction = ACTION_TO_TEXT[action];

    if (_.includes(['return'], action) && backFlowNodes.length) {
      const node = backFlowNodes.filter(item => item.id === backNodeId)[0];
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
    if (_.includes(['transfer', 'transferApprove', 'after', 'before', 'addApprove'], action)) {
      return (
        <div className="itemWrap flexRow valignWrapper">
          <div className="Gray Font13 bold">{currentAction.headerText}</div>
          {selectedUser.length ? (
            <div className="flex flexRow valignWrapper flexEnd mRight10 mLeft30">
              {_l('已选 %0 人', selectedUser.length)}
            </div>
          ) : (
            <div className="flex"></div>
          )}
          <Icon
            className="Gray_9e Font28"
            icon={selectedUser.length ? 'task-folder-charge' : 'task-add-member-circle'}
            onClick={() => this.setState({ selectUserVisible: true })}
          />
        </div>
      );
    }
  }
  renderSignType() {
    const { selectedUser, countersignType } = this.state;
    const { action } = this.props;
    if (_.includes(['after', 'before'], action) && selectedUser.length > 1) {
      const personsPassing = [
        { text: _l('或签（一名审批人通过或否决即可）'), value: 3 },
        { text: _l('会签（需所有审批人通过）'), value: 1 },
        { text: _l('会签（只需一名审批人通过，否决需全员否决）'), value: 2 },
        // { text: _l('会签（按比例投票通过）'), value: 4 },
      ];
      const handleOpen = () => {
        this.actionSheetHandler = ActionSheet.show({
          actions: personsPassing.map(item => {
            return {
              key: item.value,
              text: <span className="Bold">{item.text}</span>,
            };
          }),
          onAction: action => {
            this.setState({
              countersignType: action.key,
            });
            this.actionSheetHandler.close();
          },
        });
      };
      return (
        <div className="itemWrap flexRow valignWrapper" onClick={handleOpen}>
          <div className="Gray Font13 bold flex">{_l('多人审批时采用的审批方式')}</div>
          <div className="flex ellipsis">{_.find(personsPassing, { value: countersignType }).text}</div>
        </div>
      );
    }
  }
  renderSelectUser() {
    const { projectId, action, instance } = this.props;
    const { selectUserVisible, selectedUser, nextUserRange } = this.state;
    if (selectUserVisible) {
      const TYPES = {
        transferApprove: 6,
        addApprove: 16,
        after: 7,
        before: 7,
        transfer: 10,
      };
      const { operationUserRange } = instance;
      const isUserRange = action === 'pass' || _.isArray((operationUserRange || {})[TYPES[action]]);
      const appointedAccountIds = ((operationUserRange || {})[TYPES[action]] || _.flatten(_.map(nextUserRange))).filter(
        id => action === 'pass' || id !== md.global.Account.accountId,
      );
      const unique = !_.includes(['after', 'before', 'addApprove', 'pass'], action);
      return (
        <SelectUser
          projectId={projectId}
          visible={selectUserVisible}
          selectedUsers={_.isArray(selectedUser) ? selectedUser : [selectedUser]}
          selectRangeOptions={isUserRange ? { appointedAccountIds } : ''}
          type="user"
          onlyOne={unique}
          onClose={() => {
            this.setState({
              selectUserVisible: false,
            });
          }}
          onSave={user => {
            this.setState({ selectedUser: user });
            action !== 'pass' && this.checkEntrust(user);
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
        <div className="flexRow am-textarea-item">
          <Signature
            ref={signature => {
              this.signature = signature;
            }}
          />
        </div>
      </Fragment>
    );
  }
  renderNextApprovalUser() {
    const { selectedUser, nextUserRange } = this.state;
    const userIds = _.flatten(_.map(nextUserRange));

    if (userIds.length <= 1) return null;

    return (
      <div className="itemWrap flexRow valignWrapper">
        <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
          *
        </div>
        <div className="Gray Font13 bold">{_l('选择下一节点审批人')}</div>
        {selectedUser.length ? (
          <div className="flex flexRow valignWrapper flexEnd mRight10 mLeft30">
            {_l('已选 %0 人', selectedUser.length)}
          </div>
        ) : (
          <div className="flex"></div>
        )}
        <Icon
          className="Gray_9e Font28"
          icon={selectedUser.length ? 'task-folder-charge' : 'task-add-member-circle'}
          onClick={() => this.setState({ selectUserVisible: true })}
        />
      </div>
    );
  }
  renderAttachment() {
    const { files } = this.state;
    if (files.length) {
      return (
        <div className="flexRow pLeft15 pRight15">
          <AttachmentFiles
            width="32%"
            isRemove={true}
            attachments={files}
            onChange={files => {
              this.setState({
                files,
              });
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }
  renderVerifyPassword() {
    const { action, instance } = this.props;
    const { encrypt } = (instance || {}).flowNode || {};
    const { showPassword, removeNoneVerification } = this.state;
    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt && showPassword) {
      return (
        <div className="flexRow am-textarea-item pTop20 pBottom0">
          <div className="flex verifyPasswordInputWrap">
            <VerifyPasswordInput
              showSubTitle={false}
              isRequired={true}
              allowNoVerify={!removeNoneVerification}
              onChange={({ password, isNoneVerification }) => {
                if (password !== undefined) this.password = password;
                if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
              }}
            />
          </div>
        </div>
      );
    }
  }
  renderContent() {
    const { action, instance, projectId } = this.props;
    const { content, customApproveContent, files, opinionList = [] } = this.state;
    const currentAction = ACTION_TO_TEXT[action] || {};
    const { opinionTemplate, flowNode, app = {}, btnMap = {} } = instance || {};
    const { inputType } = opinionTemplate || {};
    const opinionTemplateOpinions = _.get(opinionTemplate, 'opinions') || [];
    const { auth, allowUploadAttachment } = flowNode || {};
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const hideContent =
      (action === 'pass' && _.includes(auth.passTypeList, 101)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 101));
    const isSignature = passSignature || overruleSignature;
    const isAttachment =
      _.includes(['pass', 'overrule', 'return', 'after', 'before', 'taskRevoke', 'revoke'], action) &&
      allowUploadAttachment;
    let opinions = [];
    if (_.includes(['after', 'pass'], action)) {
      opinions = opinionTemplateOpinions[4];
    }
    if (_.includes(['overrule', 'return'], action)) {
      opinions = opinionTemplateOpinions[5];
    }
    const selectTemplateVisible =
      !customApproveContent &&
      _.includes(['pass', 'after', 'overrule', 'return'], action) &&
      (!_.isEmpty(opinions) || !!opinionList.length);

    return (
      <Fragment>
        <div className="flex otherActionContent">
          <div className="title Gray bold Font15 pTop13">
            {currentAction.headerText}
            {action === 'pass' && (btnMap[4] || _l('同意'))}
            {action === 'overrule' && (btnMap[5] || _l('拒绝'))}
            {action === 'return' && (btnMap[17] || _l('退回'))}
          </div>
          {this.renderVerifyPassword()}
          {!hideContent && (
            <Fragment>
              <div className="flex flexColumn">
                <div className="title flexRow valignWrapper relative pTop10">
                  {(passContent || overruleContent) && (
                    <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                      *
                    </div>
                  )}
                  <div className="Font13 bold flex Gray">{_l('意见')}</div>
                  {customApproveContent &&
                    _.includes(['pass', 'after', 'overrule', 'return'], action) &&
                    (!_.isEmpty(opinions) || !!opinionList.length) && (
                      <div
                        className="ThemeColor Font14"
                        onClick={() => this.handleOpenTemplate({ inputType, opinions, opinionList })}
                      >
                        {_l('使用模板')}
                      </div>
                    )}
                </div>
                <div className="flexRow" style={{ margin: '10px 15px' }}>
                  {selectTemplateVisible ? (
                    <div
                      className="selectTemplate flexRow valignWrapper flex"
                      onClick={() => this.handleOpenTemplate({ inputType, opinions, opinionList })}
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
                    <TextArea
                      className="flex"
                      placeholder={currentAction.placeholder}
                      rows={1}
                      autoSize={{ minRows: 1, maxRows: 12 }}
                      value={content}
                      onChange={content => {
                        this.setState({
                          content,
                        });
                      }}
                      onFocus={() => {
                        if (window.isAndroid && isSignature) {
                          this.setState({ edit: true });
                        }
                      }}
                      onBlur={() => {
                        if (window.isAndroid && isSignature) {
                          this.setState({ edit: false });
                        }
                      }}
                      ref={el => {
                        this.textarea = el;
                      }}
                    />
                  )}
                  {isAttachment && (
                    <UploadFileWrapper
                      qiniuUploadClassName="w100"
                      className="selectTemplate flexRow valignWrapper justifyContentCenter"
                      style={{
                        top: 0,
                        minHeight: selectTemplateVisible ? 35 : 40,
                        width: selectTemplateVisible ? 35 : 40,
                        marginLeft: 6,
                      }}
                      projectId={projectId}
                      appId={app.id}
                      files={files}
                      onChange={files => {
                        this.setState({
                          files,
                        });
                      }}
                    >
                      <Icon className="Font16 Gray_75" icon="attachment" />
                    </UploadFileWrapper>
                  )}
                </div>
              </div>
              {isAttachment && this.renderAttachment()}
            </Fragment>
          )}
          {this.renderInfo()}
          {this.renderSignType()}
          {this.renderSelectUser()}
          {isSignature && this.renderSignature()}
          {action === 'pass' && this.renderNextApprovalUser()}
        </div>
        <div className="flexRow actionBtnWrapper">
          <div className="flex actionBtn bold Gray_75" onClick={this.props.onHide}>
            {_l('取消')}
          </div>
          <div
            className="flex actionBtn bold ok"
            onClick={() => {
              this.handleAction();
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
      <Popup
        visible={visible}
        className="otherActionModal mobileModal"
        onClose={() => {
          if (edit) return;
          onHide();
        }}
        closeOnMaskClick={true}
      >
        <div className="otherActionWrapper flexColumn leftAlign" style={{ height: edit ? 300 : 'auto' }}>
          {backFlowNodesVisible ? this.renderBackFlowNodes() : this.renderContent()}
        </div>
      </Popup>
    );
  }
}
