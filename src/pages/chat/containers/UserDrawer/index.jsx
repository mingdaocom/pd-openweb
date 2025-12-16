import React, { Fragment } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import localForage from 'localforage';
import _ from 'lodash';
import { Icon, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import accountSettingApi from 'src/api/accountSetting';
import loginApi from 'src/api/login';
import langConfig from 'src/common/langConfig';
import { dialogKeyboardShortcuts } from 'src/pages/chat/components/KeyboardShortcuts';
import MyStatus from 'src/pages/chat/components/MyStatus';
import Avatar from 'src/pages/PageHeader/components/Avatar';
import { navigateTo } from 'src/router/navigateTo';
import { navigateToLogin } from 'src/router/navigateTo';
import { getAppFeaturesVisible } from 'src/utils/app';
import { removePssId } from 'src/utils/pssId';
import { PopoverWrap, Wrap } from '../ChatList/Avatar/styled';

const renderLanguagePopover = () => {
  return (
    <PopoverWrap>
      {langConfig.map(item => (
        <div
          className={cx('itemWrap pointer', {
            active: (getCookie('i18n_langtag') || md.global.Config.DefaultLang) === item.key,
          })}
          key={item.key}
          onClick={() => {
            accountSettingApi
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
        </div>
      ))}
    </PopoverWrap>
  );
};

const renderProjectsPopover = props => {
  return (
    <PopoverWrap style={{ maxHeight: 600, overflowY: 'auto' }}>
      {_.map(md.global.Account.projects, project => {
        const isFree = project.licenseType === 0; // 免费版
        const isTrial = project.licenseType === 2; // 试用版
        return (
          <div
            className="itemWrap flexRow alignItemsCenter pointer"
            key={project.projectId}
            onClick={() => {
              navigateTo(`/admin/home/${project.projectId}`);
              props.onClose();
            }}
          >
            <div className="flex ellipsis">{project.companyName}</div>
            <div className={cx('Font12 mLeft10 Gray_9e Normal', { trial: isTrial, free: isFree })}>
              {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(project, 'version.name')}
            </div>
          </div>
        );
      })}
    </PopoverWrap>
  );
};

const logout = () => {
  window.currentLeave = true;
  loginApi.loginOut().then(data => {
    if (data) {
      localForage.clear();
      removePssId();
      window.localStorage.removeItem('LoginCheckList'); // accountId 和 encryptPassword 清理掉
      navigateToLogin({ needReturnUrl: false, redirectUrl: _.isObject(data) ? data.redirectUrl : undefined });
    }
  });
};

export default props => {
  const { onClose, onChangeSettingDrawerVisible } = props;
  const { Account } = md.global;
  const projectLength = Account.projects.length;
  const { ss } = getAppFeaturesVisible();

  return (
    <Wrap className="flexColumn h100">
      <div className="header flexColumn pBottom20">
        <div className="flexRow alignItemsCenter justifyContentRight horizontalPadding mTop20">
          <Icon icon="close" className="Font20 pointer Gray_75" onClick={() => onClose()} />
        </div>
        <div className="flexColumn alignItemsCenter">
          <Avatar
            src={Account.avatar}
            size={72}
            onClick={() => {
              window.open('/personal?type=information');
              onClose();
            }}
          />
          <div className="Font18 bold mTop12">{Account.fullname}</div>
          <div className="Font14 mTop8">{Account.mobilePhone || Account.email}</div>
          <div
            className="ThemeColor Font14 mTop10 pointer bold myAccount"
            onClick={() => {
              if (md.global.Account.isSSO || window.isDingTalk) {
                location.href = '/personal?type=information';
              } else {
                window.open('/personal?type=information');
              }

              onClose();
            }}
          >
            {_l('管理我的账户')}
          </div>
          <MyStatus />
        </div>
      </div>
      <div className="content flex">
        <div className="divider" />
        {projectLength ? (
          projectLength === 1 ? (
            <div
              className="flexRow alignItemsCenter pointer itemWrap mTop10"
              onClick={() => {
                navigateTo(`/admin/home/${Account.projects[0].projectId}`);
                onClose();
              }}
            >
              <Icon className="Gray_9e Font22" icon="business" />
              <div className="flex mLeft15">{_l('组织管理')}</div>
            </div>
          ) : (
            <Popover
              title={null}
              placement="leftTop"
              overlayClassName="userConfigPopover"
              overlayStyle={{ padding: 0 }}
              content={renderProjectsPopover(props)}
              getPopupContainer={() => document.querySelector('.userDrawerWrap')}
            >
              <div className="flexRow alignItemsCenter pointer itemWrap mTop10">
                <Icon className="Gray_9e Font22" icon="business" />
                <div className="flex mLeft15">{_l('组织管理')}</div>
                <Icon className="Gray_9e Font12" icon="arrow-right" />
              </div>
            </Popover>
          )
        ) : (
          <div
            className="flexRow alignItemsCenter pointer itemWrap mTop10"
            onClick={() => {
              navigateTo('/personal?type=enterprise');
              onClose();
            }}
          >
            <Icon className="Gray_9e Font22" icon="organization_add" />
            <div className="flex mLeft15">{_l('创建组织')}</div>
          </div>
        )}
        <Popover
          title={null}
          placement="leftTop"
          overlayClassName="userConfigPopover"
          overlayStyle={{ padding: 0 }}
          content={renderLanguagePopover()}
        >
          <div className="flexRow alignItemsCenter pointer itemWrap">
            <Icon className="Gray_9e Font22" icon="language" />
            <div className="flex mLeft15">{_l('语言')}</div>
            <Icon className="Gray_9e Font12" icon="arrow-right" />
          </div>
        </Popover>
        <div
          className="flexRow alignItemsCenter pointer itemWrap"
          onClick={() => {
            onChangeSettingDrawerVisible(true, 'base');
            onClose();
          }}
        >
          <Icon className="Gray_9e Font22" icon="settings" />
          <div className="flex mLeft15">{_l('使用设置')}</div>
        </div>
        <div
          className="flexRow alignItemsCenter pointer itemWrap"
          onClick={() => {
            onChangeSettingDrawerVisible(true, 'toolbar');
            onClose();
          }}
        >
          <Icon className="Gray_9e Font22" icon="sidebar" />
          <div className="flex mLeft15">{_l('右侧栏设置')}</div>
        </div>
        {md.global.Config.HDPUrl && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              window.open(md.global.Config.HDPUrl);
              onClose();
            }}
          >
            <Icon className="Gray_9e Font22" icon="hdp" />
            <div className="flex mLeft15">{_l('HDP 超级数据平台')}</div>
          </div>
        )}
        <div className="divider mTop10 mBottom10" />
        {ss && !md.global.SysSettings.hideHelpTip && (
          <Support href="https://help.mingdao.com">
            <div className="flexRow alignItemsCenter pointer itemWrap">
              <Icon className="Gray_9e Font22" icon="help" />
              <div className="flex mLeft15">{_l('帮助')}</div>
            </div>
          </Support>
        )}
        <div className="flexRow alignItemsCenter pointer itemWrap" onClick={() => dialogKeyboardShortcuts()}>
          <Icon className="Gray_9e Font22" icon="keyboard" />
          <div className="flex mLeft15">{_l('键盘快捷键')}</div>
          <Tooltip title={_l('快捷键')} placement="bottom">
            <div className="Gray_75 shortcutKey">K</div>
          </Tooltip>
        </div>
        {!md.global.SysSettings.hideDownloadApp && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              location.href = '/appInstallSetting';
            }}
          >
            <Icon className="Gray_9e Font18" icon="phonelink" />
            <div className="flex mLeft15">{_l('下载客户端')}</div>
          </div>
        )}
        {md.global.Account.superAdmin && (
          <Fragment>
            <div className="divider mTop10 mBottom10" />
            <div
              className="flexRow alignItemsCenter pointer itemWrap"
              onClick={() => {
                const { PlatformUrl, WebUrl } = md?.global?.Config || {};
                const url = PlatformUrl || WebUrl; //没有PlatformUrl就还是WebUrl
                window.open(url + 'sysconfig');
              }}
            >
              <Icon className="Gray_9e Font22" icon="settings1" />
              <div className="flex mLeft15">{_l('平台管理')}</div>
            </div>
          </Fragment>
        )}
      </div>
      <div className="footer flexRow alignItemsCenter justifyContentCenter">
        <div className="flexRow alignItemsCenter pointer Gray_75 logout" onClick={logout}>
          <Icon icon="logout" className="Font18" />
          <div className="mLeft2">{_l('安全退出')}</div>
        </div>
      </div>
    </Wrap>
  );
};
