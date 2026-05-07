import React, { useLayoutEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button } from 'ming-ui';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import PublicThirdPartyApp from './components/PublicThirdPartyApp';
import SelfBuiltThirdPartyApp from './components/SelfBuiltThirdPartyApp';
import './index.less';

const TABS = [
  { key: 'public', label: _l('公共') },
  { key: 'self_built', label: _l('自建') },
];

export default function ThirdpartyApp(props) {
  const [currentTab, setCurrentTab] = useState(_.find(TABS, { key: props?.match?.params?.type })?.key || 'public');
  const [publicIsEnabled, setPublicIsEnabled] = useState(false);
  const { projectId } = props?.match?.params || {};
  const selfBuiltThirdPartyAppRef = useRef(null);
  const publicThirdPartyAppRef = useRef(null);

  // 使用 useLayoutEffect 在 DOM 更新后同步检查 ref
  useLayoutEffect(() => {
    if (currentTab === 'public' && publicThirdPartyAppRef?.current) {
      setPublicIsEnabled(publicThirdPartyAppRef?.current?.isEnabled);
    }
  }, [currentTab]);

  return (
    <div className="orgManagementWrap">
      <AdminTitle prefix={_l('集成 - 第三方应用')} />
      <div className="orgManagementHeader">
        {!window.platformENV.isLocal && !window.platformENV.isOverseas ? (
          <div>{_l('公共')}</div>
        ) : (
          <div className="tabBox">
            {TABS.map(item => (
              <span
                key={item.key}
                className={cx('tabItem Hand', { active: currentTab === item.key })}
                onClick={() => {
                  setCurrentTab(item.key);
                  navigateTo(`/admin/thirdapp/${projectId}/${item.key}`);
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        )}
        <div className="flex"></div>
        <div>
          {(currentTab === 'public' || (!window.platformENV.isLocal && !window.platformENV.isOverseas)) &&
            publicIsEnabled && (
              <Button
                onClick={() => {
                  publicThirdPartyAppRef &&
                    publicThirdPartyAppRef.current &&
                    publicThirdPartyAppRef.current.handleClose();
                }}
              >
                {_l('关闭集成')}
              </Button>
            )}
          {currentTab === 'self_built' && (
            <Button
              onClick={() =>
                selfBuiltThirdPartyAppRef &&
                selfBuiltThirdPartyAppRef.current &&
                selfBuiltThirdPartyAppRef.current.handleCreate()
              }
            >
              {_l('新建')}
            </Button>
          )}
        </div>
      </div>
      {currentTab === 'public' ? (
        <PublicThirdPartyApp projectId={projectId} ref={publicThirdPartyAppRef} updateIsEnabled={setPublicIsEnabled} />
      ) : (
        <SelfBuiltThirdPartyApp projectId={projectId} ref={selfBuiltThirdPartyAppRef} />
      )}
    </div>
  );
}
