import React, { Fragment, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Drawer, Tooltip } from 'ming-ui/antd-components';
import { getCurrentAppId, getCurrentProjectId } from 'src/components/Agent/buildContext';
import Setting from 'src/pages/chat/containers/SettingDrawer';
import Enterprise from 'src/pages/chat/containers/SettingDrawer/enterprise';
import User from 'src/pages/chat/containers/UserDrawer';
import * as actions from 'src/pages/chat/redux/actions';
import Avatar from 'src/pages/PageHeader/components/Avatar';

const AvatarSetting = props => {
  const { appProjectId, embed = false, toolbarConfig, setToolbarConfig, closeSessionPanel } = props;
  const {
    userDrawerVisible,
    settingDrawerVisible,
    organizationDrawerVisible,
    settingDrawerNavType: defaultNavType,
    settingDrawerAuthTab: defaultAuthTab = 'pat',
  } = toolbarConfig;
  const currentProjectId = getCurrentAppId() ? appProjectId : getCurrentProjectId();

  const openOrganizationDrawer = useCallback(() => {
    setToolbarConfig({
      organizationDrawerVisible: true,
      userDrawerVisible: false,
      settingDrawerVisible: false,
      mingoVisible: false,
      sessionListVisible: false,
      favoriteVisible: false,
    });
    setTimeout(closeSessionPanel, 0);
  }, [closeSessionPanel, setToolbarConfig]);

  const openSettingDrawer = useCallback(
    ({ navType = 'base', authTab } = {}) => {
      setToolbarConfig({
        organizationDrawerVisible: false,
        mingoVisible: false,
        sessionListVisible: false,
        favoriteVisible: false,
        userDrawerVisible: false,
        settingDrawerVisible: true,
        settingDrawerNavType: navType,
        settingDrawerAuthTab: authTab || (navType === 'auth' ? 'pat' : defaultAuthTab),
      });
    },
    [defaultAuthTab, setToolbarConfig],
  );

  useEffect(() => {
    window.openOrganizationDrawer = openOrganizationDrawer;
    window.openSettingDrawer = openSettingDrawer;

    return () => {
      if (window.openOrganizationDrawer === openOrganizationDrawer) {
        delete window.openOrganizationDrawer;
      }

      if (window.openSettingDrawer === openSettingDrawer) {
        delete window.openSettingDrawer;
      }
    };
  }, [openOrganizationDrawer, openSettingDrawer]);

  return (
    <Fragment>
      <div className="flexColumn alignItemsCenter justifyContentCenter mTop8 mBottom8">
        <Tooltip title={md.global.Account.fullname} placement={embed ? 'bottom' : 'left'} mouseLeaveDelay={0.1}>
          <div
            onClick={() => {
              setToolbarConfig({
                organizationDrawerVisible: false,
                userDrawerVisible: true,
                settingDrawerVisible: false,
                mingoVisible: false,
                sessionListVisible: false,
                favoriteVisible: false,
              });
              setTimeout(closeSessionPanel, 0);
            }}
          >
            <Avatar src={md.global.Account.avatar} size={32} />
          </div>
        </Tooltip>
      </div>
      <Drawer
        placement="right"
        rootClassName="userDrawerWrap"
        open={userDrawerVisible}
        closable={false}
        onClose={() => setToolbarConfig({ userDrawerVisible: false })}
        getContainer={() => document.body}
        rootStyle={{
          // position: embed ? undefined : 'absolute',
          zIndex: 20,
          right: embed ? 0 : 52,
        }}
        styles={{
          mask: {
            backgroundColor: 'transparent',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <User
          currentProjectId={currentProjectId}
          onClose={() => setToolbarConfig({ userDrawerVisible: false })}
          onChangeSettingDrawerVisible={(visible, navType) => {
            if (visible) {
              openSettingDrawer({ navType, authTab: navType === 'auth' ? 'pat' : defaultAuthTab });
              return;
            }

            setToolbarConfig({ settingDrawerVisible: false });
          }}
          onOpenOrganizationDrawer={openOrganizationDrawer}
        />
      </Drawer>
      <Drawer
        placement="right"
        title={_l('我的组织')}
        mask={false}
        open={organizationDrawerVisible}
        closable={true}
        destroyOnHidden={false}
        size={760}
        onClose={() => setToolbarConfig({ organizationDrawerVisible: false })}
        getContainer={() => (embed ? document.body : document.querySelector('#containerWrapper'))}
        rootStyle={{
          position: embed ? undefined : 'absolute',
          zIndex: 20,
        }}
        styles={{
          mask: {
            backgroundColor: 'transparent',
          },
          title: {
            fontSize: 22,
          },
          body: {
            padding: 0,
          },
        }}
      >
        <Enterprise
          currentProjectId={currentProjectId}
          onClose={() => setToolbarConfig({ organizationDrawerVisible: false })}
        />
      </Drawer>
      <Drawer
        placement="right"
        mask={false}
        open={settingDrawerVisible}
        push={false}
        closable={false}
        size={680}
        onClose={() => setToolbarConfig({ settingDrawerVisible: false })}
        getContainer={() => (embed ? document.body : document.querySelector('#containerWrapper'))}
        rootStyle={{
          position: embed ? undefined : 'absolute',
          zIndex: 20,
        }}
        styles={{
          mask: {
            backgroundColor: 'transparent',
          },
          body: {
            padding: 0,
          },
        }}
      >
        <Setting
          key={`${defaultNavType || 'base'}-${defaultAuthTab}`}
          defaultAuthTab={defaultAuthTab}
          defaultNavType={defaultNavType}
          onClose={() => setToolbarConfig({ settingDrawerVisible: false })}
        />
      </Drawer>
    </Fragment>
  );
};

export default connect(
  state => ({
    appProjectId: state.appPkg.projectId,
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig', 'closeSessionPanel']), dispatch),
)(AvatarSetting);
