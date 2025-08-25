import React, { Fragment, useEffect, useState } from 'react';
import { Divider, Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import accountSettingApi from 'src/api/accountSetting';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';

const Wrap = styled(Menu)`
  .ant-dropdown-menu-item.active {
    background-color: #f5f5f5;
  }
`;

export default props => {
  const { placement, app, isCharge } = props;
  const { id: appId, projectId } = app;
  const [loading, setLoading] = useState(true);
  const [appLangs, setAppLangs] = useState([]);
  const [langList, setLangList] = useState({});

  useEffect(() => {
    appManagementApi
      .getAppLangs({
        appId,
        projectId,
      })
      .then(data => {
        setAppLangs(data);
        if (placement.includes('top')) {
          loadLangList(data);
        }
      });
  }, []);

  const loadLangList = appLangs => {
    if (!_.isEmpty(langList)) return;
    setLoading(true);
    fixedDataApi
      .loadLangList({
        langCodes: appLangs
          .map(n => n.langCode)
          .concat(app.originalLang)
          .filter(n => n),
      })
      .then(langList => {
        setLangList(langList);
        setLoading(false);
      });
  };

  const handleSetLang = value => {
    const langCodeObjs = {
      en: 'en',
      ja: 'ja',
      zh_hant: 'zh-Hant',
      zh_hans: 'zh-Hans',
    };
    const langCode =
      value === ''
        ? langCodeObjs[app.originalLang]
          ? getCurrentLangCode(langCodeObjs[app.originalLang])
          : 0
        : getCurrentLangCode(langCodeObjs[value]);
    accountSettingApi
      .editAccountSetting({
        settingType: '20',
        settingValue: value,
      })
      .then(data => {
        if (data) {
          if (_.isNumber(value === '' ? 0 : getCurrentLangCode(langCodeObjs[value] || ''))) {
            accountSettingApi
              .editAccountSetting({
                settingType: '6',
                settingValue: langCode.toString(),
              })
              .then(res => {
                if (res) {
                  setCookie('i18n_langtag', langCodeObjs[value] ? value : 'zh-Hans');
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
                    {item.langCode === md.global.Account.appLang && <Icon icon="done" className="ThemeColor Font19" />}
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
                    {_l('原始语言')}
                    {app.originalLang && `(${_.get(langList[app.originalLang], 'localLang')})`}
                  </div>
                  {!md.global.Account.appLang && <Icon icon="done" className="ThemeColor Font19" />}
                </div>
              </Menu.Item>
              {isCharge && (
                <Fragment>
                  <Divider className="mTop2 mBottom2" />
                  <Menu.Item
                    key="settings"
                    onClick={() => {
                      location.href = `/app/${appId}/settings/language`;
                    }}
                  >
                    <Icon icon="settings" className="mRight8 Gray_9e" />
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
        if (value && !langList.length) {
          loadLangList(appLangs);
        }
      }}
    >
      <span>{props.children}</span>
    </Dropdown>
  );
};
