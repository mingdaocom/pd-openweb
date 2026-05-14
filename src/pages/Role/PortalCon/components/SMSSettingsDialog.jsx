import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Checkbox, Dialog } from 'ming-ui';

const { TextArea } = Input;

const Wrap = styled.div``;

const SmsTip = styled.div`
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
`;

const CheckRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  flex-wrap: wrap;
  gap: 8px;
  .countText {
    color: var(--color-text-tertiary);
    font-size: 12px;
    margin-left: auto;
  }
`;

function wrapCn(name) {
  return `【${name}】`;
}

function smsSignCore(sign) {
  const s = String(sign || '').trim();
  const m = s.match(/^【(.*)】$/);
  return m ? m[1].trim() : s;
}

function containsURL(content) {
  return /((http|https|ftp):\/\/|w{3}\.)[^\s|<|\u4E00-\u9FA5]+/i.test(String(content || ''));
}

/** 含链接：【明道云】（自定义签名）；自定义签名为明道云时不再重复括号段。不含链接：【自定义签名】 */
function smsSignaturePrefix(smsContainsLink, sign) {
  const core = smsSignCore(sign);
  const platform = _l('明道云');
  const isPlatformCore = !core || core === _l('明道云') || core === platform;

  if (smsContainsLink) {
    if (isPlatformCore) {
      return wrapCn(platform);
    }

    return `${wrapCn(platform)}（${core}）`;
  }

  return wrapCn(core || platform);
}

/** 国内明道云 SaaS；私有部署、海外等环境为 false */
function getIsMingdaoSaas() {
  return !window.platformENV.isOverseas && !window.platformENV.isLocal;
}

export default function Con(props) {
  const { onCancel, onChangePortalSet, sign } = props;
  const { portalSetModel = {} } = props.portalSet;
  const { defaultApprovedSms, defaultRefusedSms, defaultInviteSms } = portalSetModel;
  const isMingdaoSaas = getIsMingdaoSaas();
  const [focusId, setFocusId] = useState('');
  const [approvedSms, setapprovedSms] = useState('');
  const [refusedSms, setrefusedSms] = useState('');
  const [inviteSms, setinviteSms] = useState('');
  const [approvedSmsContainsLink, setApprovedSmsContainsLink] = useState(() =>
    isMingdaoSaas ? true : false,
  );
  const [refusedSmsContainsLink, setRefusedSmsContainsLink] = useState(() =>
    isMingdaoSaas ? true : false,
  );
  const [inviteSmsContainsLink, setInviteSmsContainsLink] = useState(() =>
    isMingdaoSaas ? true : false,
  );

  useEffect(() => {
    const { portalSet = {} } = props;
    const model = portalSet.portalSetModel || {};
    setapprovedSms(model.approvedSms);
    setrefusedSms(model.refusedSms);
    setinviteSms(model.inviteSms);
    setApprovedSmsContainsLink(
      isMingdaoSaas ? model.approvedSmsContainsLink !== false : false,
    );
    setRefusedSmsContainsLink(
      isMingdaoSaas ? model.refusedSmsContainsLink !== false : false,
    );
    setInviteSmsContainsLink(
      isMingdaoSaas ? model.inviteSmsContainsLink !== false : false,
    );
  }, [props, isMingdaoSaas]);

  const getStrip = n => {
    if (n > 70) {
      return Math.ceil(n / 67);
    }

    return 1;
  };

  const effectiveApprovedLink = isMingdaoSaas && approvedSmsContainsLink;
  const effectiveRefusedLink = isMingdaoSaas && refusedSmsContainsLink;
  const effectiveInviteLink = isMingdaoSaas && inviteSmsContainsLink;
  const prefixApproved = smsSignaturePrefix(effectiveApprovedLink, sign);
  const prefixRefused = smsSignaturePrefix(effectiveRefusedLink, sign);
  const prefixInvite = smsSignaturePrefix(effectiveInviteLink, sign);
  const fullApproved = `${prefixApproved}${approvedSms || ''}`;
  const fullRefused = `${prefixRefused}${refusedSms || ''}`;
  const fullInvite = `${prefixInvite}${inviteSms || ''}`;

  return (
    <Dialog
      title={_l('短信通知内容设置')}
      className={cx('')}
      width={640}
      headerClass=""
      bodyClass=""
      okText={_l('保存')}
      cancelText={_l('取消')}
      onCancel={onCancel}
      onOk={() => {
        const { portalSet = {} } = props;
        const model = portalSet.portalSetModel || {};
        const { defaultApprovedSms: dA, defaultRefusedSms: dR, defaultInviteSms: dI } = model;
        const hasUncheckedLinkContent =
          isMingdaoSaas &&
          ((!approvedSmsContainsLink && containsURL(approvedSms || dA)) ||
            (!refusedSmsContainsLink && containsURL(refusedSms || dR)) ||
            (!inviteSmsContainsLink && containsURL(inviteSms || dI)));

        if (hasUncheckedLinkContent) {
          alert(_l('未勾选“包含链接”时，短信内容不能包含链接，请删除链接后再保存。'), 2);
          return;
        }

        onChangePortalSet({
          portalSetModel: {
            ...model,
            refusedSms: refusedSms || dR,
            approvedSms: approvedSms || dA,
            inviteSms: inviteSms || dI,
            approvedSmsContainsLink: isMingdaoSaas ? approvedSmsContainsLink : false,
            refusedSmsContainsLink: isMingdaoSaas ? refusedSmsContainsLink : false,
            inviteSmsContainsLink: isMingdaoSaas ? inviteSmsContainsLink : false,
          },
        });
        onCancel();
      }}
      visible={true}
      updateTrigger="false"
    >
      <Wrap>
        {isMingdaoSaas && (
          <SmsTip>
            {_l(
              '短信内容包含链接：短信将只能使用签名 【明道云】（不可删除）。 短信内容不包含链接：可使用自定义签名；可在短信里描述外部门户的打开路径替代链接地址。',
            )}
          </SmsTip>
        )}
        <p className=" Bold mBottom0 mTop16">
          {_l('通知：')}
          <span className="Green">{_l('审核通过')}</span>
        </p>
        <TextArea
          id="1"
          autoSize
          minHeight={36}
          value={focusId !== 1 ? fullApproved : approvedSms || ''}
          onChange={e => {
            setapprovedSms(e.target.value);
          }}
          onBlur={e => {
            setFocusId(0);
            if (!e.target.value.trim()) {
              setapprovedSms(defaultApprovedSms);
            }
          }}
          onFocus={() => {
            setFocusId(1);
          }}
          className="Block mTop10"
        />
        <CheckRow>
          {isMingdaoSaas && (
            <Checkbox
              text={_l('包含链接')}
              checked={approvedSmsContainsLink}
              onClick={cur => setApprovedSmsContainsLink(!cur)}
            />
          )}
          <span className="countText">
            {_l('已输入 %0  个字（含签名），短信按 %1 条计费', fullApproved.length, getStrip(fullApproved.length))}
          </span>
        </CheckRow>
        <p className=" Bold mBottom0 mTop24">
          {_l('通知：')}
          <span className="Red">{_l('审核拒绝')}</span>
        </p>
        <TextArea
          id="2"
          autoSize
          minHeight={36}
          value={focusId !== 2 ? fullRefused : refusedSms || ''}
          onChange={e => {
            setrefusedSms(e.target.value);
          }}
          onBlur={e => {
            setFocusId(0);
            if (!e.target.value.trim()) {
              setrefusedSms(defaultRefusedSms);
            }
          }}
          onFocus={() => {
            setFocusId(2);
          }}
          className="Block mTop10"
        />
        <CheckRow>
          {isMingdaoSaas && (
            <Checkbox
              text={_l('包含链接')}
              checked={refusedSmsContainsLink}
              onClick={cur => setRefusedSmsContainsLink(!cur)}
            />
          )}
          <span className="countText">
            {_l('已输入 %0  个字（含签名），短信按 %1 条计费', fullRefused.length, getStrip(fullRefused.length))}
          </span>
        </CheckRow>
        <p className=" Bold mBottom0 mTop24">{_l('邀请用户注册')}</p>
        <TextArea
          autoSize
          id="3"
          minHeight={36}
          value={focusId !== 3 ? fullInvite : inviteSms || ''}
          onChange={e => {
            setinviteSms(e.target.value);
          }}
          onBlur={e => {
            setFocusId(0);
            if (!e.target.value.trim()) {
              setinviteSms(defaultInviteSms);
            }
          }}
          onFocus={() => {
            setFocusId(3);
          }}
          className="Block mTop10"
        />
        <CheckRow>
          {isMingdaoSaas && (
            <Checkbox
              text={_l('包含链接')}
              checked={inviteSmsContainsLink}
              onClick={cur => setInviteSmsContainsLink(!cur)}
            />
          )}
          <span className="countText">
            {_l('已输入 %0  个字（含签名），短信按 %1 条计费', fullInvite.length, getStrip(fullInvite.length))}
          </span>
        </CheckRow>
      </Wrap>
    </Dialog>
  );
}
