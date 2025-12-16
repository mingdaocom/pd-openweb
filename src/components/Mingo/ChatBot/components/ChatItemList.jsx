import React, { Fragment, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, Input, Menu, MenuItem, MobileConfirmPopup, PopupWrapper, Skeleton } from 'ming-ui';
import ScrollView from 'ming-ui/components/ScrollView';
import { getPublicShare, updatePublicShareStatus } from 'src/pages/worksheet/components/Share/controller';
import { browserIsMobile } from 'src/utils/common';
import { compatibleMDJS } from 'src/utils/project';
import 'rc-trigger/assets/index.css';

const Con = styled(ScrollView)`
  width: 100%;
  height: 100%;
  background: #fff;
  .header {
    height: 50px;
    padding: 0 10px 0 16px;
    .title {
      font-size: 18px;
      font-weight: bold;
    }
    .closeIcon {
      width: 30px;
      height: 30px;
      font-size: 18px;
      color: #757575;
    }
  }
  .chatHistoryList {
    padding: 0 10px;
    .chatHistoryItem {
      cursor: pointer;
      border-radius: 3px;
      padding: 0 10px;
      height: 45px;
      font-size: 14px;
      color: #151515;
      .updateTime {
        margin-left: 6px;
        font-size: 12px;
        color: #9e9e9e;
      }
      .operateIcon {
        width: 24px;
        height: 24px;
        border-radius: 3px;
        background: #fff;
        font-size: 14px;
        color: #757575;
        cursor: pointer;
        display: none;
        justify-content: center;
        align-items: center;
      }
      &:hover,
      &.hasMenu {
        .operateIcon {
          display: flex;
        }
        .updateTime {
          display: none;
        }
      }
    }
    .emptyStatus {
      padding: 12px 0;
      font-size: 14px;
      color: #9e9e9e;
      text-align: center;
    }
  }
  &.isMobile {
    .updateTime {
      display: none;
    }
    .operateIcon {
      display: flex !important;
    }
  }
`;

function ChatHistoryItem({
  item,
  currentChatId,
  allowShareChat,
  appId,
  onClick = () => {},
  onRename = () => {},
  onDelete = () => {},
  onShare = () => {},
}) {
  const isMobile = browserIsMobile();
  const { chatbotId, conversationId } = item.conversation || {};
  const [menuVisible, setMenuVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const itemRef = useRef(null);
  const cache = useRef({});
  useClickAway(itemRef, e => {
    if (e.target.closest('.MenuItem')) {
      return;
    }
    setMenuVisible(false);
  });

  const handleShare = async () => {
    let linkUrl = '';
    if (!conversationId) {
      // 帮助文档历史对话
      linkUrl = `${location.origin}/mingo/share/${item.chatId}`;
    } else {
      // 对话机器人历史对话
      const sourceId = `${chatbotId}|${conversationId}`;
      const shareParams = await getPublicShare({
        from: 'chatbot',
        appId,
        sourceId,
      });
      // 未开启分享
      if (!shareParams.shareLink) {
        const updateRes = await updatePublicShareStatus({
          from: 'chatbot',
          appId,
          sourceId,
          isPublic: true,
        });
        if (!updateRes.shareLink) {
          alert(_l('分享失败'), 2);
          return;
        }
        linkUrl = updateRes.shareLink;
      } else {
        linkUrl = shareParams.shareLink;
      }
    }

    if (window.isMingDaoApp) {
      compatibleMDJS('shareContent', {
        type: 1,
        title: item.title || _l('未命名'),
        url: linkUrl,
        success: function (res) {
          console.log(res, 'success');
        },
        cancel: function (res) {
          console.log(res, 'cancel');
        },
      });
    } else {
      setMobileMenuVisible(false);
      copy(linkUrl);
      alert(_l('链接已复制'));
    }
  };

  const renderDesktopTrigger = () => {
    return (
      <Trigger
        popupVisible={menuVisible}
        onPopupVisibleChange={setMenuVisible}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 6],
          overflow: { adjustY: true, adjustX: true },
        }}
        popup={
          <Menu className="Relative">
            <MenuItem
              onClick={() => {
                setMenuVisible(false);
                Dialog.confirm({
                  title: _l('重命名对话'),
                  width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                  description: (
                    <Input
                      autoFocus
                      placeholder={_l('请输入对话名称')}
                      className="w100 Gray"
                      defaultValue={item.title}
                      manualRef={ref => (cache.current.input = ref)}
                    />
                  ),
                  onOk: () => {
                    if (cache.current.input?.value.trim()) {
                      onRename(cache.current.input.value);
                    } else {
                      alert(_l('请输入对话名称'), 3);
                      cache.current.input.focus();
                      return false;
                    }
                  },
                });
              }}
              icon={<Icon icon="rename_input" className="Font18 mLeft5" />}
            >
              <span className="mLeft10">{_l('重命名')}</span>
            </MenuItem>
            {allowShareChat && (
              <MenuItem
                onClick={() => {
                  setMenuVisible(false);
                  onShare();
                }}
                icon={<Icon icon="share" className="Font18 mLeft5" />}
              >
                <span className="mLeft10">{_l('分享')}</span>
              </MenuItem>
            )}
            <MenuItem
              icon={<Icon icon="trash" className="Font18 mLeft5" style={{ color: '#F44336' }} />}
              onClick={() => {
                setMenuVisible(false);
                Dialog.confirm({
                  title: <span style={{ color: '#F44336', fontWeight: 'bold' }}>{_l('确定删除该对话')}</span>,
                  width: window.innerWidth - 20 > 480 ? 480 : window.innerWidth - 20,
                  description: _l('删除后，聊天记录将不可恢复'),
                  buttonType: 'danger',
                  onOk: () => {
                    onDelete();
                  },
                });
              }}
            >
              <span className="mLeft10" style={{ color: '#F44336' }}>
                {_l('删除')}
              </span>
            </MenuItem>
          </Menu>
        }
      >
        <span className="operateIcon" onClick={e => e.stopPropagation()}>
          <i className="icon icon-more_horiz Font18 Gray_9e Hand" />
        </span>
      </Trigger>
    );
  };

  const renderMobilePopup = () => {
    return (
      <Fragment>
        <span className="operateIcon" onClick={() => setMobileMenuVisible(true)}>
          <i className="icon icon-more_horiz Font18 Gray_9e Hand" />
        </span>
        <PopupWrapper
          visible={mobileMenuVisible}
          title={item.title}
          headerType="withIcon"
          headerTitleAlign="left"
          onClose={() => setMobileMenuVisible(false)}
        >
          <div className="commonButtonBox">
            {allowShareChat && (
              <div className="commonButton" onClick={handleShare}>
                <Icon icon="share" />
                <div className="buttonText">{_l('对外公开分享')}</div>
              </div>
            )}
            <div className="commonButton" onClick={() => setConfirmVisible(true)}>
              <Icon className="error" icon="trash" />
              <div className="buttonText error">{_l('删除')}</div>
            </div>
          </div>
        </PopupWrapper>
        <MobileConfirmPopup
          visible={confirmVisible}
          title={_l('确定删除该对话')}
          subDesc={_l('删除后，聊天记录将不可恢复')}
          confirmType="delete"
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => {
            setMobileMenuVisible(false);
            setConfirmVisible(false);
            onDelete();
          }}
        />
      </Fragment>
    );
  };

  return (
    <div
      className={cx('chatHistoryItem t-flex t-items-center t-space-between', {
        active: currentChatId && item.chatId === currentChatId,
        hasMenu: menuVisible,
      })}
      onClick={onClick}
      ref={itemRef}
    >
      <div className="name ellipsis t-flex-1">{item.title}</div>
      <div className="updateTime">{window.createTimeSpan(item.updateTime, 5)}</div>
      <div onClick={e => e.stopPropagation()}>{isMobile ? renderMobilePopup() : renderDesktopTrigger()}</div>
    </div>
  );
}

export default function ChatItemList(props) {
  const {
    className,
    isMobile,
    header,
    showHeader,
    isLoading,
    chatListData,
    currentChatId,
    isLand,
    allowShareChat,
    appId,
    onClick,
    onSelect,
    onDelete,
    onRename,
    onShare,
    onClose,
  } = props;
  return (
    <Con className={cx('chatItemList', className, { isMobile })} onClick={onClick}>
      {header}
      {showHeader && (
        <div className="header t-flex t-items-center t-space-between">
          <div className="title">{_l('历史记录')}</div>
          <div className="closeIcon Hand t-flex t-items-center t-justify-center Hand">
            <i className="icon icon-close" onClick={onClose}></i>
          </div>
        </div>
      )}
      <div className="chatHistoryList">
        {isLoading ? (
          <Skeleton
            active
            style={{ maxWidth: 800, margin: '0 auto', padding: '0 10px' }}
            widths={[100, '100%', '100%', '50%']}
          />
        ) : (
          <Fragment>
            {!chatListData.length && <div className="emptyStatus">{_l('暂无历史记录')}</div>}
            {!!chatListData.length &&
              chatListData.map((item, i) => (
                <ChatHistoryItem
                  isMobile={isMobile}
                  allowShareChat={allowShareChat}
                  isLand={isLand}
                  key={i}
                  item={item}
                  currentChatId={currentChatId}
                  appId={appId}
                  onClick={() => {
                    onSelect(item);
                  }}
                  onDelete={() => {
                    onDelete(item);
                  }}
                  onRename={newTitle => {
                    onRename(newTitle, item);
                  }}
                  onShare={() => {
                    onShare(item);
                  }}
                />
              ))}
          </Fragment>
        )}
      </div>
    </Con>
  );
}
