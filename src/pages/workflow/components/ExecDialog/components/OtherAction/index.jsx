import React, { Component, Fragment } from 'react';
import { func, string, object, oneOf } from 'prop-types';
import { Dialog, Textarea, Dropdown, Signature, VerifyPasswordInput } from 'ming-ui';
import { ACTION_TO_TEXT } from '../../config';
import cx from 'classnames';
import _ from 'lodash';
import { verifyPassword } from 'src/util';
import { quickSelectUser } from 'ming-ui/functions';
import styled from 'styled-components';
import codeAuth from 'src/api/codeAuth';
import { Tooltip } from 'antd';
import './index.less';
import delegationAJAX from '../../../../api/delegation';
import Attachment from 'src/components/newCustomFields/widgets/Attachment';
import instanceAJAX from '../../../../api/instance';

const Member = styled.span`
  align-items: center;
  display: inline-flex;
  height: 26px;
  vertical-align: top;
  margin-top: 10px;
  margin-right: 10px;
  background: #f7f7f7;
  border-radius: 26px;
  padding-right: 10px;
  position: relative;
  img {
    width: 26px;
    height: 26px;
    border-radius: 50%;
  }
  .icon-close {
    &:hover {
      color: #f44336 !important;
    }
  }
  .icon-info {
    color: #ffa340;
    position: absolute;
    left: -5px;
    top: -5px;
    &:before {
      z-index: 1;
      position: relative;
    }
    &:after {
      position: absolute;
      top: 3px;
      left: 3px;
      right: 3px;
      bottom: 3px;
      content: '';
      background: #fff;
    }
  }
`;

const TemplateList = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 180px;
  span {
    max-width: 100%;
    height: 28px;
    display: inline-block;
    line-height: 28px;
    padding: 0 12px;
    margin-right: 8px;
    margin-top: 4px;
    margin-bottom: 4px;
    cursor: pointer;
    background: #f5f5f5;
    border-radius: 3px;
    color: #757575;
    &:hover,
    &.active {
      color: #2196f3;
      background-color: #e8f5ff;
    }
  }
`;

const AttachmentBtn = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 10px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

export default class OtherAction extends Component {
  static propTypes = {
    projectId: string,
    data: object,
    action: oneOf(['after', 'before', 'pass', 'overrule', 'transfer', 'transferApprove', 'addApprove', 'return']),
    onOk: func.isRequired,
    onCancel: func.isRequired,
  };
  static defaultProps = {
    projectId: '',
    data: {},
    action: 'before',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);
    let backNodeId = '';
    let content = '';

    if (props.action === 'return') {
      backNodeId = _.get(props.data, 'backFlowNodes[0].id') || '';
    }

    if (props.action === 'taskRevoke') {
      backNodeId = _.get(props.data, 'allowTaskRevokeBackNodeId') || '';
    }

    if (_.includes(['pass', 'overrule', 'return', 'after'], props.action)) {
      const { opinions = [] } = _.get(props.data, 'opinionTemplate') || {};
      let list = (
        (_.includes(['pass', 'after'], props.action)
          ? _.get(props, 'data.opinionTemplate.opinions[4]')
          : _.get(props, 'data.opinionTemplate.opinions[5]')) || []
      ).filter(item => item.selected);

      if (list.length) {
        content = list[0].value;
      }
    }

    this.state = {
      content,
      backNodeId,
      selectedUsers: [],
      showCode: false,
      link: '',
      code: '',
      resultCode: '',
      entrustList: {},
      showPassword: false,
      removeNoneVerification: false,
      files: '',
      countersignType: 1,
      opinionList: [],
    };
  }

  isComplete = true;
  password = '';
  isNoneVerification = false;

  componentDidMount() {
    const { projectId, action } = this.props;
    const { encrypt } = (this.props.data || {}).flowNode || {};

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      verifyPassword({
        projectId,
        checkNeedAuth: true,
        fail: result => {
          this.setState({ showPassword: true, removeNoneVerification: result === 'showPassword' });
        },
      });
    }

    this.getHistoryOpinionList();
  }

  /**
   * 获取历史意见列表
   */
  getHistoryOpinionList() {
    const { instanceId } = this.props;

    instanceAJAX.getOperationHistoryList({ instanceId }).then(res => {
      this.setState({ opinionList: res });
    });
  }

  /**
   * 根据操作类型渲染头部
   */
  renderHeader = () => {
    const { action } = this.props;

    return (
      <header className="flexRow">
        <div className="headerText Font17">{(ACTION_TO_TEXT[action] || {}).headerText}</div>
      </header>
    );
  };

  onOk = () => {
    const { projectId, action, onOk, onCancel } = this.props;
    const { content, backNodeId, selectedUsers, entrustList, showPassword, files, countersignType } = this.state;
    const { auth, encrypt } = (this.props.data || {}).flowNode || {};
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const attachments = files ? JSON.stringify(JSON.parse(files).attachments) : '';
    const submitFun = () => {
      const userId = selectedUsers
        .map(user => {
          if (entrustList[user.accountId]) {
            return entrustList[user.accountId].trustee.accountId;
          }
          return user.accountId;
        })
        .join(',');

      if (!this.isComplete) return;

      this.isComplete = false;

      if (this.signature) {
        this.signature.saveSignature(signature => {
          onOk({ action, content, userId, backNodeId, signature, files: attachments, countersignType });
          onCancel();
        });
      } else {
        onOk({ action, content, userId, backNodeId, signature: undefined, files: attachments, countersignType });
        onCancel();
      }
    };

    if (_.includes(['after', 'before', 'transfer', 'transferApprove', 'addApprove'], action) && !selectedUsers.length) {
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

    if ($('.approveDialog .fileUpdateLoading').length) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }

    // 验证密码
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
    } else if (
      // 实名 + 实人认证
      (action === 'pass' && _.includes(auth.passTypeList, 3)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 3))
    ) {
      this.getCode();
      this.setState({ showCode: true });
    } else {
      // 验证密码
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
    }
  };

  /**
   * 选人人员
   */
  renderMember() {
    const { action } = this.props;
    const { selectedUsers, entrustList } = this.state;

    return (
      <div className="mBottom20">
        <div className="bold">
          {_.includes(['after', 'before'], action)
            ? _l('加签')
            : action === 'addApprove'
            ? _l('添加成员')
            : _l('转交给')}

          {_.includes(['after', 'before', 'addApprove'], action) &&
            !!selectedUsers.length &&
            `(${selectedUsers.length})`}
        </div>

        <div>
          {selectedUsers.map((user, index) => {
            return (
              <Member key={index}>
                <img src={user.avatar} />
                <span className="ellipsis mLeft8" style={{ maxWidth: 300 }}>
                  {user.fullname}
                </span>
                {_.includes(['after', 'before', 'addApprove'], action) && (
                  <i
                    className="icon-close Font14 mLeft5 Gray_75 pointer"
                    onClick={() =>
                      this.setState({ selectedUsers: selectedUsers.filter(o => o.accountId !== user.accountId) })
                    }
                  />
                )}

                {!!entrustList[user.accountId] && (
                  <Tooltip
                    placement="bottomLeft"
                    color="#fff"
                    overlayInnerStyle={{ padding: '12px 16px', width: 240 }}
                    align={{ offset: [5, 15] }}
                    title={() => (
                      <Fragment>
                        <div className="Font15 bold Gray">
                          {_l('%0发起了委托', entrustList[user.accountId].principal.fullName)}
                        </div>
                        <div className="mTop10 flexRow alignItemsCenter">
                          <div className="Gray_75 Font13">{_l('将委托给')}</div>
                          <div className="mLeft15">
                            <Member style={{ marginTop: 0 }}>
                              <img src={entrustList[user.accountId].trustee.avatar} />
                              <span className="ellipsis mLeft8 Gray" style={{ maxWidth: 300 }}>
                                {entrustList[user.accountId].trustee.fullName}
                              </span>
                            </Member>
                          </div>
                        </div>
                        <div className="mTop10 flexRow Font13 alignItemsCenter">
                          <div className="Gray_75">{_l('委托截止')}</div>
                          <div className="mLeft15 Gray">{entrustList[user.accountId].endDate}</div>
                        </div>
                      </Fragment>
                    )}
                  >
                    <i className="icon-info Font16" />
                  </Tooltip>
                )}
              </Member>
            );
          })}

          <i
            className={cx(
              'Font26 Gray_75 ThemeHoverColor3 pointer mTop10 InlineBlock relative',
              !_.includes(['after', 'before', 'addApprove'], action) && !!selectedUsers.length
                ? 'icon-task-folder-charge'
                : 'icon-task-add-member-circle',
            )}
            onClick={this.selectUser}
          />
        </div>
      </div>
    );
  }

  /**
   * 选择人员
   */
  selectUser = event => {
    const { projectId, action, data } = this.props;
    const { operationUserRange } = data;
    const TYPES = {
      transferApprove: 6,
      addApprove: 16,
      after: 7,
      before: 7,
      transfer: 10,
    };
    const isUserRange = _.isArray((operationUserRange || {})[TYPES[action]]);
    const appointedAccountIds = ((operationUserRange || {})[TYPES[action]] || []).filter(
      id => id !== md.global.Account.accountId,
    );
    const unique = !_.includes(['after', 'before', 'addApprove'], action);

    quickSelectUser(event.target, {
      offset: {
        top: 10,
        left: 0,
      },
      selectRangeOptions: isUserRange ? { appointedAccountIds } : '',
      projectId,
      unique,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      filterAccountIds: [md.global.Account.accountId].concat(this.state.selectedUsers.map(o => o.accountId)),
      onSelect: users => {
        const selectedUsers = unique ? users : _.uniqBy(this.state.selectedUsers.concat(users), user => user.accountId);

        this.setState({ selectedUsers });
        this.checkEntrust(selectedUsers);
      },
    });
  };

  getCode(fixedSignMode) {
    const { action, workId } = this.props;
    const { auth } = (this.props.data || {}).flowNode || {};
    let signMode;

    if (action === 'pass') {
      signMode = _.includes(auth.passTypeList, 2) ? 1 : 2;
    }

    if (action === 'overrule') {
      signMode = _.includes(auth.overruleTypeList, 2) ? 1 : 2;
    }

    codeAuth.getQrCode({ signMode: fixedSignMode || signMode, workId }).then(res => {
      this.setState({ link: res.qrCode, code: res.state }, () => {
        this.getCodeResult();
      });
    });
  }

  getCodeResult() {
    const { action, onOk, selectedUser, selectedUsers } = this.props;
    const { content, backNodeId, code } = this.state;
    const id = selectedUsers.length ? selectedUsers.map(item => item.accountId).join(',') : selectedUser.accountId;

    codeAuth.getQrCodeResult({ state: code }).then(res => {
      if (res.code === '0') {
        this.getCodeResult();
      } else if (res.code === '1') {
        onOk({ action, content, userId: id, backNodeId, signature: { key: res.picUrl } });
      } else {
        this.setState({ resultCode: res.code });
      }
    });
  }

  /**
   * 检测是否委托
   */
  checkEntrust(users) {
    const { projectId } = this.props;

    delegationAJAX
      .getListByPrincipals({
        companyId: projectId,
        principals: users.map(item => item.accountId),
      })
      .then(entrustList => {
        this.setState({ entrustList });
      });
  }

  /**
   * 渲染加载方式
   */
  renderSignType = () => {
    const { countersignType } = this.state;
    const personsPassing = [
      { text: _l('或签（一名审批人通过或否决即可）'), value: 3 },
      { text: _l('会签（需所有审批人通过）'), value: 1 },
      { text: _l('会签（只需一名审批人通过，否决需全员否决）'), value: 2 },
      // { text: _l('会签（按比例投票通过）'), value: 4 },
    ];

    return (
      <div className="mBottom20">
        <div className="bold">{_l('多人审批时采用的审批方式')}</div>
        <Dropdown
          className="mTop10 w100"
          menuClass="w100"
          data={personsPassing}
          value={countersignType}
          border
          onChange={countersignType => this.setState({ countersignType })}
        />
      </div>
    );
  };

  /**
   * 渲染审批意见列表
   */
  renderTemplateList() {
    const { action, data } = this.props;
    const { content, opinionList } = this.state;
    const { opinions = [] } = data.opinionTemplate || {};
    let list = (_.includes(['pass', 'after'], action) ? opinions[4] : opinions[5]) || [];

    if (!list.length && !opinionList.length) {
      return null;
    }

    return (
      <Fragment>
        {!!list.length && (
          <Fragment>
            <div className="Gray_75 mTop15 mBottom6">{_l('选择预设')}</div>
            <TemplateList>
              {list.map((item, index) => (
                <span
                  className={cx('ellipsis', { active: content.trim() === item.value.trim() })}
                  key={index}
                  onClick={() => this.setState({ content: item.value })}
                >
                  {item.value}
                </span>
              ))}
            </TemplateList>
          </Fragment>
        )}

        {!!opinionList.length && (
          <Fragment>
            <div className="Gray_75 mTop15 mBottom6">{_l('上次输入')}</div>
            <TemplateList>
              {opinionList.map((item, index) => (
                <span
                  className={cx('ellipsis', { active: content.trim() === item.opinion.trim() })}
                  key={index}
                  onClick={() => this.setState({ content: item.opinion })}
                >
                  {item.opinion}
                </span>
              ))}
            </TemplateList>
          </Fragment>
        )}
      </Fragment>
    );
  }

  render() {
    const { action, onCancel, projectId } = this.props;
    const { callBackNodeType, opinionTemplate, app = {} } = this.props.data;
    const { auth, encrypt, allowUploadAttachment } = (this.props.data || {}).flowNode || {};
    const {
      content,
      backNodeId,
      showCode,
      link,
      resultCode,
      selectedUsers,
      showPassword,
      removeNoneVerification,
      files,
    } = this.state;
    const backFlowNodes = ((this.props.data || {}).backFlowNodes || []).map(item => {
      return {
        text: item.name,
        value: item.id,
      };
    });
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);
    const hideContent =
      (action === 'pass' && _.includes(auth.passTypeList, 101)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 101));
    const onlySelectTemplate =
      _.includes(['pass', 'overrule', 'return', 'after'], action) && _.get(opinionTemplate, 'inputType') === 2;

    if (showCode) {
      return (
        <Dialog
          visible
          width={560}
          title={_l('扫码刷脸')}
          footer={null}
          handleClose={() => this.setState({ showCode: false })}
        >
          <div className="Gray_9e">{_l('请用微信、微警或警融App扫下方二维码进行刷脸验证，验证通过后才能提交流程')}</div>
          <div className="mTop20 TxtCenter " style={{ minHeight: 200 }}>
            {link && (
              <div className="relative InlineBlock">
                <img src={link} />
                {resultCode && (
                  <div
                    className="flexColumn White"
                    onClick={() => {
                      this.setState({ resultCode: '' });
                      this.getCode(resultCode === '-3' ? 2 : '');
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(51, 51, 51, 0.80)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      className="flexRow mBottom15 pointer"
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30,
                        background: '#d85959',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <i className="icon-priority_high Font16" />
                    </div>

                    {resultCode === '-3' && (
                      <Fragment>
                        <div>{_l('认证失败')}</div>
                        <div>{_l('人脸信息不匹配')}</div>
                      </Fragment>
                    )}

                    {resultCode === '-2' && (
                      <Fragment>
                        <div>{_l('认证失败')}</div>
                        <div>{_l('点击刷新重试')}</div>
                      </Fragment>
                    )}

                    {resultCode === '-1' && (
                      <Fragment>
                        <div>{_l('二维码已过期')}</div>
                        <div>{_l('点击刷新重试')}</div>
                      </Fragment>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Dialog>
      );
    }

    return (
      <Dialog
        className={cx('approveDialog', { approveDialogBtn: action === 'overrule' })}
        visible
        overlayClosable={false}
        width={640}
        title={this.renderHeader()}
        handleClose={onCancel}
        onOk={this.onOk}
        onCancel={onCancel}
      >
        {_.includes(['pass', 'overrule', 'return'], action) && encrypt && showPassword && (
          <div className="mBottom15">
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
        )}

        {_.includes(['after', 'before', 'transfer', 'transferApprove', 'addApprove'], action) && this.renderMember()}

        {_.includes(['after', 'before'], action) && selectedUsers.length > 1 && this.renderSignType()}

        {!hideContent && (
          <Fragment>
            <div className="relative bold">
              {(passContent || overruleContent) && (
                <div className="Absolute" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                  *
                </div>
              )}
              {action === 'return' ? _l('退回理由') : _l('审批意见')}
            </div>
            <div className="mTop10 relative">
              <div className="flexRow">
                <Textarea
                  className="Font13 TxtTop flex"
                  disabled={onlySelectTemplate}
                  minHeight={0}
                  style={{ paddingTop: 7, paddingBottom: 7 }}
                  maxHeight={240}
                  value={content}
                  onChange={content => this.setState({ content })}
                  placeholder={
                    onlySelectTemplate ? _l('选择预设的审批意见') : (ACTION_TO_TEXT[action] || {}).placeholder
                  }
                />
                {_.includes(['pass', 'overrule', 'return', 'after', 'before', 'taskRevoke', 'revoke'], action) &&
                  allowUploadAttachment && (
                    <AttachmentBtn
                      className="tip-top"
                      data-tip={_l('添加附件')}
                      onClick={() => {
                        $('.approveDialog .customFieldsContainer .triggerTraget').click();
                      }}
                    >
                      <i className="Font16 Gray_75 icon-attachment" />
                    </AttachmentBtn>
                  )}
              </div>

              {_.includes(['pass', 'overrule', 'return', 'after'], action) && this.renderTemplateList()}
            </div>

            {_.includes(['pass', 'overrule', 'return', 'after', 'before', 'taskRevoke', 'revoke'], action) &&
              allowUploadAttachment && (
                <div className="mTop10">
                  <div className="customFieldsContainer InlineBlock mLeft0 pointer">
                    <Attachment
                      projectId={projectId}
                      appId={app.id}
                      value={files}
                      hint={_l('附件')}
                      canAddKnowledge={false}
                      advancedSetting={{}}
                      onChange={files => this.setState({ files })}
                    />
                  </div>
                </div>
              )}
          </Fragment>
        )}

        {action === 'return' && !!backFlowNodes.length && (
          <Fragment>
            {_.includes([0, 3], callBackNodeType) ? (
              <Fragment>
                <div className="mTop20 bold">{_l('退回到')}</div>
                <Dropdown
                  className="mTop10 approveDialogCallBack"
                  data={backFlowNodes}
                  value={backNodeId}
                  border
                  onChange={backNodeId => this.setState({ backNodeId })}
                />
              </Fragment>
            ) : (
              <div className="mTop20">
                {callBackNodeType === 1
                  ? _l('退回到：%0', backFlowNodes[0].text)
                  : _l('退回上一节点：%0', backFlowNodes[0].text)}
              </div>
            )}
          </Fragment>
        )}

        {(passSignature || overruleSignature) && (
          <Fragment>
            <div className="mTop20 mBottom10 relative bold">
              <div className="Absolute" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
                *
              </div>
              {_l('签名')}
            </div>
            <Signature
              ref={signature => {
                this.signature = signature;
              }}
            />
          </Fragment>
        )}
      </Dialog>
    );
  }
}
