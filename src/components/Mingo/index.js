import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { AGENT_HEADER_EVENT } from 'src/components/Agent/agentService';
import mingoWordmark from 'src/pages/mingo/common/images/mingo-logo.png';
import { emitter, pathCompletion } from 'src/utils/common';
import { MINGO_TASK_TYPE } from './ChatBot/enum';
import MingoEntry from './Entry';

const MingoWrap = styled.div`
  height: 100%;
  overflow: hidden;
  background: var(--color-background-primary);
  display: flex;
  flex-direction: column;
  position: relative;
  .header {
    padding: 11px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .chattingTitle {
      cursor: pointer;
      .backIcon:hover {
        color: var(--color-text-title) !important;
      }
    }
    .brandWordmark {
      margin-left: 8px;
      height: 24px;
      width: auto;
      object-fit: contain;
      display: block;
      /* 文字 logo 视觉重心偏上，几何居中后略下沉 2px 才视觉居中 */
      margin-top: 2px;
    }
  }
`;

function getDefaultValueOfMingoCache() {
  if (window.globalStoreForMingo.activeModule === 'worksheetControlsEdit') {
    const cacheObj = safeParse(
      localStorage.getItem(`MINGO_CACHE_CREATE_WORKSHEET_BOT_${get(md, 'global.Account.accountId')}`),
    );

    if (cacheObj && cacheObj.worksheetId === window.globalStoreForMingo.worksheetId) {
      return cacheObj;
    }
    //  && globalStoreForMingo.worksheetId
  }

  return {};
}

function Mingo(props) {
  const { mingoFixing, onFixing, onClose, drawerVisible, sheetList, worksheetInfo } = props;
  // 抽屉未固定时，从 MingoWelcome / 首页提交会经 SET_MINGO_FIXED|SET_MINGO_VISIBLE 触发固定，
  // 而固定/非固定分属 ToolbarDrawer 的 FixingWrap / Drawer 两个分支，会把 Mingo 整体重挂，
  // 旧实例 onStartTask 设的 isChatting/taskType 随之丢失。这里在新实例挂载时直接用 pendingTask
  // 初始化进入对应任务（如 CREATE_APP → Agent），让 Agent 接力读取 window.mingoInitialMessage 自动发起。
  const pendingStartTask = window.mingoPendingStartTask;
  const [base, setBase] = useState(
    pendingStartTask && pendingStartTask.base ? { ...props.base, ...pendingStartTask.base } : props.base,
  );
  const hadPendingTask = useRef(!!pendingStartTask);
  // 记住挂载时捕获的 pendingTask 引用，供挂载后清理（避免在 effect 闭包里依赖 render 派生值）
  const pendingStartTaskRef = useRef(pendingStartTask);
  // 固定显示时刷新会先挂载 Mingo，此时 Redux base 可能尚未被 WorkSheet updateBase 写入 appId；
  // 仅用 useState 初始值会导致本地 base 一直为空，创建工作表等接口报 appId 不存在。
  useEffect(() => {
    // 存在待处理任务时跳过初次合并，避免 Redux 中的 base（如自定义页面ID）覆盖 pendingTask 中的正确数据
    if (hadPendingTask.current) {
      hadPendingTask.current = false;
      return;
    }

    setBase(prev => ({ ...prev, ...props.base }));
  }, [props.base]);
  const defaultMingoCache = useMemo(() => getDefaultValueOfMingoCache(), []);
  // 记住上次 Agent 会话：无待办任务 / 无其它缓存时，若本地存有上次会话则重开直接进入 Agent 续接（ChatPanel 内恢复消息），
  // 否则照常落到 MingoWelcome 首页。"新对话"会清掉该记录，从首页重新开始。
  const rememberedAgentSession = useMemo(() => {
    if (window.mingoPendingStartTask || defaultMingoCache.taskType) return '';
    const accountId = get(md, 'global.Account.accountId') || '';

    return accountId ? (localStorage.getItem(`md_agent_last_session_${accountId}`) || '').trim() : '';
  }, [defaultMingoCache.taskType]);
  const [, setCurrentChatId] = useState(null);
  // 新版 Agent 当前会话 id（由 ChatPanel 广播 SESSION_ACTIVE 得到）：供「新窗口打开」续接同一会话
  const [agentSessionId, setAgentSessionId] = useState(null);
  const contentRef = useRef(null);
  const [taskType, setTaskType] = useState(
    (pendingStartTask && pendingStartTask.type) ||
      defaultMingoCache.taskType ||
      (rememberedAgentSession ? MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT : MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT),
  );
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT);
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT); // 测试
  // const [isChatting, setIsChatting] = useState(true); // 测试
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CUSTOM_BOT);
  const [isChatting, setIsChatting] = useState(
    !!pendingStartTask || !!defaultMingoCache.taskType || !!rememberedAgentSession,
  );
  // 已在初始 state 消费 pendingTask（进入对应任务），挂载后清掉全局，避免后续无关重挂被旧任务带偏。
  // 仅清挂载时捕获的那一个引用：若挂载后又有外部入口设了新的 pendingTask（走 handleStartPendingTask），不误清。
  useEffect(() => {
    const captured = pendingStartTaskRef.current;

    if (captured && window.mingoPendingStartTask === captured) {
      window.mingoPendingStartTask = null;
    }
  }, []);
  const handleMingoFixing = useCallback(() => {
    onFixing({ saveStateToLocal: false });
  }, []);
  const handleStartPendingTask = useCallback(() => {
    setTimeout(() => {
      if (window.mingoPendingStartTask) {
        if (window.mingoPendingStartTask.base) {
          setBase(window.mingoPendingStartTask.base);
        }

        setIsChatting(true);
        setTaskType(window.mingoPendingStartTask.type);
        window.mingoPendingStartTask = null;
      }
    }, 0);
  }, []);
  const handleBack = useCallback(() => {
    // 同步先退出对话态，避免 taskType 置空的中间帧仍渲染对话头部、标题「Mingo」一闪而过
    setIsChatting(false);
    setTaskType(undefined);
    setTimeout(() => {
      setTaskType(MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT);
    }, 0);
  }, []);
  const handleClose = useCallback(() => {
    // 先广播会话关闭：ChatPanel 同步中断在途流并调取消接口（此刻面板仍挂载，监听器可执行）
    emitter.emit(AGENT_HEADER_EVENT.SESSION_CLOSE);
    handleBack();
    onClose();
  }, []);
  useEffect(() => {
    if (taskType !== MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT && !mingoFixing) {
      handleMingoFixing();
    }

    const handleAgentSessionActive = ({ sessionId } = {}) => sessionId && setAgentSessionId(sessionId);

    emitter.on('SET_MINGO_FIXED', handleMingoFixing);
    window.addEventListener('popstate', handleClose);
    emitter.on('SET_MINGO_VISIBLE', handleStartPendingTask);
    emitter.on(AGENT_HEADER_EVENT.SESSION_ACTIVE, handleAgentSessionActive);
    emitter.on(AGENT_HEADER_EVENT.BACK_TO_WELCOME, handleBack);
    return () => {
      emitter.off('SET_MINGO_VISIBLE', handleStartPendingTask);
      emitter.off('SET_MINGO_FIXED', handleMingoFixing);
      emitter.off(AGENT_HEADER_EVENT.SESSION_ACTIVE, handleAgentSessionActive);
      emitter.off(AGENT_HEADER_EVENT.BACK_TO_WELCOME, handleBack);
      window.removeEventListener('popstate', handleClose);
    };
  }, []);
  useEffect(() => {
    window.mingoFixing = mingoFixing;
  }, [drawerVisible, mingoFixing]);

  if (!drawerVisible && !mingoFixing) {
    return null;
  }

  return (
    <MingoWrap className="mingoWrap">
      {!includes(
        [
          MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT,
          // MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT,
          // MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT,
        ],
        taskType,
      ) && (
        <div className={cx('header')}>
          {!isChatting && (
            <BgIconButton
              tooltip={mingoFixing ? _l('取消固定') : _l('固定')}
              iconStyle={
                mingoFixing ? { color: 'var(--color-text-title)' } : { color: 'var(--color-text-placeholder)' }
              }
              icon="set_top"
              onClick={onFixing}
            />
          )}
          {isChatting && (
            <div className="chattingTitle t-flex t-flex-row t-items-center">
              {/* 搭建应用（Agent）头部去掉返回按钮（改由「新对话」回首页）；其它任务保留返回 */}
              {taskType === MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT ? (
                // 点击 logo 回到 welcome 首页：同「新对话」先清掉记住的会话，避免下次打开又恢复上次会话
                <img
                  className="brandWordmark pointer"
                  src={mingoWordmark}
                  alt="Mingo"
                  onClick={() => {
                    emitter.emit(AGENT_HEADER_EVENT.NEW_CONVERSATION);
                    handleBack();
                  }}
                />
              ) : (
                <>
                  <BgIconButton icon="backspace" onClick={handleBack} />
                  <img className="brandWordmark" src={mingoWordmark} alt="Mingo" />
                </>
              )}
            </div>
          )}
          <BgIconButton.Group gap={6}>
            {taskType === MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT && !window?.platformENV?.isLocal && (
              <BgIconButton
                tooltip={_l('新窗口打开')}
                icon="launch"
                onClick={() => {
                  window.open(pathCompletion('/mingo'), '_blank');
                }}
              />
            )}
            {taskType === MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT && (
              <>
                <BgIconButton
                  tooltip={_l('新对话')}
                  icon="plus"
                  onClick={() => {
                    // 新对话 = 回到 MingoWelcome 重新开始；先广播清掉记住的会话，避免重开抽屉时被旧会话恢复
                    emitter.emit(AGENT_HEADER_EVENT.NEW_CONVERSATION);
                    handleBack();
                  }}
                />
                <BgIconButton
                  tooltip={_l('历史对话')}
                  icon="access_time"
                  onClick={() => emitter.emit(AGENT_HEADER_EVENT.OPEN_HISTORY)}
                />
                <BgIconButton
                  tooltip={_l('新窗口打开')}
                  icon="launch"
                  onClick={() => {
                    window.open(pathCompletion(agentSessionId ? `/mingo/chat/${agentSessionId}` : '/mingo'), '_blank');
                  }}
                />
              </>
            )}
            {taskType === MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT && !isChatting && (
              <BgIconButton
                tooltip={_l('历史对话')}
                icon="access_time"
                onClick={() => emitter.emit(AGENT_HEADER_EVENT.OPEN_HISTORY)}
              />
            )}
            <BgIconButton icon="close" onClick={handleClose} />
          </BgIconButton.Group>
        </div>
      )}
      <MingoEntry
        allowEdit
        base={{ ...base, worksheetInfo: base.worksheetInfo || worksheetInfo }}
        sheetList={sheetList}
        taskType={taskType}
        ref={contentRef}
        updateIsChatting={setIsChatting}
        onUpdateChatId={setCurrentChatId}
        onUpdateTaskType={setTaskType}
        onUpdateBase={setBase}
        onClose={onClose}
        onBack={handleBack}
      />
    </MingoWrap>
  );
}

Mingo.propTypes = {
  mingoFixing: PropTypes.bool,
  onFixing: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  base: state.sheet.base,
  sheetList: state.sheetList,
  worksheetInfo: state.sheet.worksheetInfo,
});

export default connect(mapStateToProps)(Mingo);
