import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import { Input } from 'antd';
const { TextArea } = Input;
import cx from 'classnames';
const Wrap = styled.div`
  .line {
    border: 1px solid #000000;
    opacity: 0.08;
  }
`;
export default function Con(props) {
  const { onCancel, onChangePortalSet } = props;
  const { portalSetModel = {} } = props.portalSet;
  const { defaultApprovedEmail, defaultRefusedEmail, defaultInviteEmail } = portalSetModel;
  const [approvedEmail, setapprovedEmail] = useState({});
  const [refusedEmail, setrefusedEmail] = useState({});
  const [inviteEmail, setinviteEmail] = useState({});
  const [portalSet, setPortalSet] = useState({});
  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setapprovedEmail(portalSetModel.approvedEmail);
    setrefusedEmail(portalSetModel.refusedEmail);
    setinviteEmail(portalSetModel.inviteEmail);
    setPortalSet(portalSet);
  }, [props]);

  return (
    <Dialog
      title={_l('邮件通知内容设置')}
      className={cx('')}
      width={640}
      headerClass=""
      bodyClass=""
      okText={_l('保存')}
      cancelText={_l('取消')}
      onCancel={onCancel}
      onOk={() => {
        let { portalSetModel = {} } = portalSet;
        onChangePortalSet({
          portalSetModel: {
            ...portalSetModel,
            refusedEmail: {
              content: refusedEmail.content || defaultRefusedEmail.content,
              title: refusedEmail.title || defaultRefusedEmail.title,
            },
            approvedEmail: {
              content: approvedEmail.content || defaultApprovedEmail.content,
              title: approvedEmail.title || defaultApprovedEmail.title,
            },
            inviteEmail: {
              content: inviteEmail.content || defaultInviteEmail.content,
              title: inviteEmail.title || defaultInviteEmail.title,
            },
          },
        });
        onCancel();
      }}
      visible={true}
      updateTrigger="false"
    >
      <Wrap>
        <p className="Font16 Bold mBottom0 mTop16">
          <span className="Green">{_l('审核通过')}</span>
        </p>
        <p className="Bold mBottom0 mTop16">{_l('标题')}</p>
        <Input
          value={approvedEmail.title}
          className="mTop10"
          onChange={e => {
            setapprovedEmail({
              ...approvedEmail,
              title: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setapprovedEmail({
                ...approvedEmail,
                title: defaultApprovedEmail.title,
              });
            }
          }}
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="1"
          autoSize={{ minRows: 3 }}
          value={approvedEmail.content}
          onChange={e => {
            setapprovedEmail({
              ...approvedEmail,
              content: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setapprovedEmail({
                ...approvedEmail,
                content: defaultApprovedEmail.content,
              });
            }
          }}
          className="Block mTop10"
        />
        <p className="Font16 Bold mBottom0 mTop32">
          <span className="Red">{_l('审核拒绝')}</span>
        </p>
        <p className="Bold mBottom0 mTop16">{_l('标题')}</p>
        <Input
          value={refusedEmail.title}
          className="mTop10"
          onChange={e => {
            setrefusedEmail({
              ...refusedEmail,
              title: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setrefusedEmail({
                ...refusedEmail,
                title: defaultRefusedEmail.title,
              });
            }
          }}
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="2"
          autoSize={{ minRows: 3 }}
          value={refusedEmail.content}
          onChange={e => {
            setrefusedEmail({
              ...refusedEmail,
              content: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setrefusedEmail({
                ...refusedEmail,
                content: defaultRefusedEmail.content,
              });
            }
          }}
          className="Block mTop10"
        />
        <p className="Font16 Bold mBottom0 mTop32">
          <span className="">{_l('邀请用户注册')}</span>
        </p>
        <p className="Bold mBottom0 mTop16">{_l('标题')}</p>
        <Input
          value={inviteEmail.title}
          className="mTop10"
          onChange={e => {
            setinviteEmail({
              ...inviteEmail,
              title: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setinviteEmail({
                ...inviteEmail,
                title: defaultInviteEmail.title,
              });
            }
          }}
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="3"
          autoSize={{ minRows: 3 }}
          value={inviteEmail.content}
          onChange={e => {
            setinviteEmail({
              ...inviteEmail,
              content: e.target.value,
            });
          }}
          onBlur={e => {
            if (!e.target.value.trim()) {
              setinviteEmail({
                ...inviteEmail,
                content: defaultInviteEmail.content,
              });
            }
          }}
          className="Block mTop10"
        />
      </Wrap>
    </Dialog>
  );
}
