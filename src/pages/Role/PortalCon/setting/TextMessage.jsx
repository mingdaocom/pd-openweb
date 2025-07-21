import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Support } from 'ming-ui';
import project from 'src/api/project';
import MailSettingsDialog from 'src/pages/Role/PortalCon/components/MailSettingsDialog';
import SMSSettingsDialog from 'src/pages/Role/PortalCon/components/SMSSettingsDialog';
import signDialog from 'src/pages/workflow/components/signDialog';

const Wrap = styled.div`
  .warnTxt {
    background: #fdf9dc;
    border-radius: 3px;
    padding: 12px;
    margin-bottom: 24px;
  }
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
    .sign {
      width: 200px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      padding: 0 14px;
      &:hover {
        border: 1px solid #bdbdbd;
      }
      &:focus {
        border: 1px solid #2196f3;
      }
    }
  }
  textarea {
    margin-top: 10px;
    width: 100%;
    background: #ffffff;
    border: 1px solid #e0e0e0;
    padding: 12px;
    border-radius: 3px;
    height: 90px;
    resize: none;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
    border: 1px solid #2196f3;
  }
  .sysBtn {
    line-height: 34px;
    background: #f5f5f5;
    border-radius: 4px;
    color: #2196f3;
    padding: 0 12px;
    display: inline-block;
    cursor: pointer;
    margin-top: 14px;
    font-weight: 500;
    i {
      display: inline-block;
      vertical-align: middle;
    }
    &:hover {
      color: #2182f3 !important;
    }
  }
  .line {
    height: 0px;
    border: 1px solid #000000;
    opacity: 0.08;
  }
`;

export default function TextMessage(props) {
  const { projectId, onChangePortalSet } = props;
  const [sign, setSign] = useState(_.get(props, 'portalSet.portalSetModel.smsSignature')); //签名
  const [emailSignature, setEmailSignature] = useState(_.get(props, 'portalSet.portalSetModel.emailSignature'));
  const [{ showEmailDialog, showTelDialog }, setState] = useSetState({
    showEmailDialog: false,
    showTelDialog: false,
  });
  const [isCertified, setCertified] = useState(null);

  useEffect(() => {
    project.getProjectInfo({ projectId }).then(res => {
      setCertified(res.authType === 2);
    });
  }, []);

  return (
    <Wrap>
      <div className="content">
        {md.global.SysSettings.enableSmsCustomContent && (
          <React.Fragment>
            <h6 className="Font16 Gray Bold mBottom0">
              {_l('短信通知')}
              {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) && (
                <Tooltip
                  title={_l(
                    '短信收费标准：短信%0/条，自动从企业账务中心扣费。70字计一条短信，超过70字以67字每条计费。每个标点、空格、英文字母都算一个字。短信实际发送可能有10-20分钟的延时。',
                    _.get(md, 'global.PriceConfig.SmsPrice'),
                  )}
                >
                  <i className="icon-workflow_help mLeft5 Gray_9e"></i>
                </Tooltip>
              )}
            </h6>
            <div className="mTop6 Gray_9e">
              {_l(
                '注册开启审核后，审核结果(通过、拒绝)会短信告知注册用户;外部门户类型设为私有后再添加用户后也会发送邀请通知。',
              )}
            </div>

            <h6 className="Font16 Gray Bold mBottom0 mTop24">
              {_l('签名')}
              <Tooltip
                title={_l(
                  '签名规范：签名内容长度为2-20个字；由中英文组成，不能纯英文；签名内容必须能辨别所属公司名称或品牌名称；不符合规范的签名平台会清空需重新输入，同时运营商也会拦截。',
                )}
              >
                <i className="icon-workflow_help mLeft5 Gray_9e"></i>
              </Tooltip>
            </h6>
            <div className="mTop6 Gray_9e">
              {_l(
                '此签名适用的短信场景:外部门户用户注册登录、邀请外部用户注册、外部用户审核(通过/拒绝);修改签名必须线下完成实名登记，且一个营业执照只能设置一个签名。',
              )}
              <Support type={3} href="https://help.mingdao.com/workflow/sms-failure" text={_l('收不到短信？')} />
            </div>
            <div className="mTop6 flexRow alignItemsCenter">
              <input
                type="text"
                className="sign"
                placeholder={_l('请输入签名')}
                maxLength={20}
                value={sign}
                disabled={!isCertified}
                onBlur={evt => {
                  const value = evt.currentTarget.value.trim().replace(/[^\u4e00-\u9fa5a-zA-Z ]/g, '');

                  setSign(value);
                  onChangePortalSet({
                    portalSetModel: {
                      ...props.portalSet.portalSetModel,
                      smsSignature: value,
                    },
                  });
                }}
                onChange={evt => setSign(evt.currentTarget.value)}
              />

              {isCertified === false && (
                <span className="ThemeColor3 ThemeHoverColor2 pointer mLeft20" onClick={() => signDialog(projectId)}>
                  {_l('自定义签名')}
                </span>
              )}
            </div>

            <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('内容')}</h6>
            <div className="sysBtn flexRow alignItemsCenter" onClick={() => setState({ showTelDialog: true })}>
              <Icon icon="textsms1" className="Font18 mRight6" /> {_l('短信设置')}
            </div>
            <div className="line mTop24"></div>
          </React.Fragment>
        )}

        <h6 className={cx('Font16 Gray Bold mBottom0', { mTop24: md.global.SysSettings.enableSmsCustomContent })}>
          {_l('邮件通知')}
          {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) && (
            <Tooltip
              title={_l(
                '邮件收费标准：邮件%0/封，自动从企业账务中心扣费。',
                _.get(md, 'global.PriceConfig.EmailPrice'),
              )}
            >
              <i className="icon-workflow_help mLeft5 Gray_9e"></i>
            </Tooltip>
          )}
        </h6>
        <div className="mTop6 Gray_9e">
          {_l(
            '注册开启审核后，审核结果(通过、拒绝)会邮件告知注册用户;外部门户类型设为私有后再添加用户后也会发送邀请通知。',
          )}
        </div>

        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('发件人名称')}</h6>
        <input
          type="text"
          className="sign mTop6"
          placeholder={_l('请输入发件人名称')}
          value={emailSignature}
          maxLength={32}
          onBlur={evt => {
            const value = evt.currentTarget.value.trim();

            setEmailSignature(value);
            onChangePortalSet({
              portalSetModel: {
                ...props.portalSet.portalSetModel,
                emailSignature: value,
              },
            });
          }}
          onChange={evt => setEmailSignature(evt.currentTarget.value)}
        />

        <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('内容')}</h6>
        <div className="sysBtn flexRow alignItemsCenter" onClick={() => setState({ showEmailDialog: true })}>
          <Icon icon="email" className="Font18 mRight6" style={{ marginTop: -3 }} /> {_l('邮件设置')}
        </div>
      </div>

      {showTelDialog && (
        <SMSSettingsDialog {...props} sign={sign} onCancel={() => setState({ showTelDialog: false })} />
      )}

      {showEmailDialog && <MailSettingsDialog {...props} onCancel={() => setState({ showEmailDialog: false })} />}
    </Wrap>
  );
}
