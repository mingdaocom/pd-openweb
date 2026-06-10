import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import accountSettingApi from 'src/api/accountSetting';
import appManagementApi from 'src/api/appManagement';
import fixedDataApi from 'src/api/fixedData';
import homeApi from 'src/api/homeApp';
import { canEditApp, canEditData } from 'src/pages/worksheet/redux/actions/util.js';

const ModalWrap = styled(Popup)`
  &.appMoreActionWrap {
    .header {
      padding: 20px 15px 0;
      .closeIcon {
        width: 24px;
        height: 24px;
        text-align: center;
        border-radius: 50%;
        background-color: var(--color-border-secondary);
        .icon {
          line-height: 24px;
        }
      }
    }
    .actionContent {
      padding: 0 20px 15px;
      color: var(--color-text-primary);
      line-height: 50px;
      text-align: left;
      font-weight: 600;

      .langItem {
        justify-content: space-between;
      }
    }
    .languageActionContent {
      max-height: calc(100vh - 84px);
      overflow-y: auto;
    }
    .active {
      color: var(--color-yellow) !important;
    }
    .lightColor {
      color: var(--color-warning) !important;
    }
  }
`;

export default function MoreAction(props) {
  const {
    visible,
    viewHideNavi,
    detail = {},
    onClose = () => {},
    dealMarked = () => {},
    dealViewHideNavi = () => {},
  } = props;
  const hasManagePermission = canEditData(detail.permissionType) || canEditApp(detail.permissionType, detail.isLock);
  const [roleEntryVisible, setRoleEntryVisible] = useState(hasManagePermission);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [appLangs, setAppLangs] = useState([]);
  const [langList, setLangList] = useState({});
  const [originalLang, setOriginalLang] = useState('');
  const currentAppIdRef = useRef(detail.id);
  const appInfoPromiseRef = useRef();
  const roleSettingPromiseRef = useRef();
  const langListPromiseRef = useRef();

  const handleLanguageClose = () => {
    setLanguageVisible(false);
  };

  const loadLangList = (_appLangs = [], _originalLang = originalLang) => {
    const langCodes = _appLangs
      .map(n => n.langCode)
      .concat(_originalLang)
      .filter(n => n);

    if (_.isEmpty(langCodes) || langListPromiseRef.current) return;

    const currentAppId = detail.id;
    langListPromiseRef.current = fixedDataApi
      .loadLangList({
        langCodes,
      })
      .then(list => {
        if (currentAppIdRef.current !== currentAppId) return;
        setLangList(list || {});
      })
      .catch(() => {});
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
        ? langCodeObjs[originalLang]
          ? getCurrentLangCode(langCodeObjs[originalLang])
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

  const getAppInfo = () => {
    if (!detail.id || appInfoPromiseRef.current) return;

    const currentAppId = detail.id;
    appInfoPromiseRef.current = Promise.all([
      appManagementApi
        .getAppLangs({
          appId: detail.id,
          projectId: detail.projectId,
        })
        .then(data => data || [])
        .catch(() => []),
      homeApi
        .getApp({
          appId: detail.id,
        })
        .then((data = {}) => data.originalLang || '')
        .catch(() => ''),
    ]).then(values => {
      if (currentAppIdRef.current !== currentAppId) return;
      const [_appLangs, _originLang] = values;
      setAppLangs(_appLangs);
      setOriginalLang(_originLang);
      loadLangList(_appLangs, _originLang);
    });
  };

  useEffect(() => {
    currentAppIdRef.current = detail.id;
    appInfoPromiseRef.current = null;
    roleSettingPromiseRef.current = null;
    langListPromiseRef.current = null;
    setRoleEntryVisible(hasManagePermission);
    setLanguageVisible(false);
    setAppLangs([]);
    setLangList({});
    setOriginalLang('');
  }, [detail.id]);

  useEffect(() => {
    if (!visible || !detail.id) return;

    if (hasManagePermission) {
      setRoleEntryVisible(true);
    } else if (!roleSettingPromiseRef.current) {
      const currentAppId = detail.id;
      roleSettingPromiseRef.current = appManagementApi
        .getAppRoleSetting({
          appId: detail.id,
        })
        .then((data = {}) => {
          if (currentAppIdRef.current !== currentAppId) return;
          const { appSettingsEnum } = data;
          setRoleEntryVisible(appSettingsEnum === 1);
        })
        .catch(() => {});
    }

    getAppInfo();
  }, [visible, detail.id, detail.projectId, detail.permissionType, detail.isLock, hasManagePermission]);

  return (
    <Fragment>
      <ModalWrap
        visible={visible}
        className="mobileModal topRadius appMoreActionWrap"
        onClose={onClose}
        onMaskClick={onClose}
      >
        <div className="flexRow header">
          <div className="Font13 textTertiary flex">{_l('应用操作')}</div>
          <div className="closeIcon" onClick={onClose}>
            <Icon icon="close" className="Font17 textTertiary bold" />
          </div>
        </div>
        <div className="actionContent">
          {!window.isPublicApp && (
            <div className="flexCenter" onClick={() => dealMarked(!detail.isMarked)}>
              <Icon
                icon="star_3"
                className={cx('textTertiary mRight24 Font20 TxtMiddle', { active: detail.isMarked })}
              />
              <span className="Font15">{detail.isMarked ? _l('取消收藏') : _l('收藏应用')}</span>
            </div>
          )}
          {roleEntryVisible && (
            <div
              className="flexCenter"
              onClick={() => {
                window.mobileNavigateTo(`/mobile/members/${detail.id}`);
                onClose();
              }}
            >
              <Icon icon="group" className="textTertiary mRight24 Font20 TxtMiddle" />
              <span className="Font15">{_l('人员管理')}</span>
            </div>
          )}
          {appLangs.length > 0 && (
            <div className="flexCenter" onClick={() => setLanguageVisible(true)}>
              <Icon icon="language" className="textTertiary mRight24 Font20 TxtMiddle" />
              <span className="Font15">{_l('应用语言')}</span>
            </div>
          )}
          {(canEditApp(detail.permissionType, detail.isLock) || canEditData(detail.permissionType)) && (
            <div
              className="flexCenter"
              onClick={() => {
                dealViewHideNavi(viewHideNavi ? false : true);
                onClose();
              }}
            >
              <Icon
                icon={viewHideNavi ? 'public-folder-hidden' : 'visibility'}
                className={'textTertiary mRight24 Font20 TxtMiddle'}
              />
              <span className="Font15">{viewHideNavi ? _l('不显示隐藏的应用项') : _l('显示隐藏的应用项')}</span>
            </div>
          )}
        </div>
      </ModalWrap>
      <ModalWrap
        visible={languageVisible}
        className="mobileModal topRadius appMoreActionWrap"
        onClose={handleLanguageClose}
        onMaskClick={handleLanguageClose}
      >
        <div className="flexRow header">
          <div className="Font13 textTertiary flex">{_l('应用语言')}</div>
          <div className="closeIcon" onClick={handleLanguageClose}>
            <Icon icon="close" className="Font17 textTertiary bold" />
          </div>
        </div>
        <div className="actionContent languageActionContent">
          {appLangs.map(item => (
            <div className="flexCenter langItem" key={item.langCode} onClick={() => handleSetLang(item.langCode)}>
              <span className="Font15">{_.get(langList[item.langCode], 'localLang')}</span>
              {item.langCode === md.global.Account.appLang && <Icon icon="done" className="colorPrimary Font30" />}
            </div>
          ))}
          <div className="flexCenter langItem" onClick={() => handleSetLang('')}>
            <span className="Font15">
              {_l('基准语言')}
              {originalLang && `(${_.get(langList[originalLang], 'localLang')})`}
            </span>
            {!md.global.Account.appLang && <Icon icon="done" className="colorPrimary Font30" />}
          </div>
        </div>
      </ModalWrap>
    </Fragment>
  );
}
