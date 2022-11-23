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
  const { onCancel, onChangePortalSet, sign } = props;
  // const [focusId, setFocusId] = useState(''); //
  const [approvedEmail, setapprovedEmail] = useState({});
  const [refusedEmail, setrefusedEmail] = useState({});
  const [inviteEmail, setinviteEmail] = useState({});
  useEffect(() => {
    let { portalSet = {} } = props;
    let { portalSetModel = {} } = portalSet;
    setapprovedEmail(portalSetModel.approvedEmail);
    setrefusedEmail(portalSetModel.refusedEmail);
    setinviteEmail(portalSetModel.inviteEmail);
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
        let { portalSet = {} } = props;
        let { portalSetModel = {} } = portalSet;
        onChangePortalSet({
          portalSetModel: {
            ...portalSetModel,
            refusedEmail,
            approvedEmail,
            inviteEmail,
          },
        });
        props.onSave();
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
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="1"
          autoSize={{ minRows: 3 }}
          // minHeight={36}
          value={approvedEmail.content}
          onChange={e => {
            setapprovedEmail({
              ...approvedEmail,
              content: e.target.value,
            });
          }}
          // onBlur={e => {
          //   setFocusId(0);
          // }}
          // onFocus={() => {
          //   setFocusId(1);
          // }}
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
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="2"
          autoSize={{ minRows: 3 }}
          // minHeight={36}
          value={refusedEmail.content}
          onChange={e => {
            setrefusedEmail({
              ...refusedEmail,
              content: e.target.value,
            });
          }}
          // onBlur={e => {
          //   setFocusId(0);
          // }}
          // onFocus={() => {
          //   setFocusId(2);
          // }}
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
        />
        <p className="Bold mBottom0 mTop16">{_l('内容')}</p>
        <TextArea
          id="3"
          autoSize={{ minRows: 3 }}
          // minHeight={36}
          value={inviteEmail.content}
          onChange={e => {
            setinviteEmail({
              ...inviteEmail,
              content: e.target.value,
            });
          }}
          // onBlur={e => {
          //   setFocusId(0);
          // }}
          // onFocus={() => {
          //   setFocusId(3);
          // }}
          className="Block mTop10"
        />
      </Wrap>
    </Dialog>
  );
}
