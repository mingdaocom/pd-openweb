import React, { Fragment, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { Checkbox } from 'ming-ui/antd-components';
import SharePopup from 'mobile/components/SharePopup';
import { buildChatbotShareProps } from './chatbotShare';

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
      background: var(--app-primary-color, var(--color-success));
    }
  }
`;

const MobileShareOperate = ({
  from = 'chatbot',
  appId,
  chatbotId,
  conversationId,
  // 同 PC：分享范围按应用所属组织提交，不传会回退到「当前组织」
  projectId,
  isCharge,
  isSelectAll = false,
  messages,
  maxWidth,
  selectedMessageIds,
  setShareMode = () => {},
  setSelectedMessageIds = () => {},
  setIsSelectAll = () => {},
}) => {
  const selectedCount = Math.floor(selectedMessageIds.length / 2);
  // 勾选态与「再点一次取消」必须同一口径，否则手动勾满后首次点击会退化成「再全选一次」，需点两次才清空
  const allSelected = isSelectAll || selectedMessageIds.length === messages.length;
  const [shareVisible, setShareVisible] = useState(false);
  const selectedUserMessageIds = isSelectAll ? [] : selectedMessageIds.filter(id => id?.length === 24);
  const shareProps = shareVisible
    ? buildChatbotShareProps({
        from,
        appId,
        chatbotId,
        conversationId,
        projectId,
        isCharge,
        messageIds: selectedUserMessageIds,
      })
    : null;

  useEffect(() => {
    if (!isSelectAll && isEmpty(selectedMessageIds)) {
      setShareMode(false);
    }
  }, [isSelectAll, selectedMessageIds, setShareMode]);
  if (!isSelectAll && isEmpty(selectedMessageIds)) {
    return null;
  }

  return (
    <MobileShareOperateWrap>
      <WidthWrap style={{ maxWidth }}>
        <LeftSection>
          <Checkbox
            checked={allSelected}
            onChange={() => {
              if (allSelected) {
                setIsSelectAll(false);
                setSelectedMessageIds([]);
                return;
              }

              setSelectedMessageIds(messages.map(message => message.modelMessageId));
            }}
            className="textPrimary"
          >
            {_l('全选')}
          </Checkbox>
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
          <div className="basicBtn success" onClick={() => setShareVisible(true)}>
            <i className="icon icon-share Font16 mRight6"></i>
            {_l('分享')}
          </div>
        </RightSection>
      </WidthWrap>
      {shareVisible && <SharePopup {...shareProps} onClose={() => setShareVisible(false)} />}
    </MobileShareOperateWrap>
  );
};

export default MobileShareOperate;
