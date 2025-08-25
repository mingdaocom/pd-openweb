import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { debounce } from 'lodash';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import chatAjax from 'src/api/chat';
import { Bold600, BorderBox, commonShadow, Textarea, Tip9e, Tipbd } from 'worksheet/components/Basics';

const Con = styled.div``;

const SelectedUser = styled(BorderBox)`
  width: 280px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
  ${({ active }) => (active ? 'border-color: #1677ff;' : '')}
  > .con {
    flex: 1;
    overflow: hidden;
  }
  i.arrow {
    font-size: 14px;
    color: #bdbdbd;
  }
`;

const Description = styled(Textarea)`
  min-height: 67px;
  margin-top: 12px;
`;

const ChatList = styled.div`
  width: 280px;
  background: #fff;
  border-radius: 3px;
  ${commonShadow}
  .header {
    display: flex;
    padding: 12px 16px;
  }
  .list {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 220px;
  }
`;

const Empty = styled(Tip9e)`
  padding: 14px 0;
  text-align: center;
`;

const AccountItem = styled.div`
  cursor: pointer;
  width: 100%;
  height: 36px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  &:hover,
  &.active {
    background: #1677ff;
    color: #fff;
  }
`;

export default function SendToChat(props) {
  const { card, url, onClose = () => {} } = props;
  const [description, setDescription] = useState();
  const [selectedUser, setSelectedUser] = useState();
  const [listActive, setListActive] = useState(false);
  const [list, setList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);
  const [loading, setLoading] = useState();
  const scrollViewRef = useRef();
  const descriptionRef = useRef();

  useEffect(() => {
    if (_.isNumber(activeIndex) && scrollViewRef.current) {
      const { viewport } = scrollViewRef.current.getScrollInfo();
      const activeEl = viewport.querySelector('.active');
      activeEl && scrollViewRef.current.scrollToElement(activeEl);
    }
  }, [activeIndex]);

  function loadChat(keywords = '') {
    setLoading(true);
    setActiveIndex(null);
    chatAjax
      .getChatList({
        keywords,
        size: 20,
      })
      .then(data => {
        setLoading(false);
        setList(data);
      });
  }
  function handleSend() {
    if (card && !card.url) {
      card.url = url;
    }
    chatAjax
      .sendCardToChat({
        cards: card ? [card] : [],
        message: description,
        [selectedUser.type === 1 ? 'toAccountId' : 'toGroupId']: selectedUser.value,
      })
      .then(data => {
        if (data) {
          onClose();
          alert(_l('发送成功'));
        } else {
          alert(_l('发送失败'), 3);
        }
      });
  }

  const debounceLoadChat = useCallback(debounce(loadChat, 300), []);
  const chatListComp = (
    <ChatList>
      {!loading && !list.length ? (
        <Empty>{_l('未找到相关的人员或群聊')}</Empty>
      ) : (
        <Fragment>
          <div className="header">
            <Tip9e>{_l('最近聊天')}</Tip9e>
          </div>
          <div className="list flexColumn">
            {loading && <LoadDiv size="small" />}
            {!loading && !!list.length && (
              <ScrollView className="flex" ref={scrollViewRef}>
                {list.map((account, index) => (
                  <AccountItem
                    className={cx({ active: index === activeIndex })}
                    onClick={() => {
                      setSelectedUser(account);
                      setListActive(false);
                    }}
                  >
                    <UserHead
                      className="mRight10"
                      user={{
                        userHead: account.logo,
                        accountId: account.value,
                      }}
                      size={26}
                    />
                    <div className="ellipsis" title={account.name}>
                      {account.name}
                    </div>
                  </AccountItem>
                ))}
              </ScrollView>
            )}
          </div>
        </Fragment>
      )}
    </ChatList>
  );

  return (
    <Con>
      <Bold600 className="mTop20">{_l('发送到')}</Bold600>
      <Trigger
        action={['click']}
        popupVisible={listActive}
        popup={chatListComp}
        getPopupContainer={() => document.body}
        onPopupVisibleChange={visible => {
          if (visible && !list.length) {
            loadChat();
          }
          setListActive(visible);
        }}
        destroyPopupOnHide
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 0],
          overflow: {
            adjustY: true,
          },
        }}
      >
        <SelectedUser active={listActive}>
          <div className="con">
            {listActive && (
              <input
                type="text"
                autoFocus
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                onKeyUp={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  const code = event.keyCode || event.which;
                  if (code === 13) {
                    const account = list[activeIndex];
                    if (account) {
                      setSelectedUser(account);
                      setListActive(false);
                      setActiveIndex(null);
                      descriptionRef.current.focus();
                    }
                    return;
                  }
                  if (code === 38) {
                    const index = activeIndex === null ? list.length : activeIndex - 1;
                    setActiveIndex(index < 0 ? list.length - 1 : index);
                    return;
                  }
                  if (code === 40) {
                    const index = activeIndex === null ? 0 : activeIndex + 1;
                    setActiveIndex(index >= list.length ? 0 : index);
                    return;
                  }
                }}
                onChange={e => debounceLoadChat(e.target.value)}
              />
            )}
            {!listActive &&
              (selectedUser ? (
                <div className="flexRow">
                  <UserHead
                    className="mRight10"
                    user={{
                      userHead: selectedUser.logo,
                      accountId: selectedUser.value,
                    }}
                    size={24}
                  />
                  <div className="flex ellipsis" title={selectedUser.name}>
                    {selectedUser.name}
                  </div>
                </div>
              ) : (
                <Tipbd>{_l('请选择')}</Tipbd>
              ))}
          </div>
          <i className="arrow icon icon-arrow-down-border"></i>
        </SelectedUser>
      </Trigger>
      <Description
        ref={descriptionRef}
        className="shareDescription"
        placeholder={_l('添加说明内容')}
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <Button className="mTop6" disabled={!selectedUser} onClick={handleSend}>
        {_l('发送')}
      </Button>
    </Con>
  );
}
