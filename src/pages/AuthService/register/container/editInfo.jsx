import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, LoadDiv } from 'ming-ui';
import account from 'src/api/account';
import RegisterController from 'src/api/register';
import DepDropDown from 'src/pages/AuthService/components/DepDropDown.jsx';
import { ActionResult } from 'src/pages/AuthService/config.js';
import { getDepartmentInfo, registerSuc } from 'src/pages/AuthService/register/util.js';
import { encrypt, getRequest } from 'src/utils/common';
import { mdAppResponse } from 'src/utils/project';

const Wrap = styled.div`
  .Dropdown--placeholder,
  .ant-select-selection-placeholder,
  .ant-select-selection-item {
    line-height: 52px !important;
  }
`;

export default function (props) {
  const { onChange } = props;
  const [{ workSitesArr, jobsArr, loading, pageLoading, warnList, focusDiv }, setState] = useSetState({
    workSitesArr: [],
    jobsArr: [],
    loading: false,
    pageLoading: true,
    warnList: [],
    focusDiv: '',
  });

  useEffect(() => {
    const { userCard = {} } = props;
    const { isMustWorkSite, isMustDepartment, isMustJobNumber, isMustJob } = userCard;
    if (!isMustWorkSite && !isMustDepartment && !isMustJobNumber && !isMustJob) {
      submitUserCard();
    } else {
      setState({ ...getDepartmentInfo(props), pageLoading: false });
    }
  }, [props]);

  // 提交名片信息
  const submitUserCard = () => {
    if (loading) return;
    const {
      fullName,
      password,
      emailOrTel,
      isApplyJoin, // 主动申请加入网络
      projectId,
      TPParams = {},
      confirmation,
      verifyCode,
      dialCode,
      regcode,
      email,
      company = {},
    } = props;
    const isV = validateUserCardRequiredField();
    if (isV) {
      setState({ loading: true });
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

      if (location.href.match(/enterpriseRegister(\.htm)?\?type=editInfo/i)) {
        const request = getRequest();
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
        data.token && onChange({ tokenProjectCode: data.token });

        if (isApplyJoinOrInviteJoin) {
          // 接口调用成功后需要删除 cookie RegFrom 和  Referrer
          window.localStorage.removeItem('RegFrom');
          window.localStorage.removeItem('Referrer');
        }

        if (location.href.match(/enterpriseRegister(\.htm)?\?type=editInfo/i) || !!regcode) {
          validateEditCard(data);
        } else {
          if (data.actionResult == ActionResult.success) {
            setState({ loading: false });
            registerSuc(props);
          } else if (data.actionResult == ActionResult.userAccountExists) {
            alert(_l('该手机号已注册，您可以使用已有账号登录'), 3);
          } else if (data.actionResult == ActionResult.inviteLinkExpirate) {
            onChange({ step: 'inviteLinkExpirate' });
          } else if (data.actionResult == ActionResult.failInvalidVerifyCode) {
            alert(_l('验证码错误'), 3);
          } else if (data.actionResult == ActionResult.noEfficacyVerifyCode) {
            alert(_l('验证码已经失效，请重新发送'), 3);
          } else if (data.actionResult == ActionResult.projectUserExists) {
            setTimeout(() => registerSuc(props), 1000);
            alert(_l('您已经是该组织成员，可直接登录'), 3);
          } else if (data.actionResult == ActionResult.freeProjectForbid) {
            alert(_l('你加入的组织用户额度不足，请联系该组织管理员'), 3);
          } else if (data.actionResult == ActionResult.accountFrequentLoginError) {
            alert(_l('账号已被锁定，请稍后再试'), 3);
          } else if (
            data.actionResult == ActionResult.firstLoginResetPassword ||
            data.actionResult == ActionResult.passwordOverdue
          ) {
            alert(_l('密码已过期，请重置后重新操作'), 3);
          } else {
            alert(_l('操作失败'), 3);
          }
        }
      });
    }
  };

  const validateEditCard = data => {
    let { dialCode, password = '', emailOrTel = '' } = props;
    if (![1, 2].includes(data.joinProjectResult)) {
      setState({ loading: false });
    }
    switch (data.joinProjectResult) {
      case 1:
        alert(_l('您已成功加入该组织'), 1, 2000, function () {
          setState({ loading: false });
          location.href = '/app';
          if (window.isMingDaoApp) {
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
          setState({ loading: false });
          location.href = '/personal?type=enterprise';
          if (window.isMingDaoApp) {
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
  const validateUserCardRequiredField = () => {
    const { company = {}, userCard = {} } = props;
    const {
      departmentId = '',
      jobId = '', // 加入网络使用
      workSiteId = '',
      jobNumber = '',
    } = company;
    const { isMustWorkSite, isMustDepartment, isMustJobNumber, isMustJob } = userCard;
    let isRight = true;
    let warnList = [];

    if (isMustDepartment && (_.get(userCard, 'departments') || []).length > 0 && !departmentId) {
      warnList.push({ tipDom: 'departmentId', warnTxt: _l('请填写部门') });
      isRight = false;
    }

    if (isMustJob && !jobId) {
      warnList.push({ tipDom: 'jobId', warnTxt: _l('请填写职位') });
      isRight = false;
    }

    if (isMustWorkSite && !workSiteId) {
      warnList.push({ tipDom: 'workSiteId', warnTxt: _l('请填写工作地点') });
      isRight = false;
    }

    if (isMustJobNumber && !jobNumber) {
      warnList.push({ tipDom: 'jobNumber', warnTxt: _l('请填写工号') });
      isRight = false;
    }

    setState({ warnList });
    return isRight;
  };

  const renderClassName = (key, value) => {
    const warn = warnList.find(o => o.tipDom === key);
    return {
      hasValue: !!value || focusDiv === key,
      errorDiv: warn,
      warnDiv: warn && warn.noErr,
      errorDivCu: !!focusDiv && focusDiv === key,
    };
  };

  const renderWarn = key => {
    const warn = warnList.find(o => o.tipDom === key);
    if (!warn) return;
    return <div className={cx('warnTips')}>{warn.warnTxt}</div>;
  };

  const renderCon = () => {
    const { updateCompany = () => {}, company = {}, userCard = {} } = props;
    const { isMustWorkSite, isMustDepartment, isMustJobNumber, isMustJob } = userCard;
    const {
      departmentId,
      jobId, // 加入网络使用
      workSiteId,
      jobNumber,
    } = company;

    return (
      <Wrap>
        <div className="messageBox mTop5">
          {isMustDepartment && (
            <div className={cx('mesDiv hasValue', renderClassName('departmentId', departmentId))}>
              <div ref={departmentId => (departmentId = departmentId)}>
                <DepDropDown
                  {...props}
                  onBlur={() => setState({ focusDiv: '' })}
                  onFocus={() => setState({ focusDiv: 'departmentId' })}
                  onChange={value => {
                    updateCompany({ departmentId: value });
                    setState({ warnList: _.filter(warnList, it => it.tipDom !== 'departmentId') });
                  }}
                />
              </div>
              <div className="title">{_l('部门')}</div>
              {renderWarn('departmentId')}
            </div>
          )}

          {isMustJob && (
            <div className={cx('mesDiv hasValue', renderClassName('jobId', jobId))}>
              <div ref={jobId => (jobId = jobId)}>
                <Dropdown
                  showItemTitle
                  value={jobId || undefined}
                  onBlur={() => setState({ focusDiv: '' })}
                  onFocus={() => setState({ focusDiv: 'jobId' })}
                  onChange={value => {
                    updateCompany({ jobId: value });
                    setState({ warnList: _.filter(warnList, it => it.tipDom !== 'jobId') });
                  }}
                  data={jobsArr}
                />
              </div>
              <div className="title">{_l('职位')}</div>
              {renderWarn('jobId')}
            </div>
          )}

          {isMustWorkSite && (
            <div className={cx('mesDiv hasValue', renderClassName('workSiteId', workSiteId))}>
              <div ref={workSiteId => (workSiteId = workSiteId)}>
                <Dropdown
                  showItemTitle
                  value={workSiteId || undefined}
                  onBlur={() => setState({ focusDiv: '' })}
                  onFocus={() => setState({ focusDiv: 'workSiteId' })}
                  onChange={value => {
                    updateCompany({ workSiteId: value });
                    setState({ warnList: _.filter(warnList, it => it.tipDom !== 'workSiteId') });
                  }}
                  data={workSitesArr}
                />
              </div>
              <div className="title">{_l('工作地点')}</div>
              {renderWarn('workSiteId')}
            </div>
          )}

          {isMustJobNumber && (
            <div className={cx('mesDiv', renderClassName('jobNumber', jobNumber))}>
              <input
                type="text"
                className="jobNumber"
                maxLength={'60'}
                autoComplete="off"
                ref={jobNumber => (jobNumber = jobNumber)}
                onBlur={() => setState({ focusDiv: '' })}
                onFocus={() => setState({ focusDiv: 'jobNumber' })}
                onChange={e => {
                  updateCompany({ jobNumber: e.target.value });
                  setState({ warnList: _.filter(warnList, it => it.tipDom !== 'jobNumber') });
                }}
                value={jobNumber}
              />
              <div className="title" onClick={e => setState({ focusDiv: 'jobNumber' })}>
                {_l('工号')}
              </div>
              {renderWarn('jobNumber')}
            </div>
          )}
        </div>
      </Wrap>
    );
  };

  const { company = {} } = props;
  const { companyName } = company;

  if (pageLoading) {
    return <LoadDiv className="" style={{ margin: '150px auto' }} />;
  }

  return (
    <React.Fragment>
      {loading && <div className="loadingLine"></div>}
      <div className="title mTop24 Font20">{companyName || _l('填写名片')}</div>
      <p className="mTop15 Gray_9e Font15">{_l('完善名片信息')}</p>
      {renderCon()}
      <span
        className="btnForRegister Hand"
        onClick={() => {
          if (loading) return;
          submitUserCard();
        }}
      >
        {loading ? _l('提交中...') : _l('完成')}
      </span>
    </React.Fragment>
  );
}
