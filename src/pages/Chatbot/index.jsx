import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import processApi from 'src/pages/workflow/api/process';
import Share from 'worksheet/components/Share';
import UnNormal from 'worksheet/views/components/UnNormal';
import { buildChatbotShareProps } from 'src/components/Mingo/modules/chatbotShare';
import WorkflowChatBot from 'src/components/Mingo/modules/WorkflowChatBot';
import ConversationList from 'src/components/Mingo/modules/WorkflowChatBot/ConversationList';
import chatbotAjax from 'src/pages/workflow/apiV2/chatbot';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { canEditApp } from 'src/utils/domain/permission/app';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { setAppThemeColor } from 'src/utils/platform/theme/theme';
import { getTranslateInfo } from 'src/utils/services/app';
import defaultProfile from './assets/profile.png';
import Edit from './Edit';
import MoreMenu from './MoreMenu';

const Wrap = styled.div`
  flex: 1;
  height: 100%;
  background-color: var(--color-background-primary);
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
    border: 1px solid var(--color-border-primary);
  }
  .headerLeft,
  .headerRight {
    padding: 17px;
  }
  .chatbotName {
    color: var(--color-text-primary);
  }
  .navWrap {
    border-right: 1px solid var(--color-border-tertiary);
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
      background: var(--color-background-hover);
    }
  }
`;

const Chatbot = props => {
  const { data, appPkg, navigateToConversation = () => {}, isEmbed = false } = props;
  const { chatbotId, conversationId } = data;
  const [chatbotConfig, setChatbotConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [navVisible, setNavVisible] = useState(localStorage.getItem(`chatbotNavVisible`) ? true : false);
  const [editVisible, setEditVisible] = useState(sessionStorage.getItem(`chatbotNewCreate-${chatbotId}`));
  const [chatbotAppItem, setChatbotAppItem] = useState({});
  const [shareVisible, setShareVisible] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('');
  // 新会话的 id 由服务端在流式过程中下发，回传后还要经 navigateToConversation 绕一圈路由才回到 data，
  // 这段空窗里顶部分享是灰的、左侧会话列表却已能分享。这里直接收下回传值兜住空窗，
  // 切换会话与新建对话都会带着新值（或空串）再次回调，不会残留上一个会话的 id。
  const [generatedConversationId, setGeneratedConversationId] = useState('');
  // 读取失败（已删除 / 无权访问）的会话 id：存 id 而不是布尔值，切到别的会话时判断自然失效，
  // 不需要再写一个副作用去重置
  const [unavailableConversationId, setUnavailableConversationId] = useState('');
  const requestRef = useRef({});
  const conversationIdRef = useRef(conversationId);
  const isDark = _.get(chatbotConfig.config, 'isDark') || false;
  const isCharge = canEditApp(appPkg.permissionType);
  const appId = appPkg.id || data.appId;
  const chatbotName = getTranslateInfo(appId, null, chatbotId).name || data.name || chatbotAppItem.workSheetName;
  const currentConversationId = data.conversationId || generatedConversationId;
  // 当前 URL 上的会话读不出来（被删除或无权访问）：正文换成异常态，顶部分享也一并收起
  const conversationUnavailable = !!data.conversationId && unavailableConversationId === data.conversationId;
  const settingMenuItems = [
    {
      key: 'edit',
      icon: <Icon icon="edit" className="Font18 textTertiary" />,
      label: _l('编辑对话机器人'),
      onClick: () => setEditVisible(!editVisible),
    },
    {
      key: 'flow',
      icon: <Icon icon="hr_structure" className="Font18 textTertiary" />,
      label: _l('配置流程'),
      onClick: () => window.open(pathCompletion(`/workflowedit/${data.chatbotId}`)),
    },
  ];

  const handleNavVisible = value => {
    setNavVisible(value);
    value ? localStorage.setItem(`chatbotNavVisible`, true) : localStorage.removeItem(`chatbotNavVisible`);
  };

  // 顶部「分享」：直接分享当前整个会话，不进入消息勾选态。会话标题用于分享弹窗标题及分享页展示，
  // 取不到时退回机器人名称，不阻塞弹窗打开。
  const handleOpenShare = async () => {
    if (!currentConversationId) return;

    try {
      const res = await chatbotAjax.getConversation({
        chatbotId: data.chatbotId,
        conversationId: currentConversationId,
      });
      setConversationTitle(res.title || chatbotName);
    } catch (err) {
      console.error('[chatbot-share] get conversation failed', err);
      setConversationTitle(chatbotName);
    }

    setShareVisible(true);
  };

  // 会话 id 仅移动端重定向时需要，用 ref 取最新值，不能放进下方副作用的依赖（见其注释）
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // 机器人信息与配置只由 appId / chatbotId 决定，与具体会话无关，因此不依赖 conversationId：
  // 新会话首条消息时服务端在流式过程中下发 conversationId 并同步到 URL，若这里跟着重跑副作用，
  // setLoading(true) 会让下方 WorkflowChatBot 整棵卸载，useChat 的卸载 cleanup 随即 abort 掉在途
  // 的流式请求，表现为回答刚开始就被自动终止。切换会话由 WorkflowChatBot 自身的副作用负责重载。
  useEffect(() => {
    const appItemRequest = homeAppApi.getItemDetailByAppId({
      appId,
      itemIds: [chatbotId],
    });
    const configRequest = processApi.getChatbotConfig({ chatbotId });

    requestRef.current = { appItemRequest, configRequest };
    setLoading(true);
    setChatbotAppItem({});
    setChatbotConfig({});

    Promise.all([appItemRequest, configRequest])
      .then(res => {
        if (
          requestRef.current.appItemRequest !== appItemRequest ||
          requestRef.current.configRequest !== configRequest
        ) {
          return;
        }

        const [appItem, config] = res;

        if (browserIsMobile() && appItem[0].sectionId) {
          location.href = pathCompletion(
            `/mobile/chatbot/${appId}/${appItem[0].sectionId}/${chatbotId}/${conversationIdRef.current || ''}${location.search || ''}`,
          );
          return;
        }

        if (appItem[0].iconColor) {
          setAppThemeColor(appItem[0].iconColor);
        }

        setChatbotAppItem(appItem[0]);
        setChatbotConfig(config);
        setLoading(false);
      })
      .catch(() => {
        if (
          requestRef.current.appItemRequest !== appItemRequest ||
          requestRef.current.configRequest !== configRequest
        ) {
          return;
        }

        setLoading(false);
      });

    return () => {
      appItemRequest.abort && appItemRequest.abort();
      configRequest.abort && configRequest.abort();
      if (requestRef.current.appItemRequest === appItemRequest && requestRef.current.configRequest === configRequest) {
        requestRef.current = {};
      }
    };
  }, [appId, chatbotId]);

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
          <Icon
            icon="menu_right"
            className="Font20 textTertiary pointer"
            onClick={() => handleNavVisible(!navVisible)}
          />
        </div>
      )}
      <div className="flexRow alignItemsCenter flex">
        {isEmbed && <img className="chatbotAvatar mRight5" src={chatbotConfig.iconUrl || defaultProfile} />}
        {!isEmbed && appPkg.currentPcNaviStyle === 2 && (
          <div className="iconWrap mRight5">
            <Tooltip
              arrow={{ pointAtCenter: true }}
              title={_l('退出全屏')}
              shortcut={window.isMacOs ? '⌘/' : 'Ctrl+/'}
              placement="bottom"
            >
              <Icon
                className="Font20 textTertiary pointer"
                icon="backspace"
                onClick={() => {
                  window.disabledSideButton = true;
                  navigateTo(`/app/${appId}/${data.groupId}`);
                }}
              />
            </Tooltip>
          </div>
        )}
        <div className={cx('chatbotName bold Font17 mRight5', { mLeft5: !navVisible })}>{chatbotName}</div>
        <MoreMenu
          {...props}
          isCharge={isCharge}
          isLand={isEmbed}
          desc={chatbotAppItem.desc}
          remark={chatbotAppItem.remark}
          onChangeDesc={value => setChatbotAppItem(values => ({ ...values, ...value }))}
        >
          {(isCharge || isEmbed) && (
            <div className="iconWrap">
              <Icon icon="more_horiz" className="Font20 textTertiary pointer" />
            </div>
          )}
        </MoreMenu>
      </div>
      {navVisible && (
        <div className="iconWrap">
          <Icon
            icon="menu_left"
            className="Font20 textTertiary pointer"
            onClick={() => handleNavVisible(!navVisible)}
          />
        </div>
      )}
    </div>
  );
  // 分享入口在应用内与「新页面打开」页都要出现，故不排除 isEmbed；外部门户 / 公开应用下不提供
  const allowShareEntry = !window.isPublicApp && !md.global.Account.isPortal && chatbotConfig.allowShare;
  const hasConversation = !!currentConversationId && !conversationUnavailable;
  const headerRight = (
    <div className="flexRow alignItemsCenter headerRight">
      {allowShareEntry && hasConversation && (
        <Tooltip title={_l('分享')}>
          <div className="iconWrap mRight10">
            <Icon icon="share" className="Font20 textTertiary pointer" onClick={handleOpenShare} />
          </div>
        </Tooltip>
      )}
      {!isEmbed && !window.isPublicApp && !md.global.Account.isPortal && (
        <Tooltip title={_l('新页面打开')}>
          <div className="iconWrap mRight10">
            <Icon
              icon="launch"
              className="Font20 textTertiary pointer"
              onClick={() => {
                window.open(
                  pathCompletion(`/embed/chatbot/${appPkg.id}/${data.chatbotId}/${currentConversationId || ''}`),
                );
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
            menu={{ items: settingMenuItems, style: { minWidth: 180 } }}
          >
            <div className="iconWrap">
              <Icon icon="settings" className="Font20 textTertiary pointer" />
            </div>
          </Dropdown>
        </Tooltip>
      )}
    </div>
  );
  const Content = (
    <div className="content flex">
      {conversationUnavailable ? (
        // 会话读不出来时不渲染聊天区：既不给一个「像新对话」的空会话，也不留下能继续提问的输入框
        <UnNormal type="chatbot" errorText={_l('会话不存在或已被删除')} renderRefresh={false} />
      ) : (
        <WorkflowChatBot
          appId={appId}
          projectId={appPkg.projectId}
          isCharge={isCharge}
          maxWidth={800}
          chatbotId={data.chatbotId}
          conversationId={data.conversationId}
          chatbotConfig={chatbotConfig}
          onGenerateConversation={(newConversationId = '') => {
            setGeneratedConversationId(newConversationId);
            navigateToConversation(newConversationId, true);
          }}
          onConversationUnavailable={(unavailableId = '') => setUnavailableConversationId(unavailableId)}
        />
      )}
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
                appId={appId}
                projectId={appPkg.projectId}
                name={chatbotName}
                isDark={isDark}
                isCharge={isCharge}
                allowShareChat={md.global.Account.isPortal ? false : chatbotConfig.allowShare}
                chatbotId={data.chatbotId}
                currentConversationId={currentConversationId}
                onSelect={conversationId => {
                  setGeneratedConversationId('');
                  navigateToConversation(conversationId);
                }}
                onNewConversation={newConversationId => {
                  // 会话列表收到服务端推送后就把这条新会话当作当前会话（「更多」里已可分享），
                  // 而流式响应此时可能还没下发 conversationId。这里同步兜住顶部分享的可点状态，
                  // 保持两处一致；只补 id 不改路由，避免中断在途的流式请求。
                  if (currentConversationId) return;
                  setGeneratedConversationId(newConversationId);
                }}
              />
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
      {shareVisible && (
        <Share
          {...buildChatbotShareProps({
            appId,
            chatbotId: data.chatbotId,
            conversationId: currentConversationId,
            title: conversationTitle,
            projectId: appPkg.projectId,
            isCharge,
          })}
          onClose={() => setShareVisible(false)}
        />
      )}
      {isEmbed && <DocumentTitle title={chatbotName} />}
    </Wrap>
  );
};

export default connect(({ appPkg }) => ({ appPkg }))(Chatbot);
// export default Chatbot;
