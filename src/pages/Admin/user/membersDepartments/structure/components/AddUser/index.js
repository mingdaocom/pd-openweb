import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, Support } from 'ming-ui';
import { Drawer, Input, Radio, Tooltip } from 'ming-ui/antd-components';
import { getDefaultCountry } from 'ming-ui/components/PhoneNumberInput/util';
import { dialogSelectUser } from 'ming-ui/functions';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import importUserController from 'src/api/importUser';
import userAjax from 'src/api/user';
import { encrypt } from 'src/utils/services/security/encryption';
import { checkForm, getMobilePhoneNumber, RESULTS } from '../../constant';
import { useAddUserFeedback } from '../AddUserFeedback';
import BaseFormInfo from '../BaseFormInfo';
import ControlledPhoneInput from '../ControlledPhoneInput';
import { createControlledPhoneAdapter, getControlledPhoneValue } from '../ControlledPhoneInput/utils';
import DrawerFooterOption from '../DrawerFooterOption';
import EditUser from '../EditUser';
import TextInput from '../TextInput';
import './index.less';

class AddUser extends Component {
  constructor(props) {
    super(props);
    const { dialCode } = getControlledPhoneValue('', getDefaultCountry());

    this.state = {
      departmentIds: [],
      errors: {},
      baseInfo: {},
      inviteType: 'email',
      addUserVisible: props.addUserVisible,
      mobileDialCode: dialCode,
      autonomouslyDialCode: dialCode,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.addUserVisible !== this.props.addUserVisible) {
        this.setState({
          addUserVisible: this.props.addUserVisible,
        });
      }
    }
  }
  // 通讯录添加人员
  dialogSelectUserHandler = () => {
    const { projectId } = this.props;
    const _this = this;
    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        filterProjectId: projectId,
        unique: true,
        callback(userObj) {
          _this.setState({ user: userObj[0] });
          _this.checkedUser({ type: 'selectUser', accountId: userObj[0].accountId });
        },
      },
    });
  };
  clearSelectUser = () => {
    this.clearError('mobile');
    this.clearError('email');
    this.setState({
      user: {},
      errors: {},
      inviteType: 'mobile',
      mobile: '',
      mobileDialCode: getControlledPhoneValue('', getDefaultCountry()).dialCode,
      email: '',
    });
  };

  changeFormInfo = (e, field) => {
    this.setState({
      [field]: _.includes(['mobile', 'email', 'autonomously'], field) ? e : e.target.value,
      isClickSubmit: false,
    });
  };
  getMobileAdapter = () => {
    return createControlledPhoneAdapter({ dialCode: this.state.mobileDialCode, value: this.state.mobile });
  };
  getAutonomouslyAdapter = () => {
    const { autonomously, autonomouslyDialCode } = this.state;
    const showDialCode = !!autonomously && autonomously.length > 3 && !isNaN(Number(autonomously));

    return createControlledPhoneAdapter({ dialCode: autonomouslyDialCode, value: autonomously, showDialCode });
  };
  clearError = field => {
    const { errors = {} } = this.state;
    delete errors[field];
    this.setState({ errors });
  };
  // check当前组织是否存在该人员
  checkedUser = ({ val, type, accountId } = {}) => {
    const { projectId, typeCursor, departmentId } = this.props;
    const { email, inviteType, autonomously } = this.state;
    const mobileAdapter = this.getMobileAdapter();
    const autonomouslyAdapter = this.getAutonomouslyAdapter();

    if (
      (type === 'mobile' && !!checkForm['mobile'](val, mobileAdapter)) ||
      (type === 'email' && !!checkForm['email'](val)) ||
      (type === 'autonomously' && !!checkForm['autonomously'](val, autonomouslyAdapter))
    ) {
      this.setState({ showMask: false });
      return;
    }

    const userContact =
      type === 'selectUser'
        ? ''
        : inviteType === 'mobile'
          ? getMobilePhoneNumber(mobileAdapter, this.state.mobile)
          : inviteType === 'email'
            ? email
            : type === 'autonomously'
              ? autonomouslyAdapter.getNumber()
              : autonomously;

    if (!userContact && !accountId) {
      this.setState({ showMask: false });
      return;
    }

    userAjax
      .getUserOrgState({
        projectId,
        userContact,
        departmentId,
        accountId,
      })
      .then(res => {
        // {0: 用户不存在，1:用户存在但不在组织内，2:用户存在且在组织内，3:未激活，4:未审核，5:已离职，6:在当前部门下}
        if (res.userState === 0 || res.userState === 1) {
          this.setState({ showMask: false });
          return;
        }

        let user = {
          accountId: res.accountId,
          fullname: res.name,
          mobile: res.phone,
          email: res.email,
          avatar: res.avatar,
        };
        const data = _.get(res, 'userCardModel.user') || {};
        user = {
          ...user,
          ...data,
          departmentIds: (data.departmentInfos || []).map(it => it.departmentId),
        };
        this.props.openAddUserFeedback({
          projectId,
          typeCursor: res.userState === 3 ? 2 : res.userState === 4 ? 3 : typeCursor,
          departmentId,
          actionResult: res.userState,
          closeDrawer: this.props.onClose,
          currentUser: user,
          refreshData: this.props.refreshData,
          reviewUserInfo: this.reviewUserInfo,
          hideMask: () => {
            this.setState({ showMask: false });
            this.clearSelectUser();
          },
          fetchReInvite: this.props.fetchReInvite,
          fetchCancelImportUser: this.props.fetchCancelImportUser,
        });
        this.setState({ currentUser: user });
      });
  };
  handleSubmit = isClear => {
    const _this = this;
    const { isUploading, inviteType, userName, email, user = {}, autonomouslyPasswrod } = this.state;
    const mobileAdapter = this.getMobileAdapter();
    const autonomouslyAdapter = this.getAutonomouslyAdapter();
    const mobile = getMobilePhoneNumber(mobileAdapter, this.state.mobile);
    const {
      jobIds = [],
      departmentInfos = [],
      jobNumber = '',
      workSiteId = '',
      contactPhone = '',
      orgRoles = [],
      useMultiJobs,
      departmentJobInfos = [],
    } = this.baseFormInfo.state;
    const { projectId } = this.props;
    const errors = {
      ...this.state.errors,
      userName: !!checkForm['userName'](userName),
      mobile: inviteType === 'mobile' && !!checkForm['mobile'](mobile, mobileAdapter),
      email: inviteType === 'email' && !!checkForm['email'](email),
      autonomously: !!checkForm['autonomously'](autonomouslyAdapter.getNumber(), autonomouslyAdapter),
      autonomouslyPasswrod: inviteType === 'autonomously' && !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod),
    };

    this.setState({ isClickSubmit: true, errors });
    if (isUploading) return false;
    let check = !_.isEmpty(user)
      ? false
      : inviteType === 'mobile'
        ? !!checkForm['userName'](userName) || !!checkForm['mobile'](mobile, mobileAdapter)
        : !!checkForm['userName'](userName) || !!checkForm['email'](email);

    if ((window.platformENV.isOverseas || window.platformENV.isLocal) && _.isEmpty(user)) {
      check = _.includes(['mobile', 'email'], inviteType)
        ? check
        : inviteType === 'autonomously' &&
          (!!checkForm['autonomously'](autonomouslyAdapter.getNumber(), autonomouslyAdapter) ||
            !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod));
    }

    if (useMultiJobs && !!departmentJobInfos.filter(item => !item.departmentId).length) {
      alert(_l('多任职信息中部门不能为空'), 3);
      check = true;
    }

    if (check) {
      return false;
    } else {
      const params = {
        projectId,
        jobIds: jobIds.join(';'),
        departmentIds: departmentInfos.map(it => it.departmentId).join(';'),
        jobNumber,
        workSiteId,
        contactPhone,
        fullname: !_.isEmpty(user) ? user.fullname : userName,
        account: inviteType === 'mobile' ? mobile : email,
        accountId: window.platformENV.isHap || !_.isEmpty(user) ? user.accountId : '',
        orgRoleIds: orgRoles.map(l => l.id).join(';'),
        useMultiJobs,
        departmentJobIdMaps: departmentJobInfos.map(item => ({
          departmentId: item.departmentId,
          jobIds: item.jobIds,
        })),
      };

      if (window.platformENV.isOverseas || window.platformENV.isLocal) {
        params.verifyType = _.includes(['mobile', 'email'], inviteType) ? 0 : 1;
        if (inviteType === 'autonomously') {
          params.account = _.isEmpty(user) ? autonomouslyAdapter.getNumber() : '';
          params.password = encrypt(autonomouslyPasswrod);
        }
      }

      this.setState({
        isUploading: true,
        departmentInfos: [],
      });
      importUserController
        .inviteUser(params)
        .then(data => {
          const { failUsers, successUsers, existsUsers, forbidUsers, successCount } = data;
          const failReason = failUsers && failUsers.length ? _.get(failUsers, '[0].failReason') : '';

          if (!data || data.actionResult == RESULTS.FAILED) {
            alert(_l(failReason || '邀请失败'), 2);
          } else if (data.actionResult == RESULTS.OVERINVITELIMITCOUNT) {
            alert(_l('超过邀请数量限制'), 3);
          } else {
            if (failUsers && failUsers.length) {
              alert(failReason || _l('邀请失败'), 2);
            } else if (successUsers || successCount) {
              alert(_l('邀请成功'), 1);
              if (!isClear) {
                _this.props.onClose();
              }
            } else if (existsUsers) {
              alert(_l('手机号/邮箱已存在'), 2);
            } else if (forbidUsers) {
              alert(_l('账号来源类型受限'), 2);
            }
          }

          this.clearError('mobile');
          this.clearError('email');
          this.setState({
            inviteType: 'mobile',
            user: {},
            userName: '',
            mobile: '',
            mobileDialCode: getControlledPhoneValue('', getDefaultCountry()).dialCode,
            email: '',
            departmentInfos: [],
            jobIds: [],
            workSiteId: '',
            jobNumber: '',
            contactPhone: '',
            errors: {},
            isUploading: false,
            autonomously: '',
            autonomouslyDialCode: getControlledPhoneValue('', getDefaultCountry()).dialCode,
          });
        })
        .catch(() => {
          this.setState({ isUploading: false });
        });
    }
  };

  renderBase = () => {
    const {
      userName,
      mobile,
      email,
      inviteType,
      errors = {},
      user = {},
      autonomously,
      mobileDialCode,
      autonomouslyDialCode,
      autonomouslyPasswrod,
    } = this.state;
    const { passwordRegexTip } = _.get(md, 'global.SysSettings') || {};
    const mobileAdapter = this.getMobileAdapter();
    const autonomouslyAdapter = this.getAutonomouslyAdapter();

    return (
      <Fragment>
        {_.isEmpty(user) ? (
          <TextInput
            ref={ele => (this.userNameInput = ele)}
            label={_l('姓名')}
            field={'userName'}
            value={userName}
            isRequired={true}
            placeholder=""
            error={errors['userName'] && !!checkForm['userName'](userName)}
            onChange={e => this.changeFormInfo(e, 'userName')}
            onFocus={() => {
              this.clearError('userName');
            }}
          >
            <Tooltip placement="bottomLeft" align={{ offset: [-10, 0] }} title={_l('从通讯录添加')}>
              <span
                className="icon-topbar-addressList Font16 selectUser hoverColorPrimary"
                onClick={this.dialogSelectUserHandler}
              />
            </Tooltip>
          </TextInput>
        ) : (
          <div className="formGroup">
            <div className="formLabel">{_l('姓名')}</div>
            <div>
              <span className="userLabel">
                <img src={user.avatar} />
                <span className="userLabelName">{user.fullname}</span>
                <span className="mLeft5 icon-cancel Font14 textPlaceholder Hand" onClick={this.clearSelectUser} />
              </span>
              <Tooltip title={_l('从通讯录添加')}>
                <span
                  className="icon-topbar-addressList Font16 selectUser hoverColorPrimary"
                  onClick={this.dialogSelectUserHandler}
                />
              </Tooltip>
            </div>
          </div>
        )}
        {_.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">{_l('邀请方式')}</div>
            <div>
              <Radio.Group
                value={inviteType}
                options={(
                  [
                    {
                      text: window.platformENV.isOverseas || window.platformENV.isLocal ? _l('邮箱邀请') : _l('邮箱'),
                      value: 'email',
                    },
                    {
                      text: window.platformENV.isOverseas || window.platformENV.isLocal ? _l('手机号邀请') : _l('手机'),
                      value: 'mobile',
                    },
                    { text: _l('自主创建'), value: 'autonomously' },
                  ].filter(item =>
                    window.platformENV.isPlatform
                      ? item.value !== 'autonomously'
                      : !md.global.SysSettings.enableSmsCustomContent
                        ? item.value !== 'mobile'
                        : true,
                  ) || []
                ).map(({ text, ...option }) => ({ ...option, label: text }))}
                onChange={event => {
                  const val = event.target.value;

                  this.clearError('mobile');
                  this.clearError('email');
                  this.clearError('autonomously');
                  this.setState({
                    inviteType: val,
                    mobile: '',
                    mobileDialCode: getControlledPhoneValue('', getDefaultCountry()).dialCode,
                    email: '',
                    autonomously: '',
                    autonomouslyDialCode: getControlledPhoneValue('', getDefaultCountry()).dialCode,
                    autonomouslyPasswrod: '',
                  });
                }}
              ></Radio.Group>
            </div>
            {inviteType === 'mobile' && (
              <div className="prompt flexRow mBottom20 textPrimary mTop10">
                <div className="mRight3">
                  <Icon icon="info" className="Font16" />
                </div>
                <div className="flex">
                  <span>
                    {_l('受运营商政策影响，含链接的邀请短信可能被拦截。如未收到短信，请通过邮箱或邀请链接发送邀请')}
                  </span>
                  <Support
                    type={3}
                    className="mLeft5 mBottom3"
                    href="https://blog.mingdao.com/37103.html"
                    text={_l('详细')}
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {inviteType === 'mobile' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">
              {_l('手机')}
              <span className="TxtMiddle Red">*</span>
            </div>
            <ControlledPhoneInput
              value={mobile || ''}
              dialCode={mobileDialCode}
              className="formControl"
              status={errors['mobile'] && checkForm['mobile'](mobile, mobileAdapter) ? 'error' : undefined}
              placeholder={_l('成员会收到邀请链接，验证后可加入组织')}
              onFocus={() => {
                this.clearError('mobile');
              }}
              onChange={({ value, dialCode }) => {
                this.setState({ mobile: value, mobileDialCode: dialCode, isClickSubmit: false });
              }}
              onBlur={() => {
                this.setState({ showMask: true });
                this.checkedUser({ val: this.state.mobile, type: 'mobile' });
              }}
            />
            {errors['mobile'] && !!checkForm['mobile'](mobile, mobileAdapter) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['mobile'](mobile, mobileAdapter)}</div>
            )}
          </div>
        )}
        {inviteType === 'email' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">
              {_l('邮箱')}
              <span className="TxtMiddle Red">*</span>
            </div>
            <Input
              className="formControl"
              status={errors['email'] && checkForm['email'](email) ? 'error' : undefined}
              value={email}
              onChange={e => this.changeFormInfo(e.target.value, 'email')}
              placeholder={_l('成员会收到邀请链接，验证后可加入组织')}
              onFocus={() => {
                this.clearError('email');
              }}
              onBlur={e => {
                this.setState({ showMask: true });
                this.checkedUser({ val: e.target.value, type: 'email' });
              }}
            />
            {errors['email'] && checkForm['email'](email) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['email'](email)}</div>
            )}
          </div>
        )}
        {inviteType === 'autonomously' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">{_l('登录账号')}</div>
            <ControlledPhoneInput
              value={autonomously || ''}
              dialCode={autonomouslyDialCode}
              showDialCode={!!autonomously && autonomously.length > 3 && !isNaN(Number(autonomously))}
              className="formControl input"
              status={
                errors['autonomously'] && checkForm['autonomously'](autonomously, autonomouslyAdapter)
                  ? 'error'
                  : undefined
              }
              onChange={({ value, dialCode }) => {
                this.setState({ autonomously: value, autonomouslyDialCode: dialCode, isClickSubmit: false });
              }}
              placeholder={_l('请输入')}
              onFocus={() => this.clearError('autonomously')}
              onBlur={() => {
                this.setState({ showMask: true });
                this.checkedUser({ val: this.state.autonomously, type: 'autonomously' });
              }}
            />
            {errors['autonomously'] && checkForm['autonomously'](autonomously) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['autonomously'](autonomously)}</div>
            )}
          </div>
        )}
        {inviteType === 'autonomously' && _.isEmpty(user) && (
          <TextInput
            type="password"
            field={'autonomouslyPasswrod'}
            value={autonomouslyPasswrod}
            placeholder={passwordRegexTip || _l('密码，8-20位，必须含字母+数字')}
            label={
              <span>
                {_l('初始密码')}
                {passwordRegexTip ? (
                  <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{passwordRegexTip}</span>} placement="top">
                    <Icon icon="info_outline" className="Font16 mLeft5 textTertiary" />
                  </Tooltip>
                ) : (
                  ''
                )}
              </span>
            }
            onFocus={() => this.clearError('autonomouslyPasswrod')}
            onChange={e => this.changeFormInfo(e, 'autonomouslyPasswrod')}
            error={errors.autonomouslyPasswrod}
          />
        )}
      </Fragment>
    );
  };

  reviewUserInfo = () => {
    this.setState({ openChangeUserInfoDrawer: !this.state.openChangeUserInfoDrawer });
  };

  render() {
    const {
      actType,
      typeCursor,
      editCurrentUser,
      projectId,
      departmentId,
      authority = [],
      onClose = () => {},
    } = this.props;
    const {
      isUploading,
      errors,
      jobList,
      worksiteList,
      baseInfo,
      openChangeUserInfoDrawer,
      showMask,
      addUserVisible,
      currentUser = {},
    } = this.state;

    return (
      <Fragment>
        <Drawer
          size={580}
          placement="right"
          onClose={onClose}
          open={addUserVisible}
          mask={{ closable: false }}
          closable={false}
        >
          <div className="addEditUserInfoWrap" key="addEditUserInfo">
            <div className="headerInfo">
              <div className="Font17 Bold flex">{_l('添加人员')}</div>
              <span
                className="close Hand"
                onClick={() => {
                  onClose();
                }}
              >
                <Icon icon="close" className="Font24 textTertiary LineHeight36" />
              </span>
            </div>

            {window.platformENV.isPlatform && (
              <div className="textTertiary mLeft24">{_l('姓名、手机和邮箱为个人账户信息，组织中无法修改')}</div>
            )}
            {isUploading ? (
              <div className="flex flexRow justifyContentCenter alignItemsCenter">
                <LoadDiv />
              </div>
            ) : (
              <Fragment>
                <div className="formInfoWrap flex">
                  {this.renderBase()}
                  <BaseFormInfo
                    ref={ele => (this.baseFormInfo = ele)}
                    typeCursor={typeCursor}
                    actType={actType}
                    isUploading={isUploading}
                    editCurrentUser={editCurrentUser}
                    projectId={projectId}
                    errors={errors}
                    jobList={jobList}
                    worksiteList={worksiteList}
                    baseInfo={{ ...baseInfo, departmentIds: departmentId ? [departmentId] : [] }}
                    authority={authority}
                    departmentInfos={this.props.departmentInfos}
                  />
                </div>
                <DrawerFooterOption
                  typeCursor={typeCursor}
                  actType={actType}
                  isUploading={isUploading}
                  editCurrentUser={editCurrentUser}
                  projectId={projectId}
                  departmentId={departmentId}
                  clickSave={this.props.clickSave}
                  handleSubmit={this.handleSubmit}
                  onClose={onClose}
                  errors={errors}
                  jobList={jobList}
                  worksiteList={worksiteList}
                  baseInfo={{ ...baseInfo, departmentIds: departmentId ? [departmentId] : [] }}
                  fetchInActive={this.props.fetchInActive}
                  fetchApproval={this.props.fetchApproval}
                />
              </Fragment>
            )}
            {!showMask && (
              <div
                className="cover"
                onClick={() => {
                  onClose();
                }}
              ></div>
            )}
            {showMask && <div className="mask"></div>}
          </div>
        </Drawer>
        {openChangeUserInfoDrawer && (
          <EditUser
            projectId={projectId}
            typeCursor={typeCursor}
            actType={'edit'}
            key={`editUserInfo_${currentUser.accountId}`}
            accountId={currentUser.accountId}
            editCurrentUser={currentUser}
            departmentId={departmentId}
            clickSave={() => {
              this.reviewUserInfo();
              this.props.refreshData();
              onClose();
            }}
            onClose={() => {
              this.reviewUserInfo();
            }}
            cancelInviteRemove={this.props.cancelInviteRemove}
            fetchInActive={this.props.fetchInActive}
            fetchApproval={this.props.fetchApproval}
            authority={authority}
            openChangeUserInfoDrawer={openChangeUserInfoDrawer}
          />
        )}
      </Fragment>
    );
  }
}

export default withOpeners(AddUser, {
  openAddUserFeedback: useAddUserFeedback,
});
