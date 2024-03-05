import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
const { TextArea } = Input;
import cx from 'classnames';
const Wrap = styled.div``;
export default function Con(props) {
  const { onCancel, onChangePortalSet, sign } = props;
  const { portalSetModel = {} } = props.portalSet;
  const { defaultApprovedSms, defaultRefusedSms, defaultInviteSms } = portalSetModel;
  const [focusId, setFocusId] = useState(''); //
  const [approvedSms, setapprovedSms] = useState('');
  const [refusedSms, setrefusedSms] = useState('');
  const [inviteSms, setinviteSms] = useState('');
  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setapprovedSms(portalSetModel.approvedSms);
    setrefusedSms(portalSetModel.refusedSms);
    setinviteSms(portalSetModel.inviteSms);
  }, [props]);
  const getStrip = n => {
    if (n > 70) {
      return Math.ceil(n / 67);
    } else {
      return 1;
    }
  };
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
        let { portalSet = {} } = props;
        let { portalSetModel = {} } = portalSet;
        const { defaultApprovedSms, defaultRefusedSms, defaultInviteSms } = portalSetModel;
        onChangePortalSet({
          portalSetModel: {
            ...portalSetModel,
            refusedSms: refusedSms || defaultRefusedSms,
            approvedSms: approvedSms || defaultApprovedSms,
            inviteSms: inviteSms || defaultInviteSms,
          },
        });
        onCancel();
      }}
      visible={true}
      updateTrigger="false"
    >
      <Wrap>
        <p className=" Bold mBottom0 mTop24">
          {_l('通知：')}
          <span className="Green">{_l('审核通过')}</span>
        </p>
        <TextArea
          id="1"
          autoSize
          minHeight={36}
          value={focusId !== 1 ? `[${sign}]${approvedSms || ''}` : approvedSms || ''}
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
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），短信按 %1 条计费',
            `[${sign}]${approvedSms || ''}`.length,
            getStrip(`[${sign}]${approvedSms || ''}`.length),
          )}
        </p>
        <p className=" Bold mBottom0 mTop24">
          {_l('通知：')}
          <span className="Red">{_l('审核拒绝')}</span>
        </p>
        <TextArea
          id="2"
          autoSize
          minHeight={36}
          value={focusId !== 2 ? `[${sign}]${refusedSms || ''}` : refusedSms || ''}
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
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），短信按 %1 条计费',
            `[${sign}]${refusedSms || ''}`.length,
            getStrip(`[${sign}]${refusedSms || ''}`.length),
          )}
        </p>
        <p className=" Bold mBottom0 mTop24">{_l('邀请用户注册')}</p>
        <TextArea
          autoSize
          id="3"
          minHeight={36}
          value={focusId !== 3 ? `[${sign}]${inviteSms || ''}` : inviteSms || ''}
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
        <p className="Gray_9e mTop10">
          {_l(
            '已输入 %0  个字（含签名），短信按 %1 条计费',
            `[${sign}]${inviteSms || ''}`.length,
            getStrip(`[${sign}]${inviteSms || ''}`.length),
          )}
        </p>
      </Wrap>
    </Dialog>
  );
}
