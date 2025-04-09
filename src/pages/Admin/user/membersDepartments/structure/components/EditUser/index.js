import React, { Component, Fragment } from 'react';
import { Icon, Input, LoadDiv, intlTelInput } from 'ming-ui';
import { Drawer } from 'antd';
import userController from 'src/api/user';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';
import DrawerFooterOption from '../DrawerFooterOption';
import BaseFormInfo from '../BaseFormInfo';
import TextInput from '../TextInput';
import { checkForm } from '../../constant';
import fixedDataAjax from 'src/api/fixedData.js';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import { getCurrentProject } from 'src/util';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default class EditUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      departmentIds: [],
      errors: {},
      baseInfo: {},
      agreeLoading: false,
    };
    this.it = null;
  }
  componentDidMount() {
    const { typeCursor, editCurrentUser = {} } = this.props;
    typeCursor !== 2 && this.getUserData();
    if (typeCursor === 2) {
      this.setState({
        ...editCurrentUser,
        userName: editCurrentUser.fullname,
        mobile: editCurrentUser.mobilePhone,
        baseInfo: { ...editCurrentUser, userName: editCurrentUser.fullname, mobile: editCurrentUser.mobilePhone },
      });
    }
    if (typeCursor !== 0) {
      const { fullname, mobilePhone, email, status = '' } = editCurrentUser;
      this.setState({
        userName: fullname,
        mobile: mobilePhone,
        email,
        status,
        isUploading: false,
      });
    }
    setTimeout(() => {
      this.itiFn();
    }, 500);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.typeCursor !== 0 && !_.isEqual(this.props.editCurrentUser, nextProps.editCurrentUser)) {
      const { fullname, mobilePhone, email, department, job, worksite, jobNumber, contactPhone } = nextProps;
      this.setState({ userName: fullname, mobile: mobilePhone, email, jobNumber, contactPhone, mobilePhone });
    }
  }
  componentDidUpdate() {
    !this.iti && this.itiFn();
  }
  itiFn = () => {
    if (this.mobilePhone) {
      this.iti && this.iti.destroy();
      this.iti = intlTelInput(this.mobilePhone, {
        customPlaceholder: '',
        separateDialCode: true,
        showSelectedDialCode: true,
      });

      this.mobilePhone.addEventListener('countrychange', () => {
        const { dialCode } = (this.iti && this.iti.getSelectedCountryData()) || {};
        if (!this.state.mobilePhone.includes(`+${dialCode}`)) {
          this.setState({ mobilePhone: this.state.mobilePhone.replace('+', '') });
        }
      });
    }
  };
  getUserData = () => {
    const { accountId, projectId, typeCursor, editCurrentUser } = this.props;
    this.setState({ isUploading: true });
    userController
      .getUserCard({
        accountId,
        projectId,
      })
      .then(data => {
        let { user = {}, jobs = [], workSites = [] } = data;
        this.setState({
          isUploading: false,
          userName: user.fullname || '',
          companyName: user.companyName || '',
          mobile: user.mobilePhone,
          email: user.email,
          mobilePhone: user.mobilePhone || editCurrentUser.mobilePhone,
          baseInfo: {
            jobNumber: user.jobNumber || '',
            contactPhone: user.contactPhone || '',
            workSiteId: user.workSiteId,
            departmentIds: user.departmentInfos.map(it => it.departmentId),
            jobIds: typeCursor === 3 ? this.state.jobIds : (user.jobInfos || []).map(item => item.jobId),
            jobList: jobs,
            worksiteList: workSites,
            orgRoles: user.orgRoles || [],
          },
        });
      });
  };
  changeFormInfo = (e, field) => {
    this.setState({
      [field]: field === 'mobilePhone' ? e.target.value.replace(/ +/g, '') : e.target.value,
      isClickSubmit: false,
    });
  };
  fromatMobilePhoe = mobilePhone => {
    let value = mobilePhone;
    if (this.iti) {
      const countryData = this.iti.getSelectedCountryData();
      const dialCode = `+${countryData.dialCode}`;
      value = (value || '').replace(dialCode, '');
    }
    return value;
  };
  clearError = field => {
    const { errors = {} } = this.state;
    delete errors[field];
    this.setState({ errors });
  };
  agreeJoin = () => {
    const { projectId, accountId, onClose = () => {} } = this.props;
    const {
      jobIds = [],
      departmentInfos = [],
      jobNumber,
      workSiteId,
      contactPhone,
      orgRoles = [],
    } = this.baseFormInfo.state;
    if (this.state.agreeLoading) return;

    this.setState({ agreeLoading: true });

    userController
      .agreeUserJoin({
        projectId,
        accountId,
        jobIds,
        departmentIds: departmentInfos.map(it => it.departmentId),
        workSiteId,
        jobNumber,
        contactPhone,
        orgRoleIds: orgRoles.map(l => l.id),
      })
      .then(result => {
        if (result === 1) {
          alert(_l('批准成功'));
          onClose();
          this.props.fetchApproval();
          this.props.clickSave();
        } else if (result === 4) {
            alert(_l('当前用户数已超出人数限制'), 3);
        } else {
          alert(_l('操作失败'), 2);
        }
        this.setState({ agreeLoading: false });
      })
      .catch(() => {
        alert(_l('操作失败'), 2);
        this.setState({ agreeLoading: false });
      });
  };
  saveFn = () => {
    const { projectId, accountId } = this.props;
    const {
      jobIds = [],
      departmentInfos = [],
      jobNumber,
      workSiteId,
      contactPhone,
      orgRoles,
    } = this.baseFormInfo.state;

    if (!md.global.Config.IsLocal || md.global.Config.IsPlatformLocal) {
      userController
        .updateUserCard({
          projectId,
          accountId,
          jobIds,
          departmentIds: departmentInfos.map(it => it.departmentId),
          jobNumber,
          contactPhone,
          workSiteId,
          orgRoleIds: orgRoles.map(l => l.id),
        })
        .then(
          result => {
            if (result === 1) {
              alert(_l('修改成功'), 1);
              this.props.clickSave();
            } else {
              alert(_l('保存失败'), 2);
            }
            this.setState({ isUploading: false });
          },
          () => {
            alert(_l('保存失败'), 2);
          },
        );
    } else {
      const { userName, email, mobilePhone, companyName } = this.state;
      const errors = {
        ...this.state.errors,
        userName: !!checkForm['userName'](userName),
        mobilePhone: mobilePhone && !!checkForm['mobilePhone'](mobilePhone, this.iti),
        email: email && !!checkForm['email'](email),
      };
      this.setState({ errors });
      if (!(email || mobilePhone)) {
        alert(_l('请输入手机号或邮箱'), 3);
        return false;
      }

      if (errors && _.values(errors).some(it => it)) {
        return false;
      }

      const params = {
        accountId,
        departmentIds: departmentInfos.map(it => it.departmentId),
        email,
        fullname: userName,
        jobIds,
        jobNumber,
        mobilePhone: this.iti && this.iti.getNumber(),
        projectId,
        workSiteId,
        contactPhone,
        orgRoleIds: orgRoles.map(l => l.id),
      };

      this.setState({ isUploading: true });
      Promise.all([
        fixedDataAjax.checkSensitive({ content: jobNumber }),
      ]).then(results => {
        if (!results.find(result => result)) {
          userController
            .updateUser(params)
            .then(result => {
              if (result === 1) {
                alert(_l('修改成功'), 1);
                this.props.clickSave();
              } else {
                alert(_l('保存失败'), 2);
              }
              this.setState({ isUploading: false });
            })
            .catch(err => {
              this.setState({ isUploading: false });
              this.itiFn();
            });
        } else {
          alert(_l('输入内容包含敏感词，请重新填写'), 3);
          this.setState({ isUploading: false });
        }
      });
    }
  };
  renderBaseUserInfo = () => {
    const { typeCursor } = this.props;
    const { userName, mobile, email, companyName, mobilePhone, errors = {}, status } = this.state;
    if (md.global.Config.IsLocal) {
      return (
        <Fragment>
          {md.global.Config.IsPlatformLocal || typeCursor === 2 || typeCursor === 3 ? (
            <TextInput label={_l('姓名')} value={userName} disabled="disabled" />
          ) : (
            <TextInput
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
            />
          )}
          {md.global.Config.IsPlatformLocal || typeCursor === 2 || typeCursor === 3 ? (
            <TextInput label={_l('手机号')} value={mobile} disabled="disabled" />
          ) : (
            <div className="formGroup">
              <div className="formLabel">{_l('手机号')}</div>
              <Input
                className={cx('formControl input', {
                  error: errors['mobilePhone'] && !!checkForm['mobilePhone'](mobilePhone, this.iti),
                })}
                value={this.fromatMobilePhoe(mobilePhone)}
                manualRef={ele => (this.mobilePhone = ele)}
                onInput={e => this.changeFormInfo(e, 'mobilePhone')}
                placeholder={_l('请输入')}
                onFocus={() => {
                  this.clearError('mobilePhone');
                }}
              />
              {errors['mobilePhone'] && !!checkForm['mobilePhone'](mobilePhone, this.iti) && (
                <div className="Block Red LineHeight25 Hidden">{checkForm['mobilePhone'](mobilePhone, this.iti)}</div>
              )}
            </div>
          )}
          {md.global.Config.IsPlatformLocal ? (
            <TextInput label={_l('邮箱')} value={email} disabled="disabled" />
          ) : typeCursor === 0 || typeCursor === 1 ? (
            <TextInput
              label={_l('邮箱')}
              field={'email'}
              value={email}
              placeholder={_l('')}
              error={errors['email'] && !!checkForm['email'](email)}
              onChange={e => this.changeFormInfo(e, 'email')}
              onFocus={() => {
                this.clearError('email');
              }}
            />
          ) : (
            ''
          )}
        </Fragment>
      );
    }

    return (
      <Fragment>
        {typeCursor === 3 && (
          <div className="formGroup">
            <div className="formLabel">{_l('状态')}</div>
            {status === 3 && <div className="status check">{_l('待审核')}</div>}
            {status === 2 && <div className="status refuse">{_l('已拒绝')}</div>}
          </div>
        )}
        <TextInput label={_l('姓名')} value={userName} disabled="disabled" />
        <TextInput label={_l('手机')} value={mobile} disabled="disabled" />
        <TextInput label={_l('邮箱')} value={email} disabled="disabled" />
      </Fragment>
    );
  };
  render() {
    const {
      actType,
      typeCursor,
      editCurrentUser,
      projectId,
      departmentId,
      accountId,
      openChangeUserInfoDrawer,
      authority = [],
      onClose = () => {},
    } = this.props;
    const { isUploading, errors, jobList, worksiteList, baseInfo, showWorkHandover, userName, agreeLoading } =
      this.state;

    return (
      <Drawer
        width={580}
        placement="right"
        onClose={onClose}
        visible={openChangeUserInfoDrawer}
        maskClosable={false}
        closable={false}
      >
        <div className="addEditUserInfoWrap" key="addEditUserInfo">
          <div className="headerInfo">
            <div className="Font17 Bold flex">{_l('人员信息')}</div>
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
                {this.renderBaseUserInfo()}
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
                  baseInfo={baseInfo}
                  authority={authority}
                />
              </div>
              <DrawerFooterOption
                agreeLoading={agreeLoading}
                typeCursor={typeCursor}
                actType={actType}
                isUploading={isUploading}
                editCurrentUser={editCurrentUser}
                projectId={projectId}
                departmentId={departmentId}
                clickSave={this.props.clickSave}
                saveFn={this.saveFn}
                agreeJoin={this.agreeJoin}
                onClose={onClose}
                fetchInActive={this.props.fetchInActive}
                fetchApproval={this.props.fetchApproval}
                fetchReInvite={this.props.fetchReInvite}
                fetchCancelImportUser={this.props.fetchCancelImportUser}
                handleTransfer={() => this.setState({ showWorkHandover: true })}
              />
            </Fragment>
          )}
          <div
            className="cover"
            onClick={() => {
              onClose();
            }}
          ></div>

          {showWorkHandover && (
            <WorkHandoverDialog
              visible={showWorkHandover}
              projectId={projectId}
              transferor={{ accountId, fullname: userName }}
              onCancel={() => this.setState({ showWorkHandover: false })}
            />
          )}
        </div>
      </Drawer>
    );
  }
}
