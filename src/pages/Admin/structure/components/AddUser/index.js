import React, { Component, Fragment } from 'react';
import { Icon, Tooltip, RadioGroup, Input, LoadDiv, Radio } from 'ming-ui';
import importUserController from 'src/api/importUser';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import DrawerFooterOption from '../DrawerFooterOption';
import { encrypt } from 'src/util';
import BaseFormInfo from '../BaseFormInfo';
import TextInput from '../TextInput';
import { checkForm, RESULTS } from '../../constant';
import cx from 'classnames';
import './index.less';

export default class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departmentIds: [],
      errors: {},
      baseInfo: {},
      inviteType: md.global.Config.IsLocal ? 'invite' : 'mobile',
    };
    this.it = null;
    this.itiInvite = null;
    this.itiAutonomously = null;
  }
  componentDidMount() {
    this.itiFn();
    this.itiInviteFn();
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
        autoPlaceholder: 'off',
        initialCountry: 'cn',
        loadUtils: '',
        preferredCountries: ['cn'],
        utilsScript: utils,
        separateDialCode: true,
      });
    }
  };
  itiInviteFn = () => {
    if (this.invite) {
      this.itiInvite = intlTelInput(this.invite, {
        customPlaceholder: '',
        autoPlaceholder: 'off',
        initialCountry: 'cn',
        loadUtils: '',
        preferredCountries: ['cn'],
        utilsScript: utils,
        separateDialCode: true,
      });
      $('.iti__flag-container').hide();
      $(this.invite).css({ 'padding-left': '15px' });
    }
  };
  itiAutonomouslyFn = () => {
    this.itiAutonomously && this.itiAutonomously.destroy();
    this.itiAutonomously = intlTelInput(this.autonomously, {
      customPlaceholder: '',
      autoPlaceholder: 'off',
      initialCountry: 'cn',
      loadUtils: '',
      preferredCountries: ['cn'],
      utilsScript: utils,
      separateDialCode: true,
    });
    $('.iti__flag-container').hide();
    $(this.autonomously).css({ 'padding-left': '15px' });
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
      this.itiInviteFn();
    }, 200);

    this.clearError('mobile');
    this.clearError('email');
    this.setState({
      user: {},
      errors: {},
      inviteType: md.global.Config.IsLocal ? 'invite' : 'mobile',
      mobile: '',
      email: '',
    });
  };

  changeFormInfo = (e, field) => {
    if (!md.global.Config.IsLocal) {
      this.setState({
        [field]: field === 'mobile' ? this.iti.getNumber() : field === 'email' ? e : e.target.value,
        isClickSubmit: false,
      });
    } else {
      const isInvite = field === 'invite';
      const currentEl = isInvite ? this.invite : this.autonomously;
      const isMobile = e > 3 && !isNaN(Number(e));
      this.setState({
        [field]:
          field === 'userName' || field === 'autonomouslyPasswrod'
            ? e.target.value
            : isMobile
            ? isInvite
              ? this.itiInvite.getNumber()
              : this.itiAutonomously.getNumber()
            : e,
        isClickSubmit: false,
      });
      if (isInvite || field === 'autonomously') {
        if (e.length > 3 && !isNaN(Number(e))) {
          $(currentEl).parent().removeClass('phoneWrapper');
          $('.iti__flag-container').show();
          $(currentEl).css({ 'padding-left': '80px' });
        } else {
          $('.iti__flag-container').hide();
          $(currentEl).parent().addClass('phoneWrapper');
        }
      }
      this.clearError(field);
    }
  };
  clearError = field => {
    const { errors = {} } = this.state;
    delete errors[field];
    this.setState({ errors });
  };
  handleSubmit = isClear => {
    const _this = this;
    const {
      isUploading,
      inviteType,
      userName,
      mobile,
      email,
      user = {},
      autonomouslyPasswrod,
      invite,
      autonomously,
    } = this.state;
    const {
      jobIds = [],
      departmentInfos = [],
      jobNumber = '',
      workSiteId = '',
      contactPhone = '',
    } = this.baseFormInfo.state;
    const { projectId } = this.props;
    const errors = {
      ...this.state.errors,
      userName: !!checkForm['userName'](userName),
      mobile: mobile && !!checkForm['mobile'](mobile, this.iti),
      email: email && !!checkForm['email'](email),
      contactPhone: !!checkForm['contactPhone'](contactPhone),
      invite: this.itiInvite && !!checkForm['invite'](invite, this.itiInvite),
      autonomously: this.itiAutonomously && !!checkForm['autonomously'](autonomously, this.itiAutonomously),
      autonomouslyPasswrod: !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod),
    };

    this.setState({ isClickSubmit: true, errors });
    if (isUploading) return false;
    let check = !_.isEmpty(user)
      ? !!checkForm['contactPhone'](contactPhone)
      : inviteType === 'mobile'
      ? !!checkForm['userName'](userName) ||
        !!checkForm['mobile'](mobile, this.iti) ||
        !!checkForm['contactPhone'](contactPhone)
      : !!checkForm['userName'](userName) || !!checkForm['email'](email) || !!checkForm['contactPhone'](contactPhone);
    if (md.global.Config.IsLocal) {
      check = !_.isEmpty(user)
        ? !!checkForm['contactPhone'](contactPhone)
        : inviteType === 'invite'
        ? !!checkForm['invite'](invite, this.itiInvite)
        : !!checkForm['autonomously'](autonomously, this.itiAutonomously) ||
          !!checkForm['autonomouslyPasswrod'](autonomouslyPasswrod);
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
        fullname: userName,
        account: inviteType === 'mobile' ? mobile : email,
        accountId: !md.global.Config.IsLocal || !_.isEmpty(user) ? user.accountId : '',
      };
      if (md.global.Config.IsLocal) {
        params.verifyType = inviteType === 'invite' ? 0 : 1;
        if (inviteType === 'autonomously') {
          params.password = encrypt(autonomouslyPasswrod);
        }
        if (_.isEmpty(user)) params.account = inviteType === 'invite' ? invite : autonomously;
      }
      this.setState({
        isUploading: true,
        departmentInfos: [],
      });
      importUserController.inviteUser(params).then(data => {
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
          this.itiInviteFn();
        }, 200);
        this.clearError('mobile');
        this.clearError('email');
        this.clearError('invite');
        this.setState({
          inviteType: md.global.Config.IsLocal ? 'invite' : 'mobile',
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
          invite: '',
          autonomously: '',
        });
        if (this.mobile) {
          this.mobile.value = '';
        }
      });
    }
  };

  renderPrivate = () => {
    const { userName, inviteType, errors = {}, user = {}, invite, autonomously, autonomouslyPasswrod } = this.state;
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
            <div className="formLabel">{_l('添加方式')}</div>
            <div>
              <Radio
                className="mRight25"
                checked={inviteType === 'invite'}
                onClick={() => {
                  this.clearError('invite');
                  this.clearError('autonomously');
                  this.setState({ inviteType: 'invite', invite: '', autonomously: '' }, () => {
                    this.itiInviteFn();
                  });
                }}
                text={_l('邀请加入')}
              />
              {!md.global.Config.IsPlatformLocal && (
                <Radio
                  checked={inviteType === 'autonomously'}
                  onClick={() => {
                    this.clearError('invite');
                    this.clearError('autonomously');
                    this.setState({ inviteType: 'autonomously', invite: '', autonomously: '' }, () => {
                      this.itiAutonomouslyFn();
                    });
                  }}
                  text={_l('自主创建')}
                />
              )}
            </div>
          </div>
        )}
        {inviteType === 'invite' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">
              {_l('手机或邮箱')}
              <span className="TxtMiddle mLeft5 Gray_9d">( {_l('需已配置对应服务')} )</span>
            </div>
            <Input
              className={cx('formControl input', {
                error: errors['invite'] && !!checkForm['invite'](invite, this.itiInvite),
              })}
              manualRef={ele => (this.invite = ele)}
              onChange={e => this.changeFormInfo(e, 'invite')}
              placeholder={_l('请输入')}
              onFocus={() => {
                this.clearError('invite');
              }}
            />
            {errors['invite'] && !!checkForm['invite'](invite, this.itiInvite) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['invite'](invite, this.itiInvite)}</div>
            )}
          </div>
        )}
        {inviteType === 'autonomously' && _.isEmpty(user) && (
          <div className="formGroup">
            <div className="formLabel">{_l('登录账号')}</div>
            <Input
              className={cx('formControl input', {
                error: errors['autonomously'] && checkForm['autonomously'](autonomously),
              })}
              manualRef={ele => (this.autonomously = ele)}
              onChange={e => this.changeFormInfo(e, 'autonomously')}
              placeholder={_l('请输入')}
              onFocus={() => {
                this.clearError('autonomously');
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
            label={<span>{_l('初始密码')}</span>}
            onFocus={() => this.clearError('autonomouslyPasswrod')}
            onChange={e => this.changeFormInfo(e, 'autonomouslyPasswrod')}
            error={errors.autonomouslyPasswrod}
          />
        )}
      </Fragment>
    );
  };

  renderBase = () => {
    const { userName, mobile, email, inviteType, errors = {}, user = {} } = this.state;
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
                  { text: _l('手机'), value: 'mobile' },
                  { text: _l('邮箱'), value: 'email' },
                ]}
                onChange={val => {
                  this.clearError('mobile');
                  this.clearError('email');
                  this.setState({ inviteType: val, mobile: '', email: '' });
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
              className={cx('formControl', {
                error: errors['mobile'] && !!checkForm['mobile'](mobile, this.iti),
              })}
              manualRef={ele => (this.mobile = ele)}
              onChange={e => this.changeFormInfo(e, 'mobile')}
              placeholder={_l('成员会收到邀请链接，验证后可加入组织')}
              onFocus={() => {
                this.clearError('mobile');
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
            />
            {errors['email'] && checkForm['email'](email) && (
              <div className="Block Red LineHeight25 Hidden">{checkForm['email'](email)}</div>
            )}
          </div>
        )}
      </Fragment>
    );
  };

  render() {
    const { onClose = () => {}, actType, typeCursor, editCurrentUser, projectId, departmentId } = this.props;
    const { isUploading, errors, jobList, worksiteList, baseInfo } = this.state;
    return (
      <CSSTransitionGroup
        component={'div'}
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
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
                {md.global.Config.IsLocal ? this.renderPrivate() : this.renderBase()}
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
              />
            </Fragment>
          )}
          <div
            className="cover"
            onClick={() => {
              onClose();
            }}
          ></div>
        </div>
      </CSSTransitionGroup>
    );
  }
}
