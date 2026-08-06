import React, { useState } from 'react';
import { Dropdown, Menu } from 'antd';
import { Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import fixedDataApi from 'src/api/fixedData';
import langConfig, { getAppLangCode, getSystemLangKey } from 'src/common/langConfig';
import 'src/pages/Mobile/mobileModal.less';
import { PUBLIC_APP_BASE_LANG } from 'src/utils/app';
import { browserIsMobile } from 'src/utils/common';

const Wrapper = styled.div`
  display: inline-flex;
  align-items: center;
  height: 100%;
`;

const MenuWrap = styled(Menu)`
  width: 200px;
  max-height: 380px;
  overflow-y: auto;
`;

const IconWrap = styled(Icon)`
  font-size: 20px;
  color: var(--color-text-tertiary);
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: var(--color-primary);
  }
`;

const MobileLangContent = styled.div`
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 40px);

  .langList {
    flex: 1;
    padding: 0 20px 20px;
  }

  .langItem {
    height: 50px;
    font-size: 16px;
    font-weight: 600;

    .doneIcon {
      color: var(--color-primary);
      font-size: 28px;
    }
  }

  .loading {
    flex: 1;
    min-height: 160px;
  }
`;

const getSysLang = appLang => {
  const systemLang = getSystemLangKey(appLang);

  if (_.find(langConfig, { key: systemLang })) {
    return systemLang;
  }

  if (_.get(md, 'global.Account.accountId')) {
    return md.global.Account.lang;
  }

  return window.getDefaultLangKey();
};

const updateAppLang = value => {
  const url = new URL(location.href);
  url.searchParams.set('app_lang', value);
  url.searchParams.set('sys_lang', getSysLang(value));
  location.href = url.href;
};

const getCachedAppLangs = appId =>
  _.uniqBy(window[`appLangs-${appId}`] || [], 'langCode').filter(item => item.langCode);

export default function PublicAppLangDropdown(props) {
  const { appId, projectId, className, placement = 'bottomRight' } = props;
  const appLangs = getCachedAppLangs(appId);
  const [loading, setLoading] = useState(false);
  const [langList, setLangList] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);

  const loadLangList = () => {
    if (!appId || !projectId || loading || loaded || !appLangs.length) return;

    setLoading(true);
    fixedDataApi
      .loadLangList({
        langCodes: appLangs.map(item => item.langCode),
      })
      .then(list => {
        setLangList(list || {});
        setLoading(false);
        setLoaded(true);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  if (!appId || !projectId || (!loading && !appLangs.length)) {
    return null;
  }

  const currentAppLang = new URL(location.href).searchParams.get('app_lang') || getAppLangCode(getCurrentLang());
  const langOptions = appLangs
    .map(item => ({ key: item.langCode, text: _.get(langList[item.langCode], 'localLang') || item.langCode }))
    .concat({ key: PUBLIC_APP_BASE_LANG, text: _l('基准语言') });

  if (browserIsMobile()) {
    return (
      <Wrapper className={className}>
        <IconWrap
          icon="language"
          onClick={() => {
            setMobileVisible(true);
            loadLangList();
          }}
        />
        <Popup
          position="bottom"
          className="mobileModal topRadius publicAppLangMobilePopup"
          visible={mobileVisible}
          onMaskClick={() => setMobileVisible(false)}
          onClose={() => setMobileVisible(false)}
        >
          <MobileLangContent>
            <div className="header flexRow alignItemsCenter">
              <div>{_l('应用语言')}</div>
              <div className="closeIcon" onClick={() => setMobileVisible(false)}>
                <Icon icon="close" className="Font18" />
              </div>
            </div>
            {loading ? (
              <div className="loading flexRow alignItemsCenter justifyContentCenter">
                <LoadDiv size="small" />
              </div>
            ) : (
              <div className="langList">
                {langOptions.map(item => (
                  <div
                    className="langItem flexRow alignItemsCenter"
                    key={item.key}
                    onClick={() => updateAppLang(item.key)}
                  >
                    <div className="flex ellipsis">{item.text}</div>
                    {item.key === currentAppLang && <Icon icon="done" className="doneIcon" />}
                  </div>
                ))}
              </div>
            )}
          </MobileLangContent>
        </Popup>
      </Wrapper>
    );
  }

  return (
    <Wrapper className={className}>
      <Dropdown
        overlay={
          <MenuWrap>
            {loading ? (
              <li className="flexRow alignItemsCenter justifyContentCenter" style={{ height: 36 }}>
                <LoadDiv size="small" />
              </li>
            ) : (
              <React.Fragment>
                {langOptions.map(item => (
                  <Menu.Item
                    key={item.key}
                    className={cx({ active: item.key === currentAppLang })}
                    onClick={() => updateAppLang(item.key)}
                  >
                    <div className="flexRow alignItemsCenter">
                      <div className="flex">{item.text}</div>
                      {item.key === currentAppLang && <Icon icon="done" className="colorPrimary Font19" />}
                    </div>
                  </Menu.Item>
                ))}
              </React.Fragment>
            )}
          </MenuWrap>
        }
        placement={placement}
        trigger={['click']}
        onVisibleChange={value => {
          setTooltipVisible(false);

          if (value) {
            loadLangList();
          }
        }}
      >
        <Tooltip
          title={_l('语言')}
          placement="bottom"
          visible={tooltipVisible}
          onVisibleChange={value => setTooltipVisible(value)}
        >
          <IconWrap icon="language" />
        </Tooltip>
      </Dropdown>
    </Wrapper>
  );
}
