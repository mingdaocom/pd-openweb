import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Input, Modal } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import openAuthorAjax from 'src/api/openAuthor';
import VerifyPasswordInput from 'src/ming-ui/components/VerifyPasswordInput';
import ConfigScopeDrawer from 'src/pages/Admin/integration/thirdpartyApp/components/ConfigScopeDrawer';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './index.less';

const getPrompt = record => {
  return record.oAuthAppStatus === 0 ? _l('集成应用已被停用') : record.scopeChanged ? _l('权限已变更，请重新授权') : '';
};

const AuthorizedAppCard = props => {
  const { record, setState } = props;
  const prompt = getPrompt(record);

  return (
    <div className="authorizedAppCard">
      <div className="authorizedAppIconWrap">
        {record.iconUrl ? (
          <img src={record.iconUrl} alt={record.name} className="appIcon" />
        ) : (
          <Icon icon="widgets" className="appIconFallback" />
        )}
      </div>
      <div className="authorizedAppInfo">
        <div className="authorizedAppName ellipsis">{record.name}</div>
        <div className="authorizedAppDesc ellipsis">{record.desc}</div>
        <div className="authorizedAppTime">{_l('%0 授权', record.grantedTime)}</div>
        {!!prompt && <div className="authorizedAppError">{prompt}</div>}
      </div>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{
          className: 'authorizedAppActionMenu',
          items: [
            {
              key: 'scope',
              label: _l('查看权限'),
              onClick: () => setState({ currentItem: record }),
            },
            {
              key: 'terminate',
              label: _l('终止授权'),
              className: 'Red',
              onClick: () => setState({ currentApp: record, passwordDialogVisible: true }),
            },
          ],
        }}
      >
        <Icon icon="more_horiz" className="authorizedAppActionIcon" onClick={e => e.stopPropagation()} />
      </Dropdown>
    </div>
  );
};

export default function AuthorizedApp() {
  const [
    { searchValue, appList, loading, passwordDialogVisible, currentApp, password, searchResult, currentItem },
    setState,
  ] = useSetState({
    searchValue: '',
    appList: [],
    loading: false,
    passwordDialogVisible: false,
    currentApp: null,
    password: '',
    searchResult: [],
    currentItem: {},
  });

  const promiseRef = useRef(null);

  // 获取数据
  const getDataSource = useCallback(() => {
    if (promiseRef.current && promiseRef.current.abort) {
      promiseRef.current.abort();
    }

    setState({ loading: true });

    promiseRef.current = openAuthorAjax.userGrantedList({});

    promiseRef.current
      .then(res => {
        setState({ appList: res, loading: false });
      })
      .catch(() => {
        setState({ loading: false });
      });
  }, [setState]);

  // 验证用户密码成功后终止授权
  const handleTerminationAuth = () => {
    verifyPassword({
      checkNeedAuth: false,
      ignoreAlert: false,
      customActionName: 'checkAccount',
      password,
      success: () => {
        openAuthorAjax
          .closeUserGranted({ id: currentApp?.id })
          .then(res => {
            if (res) {
              alert(_l('授权已终止，该应用将无法继续访问数据'));
              setState({ passwordDialogVisible: false, appList: appList.filter(item => item.id !== currentApp.id) });
            } else {
              alert(_l('终止授权失败'), 2);
            }
          })
          .catch(_requestError => {
            alertIfNotUnauthorized(_requestError, _l('终止授权失败'), 2);
          });
      },
      fail: () => {},
    });
  };

  useEffect(() => {
    const timer = setTimeout(getDataSource, 0);

    return () => clearTimeout(timer);
  }, [getDataSource]);

  const authorizedApps = searchValue.trim() ? searchResult : appList;

  return (
    <div className="authorizedAppContainer">
      <div className="description">
        {_l('以下应用已获得访问你数据的授权，可随时查看或撤销授权，已终止的应用无法继续访问数据。')}
      </div>
      <Input
        allowClear
        className="authorizedAppSearch"
        prefix={<Icon icon="search" className="textSecondary Font16" />}
        value={searchValue}
        placeholder={_l('应用名称')}
        onChange={event => {
          const keyword = event.target.value;
          setState({
            searchValue: keyword,
            searchResult: appList.filter(item => item.name.toLowerCase().indexOf(keyword.trim().toLowerCase()) > -1),
          });
        }}
      />

      <div className="authorizedAppCardList">
        {loading ? (
          <div className="authorizedAppLoading">
            <LoadDiv />
          </div>
        ) : authorizedApps.length ? (
          authorizedApps.map(record => (
            <AuthorizedAppCard key={record.id || record.oAuthAppId} record={record} setState={setState} />
          ))
        ) : (
          <div className="authorizedAppEmpty">{_l('暂无已授权第三方应用')}</div>
        )}
      </div>

      {passwordDialogVisible && (
        <Modal
          open={passwordDialogVisible}
          title={<div className="textError">{_l('终止授权')}</div>}
          width={480}
          onCancel={() => {
            setState({ passwordDialogVisible: false });
          }}
          onOk={handleTerminationAuth}
        >
          <div className="passwordDialogContent">
            <div className="mBottom15 Font14 textSecondary">
              {_l('终止授权后，该集成将无法继续访问你的任何数据。需要验证 身份，请确认操作。')}
            </div>
            <VerifyPasswordInput
              showAccountEmail={false}
              autoFocus
              isRequired={true}
              onChange={({ password }) => setState({ password })}
            />
          </div>
        </Modal>
      )}

      {currentItem?.oAuthAppId && (
        <ConfigScopeDrawer
          isPersonalAuthorized={true}
          oAuthAppId={currentItem.oAuthAppId}
          scopeCodes={currentItem.scopeCodes}
          editAppConfigs={() => {}}
          onClose={() => setState({ currentItem: {} })}
        />
      )}
    </div>
  );
}
