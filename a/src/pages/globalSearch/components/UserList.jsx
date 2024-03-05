import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Avatar, Icon } from 'ming-ui';
import UserHead from 'src/components/userHead/userHead';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import TextHeightLine from './TextHeightLine';
import { USER_LIST_NAME } from '../enum';
import { getImgUrl } from '../utils';

const Box = styled.div`
  padding-bottom: 12px;
  .userListItem {
    height: 56px;
    border-radius: 4px;
    cursor: pointer;
    padding-left: 14px;
  }
  .userListItem:hover {
    background: #f7f7f7;
  }
  .userListItem:last-child {
    margin-bottom: 13px;
  }
  .userListShowMore {
    height: 37px;
    line-height: 37px;
    padding-left: 23px;
  }
  .userListShowMore .text {
    cursor: pointer;
  }
  .userListHr {
    border-bottom: 1px solid #eaeaea;
  }
  .mLeft18 {
    margin-left: 18px;
  }
  .title {
    margin-left: 14px;
  }
  .mLeft14 {
    margin-left: 14px !important;
  }
  .userListShowMore:hover {
    background: #f7f7f7;
  }
`;

export default function UserList(props) {
  const {
    data = { allCount: 0, list: [] },
    type = 0,
    needTitle = false,
    maxCount = undefined,
    needShowMore = true,
    needShowAll = true,
    showHr = false,
    searchKeyword = '',
    closeDialog = undefined,
    needDesc = false,
    style = {},
    className = '',
  } = props;

  const [list, setList] = useState(maxCount ? _.slice(data.list, 0, maxCount) : data.list);
  const [showMore, setShowMore] = useState(maxCount ? data.list.length > maxCount : false);
  const [showAll, setShowAll] = useState(needShowAll);
  const [count, setCount] = useState(data.allCount || 0);

  useEffect(() => {
    setList(maxCount ? _.slice(data.list, 0, maxCount) : data.list);
    setCount(data.allCount || 0);
  }, [data]);

  const clickShowHandle = () => {
    if (showMore) {
      setList(data.list);
      setShowMore(false);
      if (data.allCount > data.list.length) {
        setShowAll(true);
      }
      return;
    }
    if (showAll) {
      closeDialog && closeDialog();
      return;
    }
  };

  const openChat = item => {
    // 用户
    if (type === 0) {
      item.accountId !== md.global.Account.accountId && store.dispatch(actions.addUserSession(item.accountId));
    } else {
      store.dispatch(actions.addGroupSession(item.groupID || item.groupId));
    }
  };

  return (
    <Box style={style} className={className}>
      {needTitle && (
        <div className="title Font14 Bold mBottom10 mTop20">
          {USER_LIST_NAME[type].label} <span className="Gray_75 Normal mLeft8">{data.allCount}</span>
        </div>
      )}
      <ul className="userlist">
        {list &&
          list.map(item => {
            return (
              <li
                className="userListItem valignWrapper"
                key={`userListItem-${type}-${item[USER_LIST_NAME[type].idKey] || item.groupID}`}
                onClick={() => openChat(item)}
              >
                {type === 0 ? (
                  <UserHead
                    size={32}
                    user={{ userHead: item.avatarMiddle || item.userHead, accountId: item.accountId }}
                  />
                ) : (
                  <Avatar
                    src={getImgUrl(item.avatarMiddle || item.userHead || item.groupAvatar || item.avatar)}
                    size={32}
                  />
                )}
                <div className="flex ellipsis">
                  <TextHeightLine
                    className="Font14 mLeft14 flex"
                    heightLineText={searchKeyword}
                    text={item[USER_LIST_NAME[type].key] || item.userName || item.groupName}
                  />
                  {needDesc && <p className="ellipsis mLeft14 mBottom0 Gray_75 Font12 mTop5">{item.userJob}</p>}
                </div>
              </li>
            );
          })}
      </ul>
      {count > 20 && (needShowMore || needShowAll) && (showMore || showAll) && (
        <div className={cx('userListShowMore valignWrapper', { userListHr: showHr })}>
          <Icon icon="task-point-more" className="Gray_9e Font18" />
          <a
            href={showMore ? '' : `/search?search_key=${searchKeyword}&search_type=${USER_LIST_NAME[type].searchType}`}
            className="text mLeft18 Gray_9e"
            onClick={clickShowHandle}
          >
            {showMore ? _l('显示更多') : _l('查看全部')}
          </a>
        </div>
      )}
    </Box>
  );
}
