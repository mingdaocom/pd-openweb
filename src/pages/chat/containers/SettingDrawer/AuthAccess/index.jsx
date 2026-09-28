import React, { useState } from 'react';
import cx from 'classnames';
import AuthorizedApp from '../AuthorizedApp';
import PersonalAccessToken from '../personalAccessToken';
import './index.less';

const TABS = [
  { value: 'pat', name: _l('个人访问令牌') },
  { value: 'authorizedApp', name: _l('已授权第三方应用') },
];

export default function AuthAccess(props) {
  const { defaultAuthTab = 'pat' } = props;
  const [activeTab, setActiveTab] = useState(defaultAuthTab);

  return (
    <div className="settingAuthAccess flexColumn flex minHeight0">
      <div className="authTabs flexRow">
        {TABS.map(tab => (
          <div
            key={tab.value}
            className={cx('authTab pointer', { active: activeTab === tab.value })}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.name}
          </div>
        ))}
      </div>
      <div className="flex minHeight0">
        {activeTab === 'pat' && <PersonalAccessToken />}
        {activeTab === 'authorizedApp' && <AuthorizedApp />}
      </div>
    </div>
  );
}
