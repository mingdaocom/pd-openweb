import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import { Dialog } from 'ming-ui';
import openAuthorAjax from 'src/api/openAuthor';
import verifyPassword from 'src/components/verifyPassword';
import VerifyPasswordInput from 'src/ming-ui/components/VerifyPasswordInput';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import ConfigScopeDrawer from 'src/pages/Admin/integration/thirdpartyApp/components/ConfigScopeDrawer';
import Search from 'src/pages/workflow/components/Search';
import './index.less';

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
    password,
    searchResult: [],
    currentItem: {},
  });

  const promiseRef = useRef(null);

  const columns = useMemo(
    () => [
      {
        title: _l('应用名称'),
        dataIndex: 'name',
        width: 200,
        render: (text, record) => (
          <div className="flexRow alignItemsCenter overflowHidden">
            {record.iconUrl && <img src={record.iconUrl} alt={record.name} className="appIcon mRight10" />}
            <span className="flex ellipsis">{text}</span>
          </div>
        ),
      },
      {
        title: _l('说明'),
        dataIndex: 'desc',
        width: 300,
        ellipsis: true,
        render: text => <span className="textSecondary ellipsis">{text}</span>,
      },
      {
        title: _l('授权时间'),
        dataIndex: 'grantedTime',
        width: 150,
        render: text => <span className="textSecondary">{text}</span>,
      },
      {
        title: '',
        dataIndex: 'prompt',
        width: 180,
        render: (text, record) => (
          <span className="textError">
            {record.oAuthAppStatus === 0
              ? _l('集成应用已被停用')
              : record.scopeChanged
                ? _l('权限已变更，请重新授权')
                : ''}
          </span>
        ),
      },
      {
        title: '',
        dataIndex: 'action',
        width: 150,
        fixed: 'right',
        render: (text, record) => (
          <div>
            <span
              className="colorPrimary hoverTextPrimaryLight Hand mRight20"
              onClick={() => setState({ currentItem: record })}
            >
              {_l('查看权限')}
            </span>
            <span
              className="colorPrimary hoverTextPrimaryLight Hand"
              onClick={() => setState({ currentApp: record, passwordDialogVisible: true })}
            >
              {_l('终止授权')}
            </span>
          </div>
        ),
      },
    ],
    [],
  );

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
  }, [searchValue]);

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
          .catch(() => {
            alert(_l('终止授权失败'), 2);
          });
      },
      fail: () => {},
    });
  };

  useEffect(() => {
    getDataSource();
  }, []);

  return (
    <div className="authorizedAppContainer">
      <div className="description">
        {_l('以下应用已获得访问你数据的授权,可随时查看或撤销授权,已终止的应用无法继续访问数据。')}
      </div>
      <Search
        placeholder={_l('应用名称')}
        handleChange={keyword => {
          setState({
            searchValue: keyword,
            searchResult: appList.filter(item => item.name.toLowerCase().indexOf(keyword.trim().toLowerCase()) > -1),
          });
        }}
      />

      <div className="flex minHeight0">
        <PageTableCon
          loading={loading}
          columns={columns}
          dataSource={searchValue.trim() ? searchResult : appList}
          getDataSource={getDataSource}
        />
      </div>

      {passwordDialogVisible && (
        <Dialog
          visible={passwordDialogVisible}
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
        </Dialog>
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
