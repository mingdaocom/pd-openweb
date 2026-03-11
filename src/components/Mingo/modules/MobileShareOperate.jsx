import React, { Fragment, useEffect, useState } from 'react';
import copy from 'copy-to-clipboard';
import { isEmpty, isEqual } from 'lodash';
import styled from 'styled-components';
import { Checkbox, MobileConfirmPopup } from 'ming-ui';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import { getPublicShare, updatePublicShareStatus } from 'src/pages/worksheet/components/Share/controller';
import { compatibleMDJS } from 'src/utils/project';

const MobileShareOperateWrap = styled.div`
  margin-bottom: -12px;
  width: 100%;
  height: 68px;
  background: var(--color-background-primary);
  border-top: 1px solid var(--color-border-primary);
`;

const WidthWrap = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  margin: 0 auto;
  padding: 0 24px;
  justify-content: space-between;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Divider = styled.div`
  width: 1px;
  height: 16px;
  background: var(--color-border-primary);
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  .basicBtn {
    width: 70px;
    height: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    &.cancel {
      color: var(--color-text-primary);
    }
    &.success {
      color: var(--color-white);
      background: var(--color-success);
    }
  }
`;

const MobileShareOperate = ({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  isSelectAll = false,
  messages,
  maxWidth,
  selectedMessageIds,
  setShareMode = () => {},
  setSelectedMessageIds = () => {},
  setIsSelectAll = () => {},
}) => {
  const selectedCount = Math.floor(selectedMessageIds.length / 2);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const getConversationIdForShare = async () => {
    const data = await chatbotAjax.addShareConversation({
      chatbotId,
      conversationId,
      userMessageIds: selectedMessageIds.filter(id => id?.length === 24),
    });

    return data?.conversationId;
  };

  const handleShare = async () => {
    try {
      let finalConversationId = conversationId;

      if (!isSelectAll) {
        finalConversationId = await getConversationIdForShare();
        if (!finalConversationId) {
          alert(_l('获取会话失败'), 2);
          return;
        }
      }

      const sourceId = `${chatbotId}|${finalConversationId}`;
      let { shareLink } = await getPublicShare({
        from,
        appId,
        sourceId,
      });
      // 未开启分享
      if (!shareLink) {
        const res = await updatePublicShareStatus({
          from,
          appId,
          sourceId,
          isPublic: true,
        });

        if (!res?.shareLink) {
          alert(_l('分享失败'), 2);
          return;
        }

        shareLink = res.shareLink;
      }
      setConfirmVisible(true);
      setShareUrl(shareLink);
    } catch (error) {
      console.log(error);
    }
  };

  const copyShareUrl = () => {
    if (window.isMingDaoApp) {
      compatibleMDJS('shareContent', {
        type: 1,
        title: _l('链接已复制'),
        url: shareUrl,
      });
    } else {
      copy(shareUrl);
      alert(_l('链接已复制'));
    }
  };

  useEffect(() => {
    if (!isSelectAll && isEmpty(selectedMessageIds)) {
      setShareMode(false);
    }
  }, [isSelectAll, selectedMessageIds]);
  if (!isSelectAll && isEmpty(selectedMessageIds)) {
    return null;
  }

  return (
    <MobileShareOperateWrap>
      <WidthWrap style={{ maxWidth }}>
        <LeftSection>
          <Checkbox
            text={_l('全选')}
            checked={isSelectAll || selectedMessageIds.length === messages.length}
            onClick={() => {
              if (isSelectAll) {
                setIsSelectAll(false);
              } else {
                if (
                  isEqual(
                    selectedMessageIds,
                    messages.map(message => message.modelMessageId),
                  )
                ) {
                  setSelectedMessageIds([]);
                } else {
                  setSelectedMessageIds(messages.map(message => message.modelMessageId));
                }
              }
            }}
            className="textPrimary"
          />
          {!isSelectAll && !!selectedCount && (
            <Fragment>
              <Divider />
              <span className="Font13 textPrimary">{_l('已选择 %0 组对话', selectedCount)}</span>
            </Fragment>
          )}
        </LeftSection>
        <RightSection>
          <div
            className="basicBtn cancel"
            onClick={() => {
              setSelectedMessageIds([]);
              setShareMode(false);
            }}
          >
            {_l('取消')}
          </div>
          <div className="basicBtn success" onClick={handleShare}>
            <i className="icon icon-share Font16 mRight6"></i>
            {_l('分享')}
          </div>
        </RightSection>
      </WidthWrap>
      <MobileConfirmPopup
        visible={confirmVisible}
        title={_l('对外公开分享')}
        subDesc={_l('获得链接的所有人都可以查看')}
        confirmText={_l('分享')}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          copyShareUrl();
        }}
      />
    </MobileShareOperateWrap>
  );
};

export default MobileShareOperate;
