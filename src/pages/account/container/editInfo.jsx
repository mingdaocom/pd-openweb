import React from 'react';
import '../components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import Config from '../config';
import { getRequest, mdAppResponse } from 'src/util';
import { Dropdown, LoadDiv } from 'ming-ui';
import account from 'src/api/account';
let request = getRequest();
import { inputFocusFn, inputBlurFn, setWarnningData } from '../util';
import { encrypt } from 'src/util';
import _ from 'lodash';
import DepDropDown from 'src/pages/account/components/DepDropDown.jsx';
export default class EditInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      departmentsArr: [],
      workSitesArr: [],
      jobsArr: [],
      loading: false,
      pageLoading: true,
    };
  }

  componentDidMount() {
    const { registerData } = this.props;
    const { userCard = [] } = registerData;
    const { isMustWorkSite, isMustDepartment, isMustJobNumber, isMustJob } = userCard;
    if (!isMustWorkSite && !isMustDepartment && !isMustJobNumber && !isMustJob) {
      this.submitUserCard();
    } else {
      this.setState(
        {
          pageLoading: false,
        },
        () => {
          this.dataFn(this.props);
        },
      );
    }
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (!_.isEqual(this.props.registerData, nextProps.registerData)) {
      this.dataFn(nextProps);
    }
    const { registerData = [] } = nextProps;
    const { warnningData = [] } = registerData;
    if (warnningData.length > 0) {
      if (!this.state.focusDiv) {
        $(warnningData[0].tipDom).focus();
      }
    }
  }

  dataFn = props => {
    const { registerData = [] } = props;
    const { userCard = [] } = registerData;
    const { departments = [], workSites = [], jobs = [] } = userCard;
    let departmentsN =
      departments.length <= 0
        ? [
            {
              value: 'null',
              text: _l('暂无部门'),
            },
          ]
        : _.map(departments, item => {
            return {
              value: item.departmentId,
              text: item.departmentName,
            };
          });
    let workSitesN =
      workSites.length <= 0
        ? [
            {
              value: 'null',
              text: _l('暂无工作地点'),
            },
          ]
        : _.map(workSites, item => {
            return {
              value: item.workSiteId,
              text: item.workSiteName,
            };
          });
    let jobsN =
      jobs.length <= 0
        ? [
            {
              value: 'null',
              text: _l('暂无职位'),
            },
          ]
        : _.map(jobs, item => {
            return {
              value: item.jobId,
              text: item.jobName,
            };
          });
    this.setState({
      departmentsArr: departmentsN,
      workSitesArr: workSitesN,
      jobsArr: jobsN,
    });
  };

  inputOnFocus = e => {
    inputFocusFn(e, () => {
      this.setState({
        focusDiv: e.target,
      });
    });
  };

  inputOnBlur = e => {
    inputBlurFn(e, () => {
      this.setState({
        focusDiv: '',
      });
    });
  };

  // 提交名片信息
  submitUserCard = () => {
    const { registerData = {}, onChangeData, changeStep, loginSuc } = this.props;
    const {
      fullName,
      password,
      emailOrTel,
      isLink,
      isApplyJoin, // 主动申请加入网络
      company,
      projectId,
      TPParams,
      confirmation,
      verifyCode,
      dialCode,
      regcode,
      email,
    } = registerData;
    if (this.validateUserCardRequiredField()) {
      this.setState({
        loading: true,
      });
      let params = {
        account: encrypt(dialCode + emailOrTel),
        password: encrypt(password),
        verifyCode: verifyCode,
        fullname: fullName,
        companyName: company.companyName,
        departmentIds: !company.departmentId || company.departmentId === 'null' ? [] : [company.departmentId],
        jobIds: !company.jobId || company.jobId === 'null' ? [] : [company.jobId],
        jobNumber: company.jobNumber,
        workSiteId: company.workSiteId === 'null' ? '' : company.workSiteId,
        contactPhone: company.contactPhone,
      };
      let joinCompanyAction = null;
      let isApplyJoinOrInviteJoin = false;
      if (location.href.indexOf('/enterpriseRegister.htm?type=editInfo') >= 0) {
        // 受邀加入网络
        joinCompanyAction = account.joinProjectByToken;
        params.jobId = company.jobId || '';
        params.departmentId = company.departmentId || '';
        params.projectId = request.projectId;
        params.token = request.token;
      } else if (regcode) {
        // 填写网络号加入网
        joinCompanyAction = account.joinProjectByCode;
        params.jobId = company.jobId || '';
        params.departmentId = company.departmentId || '';
        params.projectId = projectId;
        params.projectCode = regcode;
      } else {
        isApplyJoinOrInviteJoin = true;
        params.regFrom = window.localStorage.getItem('RegFrom');
        params.referrer = window.localStorage.getItem('Referrer');
        params.email = email;
        if (isApplyJoin) {
          joinCompanyAction = RegisterController.applyJoinCompany;
          params.projectId = projectId;
          params.unionId = TPParams.unionId;
          params.state = TPParams.state;
          params.tpType = TPParams.tpType;
        } else {
          joinCompanyAction = RegisterController.inviteJoinCompany;
          params.confirmation = confirmation;
          params.isLink = location.href.indexOf('linkInvite') >= 0;
        }
      }
      joinCompanyAction(params).then(data => {
        data.token &&
          onChangeData({
            ...registerData,
            tokenProjectCode: data.token,
          });
        if (isApplyJoinOrInviteJoin) {
          // 接口调用成功后需要删除 cookie RegFrom 和  Referrer
          window.localStorage.removeItem('RegFrom');
          window.localStorage.removeItem('Referrer');
        }
        this.setState({
          loading: false,
        });
        if (location.href.indexOf('/enterpriseRegister.htm?type=editInfo') >= 0 || !!regcode) {
          this.validateEditCard(data);
        } else {
          let actionResult = Config.ActionResult;
          if (data.actionResult == actionResult.success) {
            loginSuc(data.user.encrypeAccount, data.user.encrypePassword);
          } else if (data.actionResult == actionResult.userAccountExists) {
            alert(_l('该手机号已注册，您可以使用已有账号登录'), 3);
          } else if (data.actionResult == actionResult.inviteLinkExpirate) {
            changeStep('inviteLinkExpirate');
          } else if (data.actionResult == actionResult.failInvalidVerifyCode) {
            alert(_l('验证码错误'), 3);
          } else if (data.actionResult == actionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (data.actionResult == actionResult.projectUserExists) {
            setTimeout(() => {
              loginSuc();
            }, 1000);
            alert(_l('您已经是该组织成员，可直接登录'), 3);
          } else if (data.actionResult == actionResult.freeProjectForbid) {
            alert(_l('你加入的组织用户额度不足，请联系该组织管理员'), 3);
          } else if (data.actionResult == actionResult.accountFrequentLoginError) {
            alert(_l('账号已被锁定，请稍后再试'), 3);
          } else if (data.actionResult == actionResult.firstLoginResetPassword || data.actionResult == actionResult.passwordOverdue) {
            alert(_l('密码已过期，请重置后重新操作'), 3);
          } else {
            alert(_l('操作失败'), 3);
          }
        }
      });
    }
  };

  validateEditCard = data => {
    const { registerData } = this.props;
    let { dialCode, password = '', emailOrTel = '' } = registerData;
    const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
    switch (data.joinProjectResult) {
      case 1:
        alert(_l('您已成功加入该组织'), 1, 2000, function () {
          location.href = '/app';
          if (isMingdao) {
            mdAppResponse({
              sessionId: 'register',
              type: 'native',
              settings: { action: 'enterpriseRegister.addSuccess', account: dialCode + emailOrTel, password },
            });
          }
        });
        break;
      case 2:
        alert(_l('您的申请已提交，请等待管理员审批'), 1, 2000, function () {
          location.href = '/personal?type=enterprise';
          if (isMingdao) {
            mdAppResponse({
              sessionId: 'register',
              type: 'native',
              settings: { action: 'enterpriseRegister.addPending', account: dialCode + emailOrTel, password },
            });
          }
        });
        break;
      case 3:
        alert(_l('您已是该组织的成员'), 3);
        break;
      case 5:
        alert(_l('免费模式的组织无法加入，请开通付费版'), 3);
        break;
      default:
        alert(_l('操作失败'), 2);
        break;
    }
  };

  // 名片字段验证
  validateUserCardRequiredField = () => {
    const { registerData, onChangeData } = this.props;
    const { company = {} } = registerData;
    const {
      departmentId = '',
      jobId = '', // 加入网络使用
      workSiteId = '',
      jobNumber = '',
    } = company;
    const { userCard = [] } = registerData;
    const { isMustWorkSite = true, isMustDepartment = true, isMustJobNumber = true, isMustJob = true } = userCard;
    let isRight = true;
    let warnningData = [];
    if (isMustDepartment && !departmentId) {
      warnningData.push({ tipDom: this.departmentId, warnningText: _l('请填写部门') });
      isRight = false;
    }
    if (isMustJob && !jobId) {
      warnningData.push({ tipDom: this.jobId, warnningText: _l('请填写职位') });
      isRight = false;
    }
    if (isMustWorkSite && !workSiteId) {
      warnningData.push({ tipDom: this.workSiteId, warnningText: _l('请填写工作地点') });
      isRight = false;
    }
    if (isMustJobNumber && !jobNumber) {
      warnningData.push({ tipDom: this.jobNumber, warnningText: _l('请填写工号') });
      isRight = false;
    }
    onChangeData({
      ...registerData,
      warnningData,
    });
    return isRight;
  };

  renderCon = () => {
    const { registerData, onChangeData } = this.props;
    const { company = {}, userCard = [], warnningData } = registerData;
    const { loading, focusDiv } = this.state;
    const { isMustWorkSite, isMustDepartment, isMustJobNumber, isMustJob } = userCard;
    const {
      departmentId,
      jobId, // 加入网络使用
      workSiteId,
      jobNumber,
    } = company;
    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          {isMustDepartment && (
            <div
              className={cx('mesDiv current', {
                ...setWarnningData(warnningData, [this.departmentId], focusDiv, departmentId),
              })}
            >
              <div ref={departmentId => (this.departmentId = departmentId)}>
                <DepDropDown
                  {...this.props}
                  onBlur={this.inputOnBlur}
                  onFocus={this.inputOnFocus}
                  onChange={value => {
                    let data = _.filter(registerData.warnningData, it => it.tipDom !== this.departmentId);
                    onChangeData({
                      ...registerData,
                      warnningData: data,
                      company: {
                        ...company,
                        departmentId: value,
                      },
                    });
                  }}
                />
              </div>
              <div className="title">{_l('部门')}</div>
              {_.find(warnningData, it => it.tipDom === this.departmentId) && (
                <div
                  className={cx('warnningTip', {
                    Hidden:
                      (!!warnningData[0] && !_.includes([this.departmentId], warnningData[0].tipDom)) ||
                      warnningData[0].tipDom !== focusDiv,
                  })}
                >
                  {_.find(warnningData, it => it.tipDom === this.departmentId).warnningText}
                </div>
              )}
            </div>
          )}
          {isMustJob && (
            <div
              className={cx('mesDiv current', {
                ...setWarnningData(warnningData, [this.jobId], focusDiv, jobId),
              })}
            >
              <div ref={jobId => (this.jobId = jobId)}>
                <Dropdown
                  showItemTitle
                  value={jobId || undefined}
                  onBlur={this.inputOnBlur}
                  onFocus={this.inputOnFocus}
                  onChange={value => {
                    let data = _.filter(registerData.warnningData, it => it.tipDom !== this.jobId);
                    onChangeData({
                      ...registerData,
                      warnningData: data,
                      company: {
                        ...company,
                        jobId: value,
                      },
                    });
                  }}
                  data={this.state.jobsArr}
                />
              </div>
              <div className="title">{_l('职位')}</div>
              {_.find(warnningData, it => it.tipDom === this.jobId) && (
                <div
                  className={cx('warnningTip', {
                    Hidden:
                      (!!warnningData[0] && !_.includes([this.jobId], warnningData[0].tipDom)) ||
                      warnningData[0].tipDom !== focusDiv,
                  })}
                >
                  {_.find(warnningData, it => it.tipDom === this.jobId).warnningText}
                </div>
              )}
            </div>
          )}
          {isMustWorkSite && (
            <div
              className={cx('mesDiv current', {
                ...setWarnningData(warnningData, [this.workSiteId], focusDiv, workSiteId),
              })}
            >
              <div ref={workSiteId => (this.workSiteId = workSiteId)}>
                <Dropdown
                  showItemTitle
                  value={workSiteId || undefined}
                  onBlur={this.inputOnBlur}
                  onFocus={this.inputOnFocus}
                  onChange={value => {
                    let data = _.filter(registerData.warnningData, it => it.tipDom !== this.workSiteId);
                    onChangeData({
                      ...registerData,
                      warnningData: data,
                      company: {
                        ...company,
                        workSiteId: value,
                      },
                    });
                  }}
                  data={this.state.workSitesArr}
                />
              </div>
              <div className="title">{_l('工作地点')}</div>
              {_.find(warnningData, it => it.tipDom === this.workSiteId) && (
                <div
                  className={cx('warnningTip', {
                    Hidden:
                      (!!warnningData[0] && !_.includes([this.workSiteId], warnningData[0].tipDom)) ||
                      warnningData[0].tipDom !== focusDiv,
                  })}
                >
                  {_.find(warnningData, it => it.tipDom === this.workSiteId).warnningText}
                </div>
              )}
            </div>
          )}
          {isMustJobNumber && (
            <div
              className={cx('mesDiv', {
                ...setWarnningData(warnningData, [this.jobNumber], focusDiv, jobNumber),
              })}
            >
              <input
                type="text"
                className="jobNumber"
                maxLength={'60'}
                autoComplete="off"
                ref={jobNumber => (this.jobNumber = jobNumber)}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                onChange={e => {
                  let data = _.filter(registerData.warnningData, it => it.tipDom !== this.jobNumber);
                  onChangeData({
                    ...registerData,
                    warnningData: data,
                    company: {
                      ...company,
                      jobNumber: e.target.value,
                    },
                  });
                }}
                value={jobNumber}
              />
              <div
                className="title"
                onClick={e => {
                  $(this.jobNumber).focus();
                }}
              >
                {_l('工号')}
              </div>
              {_.find(warnningData, it => it.tipDom === this.jobNumber) && (
                <div
                  className={cx('warnningTip', {
                    Hidden:
                      (!!warnningData[0] && !_.includes([this.jobNumber], warnningData[0].tipDom)) ||
                      warnningData[0].tipDom !== focusDiv,
                  })}
                >
                  {_.find(warnningData, it => it.tipDom === this.jobNumber).warnningText}
                </div>
              )}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { registerData = {} } = this.props;
    const { company = {} } = registerData;
    const { companyName } = company;
    if (this.state.pageLoading) {
      return <LoadDiv className="" style={{ margin: '150px auto' }} />;
    }
    return (
      <React.Fragment>
        {this.state.loading && <div className="loadingLine"></div>}
        <div className="title mTop24 Font20">{companyName || _l('填写名片')}</div>
        <p className="mTop15 Gray_9e Font15">{_l('完善名片信息')}</p>
        {this.renderCon()}
        <span
          className="btnForRegister Hand"
          onClick={() => {
            if (this.state.loading) {
              return;
            }
            this.submitUserCard();
          }}
        >
          {this.state.loading ? _l('提交中...') : _l('完成')}
        </span>
      </React.Fragment>
    );
  }
}
