import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import localForage from 'localforage';
import _ from 'lodash';
import { Dialog, LoadDiv, Support, Tooltip } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import login from 'src/api/login';
import weixin from 'src/api/weixin';
import langConfig from 'src/common/langConfig';
import { navigateTo } from 'src/router/navigateTo';
import { navigateToLogin } from 'src/router/navigateTo';
import { removePssId } from 'src/utils/pssId';
import Avatar from '../Avatar';
import './index.less';

export default function UserMenu(props) {
  const { leftCommonUserHandleWrap } = props;
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
        <ul className="userSetTooltip Normal" style={leftCommonUserHandleWrap ? { maxHeight: 352 } : {}}>
          {_.map(md.global.Account.projects, project => {
            const isFree = project.licenseType === 0; // 免费版
            const isTrial = project.licenseType === 2; // 试用版

            return (
              <li
                key={project.projectId}
                onClick={() => {
                  props.handleUserVisibleChange(false);
                  handleChangeVisible(false);
                  navigateTo(`/admin/home/${project.projectId}`);
                }}
              >
                <div className="flex ellipsis ">{project.companyName}</div>
                <div className={cx('Font12 mLeft10 Gray_9e Normal', { trial: isTrial, free: isFree })}>
                  {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(project, 'version.name')}
                </div>
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
              className={cx({
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
      <div className="flexRow accountInfo">
        <Avatar
          src={md.global.Account.avatar}
          size={40}
          onClick={() => {
            navigateTo('/personal?type=information');
          }}
        />
        <div className="mLeft12">
          <div className="Font14 bold">{md.global.Account.fullname}</div>
          <div className="Gray_75 mTop4">{md.global.Account.mobilePhone}</div>
        </div>
      </div>
      <ul className="userSetUL">
        <li data-tag="account">
          <a href="/personal?type=information" className="Relative">
            <span className="icon icon-account_circle" />
            <span className="TxtMiddle">{_l('个人账户')}</span>
            {isAccount && <span class="warnLight warnLightUserSetPosition"></span>}
          </a>
        </li>

        {md.global.Account.superAdmin && (
          <li data-tag="privateDeployment">
            <a
              href="javascript:;"
              onClick={e => {
                e.stopPropagation();
                location.href = md.global.Config.WebUrl + 'pm/sysconfig';
              }}
            >
              <span className="icon icon-settings" />
              {_l('平台管理')}
            </a>
          </li>
        )}

        {projectLength ? (
          <li
            id="userSetItem"
            onClick={() => {
              projectLength === 1 ? navigateTo(`/admin/home/${md.global.Account.projects[0].projectId}`) : null;
            }}
          >
            <Tooltip
              popupAlign={
                leftCommonUserHandleWrap
                  ? { points: ['tl', 'cr'], offset: [5, -135], overflow: { adjustX: true, adjustY: true } }
                  : { points: ['tr', 'tl'], offset: [-13, -8], overflow: { adjustX: true, adjustY: true } }
              }
              onPopupVisibleChange={userVisible => {
                handleChangeVisible(userVisible);
              }}
              action={['hover']}
              popup={renderTooltipText()}
              popupVisible={projectLength > 1 && userVisible}
            >
              <a className="Hand clearfix">
                <span className="icon icon-business" />
                <span className="TxtMiddle">{_l('组织管理')}</span>
                {projectLength > 1 && <span className="Right icon-arrow-right font10 LineHeight36" />}
              </a>
            </Tooltip>
          </li>
        ) : (
          <li className="userSetItem">
            <a className="" href="/personal?type=enterprise" target="_blank">
              <span className="icon icon-organization_add" />
              <span className="TxtMiddle">{_l('创建组织')}</span>
            </a>
          </li>
        )}

        <li id="languageSetItem" onClick={() => {}}>
          <Tooltip
            popupAlign={
              leftCommonUserHandleWrap
                ? { points: ['cl', 'cr'], offset: [5, 55], overflow: { adjustX: true, adjustY: true } }
                : { points: ['tr', 'tl'], offset: [-13, -8], overflow: { adjustX: true, adjustY: true } }
            }
            onPopupVisibleChange={languageVisible => {
              handleChangeLanguageVisible(languageVisible);
            }}
            action={['hover']}
            popup={renderTooltipLanguageText()}
            popupVisible={languageVisible}
          >
            <a className="Hand clearfix">
              <span className="icon icon-language" />
              <span className="TxtMiddle">{_l('语言设置')}</span>
              <span className="Right icon-arrow-right font10 LineHeight36" />
            </a>
          </Tooltip>
        </li>
      </ul>

      {md.global.Config.IsLocal && !md.global.SysSettings.hideDownloadApp && (
        <ul className="userSetUL">
          <li data-tag="appInstallSetting">
            <a href="/appInstallSetting">
              <span className="icon icon-phonelink Font16" />
              {_l('App下载与设置')}
            </a>
          </li>
        </ul>
      )}

      <ul className="userSetUL">
        <li>
          <a onClick={logout} rel="external">
            <span className="icon icon-logout" />
            <span className="TxtMiddle">{_l('安全退出')}</span>
          </a>
        </li>
      </ul>

      {showDialog && (
        <Dialog visible title={_l('关注服务号')} width={400} footer={null} handleClose={() => setShowDialog(false)}>
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
