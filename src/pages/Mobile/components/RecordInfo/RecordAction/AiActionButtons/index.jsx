import React, { Fragment, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { PopupWrapper } from 'ming-ui';
import { MobileConfirmPopup } from 'ming-ui';
import AiActionChatBot from 'src/components/Mingo/modules/AiActionChatBot';
import './index.less';

const BtnCon = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 18px;
  padding: 0 10px;
  box-sizing: border-box;
  overflow: hidden;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-secondary);
  ${({ isSlice }) =>
    isSlice &&
    `flex: 1;
        flex-shrink: 0;
        justify-content: center;
        font-weight: 500;`}
  .icon {
    margin-right: 6px;
    font-size: 20px;
    color: var(--color-text-tertiary);
  }
  .btnText {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 13px;
  }
`;

const AiActionButtons = props => {
  const {
    appId,
    customBtns = [],
    aiActionBtns = [],
    isSlice = false,
    worksheetId,
    recordInfo = {},
    worksheetInfo,
    closeRecordAction = () => {},
  } = props;
  const { rowData } = recordInfo;
  const parseRowData = rowData ? safeParse(rowData) : {};
  const limit = isSlice ? Math.max(0, 2 - customBtns.length) : aiActionBtns.length;
  const buttons = aiActionBtns.slice(0, limit);
  const aiActionBtnRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [currentActionItem, setCurrentActionItem] = useState({});
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const handleClick = btn => {
    setCurrentActionItem(btn);
    aiActionBtnRef?.current?.setActiveButtonId(btn.btnId);
    setVisible(true);
    closeRecordAction?.();
  };

  const handleClearConversation = () => {
    aiActionBtnRef?.current?.handleClearConversation();
    setShowConfirmPopup(false);
  };

  if (md.global.SysSettings.hideAIBasicFun) {
    return null;
  }

  return (
    <Fragment>
      {buttons.map(btn => (
        <BtnCon
          className="aiActionBtnItem"
          key={btn.btnId}
          isSlice={isSlice}
          data-action-btn
          onClick={() => handleClick(btn)}
        >
          {/* {!!btn.iconUrl && !!btn.icon && btn.icon.endsWith('_svg') ? (
            <SvgIcon
              className="InlineBlock icon mRight6"
              addClassName="TxtMiddle"
              url={btn.iconUrl}
              fill={'var(--color-text-title)'}
              size={15}
            />
          ) : (
            <Icon icon={btn.icon || 'custom_actions'} />
          )} */}
          <span className="btnText">{btn.name}</span>
        </BtnCon>
      ))}
      <PopupWrapper
        bodyClassName="heightPopupBody40 aiActionPopupBody"
        title={currentActionItem.name}
        visible={visible}
        headerType="withIcon"
        onClose={() => setVisible(false)}
        onClear={() => setShowConfirmPopup(true)}
      >
        {visible && (
          <AiActionChatBot
            ref={aiActionBtnRef}
            appId={appId}
            buttonId={currentActionItem.btnId}
            worksheetId={worksheetId}
            recordId={parseRowData.rowid}
            recordData={parseRowData}
            conversationId={'test-' + _.get(md, 'global.Account.accountId')}
            showOperateHeader
            worksheetInfo={worksheetInfo}
            buttons={buttons}
            defaultActiveButtonId={currentActionItem.btnId}
            isMobile
            isMobileSkip
            onClose={() => setVisible(false)}
          />
        )}
      </PopupWrapper>
      <MobileConfirmPopup
        title={_l('清空当前会话')}
        subDesc={
          <div className="Font13 textSecondary">
            <div>{_l('清空当前会话后将开始新对话。')}</div>
            <div>{_l('操作不可恢复。执行日志保留，不受该操作影响。')}</div>
          </div>
        }
        visible={showConfirmPopup}
        confirmText={_l('清空')}
        confirmType="delete"
        onConfirm={handleClearConversation}
        onCancel={() => setShowConfirmPopup(false)}
      />
    </Fragment>
  );
};

export default AiActionButtons;
