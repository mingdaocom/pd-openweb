import React, { useCallback, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import accountSettingApi from 'src/api/accountSetting';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';
import { getSystemLangKey } from 'src/utils/platform/i18n/langConfig';
import { pathCompletion } from 'src/utils/platform/navigation/path';

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

  const langMenuItems = loading
    ? [
        {
          key: 'loading',
          label: (
            <div className="flexRow alignItemsCenter justifyContentCenter">
              <LoadDiv />
            </div>
          ),
        },
      ]
    : [
        ...appLangs.map(item => ({
          key: item.langCode,
          className: cx({ active: item.langCode === md.global.Account.appLang }),
          style:
            item.langCode === md.global.Account.appLang
              ? { backgroundColor: 'var(--color-background-secondary)' }
              : undefined,
          label: (
            <div className="flexRow alignItemsCenter">
              <div className="flex">{_.get(langList[item.langCode], 'localLang')}</div>
              {item.langCode === md.global.Account.appLang && <Icon icon="done" className="colorPrimary Font19" />}
            </div>
          ),
          onClick: () => handleSetLang(item.langCode),
        })),
        {
          key: 'originalLang',
          className: cx({ active: !md.global.Account.appLang }),
          style: !md.global.Account.appLang ? { backgroundColor: 'var(--color-background-secondary)' } : undefined,
          label: (
            <div className="flexRow alignItemsCenter">
              <div className="flex">
                {app.originalLang ? _.get(langList[app.originalLang], 'localLang') : _l('基准语言')}
              </div>
              {!md.global.Account.appLang && <Icon icon="done" className="colorPrimary Font19" />}
            </div>
          ),
          onClick: () => handleSetLang(''),
        },
        isCharge && {
          type: 'divider',
          className: 'mTop2 mBottom2',
        },
        isCharge && {
          key: 'settings',
          icon: <Icon icon="settings" className="textTertiary Font20" />,
          label: _l('管理'),
          onClick: () => {
            location.href = pathCompletion(`/app/${appId}/settings/language`);
          },
        },
      ].filter(Boolean);

  return (
    <Dropdown
      placement={placement}
      trigger={['click']}
      onOpenChange={value => {
        if (value) {
          loadLangList(appLangs);
        }
      }}
      menu={{
        items: langMenuItems,
        style: { minWidth: 200, maxHeight: 380, overflowY: loading ? undefined : 'auto' },
      }}
    >
      <span>{props.children}</span>
    </Dropdown>
  );
};
