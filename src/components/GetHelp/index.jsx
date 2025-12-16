import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import styled from 'styled-components';
import { Button, Dialog, FunctionWrap, LoadDiv, MobilePersonalInfo, Textarea, UserName } from 'ming-ui';
import chatbotApi from 'src/pages/workflow/apiV2/chatbot';
import { browserIsMobile } from 'src/utils/common';

const PopupWrapper = styled.div`
  padding: 16px;
  .footerBtns {
    display: flex;
    gap: 5px;
    margin-top: 20px;
    .cancelBtn {
      background: #fff !important;
      border: 1px solid #e0e0e0;
      color: #757575;
      &:hover {
        color: #1677ff;
        border-color: #1677ff;
      }
    }
  }
`;

function GetHelp(props) {
  const { onClose, type = 1, chatbotId, messageId, instanceId, flowNodeId } = props; //type: 1: 用户反馈 2: 管理员反馈
  const [loading, setLoading] = useState(type === 1);
  const [owner, setOwner] = useState({});
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [personalInfoVisible, setPersonalInfoVisible] = useState(false);
  const isMobile = browserIsMobile();
  const textareaRef = useRef();

  const textInfo = {
    1: { title: _l('反馈'), desc: _l('描述使用过程中遇到的问题，反馈通知给流程拥有者'), okText: _l('发送') },
    2: {
      title: _l('反馈给平台'),
      desc: _l(
        '描述使用过程中遇到的问题，提交反馈至平台，会自动收集提问、AI 回答、工具请求参数，不会收集具体业务数据。',
      ),
      okText: _l('提交'),
    },
  };

  useEffect(() => {
    onInit();
  }, []);

  const onInit = async () => {
    if (type === 1) {
      const res = await chatbotApi.getOwner({ chatbotId });
      res && setOwner(res);
      setLoading(false);
    }
    setTimeout(() => {
      textareaRef?.current?.focus();
    }, 100);
  };

  const onSubmit = () => {
    setSubmitting(true);
    const opinion = content.trim();
    chatbotApi
      .feedback(type === 1 ? { chatbotId, messageId, opinion } : { chatbotId, instanceId, flowNodeId, opinion })
      .then(res => {
        setSubmitting(false);
        if (res) {
          alert(_l('反馈成功'));
          onClose();
        }
      })
      .catch(() => setSubmitting(false));
  };

  const renderContent = () => {
    if (loading) {
      return <LoadDiv />;
    }

    return (
      <Fragment>
        <div className="mBottom20">
          <span>{textInfo[type].desc}</span>
          {type === 1 && (
            <span onClick={() => isMobile && setPersonalInfoVisible(true)}>
              <UserName
                disabled={isMobile || md.global.Account.accountId?.startsWith('a#')}
                className="mLeft5"
                projectId={owner.companyId}
                user={{ userName: `@${owner.fullName}`, accountId: owner.accountId }}
                chatButton={location.href.indexOf('embed/chatbot') === 0}
              />
            </span>
          )}
          {isMobile && personalInfoVisible && (
            <MobilePersonalInfo
              visible
              accountId={owner.accountId}
              projectId={owner.companyId}
              onClose={() => setPersonalInfoVisible(false)}
            />
          )}
        </div>
        <Textarea
          {...(isMobile ? { minHeight: 370, maxHeight: 370 } : { minHeight: 110, maxHeight: 200 })}
          placeholder={_l('请输入描述')}
          value={content}
          onChange={value => setContent(value)}
          manualRef={con => (textareaRef.current = con)}
        />
      </Fragment>
    );
  };

  return isMobile ? (
    <Popup visible className="mobileModal topRadius" onMaskClick={onClose}>
      <PopupWrapper>
        <div className="Font17 bold mTop8 mBottom12">{textInfo[type].title}</div>
        {renderContent()}
        <div className="footerBtns">
          <Button type="link" radius className="flex cancelBtn" onClick={onClose}>
            {_l('取消')}
          </Button>
          <Button className="flex" radius onClick={onSubmit} disabled={!content.trim() || submitting}>
            {textInfo[type].okText}
          </Button>
        </div>
      </PopupWrapper>
    </Popup>
  ) : (
    <Dialog
      visible
      width={660}
      title={textInfo[type].title}
      showCancel={false}
      onCancel={onClose}
      okText={textInfo[type].okText}
      okDisabled={!content.trim() || submitting}
      onOk={onSubmit}
    >
      {renderContent()}
    </Dialog>
  );
}

export default props => FunctionWrap(GetHelp, { ...props });
