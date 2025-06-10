import React, { Component, Fragment } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Input, intlTelInput, LoadDiv, RadioGroup, Tooltip } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import importUserController from 'src/api/importUser';
import userAjax from 'src/api/user';
import { encrypt } from 'src/utils/common';
import { checkForm, RESULTS } from '../../constant';
import { addUserFeedbackFunc } from '../AddUserFeedback';
import BaseFormInfo from '../BaseFormInfo';
import DrawerFooterOption from '../DrawerFooterOption';
import EditUser from '../EditUser';
import TextInput from '../TextInput';
import './index.less';

export default class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departmentIds: [],
      errors: {},
      baseInfo: {},
      inviteType: !md.global.SysSettings.enableSmsCustomContent ? 'email' : 'mobile',
      addUserVisible: props.addUserVisible,
    };
    this.it = null;
    this.itiInvite = null;
    this.itiAutonomously = null;
  }
  componentDidMount() {
    this.itiFn();
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.addUserVisible !== nextProps.addUserVisible) {
      this.setState({ addUserVisible: nextProps.addUserVisible });
    }
  }
  componentWillUnmount() {
    this.iti && this.iti.destroy();
    this.itiInvite && this.itiInvite.destroy();
    this.itiAutonomously && this.itiAutonomously.destroy();
  }
  itiFn = () => {
    if (this.mobile) {
      this.iti && this.iti.destroy();
      this.iti = intlTelInput(this.mobile, {
        customPlaceholder: '',
        separateDialCode: true,
        showSelectedDialCode: true,
      });
    }
  };

  itiAutonomouslyFn = val => {
    this.itiAutonomously && this.itiAutonomously.destroy();
    this.itiAutonomously = intlTelInput(this.autonomously, {
      customPlaceholder: '',
      separateDialCode: true,
      showSelectedDialCode: true,
    });
    $(this.autonomously).css({ 'padding-left': '15px' });
    this.autonomously.focus();
    this.itiAutonomously.setNumber(val);
  };

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
          _this.setState({
            user: userObj[0],
          });
        },
      },
    });
  };
  clearSelectUser = () => {
    setTimeout(() => {
      this.itiFn();
    }, 200);

    this.clearError('mobile');
    this.clearError('email');
    this.setState({
      user: {},
      errors: {},
      inviteType: 'mobile',
      mobile: '',
      email: '',
    });
  };

  changeFormInfo = (e, field) => {
    const isMobile = field === 'autonomously' && e.length > 3 && !isNaN(Number(e));

    if (isMobile && !this.itiAutonomously) {
      this.itiAutonomouslyFn(e);
    }

    this.setState({
      [field]: _.includes(['mobile', 'email', 'autonomously'], field) ? e : e.target.value,
      isClickSubmit: false,
    });
  };
  clearError = field => {
    const { errors = {} } = this.state;
    delete errors[field];
    this.setState({ errors });
  };
  // check当前组织是否存在该人员
  checkedUser = (e, type) => {
    const { projectId, typeCursor, departmentId } = this.props;
    const { email, inviteType, autonomously } = this.state;
    let val = e.target.value;
    if (
      (type === 'mobile' && !!checkForm['mobile'](val, this.iti)) ||
      (type === 'email' && !!checkForm['email'](val)) ||
      (type === 'autonomously' && !!checkForm['autonomously'](val, this.itiAutonomously))
    ) {
      this.setState({ showMask: false });
      return;
    }
    const userContact =
      inviteType === 'mobile'
        ? this.iti.getNumber()
        : inviteType === 'email'
          ? email
          : type === 'autonomously' && this.itiAutonomously
            ? this.itiAutonomously.getNumber()
            : autonomously;

    if (!userContact) {
      this.setState({ showMask: false });
      return;
    }

    userAjax
      .getUserOrgState({
        projectId,
        userContact,
        departmentId,
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
        addUserFeedbackFunc({
          projectId,
          typeCursor: res.userState === 3 ? 2 : res.userState === 4 ? 3 : typeCursor,
          departmentId,
          actionResult: res.userState,
          closeDrawer: this.props.onClose,
          currentUser: user,
          refreshData: this.props.refreshData,
          reviewUserInfo: this.reviewUserInfo,
          hideMask: () => this.setState({ showMask: false }),
          fetchReInvite: this.props.fetchReInvite,
          fetchCancelImportUser: this.props.fetchCancelImportUser,
        });
        this.setState({ currentUser: user });
      });
  };
  handleSubmit = isClear => {
    const _this = this;
    const { isUploading, inviteType, userName, email, user = {}, autonomouslyPasswrod, autonomously } = this.state;
    const mobile = this.iti && this.iti.getNumber();
    const {
      jobIds = [],
      departmentInfos = [],
      jobNumber = '',
      workSiteId = '',
      contactPhone = '',
      orgRoles = [],
    } = this.baseFormInfo.state;
    const { projectId } = this.props;
    const errors = {
      ...this.state.errors,
      userName: !!checkForm['userName'](userName),
      mobile: inviteType === 'mobile' && !!checkForm['mobile'](mobile, this.iti),
      email: inviteType === 'email' && !!checkForm['email'](email),
      autonomously: !!checkForm['autonomously'](
        this.itiAutonomously ? this.itiAutonomously.getNumber() : autonomously,
        this.itiAutonomously,
      ),
      autonomouslyPasswrod: inviteType === 'autonomously' && !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod),
    };

    this.setState({ isClickSubmit: true, errors });
    if (isUploading) return false;
    let check = !_.isEmpty(user)
      ? false
      : inviteType === 'mobile'
        ? !!checkForm['userName'](userName) || !!checkForm['mobile'](mobile, this.iti)
        : !!checkForm['userName'](userName) || !!checkForm['email'](email);

    if (md.global.Config.IsLocal && _.isEmpty(user)) {
      check = _.includes(['mobile', 'email'], inviteType)
        ? check
        : inviteType === 'autonomously' &&
          (!!checkForm['autonomously'](
            this.itiAutonomously ? this.itiAutonomously.getNumber() : autonomously,
            this.itiAutonomously,
          ) ||
            !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod));
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
        accountId: !md.global.Config.IsLocal || !_.isEmpty(user) ? user.accountId : '',
        orgRoleIds: orgRoles.map(l => l.id).join(';'),
      };
      if (md.global.Config.IsLocal) {
        params.verifyType = _.includes(['mobile', 'email'], inviteType) ? 0 : 1;
        if (inviteType === 'autonomously') {
          params.account = _.isEmpty(user)
            ? this.itiAutonomously
              ? this.itiAutonomously.getNumber()
              : autonomously
            : '';
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
          if (!data || data.actionResult == RESULTS.FAILED) {
            alert(_l('邀请失败'), 1);
          } else if (data.actionResult == RESULTS.OVERINVITELIMITCOUNT) {
            alert(_l('超过邀请数量限制'), 3);
          } else {
            const { failUsers, successUsers, existsUsers, forbidUsers, successCount } = data;
            if (failUsers && failUsers.length) {
              const failReason = failUsers[0].failReason;
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
          setTimeout(() => {
            this.itiFn();
          }, 200);
          this.clearError('mobile');
          this.clearError('email');
          this.setState({
            inviteType: 'mobile',
            user: {},
            userName: '',
            mobile: '',
            email: '',
            departmentInfos: [],
            jobIds: [],
            workSiteId: '',
            jobNumber: '',
            contactPhone: '',
            errors: {},
            isUploading: false,
            autonomously: '',
          });
          if (this.mobile) {
            this.mobile.value = '';
          }
        })
        .catch(err => {
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
      autonomouslyPasswrod,
    } = this.state;
    const { passwordRegexTip } = _.get(md, 'global.SysSettings') || {};
    return (
      <Fragment>
        {_.isEmpty(user) ? (
          <TextInput
            ref={ele => (this.userNameInput = ele)}
            label={_l('姓名')}
            field={'userName'}
            value={userName}
            isRequired={true}
            placeholder={_l('')}
            error={errors['userName'] && !!checkForm['userName'](userName)}
            onChange={e => this.changeFormInfo(e, 'userName')}
            onFocus={() => {
              this.clearError('userName');
            }}
          >
            <Tooltip
              tooltipClass="addUserDressbook"
              text={<span>{_l('从通讯录添加')}</span>}
              offset={[-20, 0]}
              popupPlacement="bottom"
            >
              <span
                className="icon-topbar-addressList Font16 selectUser ThemeHoverColor3"
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
                <span
                  className="mLeft5 icon-closeelement-bg-circle Font14 Gray_c Hand"
                  onClick={this.clearSelectUser}
                />
              </span>
              <Tooltip text={_l('从通讯录添加')}>
                <span
                  className="icon-topbar-addressList Font16 selectUser ThemeHoverColor3"
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
              <RadioGroup
                checkedValue={inviteType}
                data={[
                  { text: md.global.Config.IsLocal ? _l('手机号邀请') : _l('手机'), value: 'mobile' },
                  { text: md.global.Config.IsLocal ? _l('邮箱邀请') : _l('邮箱'), value: 'email' },
                  { text: _l('自主创建'), value: 'autonomously' },
                ].filter(item => {
                  if (!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal)
                    return item.value !== 'autonomously';
                  if (!md.global.SysSettings.enableSmsCustomContent) return item.value !== 'mobile';
                  return true;
                })}
                onChange={val => {
                  setTimeout(() => {
                    this.itiFn();
                  }, 200);
                  if (val === 'autonomously' && this.itiAutonomously) {
                    this.itiAutonomously.destroy();
                    this.itiAutonomously = null;
                  }
                  this.clearError('mobile');
                  this.clearError('email');
                  this.clearError('autonomously');
                  this.setState({ inviteType: val, mobile: '', email: '', autonomously: '', autonomouslyPasswrod: '' });
                }}
              ></RadioGroup>
            </div>
          </div>
        )}
        {inviteType === 'mobile' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">
              {_l('手机')}
              <span className="TxtMiddle Red">*</span>
            </div>
            <Input
              value={mobile}
              className={cx('formControl', {
                error: errors['mobile'] && !!checkForm['mobile'](mobile, this.iti),
              })}
              manualRef={ele => (this.mobile = ele)}
              placeholder={_l('成员会收到邀请链接，验证后可加入组织')}
              onFocus={() => {
                this.clearError('mobile');
              }}
              onInput={e => {
                const val = e.target.value.replace(/ +/g, '');
                this.changeFormInfo(val, 'mobile');
              }}
              onBlur={e => {
                this.setState({ showMask: true });
                this.checkedUser(e, 'mobile');
              }}
            />
            {errors['mobile'] && !!checkForm['mobile'](mobile, this.iti) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['mobile'](mobile, this.iti)}</div>
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
              className={cx('formControl', { error: errors['email'] && checkForm['email'](email) })}
              value={email}
              onChange={e => this.changeFormInfo(e, 'email')}
              placeholder={_l('成员会收到邀请链接，验证后可加入组织')}
              onFocus={() => {
                this.clearError('email');
              }}
              onBlur={e => {
                this.setState({ showMask: true });
                this.checkedUser(e, 'email');
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
            <Input
              value={autonomously}
              className={cx('formControl input', {
                error: errors['autonomously'] && checkForm['autonomously'](autonomously),
              })}
              manualRef={ele => (this.autonomously = ele)}
              onChange={e => this.changeFormInfo(e, 'autonomously')}
              onInput={e => {
                const val = e.target.value.replace(/ +/g, '');
                if ((val.length <= 3 || isNaN(Number(val))) && this.itiAutonomously) {
                  this.itiAutonomously.destroy();
                  this.itiAutonomously = null;
                  this.autonomously.focus();
                  $(this.autonomously).css({ 'padding-left': '12px' });
                }
                this.changeFormInfo(val, 'autonomously');
              }}
              placeholder={_l('请输入')}
              onFocus={() => {
                this.clearError('autonomously');
              }}
              onBlur={e => {
                this.setState({ showMask: true });
                this.checkedUser(e, 'autonomously');
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
                  <Tooltip
                    text={<span style={{ whiteSpace: 'pre-line' }}>{passwordRegexTip}</span>}
                    popupPlacement="top"
                  >
                    <Icon icon="info_outline" className="Font16 mLeft5 Gray_9e" />
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
          width={580}
          placement="right"
          onClose={onClose}
          visible={addUserVisible}
          maskClosable={false}
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
                <Icon icon="close" className="Font24 Gray_9e LineHeight36" />
              </span>
            </div>

            {(!md.global.Config.IsLocal || (md.global.Config.IsLocal && md.global.Config.IsPlatformLocal)) && (
              <div className="Gray_9e mLeft24">{_l('姓名、手机和邮箱为个人账户信息，组织中无法修改')}</div>
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
