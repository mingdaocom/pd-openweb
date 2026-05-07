import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Drawer } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import openAuthorAjax from 'src/api/openAuthor';
import { SCOPE_LIST } from '../enum';
import AuthScope from './AuthScope';
import UseScope from './UseScope';

const DrawerWrap = styled(Drawer)`
  .ant-drawer-content-wrapper {
    box-shadow: -7px 0px 6px 1px rgba(0, 0, 0, 0.08);
  }
  .ant-drawer-header {
    border-color: var(--color-border-secondary);
    padding: 14px 24px;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        margin-right: -12px;
      }
    }
  }
  .ant-drawer-body {
    padding: 0;
    overflow: hidden;
  }
  .ant-drawer-footer {
    border: none;
  }
`;

const TabWrap = styled.div`
  width: 190px;
  background: var(--color-background-primary);
  border-right: 1px solid var(--color-border-secondary);
  padding: 20px 8px 0;
  .tabItem {
    width: 100%;
    height: 40px;
    line-height: 40px;
    border-radius: 4px 4px 4px 4px;
    padding-left: 20px;
    border-radius: 4px;
    cursor: pointer;
    &.active {
      background: var(--color-background-hover);
    }
    .activeLine {
      position: absolute;
      top: 11px;
      bottom: 0;
      left: 0;
      width: 3px;
      height: 18px;
      border-radius: 10px;
      background: var(--color-primary);
    }
  }
`;

export default function ConfigScopeDrawer(props) {
  const { projectId, oAuthAppId, onClose, editAppConfigs, isPersonalAuthorized, scopeCodes = [] } = props;
  const [{ activeTab, loading, detail }, setState] = useSetState({
    activeTab: 'authScope',
    loading: !isPersonalAuthorized,
    detail: { scopes: SCOPE_LIST },
  });

  useEffect(() => {
    if (isPersonalAuthorized) {
      return;
    }

    openAuthorAjax
      .getAppConfig({ projectId, oAuthAppId })
      .then(res => {
        setState({ detail: res, loading: false });
      })
      .catch(() => {
        setState({ detail: {}, loading: false });
      });
  }, []);

  return (
    <DrawerWrap
      title={_l('集成应用')}
      width={685}
      visible
      onClose={onClose}
      placement="right"
      destroyOnClose={true}
      closeIcon={<i className="icon-close Font18" />}
    >
      {loading ? (
        <div className="h100 flexRow alignItemsCenter justifyContentCenter">
          <LoadDiv />
        </div>
      ) : (
        <div className="flexRow h100">
          <TabWrap>
            {[
              { label: _l('接口权限'), value: 'authScope' },
              { label: _l('使用范围'), value: 'useScope' },
            ]
              .filter(item => !isPersonalAuthorized || item.value === 'authScope')
              .map(item => (
                <div
                  key={item.value}
                  className={cx('tabItem Relative', { active: activeTab === item.value })}
                  onClick={() => setState({ activeTab: item.value })}
                >
                  {item.label}
                  {activeTab === item.value && <div className="activeLine" />}
                </div>
              ))}
          </TabWrap>
          {activeTab === 'authScope' ? (
            <AuthScope
              projectId={projectId}
              oAuthAppId={oAuthAppId}
              scopes={detail?.scopes || []}
              scopeCodes={scopeCodes}
            />
          ) : (
            <UseScope
              projectId={projectId}
              oAuthAppId={oAuthAppId}
              detail={detail}
              editAppConfigs={editAppConfigs}
              onClose={onClose}
            />
          )}
        </div>
      )}
    </DrawerWrap>
  );
}
