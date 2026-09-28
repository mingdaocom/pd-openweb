import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Drawer } from 'ming-ui/antd-components';
import { getDefaultCountry } from 'ming-ui/components/PhoneNumberInput/util';
import fixedDataAjax from 'src/api/fixedData.js';
import userController from 'src/api/user';
import WorkHandoverDialog from 'src/pages/Admin/components/WorkHandoverDialog';
import UserCountLimitLink from 'src/pages/Admin/user/membersDepartments/UserCountLimitLink';
import { getCurrentProject } from 'src/utils/services/project';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { checkForm, getMobilePhoneNumber } from '../../constant';
import BaseFormInfo from '../BaseFormInfo';
import ControlledPhoneInput from '../ControlledPhoneInput';
import { createControlledPhoneAdapter, getControlledPhoneValue } from '../ControlledPhoneInput/utils';
import DrawerFooterOption from '../DrawerFooterOption';
import TextInput from '../TextInput';
import './index.less';

export default class EditUser extends Component {
  constructor(props) {
    super(props);
    const { dialCode } = getControlledPhoneValue('', getDefaultCountry());

    this.state = {
      departmentIds: [],
      errors: {},
      baseInfo: {},
      agreeLoading: false,
      mobilePhoneDialCode: dialCode,
    };
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
      const phone = getControlledPhoneValue(mobilePhone, getDefaultCountry());

      this.setState({
        userName: fullname,
        mobile: mobilePhone,
        email,
        mobilePhone: phone.value,
        mobilePhoneDialCode: phone.dialCode,
        status,
        isUploading: false,
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.typeCursor !== 0 && !_.isEqual(prevProps.editCurrentUser, this.props.editCurrentUser)) {
        const { fullname, mobilePhone, email, jobNumber, contactPhone } = this.props.editCurrentUser || {};
        const phone = getControlledPhoneValue(mobilePhone, getDefaultCountry());

        this.setState({
          userName: fullname,
          mobile: mobilePhone,
          email,
          jobNumber,
          contactPhone,
          mobilePhone: phone.value,
          mobilePhoneDialCode: phone.dialCode,
        });
      }
    }
  }
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
        const phone = getControlledPhoneValue(user.mobilePhone || editCurrentUser.mobilePhone, getDefaultCountry());

        this.setState({
          isUploading: false,
          userName: user.fullname || '',
          companyName: user.companyName || '',
          mobile: user.mobilePhone,
          email: user.email,
          mobilePhone: phone.value,
          mobilePhoneDialCode: phone.dialCode,
          isSuperAdmin: user.isAdmin,
          baseInfo: {
            jobNumber: user.jobNumber || '',
            contactPhone: user.contactPhone || '',
            workSiteId: user.workSiteId,
            departmentIds: user.departmentInfos.map(it => it.departmentId),
            jobIds: typeCursor === 3 ? this.state.jobIds : (user.jobInfos || []).map(item => item.jobId),
            jobList: jobs,
            worksiteList: workSites,
            orgRoles: user.orgRoles || [],
            useMultiJobs: user.useMultiJobs,
            departmentJobInfos: user.departmentJobInfos || [],
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
  getMobilePhoneAdapter = () => {
    return createControlledPhoneAdapter({
      dialCode: this.state.mobilePhoneDialCode,
      value: this.state.mobilePhone,
    });
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
      useMultiJobs,
      departmentJobInfos = [],
    } = this.baseFormInfo.state;
    if (this.state.agreeLoading) return;

    if (useMultiJobs && !!departmentJobInfos.filter(item => !item.departmentId).length) {
      alert(_l('多任职信息中部门不能为空'), 3);
      return;
    }

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
        useMultiJobs,
        departmentJobIdMaps: departmentJobInfos.map(item => ({
          departmentId: item.departmentId,
          jobIds: item.jobIds,
        })),
      })
      .then(result => {
        if (result === 1) {
          alert(_l('批准成功'));
          onClose();
          this.props.fetchApproval();
          this.props.clickSave();
        } else if (result === 4) {
          alert(<UserCountLimitLink projectId={projectId} />, 3);
        } else {
          alert(_l('操作失败'), 2);
        }

        this.setState({ agreeLoading: false });
      })
      .catch(_requestError2 => {
        alertIfNotUnauthorized(_requestError2, _l('操作失败'), 2);
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
      useMultiJobs,
      departmentJobInfos = [],
    } = this.baseFormInfo.state;

    if (useMultiJobs && !!departmentJobInfos.filter(item => !item.departmentId).length) {
      alert(_l('多任职信息中部门不能为空'), 3);
      return;
    }

    if (window.platformENV.isPlatform) {
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
          useMultiJobs,
          departmentJobIdMaps: departmentJobInfos.map(item => ({
            departmentId: item.departmentId,
            jobIds: item.jobIds,
          })),
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
          _requestError => {
            alertIfNotUnauthorized(_requestError, _l('保存失败'), 2);
          },
        );
    } else {
      const { userName, email, mobilePhone, companyName } = this.state;
      const mobilePhoneAdapter = this.getMobilePhoneAdapter();
      const errors = {
        ...this.state.errors,
        userName: !!checkForm['userName'](userName),
        mobilePhone: mobilePhone && !!checkForm['mobilePhone'](mobilePhone, mobilePhoneAdapter),
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
        mobilePhone: getMobilePhoneNumber(mobilePhoneAdapter, this.state.mobilePhone),
        projectId,
        workSiteId,
        contactPhone,
        orgRoleIds: orgRoles.map(l => l.id),
        useMultiJobs,
        departmentJobIdMaps: departmentJobInfos.map(item => ({
          departmentId: item.departmentId,
          jobIds: item.jobIds,
        })),
      };

      this.setState({ isUploading: true });
      // 私有部署不检查companyName
      Promise.all(
        window.platformENV.isHap
          ? [
              fixedDataAjax.checkSensitive({ content: companyName }),
              fixedDataAjax.checkSensitive({ content: jobNumber }),
            ]
          : [fixedDataAjax.checkSensitive({ content: jobNumber })],
      ).then(results => {
        if (!results.find(result => result)) {
          userController
            .updateUser(params)
            .then(result => {
              if (result === 1) {
                alert(_l('修改成功'), 1);
                this.props.clickSave();
                this.setState({ isUploading: false });
              } else {
                alert(_l('保存失败'), 2);
                this.setState({ isUploading: false });
              }
            })
            .catch(() => {
              this.setState({ isUploading: false });
            });
        } else {
          alert(_l('输入内容包含敏感词，请重新填写'), 3);
          this.setState({ isUploading: false });
        }
      });
    }
  };
  renderBaseUserInfo = () => {
    const { typeCursor, projectId } = this.props;
    const { userName, mobile, email, mobilePhone, mobilePhoneDialCode, errors = {}, status, isSuperAdmin } = this.state;
    const mobilePhoneAdapter = this.getMobilePhoneAdapter();

    const currentProject = getCurrentProject(projectId);

    if (window.platformENV.isOverseas || window.platformENV.isLocal) {
      const disabled = !currentProject.isSuperAdmin && isSuperAdmin;

      return (
        <Fragment>
          {window.platformENV.isPlatform || typeCursor === 2 || typeCursor === 3 || disabled ? (
            <TextInput label={_l('姓名')} value={userName} disabled="disabled" />
          ) : (
            <TextInput
              label={_l('姓名')}
              field={'userName'}
              value={userName}
              disabled={disabled}
              isRequired={true}
              placeholder=""
              error={errors['userName'] && !!checkForm['userName'](userName)}
              onChange={e => this.changeFormInfo(e, 'userName')}
              onFocus={() => {
                this.clearError('userName');
              }}
            />
          )}
          {window.platformENV.isPlatform || typeCursor === 2 || typeCursor === 3 || disabled ? (
            <TextInput label={_l('手机号')} value={mobile} disabled="disabled" />
          ) : (
            <div className="formGroup">
              <div className="formLabel">{_l('手机号')}</div>
              <ControlledPhoneInput
                className="formControl input"
                status={
                  errors['mobilePhone'] && checkForm['mobilePhone'](mobilePhone, mobilePhoneAdapter)
                    ? 'error'
                    : undefined
                }
                value={mobilePhone || ''}
                dialCode={mobilePhoneDialCode}
                onChange={({ value, dialCode }) => {
                  this.setState({ mobilePhone: value, mobilePhoneDialCode: dialCode, isClickSubmit: false });
                }}
                placeholder={_l('请输入')}
                onFocus={() => {
                  this.clearError('mobilePhone');
                }}
              />
              {errors['mobilePhone'] && !!checkForm['mobilePhone'](mobilePhone, mobilePhoneAdapter) && (
                <div className="Block Red LineHeight25 Hidden">
                  {checkForm['mobilePhone'](mobilePhone, mobilePhoneAdapter)}
                </div>
              )}
            </div>
          )}
          {window.platformENV.isPlatform || disabled ? (
            <TextInput label={_l('邮箱')} value={email} disabled="disabled" />
          ) : typeCursor === 0 || typeCursor === 1 ? (
            <TextInput
              label={_l('邮箱')}
              field={'email'}
              value={email}
              placeholder=""
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
        size={580}
        placement="right"
        onClose={onClose}
        open={openChangeUserInfoDrawer}
        mask={{ closable: false }}
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
              <Icon icon="close" className="Font24 textTertiary LineHeight36" />
            </span>
          </div>

          {window.platformENV.isPlatform ? (
            <div className="textTertiary mLeft24">{_l('姓名、手机和邮箱为个人账户信息，组织中无法修改')}</div>
          ) : (
            <div className="textTertiary mLeft24">{_l('非组织超级管理员无法修改组织超级管理员姓名/手机号/邮箱')}</div>
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
