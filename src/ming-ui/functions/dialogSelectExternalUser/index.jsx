import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView, UserHead } from 'ming-ui';
import { Checkbox, Input, Modal, Select } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import NoData from '../dialogSelectUser/GeneralSelect/NoData';
import './index.less';

const PAGE_SIZE = 50;
const SELECTOR_CONTENT_STYLE = { height: 'calc(100vh - 240px)' };

export function normalizeExternalUser(user) {
  return {
    ...user,
    fullname: user.name,
    phone: user.mobilePhone,
  };
}

function getUserDescription(user) {
  const contact = user.phone || user.email;

  return [contact, user.appName].filter(Boolean).join(' | ');
}

export function ExternalUserDialog(props) {
  const { projectId, appId, onSelectionChange = _.noop } = props;
  const [appState, setAppState] = useState({
    options: [],
    nextPageIndex: 1,
    keyword: '',
    loading: true,
    hasMore: true,
  });
  const {
    options: appOptions,
    nextPageIndex: nextAppPageIndex,
    keyword: appKeyword,
    loading: appLoading,
    hasMore: hasMoreApps,
  } = appState;
  const [currentAppId, setCurrentAppId] = useState(appId || '');
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [userList, setUserList] = useState([]);
  const [nextPageIndex, setNextPageIndex] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const appRequestRef = useRef();
  const appSearchRef = useRef();
  const userRequestRef = useRef();

  const resetUserList = useCallback(() => {
    setUserList([]);
    setNextPageIndex(1);
    setHasMore(true);
    setLoading(true);
  }, []);

  const getUserList = useCallback(
    (pageIndex = 1) => {
      userRequestRef.current?.abort();

      const request = externalPortalAjax.getUsers({
        projectId,
        appId: currentAppId || undefined,
        keywords: searchKeyword.trim() || undefined,
        pageIndex,
        pageSize: PAGE_SIZE,
        sortType: 0,
        isReturnTotal: false,
      });
      userRequestRef.current = request;

      request
        .then(({ users }) => {
          if (userRequestRef.current !== request) return;

          const normalizedUsers = users.map(normalizeExternalUser);
          setUserList(previousUsers => (pageIndex === 1 ? normalizedUsers : previousUsers.concat(normalizedUsers)));
          setNextPageIndex(pageIndex + 1);
          setHasMore(normalizedUsers.length === PAGE_SIZE);
        })
        .catch(() => {})
        .finally(() => {
          if (userRequestRef.current === request) {
            setLoading(false);
          }
        });
    },
    [currentAppId, projectId, searchKeyword],
  );

  const getAppList = useCallback(
    (pageIndex = 1, keyword = '', restart = false) => {
      if (appRequestRef.current) {
        if (!restart) return;

        appRequestRef.current.abort();
      }

      const request = appManagementAjax.getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageIndex,
        pageSize: PAGE_SIZE,
        keyword,
      });
      appRequestRef.current = request;

      request
        .then(({ apps = [] }) => {
          if (appRequestRef.current !== request) return;

          const options = apps.map(item => ({ value: item.appId, label: item.appName }));
          setAppState(currentState => ({
            options: pageIndex === 1 ? options : currentState.options.concat(options),
            nextPageIndex: pageIndex + 1,
            keyword,
            loading: false,
            hasMore: options.length === PAGE_SIZE,
          }));
          appRequestRef.current = null;
        })
        .catch(() => {
          if (appRequestRef.current !== request) return;

          appRequestRef.current = null;
          setAppState(currentState => ({ ...currentState, loading: false }));
        });
    },
    [projectId],
  );

  const updateSearchKeyword = useMemo(
    () =>
      _.debounce(value => {
        resetUserList();
        setSearchKeyword(value);
      }, 500),
    [resetUserList],
  );

  useEffect(() => () => updateSearchKeyword.cancel(), [updateSearchKeyword]);

  useEffect(() => {
    appSearchRef.current = _.debounce(value => {
      setAppState(currentState => ({ ...currentState, loading: true }));
      getAppList(1, value, true);
    }, 500);

    return () => appSearchRef.current?.cancel();
  }, [getAppList]);

  useEffect(() => {
    onSelectionChange(selectedUsers);
  }, [onSelectionChange, selectedUsers]);

  useEffect(() => {
    getUserList();

    return () => {
      userRequestRef.current?.abort();
      userRequestRef.current = null;
    };
  }, [getUserList]);

  useEffect(() => {
    if (appId) return;

    getAppList();

    return () => {
      appRequestRef.current?.abort();
      appRequestRef.current = null;
    };
  }, [appId, getAppList]);

  const toggleUser = user => {
    setSelectedUsers(previousUsers =>
      previousUsers.some(item => item.accountId === user.accountId)
        ? previousUsers.filter(item => item.accountId !== user.accountId)
        : previousUsers.concat(user),
    );
  };

  const handleAppChange = value => {
    const selectedAppId = value || '';

    appSearchRef.current?.cancel();
    updateSearchKeyword.cancel();
    resetUserList();
    setSearchKeyword(keyword);
    setCurrentAppId(selectedAppId);

    if (!selectedAppId) {
      setAppState(currentState => ({ ...currentState, loading: true }));
      getAppList(1, '', true);
    }
  };

  const handleKeywordChange = event => {
    const value = event.target.value;
    setKeyword(value);

    if (value) {
      updateSearchKeyword(value);
      return;
    }

    updateSearchKeyword.cancel();

    if (!searchKeyword) return;

    resetUserList();
    setSearchKeyword('');
  };

  const removeSelectedUser = accountId => {
    setSelectedUsers(previousUsers => previousUsers.filter(user => user.accountId !== accountId));
  };

  const selectedUserIds = useMemo(() => new Set(selectedUsers.map(user => user.accountId)), [selectedUsers]);

  const loadNextAppPage = event => {
    event.persist();
    const { scrollTop, offsetHeight, scrollHeight } = event.target;

    if (scrollTop + offsetHeight === scrollHeight && hasMoreApps && !appLoading && !appRequestRef.current) {
      setAppState(currentState => ({ ...currentState, loading: true }));
      getAppList(nextAppPageIndex, appKeyword);
    }
  };

  const loadNextPage = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    getUserList(nextPageIndex);
  };

  return (
    <div className="externalUserDialog" style={SELECTOR_CONTENT_STYLE}>
      <Input
        allowClear
        autoFocus
        className="mBottom16"
        placeholder={_l('搜索用户名/手机号/邮箱')}
        prefix={<Icon icon="search" className="textTertiary Font18" />}
        value={keyword}
        radius
        variant="filled"
        onChange={handleKeywordChange}
      />
      {!appId && (
        <Select
          className="w100"
          value={currentAppId || undefined}
          placeholder={_l('全部应用')}
          allowClear
          showSearch
          loading={appLoading}
          options={appOptions}
          notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
          filterOption={false}
          onChange={handleAppChange}
          onPopupScroll={loadNextAppPage}
          onSearch={value => appSearchRef.current?.(value)}
        />
      )}
      {loading && !userList.length ? (
        <div className="GSelect-container">
          <LoadDiv className="mTop20" />
        </div>
      ) : !userList.length ? (
        <div className="GSelect-container">
          <NoData>{keyword ? _l('无搜索结果') : _l('暂无外部门户用户')}</NoData>
        </div>
      ) : (
        <ScrollView className="GSelect-container" onScrollEnd={loadNextPage}>
          <div className="GSelect-userList">
            {userList.map(user => {
              const isSelected = selectedUserIds.has(user.accountId);
              const userDescription = getUserDescription(user);

              return (
                <div className="GSelect-User" key={user.accountId} onClick={() => toggleUser(user)}>
                  <Checkbox
                    className="GSelect-User--checkbox"
                    checked={isSelected}
                    onClick={event => event.stopPropagation()}
                    onChange={() => toggleUser(user)}
                  />
                  <div className="GSelect-User__avatar">
                    <UserHead
                      size={28}
                      user={{ userHead: user.avatar, accountId: user.accountId }}
                      appId={user.appId}
                      projectId={projectId}
                    />
                  </div>
                  <div className="GSelect-User__fullname" title={user.fullname}>
                    {user.fullname}
                  </div>
                  <div className="GSelect-User__companyName" title={userDescription}>
                    {userDescription}
                  </div>
                </div>
              );
            })}
          </div>
          {loading && <LoadDiv className="mTop10" size="small" />}
        </ScrollView>
      )}
      <div className="GSelect-result">
        <div className="GSelect-result-box">
          {selectedUsers.map(user => (
            <div className="GSelect-result-subItem" key={user.accountId}>
              <div className="GSelect-result-subItem__avatar">
                <UserHead
                  size={28}
                  user={{ userHead: user.avatar, accountId: user.accountId }}
                  appId={user.appId}
                  projectId={projectId}
                />
              </div>
              <div className="GSelect-result-subItem__name overflow_ellipsis">{user.fullname}</div>
              <div className="GSelect-result-subItem__remove" onClick={() => removeSelectedUser(user.accountId)}>
                <Icon icon="delete" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function dialogSelectExternalUser(options = {}) {
  let modal;
  let selectedUsers = [];
  const handlePopState = () => modal.destroy();

  const handleCancel = () => {
    if (_.isFunction(options.onClose)) {
      options.onClose();
    }
  };

  const handleConfirm = () => {
    const result = _.isFunction(options.onOk) ? options.onOk(selectedUsers) : undefined;

    if (result && _.isFunction(result.then)) {
      return result.then(value => {
        handleCancel();
        return value;
      });
    }

    handleCancel();
    return result;
  };

  const handleSelectionChange = users => {
    selectedUsers = users;
    modal.update({ okButtonProps: { ...options.okButtonProps, disabled: !selectedUsers.length } });
  };

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    cancelText: _l('取消'),
    content: <ExternalUserDialog {...options} onSelectionChange={handleSelectionChange} />,
    mask: { closable: options.overlayClosable !== false },
    okButtonProps: { ...options.okButtonProps, disabled: true },
    okCancel: true,
    okText: _l('确定'),
    onCancel: handleCancel,
    onOk: handleConfirm,
    title: options.title ?? _l('外部门户用户'),
    width: 640,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectExternalUser;
