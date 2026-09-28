import React, { useState } from 'react';
import cx from 'classnames';
import localForage from 'localforage';
import _ from 'lodash';
import { Icon, Support } from 'ming-ui';
import { Modal, Popover, Tooltip } from 'ming-ui/antd-components';
import accountSettingApi from 'src/api/accountSetting';
import loginApi from 'src/api/login';
import { useKeyboardShortcutsDialog } from 'src/pages/chat/components/KeyboardShortcuts';
import MyStatus from 'src/pages/chat/components/MyStatus';
import { getHasProjectAdminAuth } from 'src/pages/chat/containers/SettingDrawer/enterprise/modules/enterpriseCardUtils';
import Avatar from 'src/pages/PageHeader/components/Avatar';
import { navigateToLogin } from 'src/router/navigation/navigateTo';
import { isSandboxEnvironment } from 'src/utils/domain/app/sandbox';
import { removePssId } from 'src/utils/platform/auth/pssId';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';
import { getAppFeaturesVisible } from 'src/utils/platform/navigation/query';
import { getCurrentProject } from 'src/utils/services/project';
import { PopoverWrap, Wrap } from '../ChatList/Avatar/styled';
import renderHelpPopover from './Help';
import code from './images/code.jpg';
import ThemeMode from './ThemeMode';

const renderLanguagePopover = () => {
  return (
    <PopoverWrap>
      {window.getAllowLangConfig().map(item => (
        <div
          className={cx('itemWrap pointer', {
            active: (getCookie('i18n_langtag') || window.getDefaultLangKey()) === item.key,
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
  const { open: openKeyboardShortcutsDialog, holder: keyboardShortcutsDialogHolder } = useKeyboardShortcutsDialog();
  const { currentProjectId, onClose, onChangeSettingDrawerVisible, onOpenOrganizationDrawer } = props;
  const [showDialog, setShowDialog] = useState(false);
  const [helpPopoverVisible, setHelpPopoverVisible] = useState(false);
  const { Account } = md.global;
  const { ss, tr } = getAppFeaturesVisible();
  const sandboxEnvironment = isSandboxEnvironment();
  const currentProject = getCurrentProject(currentProjectId);
  const canManageCurrentProject = !!(
    tr &&
    currentProject.projectId &&
    currentProject.projectId !== 'external' &&
    getHasProjectAdminAuth(currentProject)
  );

  const showHDP =
    !sandboxEnvironment && md.global.Config.HDPUrl && (window.platformENV.isHap ? true : md.global.Config.EnableHDP);
  return (
    <Wrap className="flexColumn h100">
      {keyboardShortcutsDialogHolder}
      <div className="header flexColumn pBottom20">
        <div className="flexRow alignItemsCenter justifyContentRight horizontalPadding mTop20">
          <Icon icon="close" className="Font20 pointer textSecondary" onClick={() => onClose()} />
        </div>
        <div className="flexColumn alignItemsCenter">
          <Avatar
            src={Account.avatar}
            size={72}
            onClick={() => {
              window.open(getAccountPersonalUrl());
              onClose();
            }}
          />
          <div
            className="w100 borderBox pLeft20 pRight20 TxtCenter WordBreak Font18 bold mTop12"
            title={Account.fullname}
          >
            {Account.fullname}
          </div>
          <div className="Font14 mTop8">{Account.mobilePhone || Account.email}</div>
          {!sandboxEnvironment && (
            <>
              <div
                className="colorPrimary Font14 mTop10 pointer bold myAccount"
                onClick={() => {
                  if (md.global.Account.isSSO || window.isDingTalk) {
                    location.href = getAccountPersonalUrl();
                  } else {
                    window.open(getAccountPersonalUrl());
                  }

                  onClose();
                }}
              >
                {_l('管理我的账户')}
              </div>
              <MyStatus />
            </>
          )}
        </div>
      </div>
      <div className="content flex">
        <div className="divider" />
        {!sandboxEnvironment && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap mTop10"
            onClick={() => {
              onOpenOrganizationDrawer?.();
              onClose();
            }}
          >
            <Icon className="textTertiary Font22" icon="business" />
            <div className="flex mLeft15">{_l('我的组织')}</div>
            {canManageCurrentProject && (
              <Tooltip title={_l('进入%0的组织管理', currentProject.companyName)} placement="top">
                <Icon
                  className="textTertiary Font20 mLeft8"
                  icon="organization_in"
                  onClick={event => {
                    event.stopPropagation();
                    window.location.href = pathCompletion(`/admin/home/${currentProject.projectId}`);
                  }}
                />
              </Tooltip>
            )}
          </div>
        )}
        <Popover
          arrow={true}
          title={null}
          placement="leftTop"
          align={{ offset: [-5, 0] }}
          classNames={{ root: 'userConfigPopover' }}
          styles={{ container: { padding: '5px 0' } }}
          content={renderLanguagePopover()}
        >
          <div className={cx('flexRow alignItemsCenter pointer itemWrap', { mTop10: sandboxEnvironment })}>
            <Icon className="textTertiary Font22" icon="language" />
            <div className="flex mLeft15">{_l('语言')}</div>
            <Icon className="textTertiary Font12" icon="arrow-right" />
          </div>
        </Popover>
        {window.themeModeVisible && (
          <div className="flexRow alignItemsCenter pointer itemWrap notHover Relative">
            <Icon className="textTertiary Font22" icon="dark-mode" />
            <div className="flex mLeft15">{_l('主题')}</div>
            <ThemeMode />
          </div>
        )}
        <div
          className="flexRow alignItemsCenter pointer itemWrap"
          onClick={() => {
            onChangeSettingDrawerVisible(true, 'toolbar');
            onClose();
          }}
        >
          <Icon className="textTertiary Font22" icon="sidebar" />
          <div className="flex mLeft15">{_l('右侧栏')}</div>
        </div>
        <div
          className="flexRow alignItemsCenter pointer itemWrap"
          onClick={() => {
            onChangeSettingDrawerVisible(true, 'auth');
            onClose();
          }}
        >
          <Icon className="textTertiary Font22" icon="key1" />
          <div className="flex mLeft15">{_l('授权与访问')}</div>
        </div>
        <div
          className="flexRow alignItemsCenter pointer itemWrap"
          onClick={() => {
            onChangeSettingDrawerVisible(true, 'base');
            onClose();
          }}
        >
          <Icon className="textTertiary Font22" icon="settings" />
          <div className="flex mLeft15">{_l('更多')}</div>
        </div>
        <div className="divider mTop10 mBottom10" />
        {ss &&
          !md.global.SysSettings.hideHelpTip &&
          (window.platformENV.isOverseas || window.platformENV.isPlatform ? (
            <Popover
              arrow={true}
              title={null}
              placement="leftTop"
              align={{ offset: [-5, 0] }}
              classNames={{ root: 'userConfigPopover' }}
              noPadding
              styles={{ body: { padding: '5px 0' } }}
              open={helpPopoverVisible}
              onOpenChange={setHelpPopoverVisible}
              content={renderHelpPopover({ ...props, onCloseHelpPopover: () => setHelpPopoverVisible(false) })}
            >
              <div className="flexRow alignItemsCenter pointer itemWrap">
                <Icon className="textTertiary Font22" icon="help" />
                <div className="flex mLeft15">{_l('帮助')}</div>
                <Icon className="textTertiary Font12" icon="arrow-right" />
              </div>
            </Popover>
          ) : (
            <Support href="https://help.mingdao.com">
              <div className="flexRow alignItemsCenter pointer itemWrap">
                <Icon className="textTertiary Font22" icon="help" />
                <div className="flex mLeft15">{_l('帮助')}</div>
              </div>
            </Support>
          ))}
        <div className="flexRow alignItemsCenter pointer itemWrap" onClick={() => openKeyboardShortcutsDialog()}>
          <Icon className="textTertiary Font22" icon="keyboard" />
          <div className="flex mLeft15">{_l('快捷键')}</div>
          <Tooltip title={_l('快捷键')} placement="bottom">
            <div className="textSecondary shortcutKey">K</div>
          </Tooltip>
        </div>
        {!md.global.SysSettings.hideDownloadApp && !window.platformENV.isHap && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              window.open(pathCompletion(window.platformENV.isLocal ? '/appInstallSetting' : '/download'));
            }}
          >
            <Icon className="textTertiary Font18" icon="phonelink" />
            <div className="flex mLeft15">{_l('下载客户端')}</div>
          </div>
        )}
        {window.platformENV.isHap && (
          <div className="flexRow alignItemsCenter pointer itemWrap" onClick={() => setShowDialog(true)}>
            <Icon className="textTertiary Font22" icon="wechat" />
            <div className="flex mLeft15">{_l('微信公众号')}</div>
          </div>
        )}
        {showDialog && (
          <Modal
            open
            mask={{ closable: true }}
            keyboard
            title={_l('关注明道云公众号')}
            width={400}
            footer={null}
            onCancel={() => setShowDialog(false)}
          >
            <div className="flexRow alignItemsCenter">
              <div className="flexColumn justifyContentCenter" style={{ width: 100, height: 100 }}>
                <img src={code} />
              </div>
              <div className="flex">{_l('用微信【扫一扫】二维码')}</div>
            </div>
          </Modal>
        )}
        {window.platformENV.isHap && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              window.open('https://www.mingdao.com/affiliate');
            }}
          >
            <Icon className="textTertiary Font22" icon="military_tech" />
            <div className="flex mLeft15">{_l('推广奖励')}</div>
          </div>
        )}

        {(showHDP || md.global.Account.superAdmin) && <div className="divider mTop10 mBottom10" />}
        {showHDP && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              window.open(md.global.Config.HDPUrl);
              onClose();
            }}
          >
            <Icon className="textTertiary Font22" icon="hdp" />
            <div className="flex mLeft15">{_l('HDP 超级数据平台')}</div>
          </div>
        )}
        {md.global.Account.superAdmin && (
          <div
            className="flexRow alignItemsCenter pointer itemWrap"
            onClick={() => {
              window.open(md.global.Config.PlatformUrl);
            }}
          >
            <Icon className="textTertiary Font22" icon="platform_admin" />
            <div className="flex mLeft15">{_l('平台管理')}</div>
          </div>
        )}
      </div>
      <div className="footer flexRow alignItemsCenter justifyContentCenter">
        <div className="flexRow alignItemsCenter pointer textSecondary logout" onClick={logout}>
          <Icon icon="logout" className="Font18" />
          <div className="mLeft2">{_l('安全退出')}</div>
        </div>
      </div>
    </Wrap>
  );
};
