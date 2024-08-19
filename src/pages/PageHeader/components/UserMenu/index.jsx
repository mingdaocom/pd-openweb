import React, { useState, useEffect } from 'react';
import './index.less';
import login from 'src/api/login';
import { navigateTo } from 'src/router/navigateTo';
import { Support, Tooltip, LoadDiv, Dialog } from 'ming-ui';
import cx from 'classnames';
import { removePssId } from 'src/util/pssId';
import _ from 'lodash';
import weixin from 'src/api/weixin';
import langConfig from 'src/common/langConfig';
import accountSetting from 'src/api/accountSetting';
import { navigateToLogin } from 'src/router/navigateTo';
import localForage from 'localforage';

export default function UserMenu(props) {
  const [userVisible, handleChangeVisible] = useState(false);
  const [languageVisible, handleChangeLanguageVisible] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [code, setCode] = useState('');
  const logout = () => {
    window.currentLeave = true;

    login.loginOut().then(data => {
      if (data) {
        localForage.clear();
        removePssId();
        window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
        navigateToLogin({ needReturnUrl: false, redirectUrl: _.isObject(data) ? data.redirectUrl : undefined });
      }
    });
  };

  const renderTooltipText = () => {
    return (
      <div
        className="userSetTool"
        onMouseOver={() => {
          $('#userSet #userSetItem').addClass('active');
        }}
        onMouseLeave={() => {
          $('#userSet #userSetItem').removeClass('active');
        }}
      >
        <ul className="userSetTooltip Normal">
          {_.map(md.global.Account.projects, project => {
            return (
              <li
                className="ThemeBGColor3"
                key={project.projectId}
                onClick={() => {
                  props.handleUserVisibleChange(false);
                  handleChangeVisible(false);
                  navigateTo(`/admin/home/${project.projectId}`);
                }}
              >
                <span>{project.companyName}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderTooltipLanguageText = () => {
    return (
      <div
        className="languageSetTool"
        onMouseOver={() => {
          $('#userSet #languageSetItem').addClass('active');
        }}
        onMouseLeave={() => {
          $('#userSet #languageSetItem').removeClass('active');
        }}
      >
        <ul className="languageSetTooltip Normal">
          {langConfig.map(item => (
            <li
              className={cx('ThemeBGColor3', {
                active: (getCookie('i18n_langtag') || md.global.Config.DefaultLang) === item.key,
              })}
              key={item.key}
              onClick={() => {
                accountSetting
                  .editAccountSetting({ settingType: '6', settingValue: getCurrentLangCode(item.key).toString() })
                  .then(res => {
                    if (res) {
                      setCookie('i18n_langtag', item.key);
                      window.location.reload();
                    } else {
                      alert(_l('设置失败，请稍后再试'), 2);
                    }
                  });
              }}
            >
              <span>{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const projectLength = md.global.Account.projects.length;
  const isAccount = md.global.Account.guideSettings.accountMobilePhone || md.global.Account.guideSettings.accountEmail;

  useEffect(() => {
    if (!showDialog || code) return;

    weixin.getWeiXinServiceNumberQRCode().then(function (data) {
      setCode(data);
    });
  }, [showDialog]);

  return (
    <div id="userSet">
      <ul className="userSetUL">
        <li className="ThemeBGColor3" data-tag="account">
          <a href="/personal?type=information" className="Relative">
            <span className="icon icon-task-select-other" />
            {_l('个人账户')}
            {isAccount && <span class="warnLight warnLightUserSetPosition" />}
          </a>
        </li>

        {md.global.Account.superAdmin && (
          <li className="ThemeBGColor3" data-tag="privateDeployment">
            <a href="/privateDeployment/base">
              <span className="icon icon-settings Font16" />
              {_l('系统配置')}
            </a>
          </li>
        )}

        {projectLength ? (
          <li
            className="ThemeBGColor3"
            id="userSetItem"
            onClick={() => {
              projectLength === 1 ? navigateTo(`/admin/home/${md.global.Account.projects[0].projectId}`) : null;
            }}
          >
            <Tooltip
              popupAlign={{
                points: ['tr', 'tl'],
                offset: [-2, -8],
                overflow: { adjustX: true, adjustY: true },
              }}
              onPopupVisibleChange={userVisible => {
                handleChangeVisible(userVisible);
              }}
              action={['hover']}
              popup={renderTooltipText()}
              popupVisible={projectLength > 1 && userVisible}
            >
              <a className="Hand clearfix">
                <span className="icon icon-company" />
                {_l('组织管理')}
                {projectLength > 1 && <span className="Right icon-arrow-right font10 LineHeight36" />}
              </a>
            </Tooltip>
          </li>
        ) : (
          <li className="createCompany" data-tag="createCompany">
            <a href="/personal?type=enterprise" target="_blank">
              <span className="pAll5">{_l('全组织使用')}</span>
            </a>
          </li>
        )}

        <li className="ThemeBGColor3" id="languageSetItem" onClick={() => {}}>
          <Tooltip
            popupAlign={{
              points: ['tr', 'tl'],
              offset: [-2, -8],
              overflow: { adjustX: true, adjustY: true },
            }}
            onPopupVisibleChange={languageVisible => {
              handleChangeLanguageVisible(languageVisible);
            }}
            action={['hover']}
            popup={renderTooltipLanguageText()}
            popupVisible={languageVisible}
          >
            <a className="Hand clearfix">
              <span className="icon icon-public" />
              {_l('语言设置')}
              <span className="Right icon-arrow-right font10 LineHeight36" />
            </a>
          </Tooltip>
        </li>
      </ul>

      {md.global.Config.IsLocal && !md.global.SysSettings.hideDownloadApp && (
        <ul className="userSetUL">
          <li className="ThemeBGColor3" data-tag="appInstallSetting">
            <a href="/appInstallSetting">
              <span className="icon icon-phonelink Font16" />
              {_l('App下载与设置')}
            </a>
          </li>
        </ul>
      )}

      <ul className="userSetUL">
        <li className="ThemeBGColor3">
          <a onClick={logout} rel="external">
            <span className="icon icon-exit" />
            {_l('安全退出')}
          </a>
        </li>
      </ul>

      {showDialog && (
        <Dialog
          visible
          title={_l('关注服务号')}
          width={400}
          footer={null}
          handleClose={() => setShowDialog(false)}
        >
          <div className="flexRow alignItemsCenter">
            <div className="flexColumn justifyContentCenter" style={{ width: 100, height: 100 }}>
              {code ? <img src={code} width="100" height="100" /> : <LoadDiv />}
            </div>
            <div className="flex">{_l('用微信【扫一扫】二维码')}</div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
