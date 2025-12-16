import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import { Dropdown, Menu } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import processApi from 'src/pages/workflow/api/process';
import { canEditApp } from 'worksheet/redux/actions/util.js';
import UnNormal from 'worksheet/views/components/UnNormal';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import ConversationList from 'src/components/Mingo/modules/WorkflowChatBot/ConversationList';
import { setAppThemeColor } from 'src/utils/common';
import { browserIsMobile } from 'src/utils/common';
import defaultProfile from './assets/profile.png';
import Edit from './Edit';
import MoreMenu from './MoreMenu';

const Wrap = styled.div`
  &.light {
    --bg-color: #fff;
    --title-color: #000;
    --sub-title-color: #9e9e9e;
    --input-bg-color: #fff;
    --hover-bg-color: #f5f5f5;
  }
  &.dark {
    --bg-color: #212121;
    --title-color: #fff;
    --sub-title-color: #fff;
    --input-bg-color: #303030;
    --hover-bg-color: #424242;
  }
  flex: 1;
  height: 100%;
  background-color: var(--bg-color);

  .selfStart {
    align-items: self-start;
  }
  .rowWrap {
    .headerRight {
      justify-content: right;
    }
  }
  .chatbotAvatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #dddddd;
  }
  .headerLeft,
  .headerRight {
    padding: 17px;
  }
  .chatbotName {
    color: var(--title-color);
  }
  .navWrap {
    border-right: 1px solid #e0e0e0;
  }
  .content {
    width: 100%;
    margin: 0 auto;
    overflow: hidden;
  }
  .iconWrap {
    width: max-content;
    padding: 5px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      background: var(--hover-bg-color);
    }
  }
`;

const Chatbot = props => {
  const { data, appPkg, navigateToConversation = () => {}, isEmbed = false } = props;
  const [chatbotConfig, setChatbotConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(localStorage.getItem(`chatbotNavVisible`) ? true : false);
  const [editVisible, setEditVisible] = useState(sessionStorage.getItem(`chatbotNewCreate-${data.chatbotId}`));
  const [chatbotAppItem, setChatbotAppItem] = useState({});
  const isDark = _.get(chatbotConfig.config, 'isDark') || false;
  const isCharge = canEditApp(appPkg.permissionType);
  const chatbotName = data.name || chatbotAppItem.workSheetName;
  const appId = appPkg.id || data.appId;

  const handleNavVisible = value => {
    setNavVisible(value);
    value ? localStorage.setItem(`chatbotNavVisible`, true) : localStorage.removeItem(`chatbotNavVisible`);
  };

  const handleChangeIsDark = () => {
    const config = {
      isDark: !isDark,
    };
    processApi
      .saveChatbotConfig({
        chatbotId: data.chatbotId,
        config,
      })
      .then(() => {
        setChatbotConfig(values => ({ ...values, config }));
      });
  };

  useEffect(() => {
    const { chatbotId } = data;
    Promise.all([
      homeAppApi.getItemDetailByAppId({
        appId,
        itemIds: [chatbotId],
      }),
      processApi.getChatbotConfig({ chatbotId }),
    ]).then(data => {
      const [appItme, config] = data;
      if (browserIsMobile() && appItme[0].sectionId) {
        location.href = `/mobile/chatbot/${appId}/${appItme[0].sectionId}/${chatbotId}/${data.conversationId || ''}${location.search || ''}`;
        return;
      }
      if (appItme[0].iconColor) {
        setAppThemeColor(appItme[0].iconColor);
      }
      setChatbotAppItem(appItme[0]);
      setChatbotConfig(config);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flexRow justifyContentCenter alignItemsCenter">
        <LoadDiv />
      </div>
    );
  }

  if (_.isEmpty(chatbotAppItem)) {
    return <UnNormal type="chatbot" resultCode="-20000" />;
  }

  const headerLeft = (
    <div className="flexRow alignItemsCenter headerLeft">
      {!navVisible && (
        <div className="iconWrap">
          <Icon icon="menu_right" className="Font20 Gray_9e pointer" onClick={() => handleNavVisible(!navVisible)} />
        </div>
      )}
      <div className="flexRow alignItemsCenter flex">
        {isEmbed && <img className="chatbotAvatar mRight5" src={chatbotConfig.iconUrl || defaultProfile} />}
        <div className={cx('chatbotName bold Font17 mRight5', { mLeft5: !navVisible })}>{chatbotName}</div>
        {isCharge && (
          <MoreMenu
            {...props}
            desc={chatbotAppItem.desc}
            onChangeDesc={value => setChatbotAppItem(values => ({ ...values, desc: value }))}
          >
            <div className="iconWrap">
              <Icon icon="more_horiz" className="Font20 Gray_9e pointer" />
            </div>
          </MoreMenu>
        )}
      </div>
      {navVisible && (
        <div className="iconWrap">
          <Icon icon="menu_left" className="Font20 Gray_9e pointer" onClick={() => handleNavVisible(!navVisible)} />
        </div>
      )}
    </div>
  );
  const headerRight = (
    <div className="flexRow alignItemsCenter headerRight">
      {!isEmbed && !window.isPublicApp && !md.global.Account.isPortal && (
        <Tooltip title={_l('新页面打开')}>
          <div className="iconWrap mRight10">
            <Icon
              icon="launch"
              className="Font20 Gray_9e pointer"
              onClick={() => {
                window.open(`/embed/chatbot/${appPkg.id}/${data.chatbotId}/${data.conversationId || ''}`);
              }}
            />
          </div>
        </Tooltip>
      )}
      {isCharge && !appPkg.isLock && (
        <Tooltip title={_l('设置')}>
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            overlay={
              <Menu style={{ width: 180 }}>
                <Menu.Item key="edit" onClick={() => setEditVisible(!editVisible)}>
                  <div className="flexRow valignWrapper">
                    <Icon icon="edit" className="Font18 mLeft5 mRight10 Gray_9e" />
                    <div>{_l('编辑对话机器人')}</div>
                  </div>
                </Menu.Item>
                <Menu.Item key="flow" onClick={() => window.open(`/workflowedit/${data.chatbotId}`)}>
                  <div className="flexRow valignWrapper">
                    <Icon icon="hr_structure" className="Font18 mLeft5 mRight10 Gray_9e" />
                    <div>{_l('配置流程')}</div>
                  </div>
                </Menu.Item>
              </Menu>
            }
          >
            <div className="iconWrap">
              <Icon icon="settings" className="Font20 Gray_9e pointer" />
            </div>
          </Dropdown>
        </Tooltip>
      )}
    </div>
  );
  const Content = (
    <div className="content flex">
      <WorkflowChatBot
        maxWidth={800}
        isDark={isDark}
        chatbotId={data.chatbotId}
        conversationId={data.conversationId}
        chatbotConfig={chatbotConfig}
        onGenerateConversation={(newConversationId = '') => {
          navigateToConversation(newConversationId, true);
        }}
      />
    </div>
  );

  return (
    <Wrap className={cx('flexRow chatbotWrap', { light: !isDark, dark: isDark })}>
      <div className={navVisible ? 'flexRow rowWrap w100 h100 overflowHidden' : 'flex flexColumn overflowHidden'}>
        {navVisible ? (
          <div className="navWrap flexColumn overflowHidden" style={{ width: 300 }}>
            {headerLeft}
            <div className="navList flexColumn flex pTop overflowHidden">
              <ConversationList
                appId={appPkg.id}
                name={chatbotName}
                isDark={isDark}
                isCharge={isCharge}
                allowShareChat={md.global.Account.isPortal ? false : chatbotConfig.allowShare}
                chatbotId={data.chatbotId}
                currentConversationId={data.conversationId}
                onSelect={navigateToConversation}
              />
              {/* <div
                    className="iconWrap flexRow alignItemsCenter justifyContentCenter pointer mAll10"
                    onClick={handleChangeIsDark}
                  >
                    <Icon icon="dark-mode" className="Font22 Gray_9e" />
                  </div> */}
            </div>
          </div>
        ) : (
          <div className="flexRow selfStart justifyContentBetween">
            {headerLeft}
            {headerRight}
          </div>
        )}
        <div className={navVisible ? 'flex flexColumn overflowHidden' : 'flex flexColumn minHeight0'}>
          {navVisible && headerRight}
          {Content}
        </div>
      </div>
      {editVisible && (
        <Edit
          data={data}
          chatbotConfig={chatbotConfig}
          onChatbotConfig={setChatbotConfig}
          onClose={() => {
            sessionStorage.removeItem(`chatbotNewCreate-${data.chatbotId}`);
            setEditVisible(false);
          }}
        />
      )}
      {isEmbed && <DocumentTitle title={chatbotAppItem.workSheetName} />}
    </Wrap>
  );
};

export default connect(({ appPkg }) => ({ appPkg }))(Chatbot);
// export default Chatbot;
