import React, { useCallback, useState } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Dialog, Dropdown, Icon, Menu } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import accountSetting from 'src/api/accountSetting';
import externalPortalAjax from 'src/api/externalPortal';
import langConfig from 'src/common/langConfig';
import AvatorInfo from 'src/pages/Personal/personalInfo/modules/AvatorInfo.jsx';
import 'src/pages/Personal/personalInfo/modules/index.less';
import UserInfoDialog from 'src/pages/Role/PortalCon/components/UserInfoDialog';
import { formatDataForPortalControl, renderText } from 'src/pages/Role/PortalCon/tabCon/util';
import { browserIsMobile, emitter, setBodyThemeMode } from 'src/utils/common';
import BindContactDialog from './BindContactDialog';
import ChangeAccountDialog from './ChangeAccountDialog';
import DelDialog from './DelDialog';
import FindPwdDialog from './FindPwdDialog';
import { ModalWrap, RedMenuItemWrap, Wrap } from './style';
import './index.less';

export default function PortalUserInfoDrawer(props) {
  const {
    visible,
    onClose,
    isMobile,
    currentPcNaviStyle,
    appId,
    currentData = [],
    avatar,
    hasPassword,
    baseInfo = {},
    url,
    onLogout,
    onAvatarUpdate,
    onDetailUpdate,
    updatePortalDetail,
    showBind,
    onBindComplete,
  } = props;

  const [showMenu, setShowMenu] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [showTelDialog, setShowTelDialog] = useState(false);
  const [showDelDialog, setShowDelDialog] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [type, setType] = useState('');

  const handleUploadImg = useCallback(() => {
    Dialog.confirm({
      dialogClasses: 'uploadAvatorDialogId',
      width: browserIsMobile() ? '335px' : '460px',
      title: _l('上传头像'),
      noFooter: true,
      children: (
        <AvatorInfo
          editAvatar={res => {
            externalPortalAjax
              .saveUserDetail({
                appId,
                exAccountId: md.global.Account.accountId,
                newCell: (currentData || [])
                  .filter(o => ['avatar'].includes(o.alias))
                  .map(o => ({ ...o, value: res.fileName })),
              })
              .then(res => {
                const newAvatar = res.data.portal_avatar;
                md.global.Account.avatar = newAvatar;
                onAvatarUpdate && onAvatarUpdate(newAvatar);
                $('.uploadAvatorDialogId').parent().remove();
              });
          }}
          avatar={(avatar || '').split('imageView2')[0]}
          closeDialog={() => {
            $('.uploadAvatorDialogId').parent().remove();
          }}
        />
      ),
    });
  }, [appId, avatar, currentData, onAvatarUpdate]);

  const account =
    (currentData.find(o => [type !== 'email' ? 'portal_mobile' : 'portal_email'].includes(o.controlId)) || {}).value ||
    (currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ||
    (currentData.find(o => ['portal_email'].includes(o.controlId)) || {}).value;

  const info = currentData.filter(
    o =>
      !['name', 'mobilephone', 'avatar', 'firstLoginTime', 'roleid', 'status', 'openid', 'portal_email'].includes(
        o.alias,
      ),
  );

  const currentLangKey = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
  const langDropdownData = langConfig.map(item => ({ text: item.value, value: item.key }));
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('themeMode') || 'light');

  const themeModes = [
    { value: 'light', name: _l('浅色'), icon: 'light_mode' },
    { value: 'dark', name: _l('深色'), icon: 'dark_mode' },
    { value: 'system', name: _l('跟随设备'), icon: 'computer' },
  ];

  const handleThemeChange = useCallback(value => {
    setThemeMode(value);
    setBodyThemeMode(value);
    window.themeMode = value;
    localStorage.setItem('themeMode', value);
    if (['dark', 'light'].includes(value)) {
      emitter.emit('CHANGE_THEME_MODE', value);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      emitter.emit('CHANGE_THEME_MODE', isDark ? 'dark' : 'light');
    }
  }, []);

  const handleLangChange = useCallback(value => {
    accountSetting
      .editAccountSetting({
        settingType: '6',
        settingValue: getCurrentLangCode(value).toString(),
      })
      .then(res => {
        if (res) {
          setCookie('i18n_langtag', value);
          window.location.reload();
        } else {
          alert(_l('设置失败，请稍后再试'), 2);
        }
      });
  }, []);

  return (
    <>
      <Drawer
        width={isMobile ? '100%' : 480}
        className={[1, 3].includes(currentPcNaviStyle) ? '' : 'Absolute'}
        onClose={onClose}
        placement="right"
        visible={visible}
        maskClosable={true}
        closable={false}
        getContainer={![1, 3].includes(currentPcNaviStyle)}
        mask={true}
        bodyStyle={{ padding: 0 }}
      >
        <Wrap className={cx('flexColumn h100', { isMobile, leftNaviStyle: [1, 3].includes(currentPcNaviStyle) })}>
          {isMobile && (
            <span className="Font17 Hand InlineBlock back pLeft16" onClick={onClose}>
              <Icon icon="backspace mRight8 textTertiary" />
              {_l('我的账户')}
            </span>
          )}
          <div className="infoConBox flex">
            <div className="account flexRow alignItemsCenter">
              <div className="flex Font28 Bold">{md.global.Account.fullname}</div>
              <div
                className={cx('userImage', baseInfo?.portalSetResult?.editPersonalInfo ? 'Hand' : 'noEditAvatar')}
                onClick={baseInfo?.portalSetResult?.editPersonalInfo ? handleUploadImg : undefined}
              >
                <img
                  className="avatarImg"
                  src={(avatar || '').split('imageView2')[0]}
                  style={{ width: 56, height: 56, borderRadius: '50%' }}
                />
                <div className="hoverAvatar">
                  <span className="Font20 icon-upload_pictures"></span>
                </div>
              </div>
            </div>

            <div className="sectionBlock mTop24">
              <div className="sectionTitle textPrimary flexRow alignItemsCenter Font15 Bold mBottom12">
                <Icon icon="person" className="sectionTitleIcon mRight8 Font24 textTertiary" />
                <span>{_l('个人信息')}</span>
              </div>
              <div className={cx('email mTop16 flexRow justifyContentBetween')}>
                <span className="title textTertiary pRight5" title={_l('手机号')}>
                  {_l('手机号')}
                </span>
                <span className="telNumber Block">
                  {(currentData.find(o => o.alias === 'mobilephone') || {}).value}
                  {baseInfo?.portalSetResult?.editPersonalInfo && (
                    <span
                      className={cx('edit ThemeColor3 Hand InlineBlock', {
                        mLeft10: (currentData.find(o => o.alias === 'mobilephone') || {}).value,
                      })}
                      onClick={() => {
                        setShowTelDialog(true);
                        setType('phone');
                      }}
                    >
                      {(currentData.find(o => o.alias === 'mobilephone') || {}).value ? _l('修改') : _l('绑定')}
                    </span>
                  )}
                </span>
              </div>
              <div className={cx('tel mTop16 flexRow justifyContentBetween')}>
                <span className="title textTertiary pRight5" title={_l('邮箱')}>
                  {_l('邮箱')}
                </span>
                <span className="telNumber Block">
                  {(currentData.find(o => o.controlId === 'portal_email') || {}).value}
                  {baseInfo?.portalSetResult?.editPersonalInfo && (
                    <span
                      className={cx('edit ThemeColor3 Hand InlineBlock', {
                        mLeft10: (currentData.find(o => o.controlId === 'portal_email') || {}).value,
                      })}
                      onClick={() => {
                        setShowTelDialog(true);
                        setType('email');
                      }}
                    >
                      {(currentData.find(o => o.controlId === 'portal_email') || {}).value ? _l('修改') : _l('绑定')}
                    </span>
                  )}
                </span>
              </div>
              <div className={cx('tel mTop16 flexRow justifyContentBetween')}>
                <span className="title textTertiary" title={_l('密码')}>
                  {_l('密码')}
                </span>
                <span className={cx('telNumber Block', { textDisabled: !hasPassword })}>
                  {hasPassword ? _l('已设置') : _l('未设置')}
                  {baseInfo?.portalSetResult?.editPersonalInfo && (
                    <span className="edit ThemeColor3 Hand mLeft10 InlineBlock" onClick={() => setShowChangePwd(true)}>
                      {_l('修改')}
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="BorderTop mTop20" />
            <div className="sectionBlock mTop24">
              <div className="sectionTitle textPrimary flexRow alignItemsCenter Font15 Bold mBottom12">
                <Icon icon="settings" className="sectionTitleIcon mRight8 Font18 textTertiary" />
                <span>{_l('设置')}</span>
              </div>
              <div className={cx('tel flexRow alignItemsCenter justifyContentBetween mTop16')}>
                <span className="title textTertiary pRight5" title={_l('语言')}>
                  {_l('语言')}
                </span>
                <Dropdown
                  className="langSettingDropdown"
                  value={currentLangKey}
                  data={langDropdownData}
                  onChange={handleLangChange}
                  dropIcon="arrow-right-border"
                  isAppendToBody
                  points={['tr', 'br']}
                  offset={[0, 1]}
                  menuStyle={{ width: 180 }}
                />
              </div>
              <div className={cx('tel flexRow alignItemsCenter justifyContentBetween mTop16')}>
                <span className="title textTertiary pRight5" title={_l('主题')}>
                  {_l('主题')}
                </span>
                <div className="themeSwitcher flexRow alignItemsCenter">
                  {themeModes.map(item => (
                    <Tooltip title={item.name} placement="bottom" key={item.value}>
                      <div
                        className={cx('themeSwitcherItem flexRow alignItemsCenter justifyContentCenter Hand', {
                          active: item.value === themeMode,
                        })}
                        onClick={() => handleThemeChange(item.value)}
                      >
                        <Icon icon={item.icon} className="textTertiary Font18" />
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            <div className="BorderTop mTop20" />
            <div className="sectionBlock mTop24">
              <div className="sectionTitle textPrimary flexRow alignItemsCenter Font15 Bold mBottom12">
                <Icon icon="draft-box" className="sectionTitleIcon mRight8 Font18 textTertiary" />
                <span>{_l('我的信息')}</span>
              </div>
              <div className="infoBox">
                {info
                  .filter(o => o.fieldPermission && o.fieldPermission[2] !== '1')
                  .sort((a, b) => a.row - b.row)
                  .map(o => (
                    <div key={o.controlId} className="tel flexRow mTop10 justifyContentBetween">
                      <span className="title InlineBlock textTertiary pRight5 WordBreak" title={o.controlName}>
                        {o.controlName}
                      </span>
                      <span className={cx('mLeft24 rInfo', { isOption: [9, 10, 11].includes(o.type) })}>
                        {renderText({ ...o }, { appId })}
                      </span>
                    </div>
                  ))}
                {baseInfo?.portalSetResult?.editPersonalExtInfo && (
                  <span
                    className="edit ThemeColor3 Hand mTop12 InlineBlock"
                    onClick={() => setShowUserInfoDialog(true)}
                  >
                    {_l('修改')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="logoutBox flexRow alignItemsCenter">
            <div
              className="logout flexShrink0 flex minWidth0 alignItemsCenter justifyContentCenter TxtCenter LineHeight36 Hand Font14 Bold"
              onClick={() => onLogout(true)}
            >
              <Icon icon="logout" className="mRight5 Font18" />
              {_l('安全退出')}
            </div>
            {browserIsMobile() ? (
              <div
                className="opt alignItemsCenter justifyContentCenter Hand TxtCenter flexRow"
                onClick={() => setShowModel(true)}
              >
                <Icon icon="more_horiz" className="Font18" />
              </div>
            ) : (
              <Trigger
                action={['click']}
                popupVisible={showMenu}
                onPopupVisibleChange={setShowMenu}
                popup={
                  <Menu>
                    <RedMenuItemWrap
                      className="RedMenuItem"
                      onClick={() => {
                        setShowDelDialog(true);
                        setShowMenu(false);
                      }}
                    >
                      <span>{_l('注销此账户')}</span>
                    </RedMenuItemWrap>
                  </Menu>
                }
                popupClassName={cx('dropdownTrigger')}
                popupAlign={{
                  points: ['tl', 'bl'],
                  overflow: { adjustX: true, adjustY: true },
                }}
              >
                <div
                  className="opt alignItemsCenter justifyContentCenter Hand TxtCenter flexRow"
                  onClick={() => setShowMenu(true)}
                >
                  <Icon icon="more_horiz" className="Font18" />
                </div>
              </Trigger>
            )}
          </div>
        </Wrap>
      </Drawer>
      {showModel && (
        <ModalWrap
          visible={showModel}
          className="appMoreActionWrap mobileModal minFull topRadius"
          onClose={() => setShowModel(false)}
        >
          <div className="flexRow alignItemsCenter header mBottom20">
            <div className="Font13 textTertiary flex TxtLeft">{_l('更多')}</div>
            <div className="closeIcon TxtCenter" onClick={() => setShowModel(false)}>
              <Icon icon="close" className="Font17 textTertiary Bold" />
            </div>
          </div>
          <div className="actionContent TxtLeft Bold">
            <div
              className="RedMenuItem"
              onClick={() => {
                setShowModel(false);
                setShowDelDialog(true);
              }}
            >
              <span>{_l('注销此账户')}</span>
            </div>
          </div>
        </ModalWrap>
      )}
      {showUserInfoDialog && (
        <UserInfoDialog
          appId={appId}
          classNames={browserIsMobile() ? 'forMobilePortal' : ''}
          show={showUserInfoDialog}
          currentData={currentData
            .filter(
              o =>
                !['avatar', 'firstLoginTime', 'portal_logintime', 'roleid', 'status'].includes(o.alias) &&
                o?.fieldPermission?.[2] !== '1',
            )
            .map(o => (['portal_mobile', 'portal_email'].includes(o.controlId) ? { ...o, disabled: true } : o))}
          exAccountId={md.global.Account.accountId}
          setShow={() => setShowUserInfoDialog(false)}
          onOk={(data, ids) => {
            externalPortalAjax
              .saveUserDetail({
                appId,
                exAccountId: md.global.Account.accountId,
                newCell: formatDataForPortalControl(data.filter(o => ids.includes(o.controlId))),
              })
              .then(() => {
                setShowUserInfoDialog(false);
                onDetailUpdate && onDetailUpdate(data);
                ids.includes('portal_name') && location.reload();
              });
          }}
        />
      )}
      {showTelDialog && (
        <ChangeAccountDialog
          type={type}
          baseInfo={baseInfo}
          isBind={
            (!(currentData.find(o => o.controlId === 'portal_email') || {}).value && type === 'email') ||
            (!(currentData.find(o => o.controlId === 'portal_mobile') || {}).value && type === 'phone')
          }
          appId={appId}
          classNames={browserIsMobile() ? 'forMobilePortal' : ''}
          show={showTelDialog}
          account={account}
          exAccountId={md.global.Account.accountId}
          setShow={() => {
            setShowTelDialog(false);
            setType('');
          }}
          onOk={() => {
            if (
              (!(currentData.find(o => o.controlId === 'portal_email') || {}).value && type === 'email') ||
              (!(currentData.find(o => o.controlId === 'portal_mobile') || {}).value && type === 'phone')
            ) {
              setShowTelDialog(false);
              setType('');
              updatePortalDetail && updatePortalDetail(appId);
            } else {
              onLogout();
            }
          }}
        />
      )}
      {showChangePwd && (
        <FindPwdDialog
          type={type}
          baseInfo={baseInfo}
          appId={appId}
          classNames={browserIsMobile() ? 'forMobilePortal' : ''}
          show={showChangePwd}
          account={account}
          exAccountId={md.global.Account.accountId}
          setShow={() => setShowChangePwd(false)}
          onOk={() => onLogout()}
        />
      )}
      {showDelDialog && (
        <DelDialog
          url={url}
          type={!(currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ? 'email' : 'phone'}
          appId={appId}
          classNames={browserIsMobile() ? 'forMobilePortal' : ''}
          show={showDelDialog}
          account={account}
          exAccountId={md.global.Account.accountId}
          setShow={() => setShowDelDialog(false)}
          onOk={() => onLogout()}
        />
      )}
      {showBind && (
        <BindContactDialog
          type={(currentData.find(o => ['portal_mobile'].includes(o.controlId)) || {}).value ? 'email' : 'phone'}
          appId={appId}
          onOk={() => onBindComplete && onBindComplete()}
        />
      )}
    </>
  );
}
