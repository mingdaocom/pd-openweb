import React, { useEffect, useRef, useState } from 'react';
import _, { find, isEqual } from 'lodash';
import { arrayOf, func, string } from 'prop-types';
import styled from 'styled-components';
import { UserHead } from 'ming-ui';
import { dialogSelectUser, quickSelectUser } from 'ming-ui/functions';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';

const Con = styled.div`
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#1677ff' : 'var(--border-color)')} !important;
  .clearIcon {
    display: none;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
  ${({ isEmpty }) => (!isEmpty ? '&:hover { .downIcon { display: none;} }' : '')}
`;

const UsersCon = styled.div`
  cursor: pointer;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  min-height: 32px;
  padding: 0 0 0 10px;
`;

const UserItem = styled.div`
  font-size: 13px;
  display: inline-block;
  color: #151515;
  background: #e5e5e5;
  height: 24px;
  line-height: 24px;
  border-radius: 24px;
  padding-right: 8px;
  margin: 4px 6px 0 0;
  .userHead {
    display: inline-block !important;
    margin-right: 6px;
    vertical-align: top;
    img {
      vertical-align: unset;
    }
  }
`;

const SingleUserItem = styled.div`
  font-size: 13px;
  color: #151515;
  .userHead {
    display: inline-block !important;
    margin-right: 8px;
  }
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

const Empty = styled.span`
  color: #bdbdbd;
`;
export default function Users(props) {
  const { projectId, isMultiple, advancedSetting = {}, onChange = () => {}, appId, from } = props;
  const [values, setValues] = useState(props.values || []);
  const cache = useRef({ values });
  const { shownullitem, nullitemname, navshow, navfilters } = advancedSetting;
  const [active, setActive] = useState();
  const conRef = useRef();
  const tabType = getTabTypeBySelectUser(props.control);
  let staticAccounts = [];

  const emptyAvatar = md.global.FileStoreConfig.pictureHost + '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90';

  if (navshow === '2') {
    staticAccounts = safeParse(navfilters)
      .map(safeParse)
      .map(u => ({
        accountId: (u || {}).id,
        fullname: (u || {}).name,
        avatar: (u || {}).avatar,
      }));
  }

  const handleChange = ({ values }) => {
    onChange({ values });
    cache.current.values = values;
    setValues(values);
  };

  const handleClick = () => {
    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }
    const selectIds = values.map(l => l.accountId);

    setActive(true);
    if (from === 'NavShow') {
      dialogSelectUser({
        title: '添加成员',
        sourceId: 0,
        fromType: 0,
        showMoreInvite: false,
        SelectUserSettings: {
          includeUndefinedAndMySelf: true,
          filterResigned: false,
          // includeSystemField: true,
          showMoreInvite: false,
          projectId,
          unique: !isMultiple,
          selectedAccountIds: selectIds,
          callback(users) {
            handleChange({ values: isMultiple ? _.uniqBy([...cache.current.values, ...users], 'accountId') : users });
            setActive(false);
          },
        },
      });
    } else {
      quickSelectUser(conRef.current, {
        showMoreInvite: false,
        isDynamic: isMultiple,
        isTask: false,
        tabType,
        appId,
        includeUndefinedAndMySelf: true,
        includeSystemField: true,
        offset: {
          top: 4,
          left: -1,
        },
        zIndex: 10001,
        filterAccountIds: [md.global.Account.accountId],
        selectedAccountIds: selectIds,
        staticAccounts: (shownullitem === '1'
          ? [
              {
                avatar: emptyAvatar,
                fullname: nullitemname || _l('为空'),
                accountId: 'isEmpty',
              },
            ]
          : []
        ).concat(staticAccounts),
        SelectUserSettings: {
          projectId,
          unique: !isMultiple,
          filterResigned: md.global.Account.isPortal, //外部门户不支持查看已离职
          callback(users) {
            handleChange({ values: isMultiple ? _.uniqBy([...cache.current.values, ...users], 'accountId') : users });
            setActive(false);
          },
        },
        selectCb(users) {
          handleChange({ values: isMultiple ? _.uniqBy([...cache.current.values, ...users], 'accountId') : users });
          setActive(false);
        },
        onClose: () => {
          setActive(false);
        },
      });
    }
  };

  useEffect(() => {
    if (!isEqual(props.values, cache.current.values) && props.values) {
      setValues(props.values);
      cache.current.values = props.values;
    }
  }, [props.values]);

  return (
    <Con className={props.className} isEmpty={!values.length} active={active} onClick={handleClick}>
      <UsersCon ref={conRef}>
        {!values.length && <Empty>{_l('请选择')}</Empty>}
        {!isMultiple && !!values.length ? (
          <SingleUserItem className="singleUserItem">{values[0].fullname || nullitemname || _l('为空')}</SingleUserItem>
        ) : (
          values.map(user => {
            if (user.accountId === 'isEmpty' && !user.avatar && !user.fullname) {
              user.avatar = emptyAvatar;
              user.fullname = nullitemname || _l('为空');
            }
            return (
              <UserItem className="ellipsis">
                <UserHead
                  className="userHead"
                  user={{
                    userHead: user.avatar,
                    accountId: user.accountId,
                  }}
                  size={24}
                  appId={appId}
                  projectId={projectId}
                />
                {user.fullname}
                <i
                  className="icon icon-delete Gray_9e Font10 mLeft6 Hand"
                  onClick={e => {
                    e.stopPropagation();
                    handleChange({ values: values.filter(v => v.accountId !== user.accountId) });
                  }}
                />
              </UserItem>
            );
          })
        )}
      </UsersCon>
      <Icon className="icon icon-arrow-down-border downIcon" />
      {!!values.length && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={e => {
            e.stopPropagation();
            handleChange({ values: [] });
          }}
        />
      )}
    </Con>
  );
}

Users.propTypes = {
  projectId: string,
  values: arrayOf(string),
  onChange: func,
};
