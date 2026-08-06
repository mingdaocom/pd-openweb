import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Divider, Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import accountSettingApi from 'src/api/accountSetting';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';
import { getSystemLangKey } from 'src/common/langConfig';
import { pathCompletion } from 'src/utils/common';

const Wrap = styled(Menu)`
  .ant-dropdown-menu-item.active {
    background-color: var(--color-background-secondary);
  }
`;

export default props => {
  const { placement, app, isCharge } = props;
  const { id: appId, projectId, originalLang } = app;
  const [loading, setLoading] = useState(true);
  const [appLangs, setAppLangs] = useState([]);
  const [langList, setLangList] = useState({});
  const appLangRequestId = useRef(0);
  const langListRequestKey = useRef('');
  const loadedLangListKey = useRef('');

  const loadLangList = useCallback(
    (appLangs = []) => {
      const langCodes = appLangs
        .map(n => n.langCode)
        .concat(originalLang)
        .filter(n => n);
      const langKey = langCodes.join(',');

      if (!langKey || loadedLangListKey.current === langKey) return;

      langListRequestKey.current = langKey;
      setLoading(true);
      fixedDataApi.loadLangList({ langCodes }).then(langList => {
        if (langListRequestKey.current !== langKey) return;

        loadedLangListKey.current = langKey;
        setLangList(langList);
        setLoading(false);
      });
    },
    [originalLang],
  );

  useEffect(() => {
    const requestId = appLangRequestId.current + 1;

    appLangRequestId.current = requestId;
    appManagementApi
      .getAppLangs({
        appId,
        projectId,
      })
      .then(data => {
        if (appLangRequestId.current !== requestId) return;

        setAppLangs(data);
        if (placement.includes('top')) {
          loadLangList(data);
        }
      });
  }, [appId, loadLangList, placement, projectId]);

  const handleSetLang = value => {
    const sysLang =
      value === '' ? getSystemLangKey(app.originalLang) || window.getDefaultLangKey() : getSystemLangKey(value);
    const langCode = getCurrentLangCode(sysLang);

    accountSettingApi
      .editAccountSetting({
        settingType: '20',
        settingValue: value,
      })
      .then(data => {
        if (data) {
          if (_.isNumber(langCode)) {
            accountSettingApi
              .editAccountSetting({
                settingType: '6',
                settingValue: langCode.toString(),
              })
              .then(res => {
                if (res) {
                  setCookie('i18n_langtag', sysLang);
                  window.location.reload();
                }
              });
          } else {
            window.location.reload();
          }
        }
      });
  };

  if (!appLangs.length) {
    return null;
  }

  return (
    <Dropdown
      overlay={
        <Wrap style={{ width: 200, maxHeight: 380, overflowY: loading ? undefined : 'auto' }}>
          {loading ? (
            <li className="flexRow alignItemsCenter justifyContentCenter">
              <LoadDiv />
            </li>
          ) : (
            <Fragment>
              {appLangs.map(item => (
                <Menu.Item
                  key={item.langCode}
                  className={cx({ active: item.langCode === md.global.Account.appLang })}
                  onClick={() => handleSetLang(item.langCode)}
                >
                  <div className="flexRow alignItemsCenter">
                    <div className="flex">{_.get(langList[item.langCode], 'localLang')}</div>
                    {item.langCode === md.global.Account.appLang && (
                      <Icon icon="done" className="colorPrimary Font19" />
                    )}
                  </div>
                </Menu.Item>
              ))}
              <Menu.Item
                key={app.originalLang}
                className={cx({ active: !md.global.Account.appLang })}
                onClick={() => handleSetLang('')}
              >
                <div className="flexRow alignItemsCenter">
                  <div className="flex">
                    {app.originalLang ? _.get(langList[app.originalLang], 'localLang') : _l('基准语言')}
                  </div>
                  {!md.global.Account.appLang && <Icon icon="done" className="colorPrimary Font19" />}
                </div>
              </Menu.Item>
              {isCharge && (
                <Fragment>
                  <Divider className="mTop2 mBottom2" />
                  <Menu.Item
                    key="settings"
                    onClick={() => {
                      location.href = pathCompletion(`/app/${appId}/settings/language`);
                    }}
                  >
                    <Icon icon="settings" className="mRight8 textTertiary" />
                    {_l('管理')}
                  </Menu.Item>
                </Fragment>
              )}
            </Fragment>
          )}
        </Wrap>
      }
      placement={placement}
      trigger={['click']}
      onVisibleChange={value => {
        if (value) {
          loadLangList(appLangs);
        }
      }}
    >
      <span>{props.children}</span>
    </Dropdown>
  );
};
