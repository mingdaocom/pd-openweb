import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drawer } from 'antd';
import _ from 'lodash';
import 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import Setting from 'src/pages/chat/containers/SettingDrawer';
import User from 'src/pages/chat/containers/UserDrawer';
import * as actions from 'src/pages/chat/redux/actions';
import Avatar from 'src/pages/PageHeader/components/Avatar';

const AvatarSetting = props => {
  const { embed = false, toolbarConfig, setToolbarConfig, closeSessionPanel } = props;
  const [defaultNavType, setDefaultNavType] = useState(null);
  const { userDrawerVisible, settingDrawerVisible } = toolbarConfig;
  return (
    <Fragment>
      <div className="flexColumn alignItemsCenter justifyContentCenter mTop8 mBottom8">
        <Tooltip title={md.global.Account.fullname} placement={embed ? 'bottom' : 'left'} mouseLeaveDelay={0.1}>
          <div
            onClick={() => {
              setToolbarConfig({
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
        className="userDrawerWrap"
        visible={userDrawerVisible}
        closable={false}
        maskStyle={{
          backgroundColor: 'transparent',
        }}
        onClose={() => setToolbarConfig({ userDrawerVisible: false })}
        getContainer={() => document.body}
        style={{
          // position: embed ? undefined : 'absolute',
          zIndex: 20,
          right: embed ? 0 : 52,
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        <User
          onClose={() => setToolbarConfig({ userDrawerVisible: false })}
          onChangeSettingDrawerVisible={(visible, navType) => {
            setDefaultNavType(navType);
            setToolbarConfig({ settingDrawerVisible: visible });
          }}
        />
      </Drawer>
      <Drawer
        placement="right"
        visible={settingDrawerVisible}
        destroyOnClose={true}
        closable={false}
        maskStyle={{
          backgroundColor: 'transparent',
        }}
        width={680}
        onClose={() => setToolbarConfig({ settingDrawerVisible: false })}
        getContainer={() => (embed ? document.body : document.querySelector('#containerWrapper'))}
        style={{
          position: embed ? undefined : 'absolute',
          zIndex: 20,
        }}
        bodyStyle={{
          padding: 0,
        }}
      >
        <Setting defaultNavType={defaultNavType} onClose={() => setToolbarConfig({ settingDrawerVisible: false })} />
      </Drawer>
    </Fragment>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig', 'closeSessionPanel']), dispatch),
)(AvatarSetting);
