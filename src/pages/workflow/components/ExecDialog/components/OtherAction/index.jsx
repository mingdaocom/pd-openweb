import React, { Component, Fragment } from 'react';
import { func, oneOf } from 'prop-types';
import { Dialog, Textarea, Dropdown, Signature, Menu, MenuItem, Icon } from 'ming-ui';
import { ACTION_TO_TEXT } from '../../config';
import cx from 'classnames';
import _ from 'lodash';
import { verifyPassword } from 'src/util';
import VerifyPassword from '../VerifyPassword';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import styled from 'styled-components';
import codeAuth from 'src/api/codeAuth';
import { Select, Tooltip } from 'antd';
import './index.less';
import delegationAJAX from '../../../../api/delegation';

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

const MenuBox = styled(Menu)`
  right: 0 !important;
  width: auto !important;
  margin-top: -1px;
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: auto;
  .ming.Item {
    min-height: 36px !important;
    height: auto !important;
  }
  .Item-content {
    overflow: inherit !important;
    word-break: break-all !important;
    white-space: inherit !important;
    line-height: 20px !important;
    min-height: 36px;
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    white-space: break-spaces !important;
  }
`;

const SelectBox = styled(Select)`
  width: 100%;
  &.ant-select-focused {
    .ant-select-selector {
      border-color: #1e88e5 !important;
      box-shadow: none !important;
    }
  }
  .ant-select-selector {
    height: 36px !important;
    border-color: #ccc !important;
    border-radius: 4px !important;
    padding: 3px 10px !important;
    transition: none !important;
  }
  input {
    height: 34px !important;
  }
`;

export default class Approve extends Component {
  static propTypes = {
    action: oneOf(['after', 'before', 'pass', 'overrule', 'transfer', 'transferApprove', 'addApprove', 'return']),
    onOk: func.isRequired,
    onCancel: func.isRequired,
  };
  static defaultProps = {
    action: 'before',
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    const { isCallBack } = (props.data || {}).flowNode || {};
    let backNodeId = '';
    let content = '';

    if (props.action === 'return' && isCallBack) {
      backNodeId = _.get(props.data, 'backFlowNodes[0].id') || '';
    }

    if (_.includes(['pass', 'overrule', 'return', 'after'], props.action)) {
      let list = (
        (_.includes(['pass', 'after'], props.action)
          ? props.data.opinionTemplate.opinions[4]
          : props.data.opinionTemplate.opinions[5]) || []
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
      showTemplateList: false,
      entrustList: {},
      showPassword: false,
    };
  }

  isComplete = true;
  password = '';
  isNoneVerification = false;

  componentDidMount() {
    const { action } = this.props;
    const { encrypt } = (this.props.data || {}).flowNode || {};

    if (_.includes(['pass', 'overrule', 'return'], action) && encrypt) {
      verifyPassword({
        checkNeedAuth: true,
        fail: () => {
          this.setState({ showPassword: true });
        },
      });
    }
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

  onOk = (backNodeId = '') => {
    const { action, workId, onOk, onCancel } = this.props;
    const { content, selectedUsers, entrustList, showPassword } = this.state;
    const { auth, encrypt } = (this.props.data || {}).flowNode || {};
    const passContent = action === 'pass' && _.includes(auth.passTypeList, 100);
    const passSignature = _.includes(['pass', 'after'], action) && _.includes(auth.passTypeList, 1);
    const overruleContent = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 100);
    const overruleSignature = _.includes(['overrule', 'return'], action) && _.includes(auth.overruleTypeList, 1);

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
          onOk({ action, content, userId, backNodeId, signature });
          onCancel();
        });
      } else {
        onOk({ action, content, userId, backNodeId, signature: undefined });
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

    // 实名认证
    if (
      (action === 'pass' && _.includes(auth.passTypeList, 2)) ||
      (action === 'overrule' && _.includes(auth.overruleTypeList, 2))
    ) {
      codeAuth.getDefaultPicUrl({ workId }).then(res => {
        if (res.code === '-1') {
          this.getCode(2);
          this.setState({ showCode: true });
        } else {
          onOk({ action, content, userId: id, backNodeId, signature: { key: res.picUrl } });
        }
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
        <div>
          {_.includes(['after', 'before'], action)
            ? _l('加签给')
            : action === 'addApprove'
            ? _l('添加成员')
            : _l('转交给')}
          {action === 'addApprove' && !!selectedUsers.length && `(${selectedUsers.length})`}
        </div>

        <div>
          {selectedUsers.map((user, index) => {
            return (
              <Member key={index}>
                <img src={user.avatar} />
                <span className="ellipsis mLeft8" style={{ maxWidth: 300 }}>
                  {user.fullname}
                </span>
                {action === 'addApprove' && (
                  <i
                    className="icon-close Font14 mLeft5 Gray_9e pointer"
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
                          <div className="Gray_9e Font13">{_l('将委托给')}</div>
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
                          <div className="Gray_9e">{_l('委托截止')}</div>
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

          {(action === 'addApprove' ||
            !selectedUsers.length ||
            (action !== 'addApprove' && !!selectedUsers.length)) && (
            <i
              className={cx(
                'Font26 Gray_9e ThemeHoverColor3 pointer mTop10 InlineBlock relative',
                action !== 'addApprove' && !!selectedUsers.length
                  ? 'icon-task-folder-charge'
                  : 'icon-task-add-member-circle',
              )}
              onClick={this.selectUser}
            />
          )}
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
    const unique = action !== 'addApprove';

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
      filterAccountIds: [md.global.Account.accountId],
      isDynamic: !unique,
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
   * 渲染审批意见列表
   */
  renderTemplateList() {
    const { action, data } = this.props;
    const { showTemplateList } = this.state;
    const { opinionTemplate } = data;
    let list =
      (_.includes(['pass', 'after'], action) ? opinionTemplate.opinions[4] : opinionTemplate.opinions[5]) || [];

    if (!showTemplateList || !list.length) {
      return null;
    }

    return (
      <MenuBox
        className="mTop1"
        onClickAwayExceptions={['.approveDialog .Textarea']}
        onClickAway={() => this.setState({ showTemplateList: false })}
      >
        {list.map((item, index) => (
          <MenuItem key={index} onClick={() => this.setState({ content: item.value, showTemplateList: false })}>
            {item.value}
          </MenuItem>
        ))}
      </MenuBox>
    );
  }

  /**
   * 渲染审批意见只能选择模板
   */
  renderSelectTemplate() {
    const { action, data } = this.props;
    const { content } = this.state;
    const { opinionTemplate } = data;
    const options = (
      (_.includes(['pass', 'after'], action) ? opinionTemplate.opinions[4] : opinionTemplate.opinions[5]) || []
    ).map(item => {
      return {
        value: item.value,
        label: item.value,
      };
    });

    return (
      <SelectBox
        showSearch
        allowClear
        defaultValue={content || undefined}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        notFoundContent={<span className="Gray_9e">{_l('无匹配结果')}</span>}
        dropdownClassName="workflowTemplateListSelect"
        placeholder={_l('请选择')}
        onChange={value => this.setState({ content: value || '' })}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
        options={options}
      />
    );
  }

  render() {
    const { action, onCancel } = this.props;
    const { callBackNodeType, opinionTemplate } = this.props.data;
    const { isCallBack, auth, encrypt } = (this.props.data || {}).flowNode || {};
    const { content, backNodeId, showCode, link, resultCode, showPassword } = this.state;
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
        width={560}
        title={this.renderHeader()}
        handleClose={onCancel}
        onOk={() => this.onOk(backNodeId)}
        onCancel={onCancel}
      >
        {_.includes(['after', 'before', 'transfer', 'transferApprove', 'addApprove'], action) && this.renderMember()}

        <div className="relative">
          {(passContent || overruleContent) && (
            <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
              *
            </div>
          )}
          {_l('审批意见')}
        </div>

        <div className="mTop10 relative">
          {opinionTemplate.inputType === 2 && _.includes(['pass', 'overrule', 'return', 'after'], action) ? (
            this.renderSelectTemplate()
          ) : (
            <Textarea
              className="Font13 TxtTop"
              minHeight={0}
              style={{ paddingTop: 7, paddingBottom: 7 }}
              maxHeight={240}
              value={content}
              onChange={content => this.setState({ content })}
              onFocus={() => this.setState({ showTemplateList: true })}
              onBlue={() => this.setState({ showTemplateList: false })}
              placeholder={(ACTION_TO_TEXT[action] || {}).placeholder}
            />
          )}

          {opinionTemplate.inputType === 1 &&
            _.includes(['pass', 'overrule', 'return', 'after'], action) &&
            this.renderTemplateList()}
        </div>

        {isCallBack && action === 'return' && !!backFlowNodes.length && (
          <Fragment>
            {_.includes([0, 3], callBackNodeType) ? (
              <Fragment>
                <div className="mTop20">{_l('退回到')}</div>
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
            <div className="mTop20 mBottom10 relative">
              <div className="Absolute bold" style={{ margin: '1px 0px 0px -8px', color: '#f44336' }}>
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

        {_.includes(['pass', 'overrule', 'return'], action) && encrypt && showPassword && (
          <div className="mTop20">
            <VerifyPassword
              onChange={({ password, isNoneVerification }) => {
                if (password !== undefined) this.password = password;
                if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
              }}
            />
          </div>
        )}
      </Dialog>
    );
  }
}
