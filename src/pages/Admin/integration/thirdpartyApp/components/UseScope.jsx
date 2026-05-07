import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, RadioGroup } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';

const UseScopeWrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  flex: 1;
  min-height: 0;
  padding: 26px 16px 16px;
  overflow: hidden;
  .Radio {
    margin-right: 26px !important;
  }
  .Radio-box {
    margin-right: 8px !important;
  }
  .appListWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    .noDataContent,
    .appList {
      flex: 1;
      min-height: 0;
    }
  }
`;

const Footer = styled.div`
  margin-top: 24px;
`;

export default function UseScope(props) {
  const { projectId, detail, editAppConfigs = () => {}, onClose = () => {} } = props;
  const [state, setState] = useSetState({
    authAppType: detail?.scopeType,
    authApps: detail.apps.map(app => ({ ...app, iconUrl: app.icon })),
    saveLoading: false,
  });
  const { authAppType, authApps, saveLoading } = state;

  const addApp = () => {
    dialogSelectApp({
      projectId,
      title: _l('添加应用'),
      onOk: selectedApps => {
        const newAuthApps = _.uniqBy(authApps.concat(selectedApps), 'appId');
        setState({ authApps: newAuthApps });
      },
    });
  };

  const onSave = () => {
    if (authAppType === 2 && !authApps.length) {
      alert(_l('请添加应用'), 2);
      return;
    }

    setState({ saveLoading: true });

    editAppConfigs(
      {
        oAuthAppId: detail.oAuthAppId,
        scopeType: authAppType,
        appIds: authAppType === 2 ? authApps.map(app => app.appId) : [],
        status: detail.status,
      },
      success => {
        setState({ saveLoading: false });
        if (success) {
          alert(_l('使用范围更新成功'));
          onClose();
        } else {
          alert(_l('使用范围更新失败'), 2);
        }
      },
    );
  };

  useEffect(() => {
    setState({ authAppType: detail?.scopeType, authApps: detail.apps.map(app => ({ ...app, iconUrl: app.icon })) });
  }, [detail?.scopeType, detail?.apps]);

  return (
    <UseScopeWrap>
      <div className="mBottom10">{_l('允许访问的应用')}</div>
      <div className="flexRow alignItemsCenter mBottom10">
        <RadioGroup
          data={[
            { value: 1, text: _l('全部应用') },
            { value: 2, text: _l('指定应用') },
          ]}
          checkedValue={authAppType}
          onChange={value => setState({ authAppType: value })}
        />
        <div className="flex"></div>
        {authAppType === 2 && (
          <div className="addApp Hand colorPrimary" onClick={addApp}>
            <Icon icon="add" />
            <span className="bold mLeft5">{_l('添加应用')}</span>
          </div>
        )}
      </div>
      {authAppType === 2 ? (
        <AuthAppList
          className="flex minHeight0 appListWrapper"
          authApps={authApps}
          onRemove={id => {
            setState({
              authApps: authApps.filter(app => app.appId !== id),
            });
          }}
        />
      ) : (
        <div className="flex minHeight0"></div>
      )}
      <Footer>
        <Button type="primary" disabled={saveLoading} onClick={onSave}>
          {saveLoading ? _l('保存中...') : _l('保存')}
        </Button>
      </Footer>
    </UseScopeWrap>
  );
}
