import React, { useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, PriceTip } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import SmsSignSet from 'src/components/SmsSignSet';
import MailSettingsDialog from 'src/pages/Role/PortalCon/components/MailSettingsDialog';
import SMSSettingsDialog from 'src/pages/Role/PortalCon/components/SMSSettingsDialog';

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
        border: 1px solid #1677ff;
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
    border: 1px solid #1677ff;
  }
  .sysBtn {
    line-height: 34px;
    background: #f5f5f5;
    border-radius: 4px;
    color: #1677ff;
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
  const { projectId, onChangePortalSet, portalSet } = props;
  const [sign, setSign] = useState(_.get(portalSet, 'portalSetModel.smsSignature')); //签名
  const [emailSignature, setEmailSignature] = useState(_.get(portalSet, 'portalSetModel.emailSignature'));
  const [{ showEmailDialog, showTelDialog }, setState] = useSetState({
    showEmailDialog: false,
    showTelDialog: false,
  });

  return (
    <Wrap>
      <div className="content">
        {(!md.global?.Config?.IsLocal || md.global?.SysSettings?.enableSmsCustomContent) && (
          <React.Fragment>
            <h6 className="Font16 Gray Bold mBottom0">
              {_l('短信通知')}
              {(!_.get(md, 'global.Config.IsLocal') || _.get(md, 'global.Config.IsPlatformLocal')) && (
                <Tooltip title={<PriceTip text={_l('短信费用自动从组织信用点中扣除')} />}>
                  <i className="icon-help mLeft5 Gray_9e"></i>
                </Tooltip>
              )}
            </h6>
            <div className="mTop6 Gray_9e">
              {_l(
                '注册开启审核后，审核结果(通过、拒绝)会短信告知注册用户;外部门户类型设为私有后再添加用户后也会发送邀请通知。',
              )}
            </div>

            <h6 className="Font16 Gray Bold mBottom0 mTop24">
              {_l('短信签名')}
              <Tooltip
                title={_l('此签名适用的短信场景:外部门户用户注册登录、邀请外部用户注册、外部用户审核(通过/拒绝)')}
              >
                <i className="icon-help mLeft5 Gray_9e"></i>
              </Tooltip>
            </h6>
            <div className="mTop14">
              <SmsSignSet
                projectId={projectId}
                sign={sign}
                onOk={value => {
                  setSign(value);
                  onChangePortalSet({ portalSetModel: { ...props.portalSet.portalSetModel, smsSignature: value } });
                }}
                suffix={_.get(portalSet, 'portalSetModel.customizeName')}
              />
            </div>

            <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('短信内容')}</h6>
            <div className="sysBtn flexRow alignItemsCenter" onClick={() => setState({ showTelDialog: true })}>
              <Icon icon="textsms" className="Font18 mRight6" /> {_l('短信设置')}
            </div>
            <div className="line mTop24"></div>
          </React.Fragment>
        )}

        <h6 className={cx('Font16 Gray Bold mBottom0', { mTop24: md.global.SysSettings.enableSmsCustomContent })}>
          {_l('邮件通知')}
          {md.global.Config.IsPlatformLocal && (
            <Tooltip title={<PriceTip text={_l('邮件费用自动从组织信用点中扣除')} />}>
              <i className="icon-help mLeft5 Gray_9e"></i>
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
