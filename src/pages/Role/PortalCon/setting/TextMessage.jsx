import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, PriceTip } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import smsApi from 'src/api/sms';
import SmsSignSet from 'src/components/SmsSignSet';
import MailSettingsDialog from 'src/pages/Role/PortalCon/components/MailSettingsDialog';
import SMSSettingsDialog from 'src/pages/Role/PortalCon/components/SMSSettingsDialog';

const Wrap = styled.div`
  .warnTxt {
    background: var(--color-yellow-black);
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
      background: var(--color-background-primary);
      border: 1px solid var(--color-border-secondary);
      border-radius: 3px;
      padding: 0 14px;
      &:hover {
        border: 1px solid var(--color-text-disabled);
      }
      &:focus {
        border: 1px solid var(--color-primary);
      }
    }
  }
  textarea {
    margin-top: 10px;
    width: 100%;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    padding: 12px;
    border-radius: 3px;
    height: 90px;
    resize: none;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: none;
    border: 1px solid var(--color-primary);
  }
  .sysBtn {
    line-height: 34px;
    background: var(--color-background-secondary);
    border-radius: 4px;
    color: var(--color-primary);
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
      color: var(--color-link-hover) !important;
    }
  }
  .line {
    height: 0px;
    border: 1px solid #000000;
    opacity: 0.08;
  }

  .smsServiceCard {
    background: var(--color-background-tertiary);
    padding: 8px 12px;
    border-radius: 3px;
    margin-top: 12px;
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
  const [twilioLoading, setTwilioLoading] = useState(true);
  const [twilioBaseInfo, setTwilioBaseInfo] = useState({});

  useEffect(() => {
    if (window.platformENV.isOverseas && window.platformENV.isPlatform) {
      smsApi
        .getTwilioProviderBaseInfo({ projectId })
        .then(res => {
          setTwilioBaseInfo(res);
        })
        .finally(() => setTwilioLoading(false));
    }
  }, [projectId]);

  return (
    <Wrap>
      <div className="content">
        {md.global?.SysSettings?.enableSmsCustomContent && (
          <>
            <Fragment>
              <h6 className="Font16 textPrimary Bold mBottom0">
                {_l('短信通知')}
                {window.platformENV.isPlatform && (
                  <Tooltip title={<PriceTip text={_l('短信费用自动从组织信用点中扣除')} />}>
                    <i className="icon-help mLeft5 textTertiary"></i>
                  </Tooltip>
                )}
              </h6>
              <div className="mTop6 textTertiary">
                {_l(
                  '注册开启审核后，审核结果(通过、拒绝)会短信告知注册用户;外部门户类型设为私有后再添加用户后也会发送邀请通知。',
                )}
              </div>

              {window.platformENV.isOverseas &&
                window.platformENV.isPlatform &&
                (twilioLoading ? (
                  <LoadDiv />
                ) : (
                  <div className="smsServiceCard">
                    {twilioBaseInfo?.name ? (
                      <Fragment>
                        <span className="textTertiary">{_l('已接入国际短信')}</span>
                        <span className="Green mLeft4">{twilioBaseInfo?.name}</span>
                      </Fragment>
                    ) : (
                      <Fragment>
                        <span className="textTertiary">{_l('未配置国际短信服务,无法送达港澳台/国际地区，请前往')}</span>
                        <span
                          className="colorPrimary pointer"
                          onClick={() => (location.href = `/admin/weixin/${projectId}`)}
                        >
                          {_l('组织后台')}
                        </span>
                        <span className="textTertiary">{_l('进行配置')}</span>
                      </Fragment>
                    )}
                  </div>
                ))}

              <h6 className="Font16 textPrimary Bold mBottom0 mTop24">
                {_l('短信签名')}
                <Tooltip
                  title={
                    <div>
                      <div>
                        {_l(
                          '短信签名是附加在短信内容前面的标识，仅适用于中国大陆区，默认跟随平台签名；发送港澳台/国际短信无需配置短信签名',
                        )}
                      </div>
                      <div>
                        {_l('此签名适用的短信场景:外部门户用户注册登录、邀请外部用户注册、外部用户审核(通过/拒绝)')}
                      </div>
                    </div>
                  }
                >
                  <i className="icon-help mLeft5 textTertiary"></i>
                </Tooltip>
              </h6>
              <div className="mTop6 textTertiary">{_l('(仅用于中国大陆地区)')}</div>
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
            </Fragment>

            <h6 className="Font16 textPrimary Bold mBottom0 mTop24">{_l('短信内容')}</h6>
            <div className="sysBtn flexRow alignItemsCenter" onClick={() => setState({ showTelDialog: true })}>
              <Icon icon="textsms" className="Font18 mRight6" /> {_l('短信设置')}
            </div>
            <div className="line mTop24"></div>
          </>
        )}

        <h6
          className={cx('Font16 textPrimary Bold mBottom0', { mTop24: md.global.SysSettings.enableSmsCustomContent })}
        >
          {_l('邮件通知')}
          {window.platformENV.isPlatform && (
            <Tooltip title={<PriceTip text={_l('邮件费用自动从组织信用点中扣除')} />}>
              <i className="icon-help mLeft5 textTertiary"></i>
            </Tooltip>
          )}
        </h6>
        <div className="mTop6 textTertiary">
          {_l(
            '注册开启审核后，审核结果(通过、拒绝)会邮件告知注册用户;外部门户类型设为私有后再添加用户后也会发送邀请通知。',
          )}
        </div>

        <h6 className="Font16 textPrimary Bold mBottom0 mTop24">{_l('发件人名称')}</h6>
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

        <h6 className="Font16 textPrimary Bold mBottom0 mTop24">{_l('内容')}</h6>
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
