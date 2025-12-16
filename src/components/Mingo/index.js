import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { get, includes } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { BgIconButton } from 'ming-ui';
import { emitter } from 'src/utils/common';
import { MINGO_TASK_TYPE } from './ChatBot/enum';
import MingoEntry from './Entry';
import { getTitleOfTaskType } from './modules';

const MingoWrap = styled.div`
  height: 100%;
  overflow: hidden;
  background: #fff;
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
        color: #151515 !important;
      }
    }
    .chattingTitleText {
      margin-left: 8px;
      font-size: 17px;
      color: #151515;
      font-weight: bold;
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
  const { mingoFixing, onFixing, onClose, drawerVisible, base, sheetList, worksheetInfo } = props;
  const defaultMingoCache = useMemo(() => getDefaultValueOfMingoCache(), []);
  const [currentChatId, setCurrentChatId] = useState(null);
  const contentRef = useRef(null);
  const [taskType, setTaskType] = useState(defaultMingoCache.taskType || MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT);
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT);
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT); // 测试
  // const [isChatting, setIsChatting] = useState(true); // 测试
  // const [taskType, setTaskType] = useState(MINGO_TASK_TYPE.CUSTOM_BOT);
  const [isChatting, setIsChatting] = useState(defaultMingoCache.taskType ? true : false);
  const [title, setTitle] = useState(getTitleOfTaskType(taskType));
  const handleMingoFixing = useCallback(() => {
    onFixing({ saveStateToLocal: false });
  }, []);
  const handleStartPendingTask = useCallback(() => {
    setTimeout(() => {
      if (window.mingoPendingStartTask) {
        setIsChatting(true);
        setTaskType(window.mingoPendingStartTask.type);
        window.mingoPendingStartTask = null;
      }
    }, 0);
  }, []);
  const handleBack = useCallback(() => {
    setTaskType(undefined);
    setTimeout(() => {
      setTaskType(MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT);
      setIsChatting(false);
    }, 0);
  }, []);
  const handleClose = useCallback(() => {
    handleBack();
    onClose();
  }, []);
  useEffect(() => {
    setTitle(getTitleOfTaskType(taskType));
  }, [taskType]);
  useEffect(() => {
    if (taskType !== MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT && !mingoFixing) {
      handleMingoFixing();
    }
    emitter.on('SET_MINGO_FIXED', handleMingoFixing);
    window.addEventListener('popstate', handleClose);
    emitter.on('SET_MINGO_VISIBLE', handleStartPendingTask);
    return () => {
      emitter.off('SET_MINGO_VISIBLE', handleStartPendingTask);
      emitter.off('SET_MINGO_FIXED', handleMingoFixing);
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
    <MingoWrap>
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
              iconStyle={mingoFixing ? { color: '#515151' } : { color: '#cccccc' }}
              icon="set_top"
              onClick={onFixing}
            />
          )}
          {isChatting && (
            <div className="chattingTitle t-flex t-flex-row t-items-center">
              <BgIconButton icon="backspace" onClick={handleBack} />
              <div className="chattingTitleText">{title}</div>
            </div>
          )}
          <BgIconButton.Group gap={6}>
            {taskType === MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT && (
              <BgIconButton
                tooltip={_l('新窗口打开')}
                icon="launch"
                onClick={() => {
                  window.open(isChatting && currentChatId ? `/mingo/chat/${currentChatId}` : '/mingo', '_blank');
                }}
              />
            )}
            <BgIconButton icon="close" onClick={handleClose} />
          </BgIconButton.Group>
        </div>
      )}
      <MingoEntry
        allowEdit
        base={{ ...base, worksheetInfo }}
        sheetList={sheetList}
        taskType={taskType}
        ref={contentRef}
        setTitle={setTitle}
        updateIsChatting={setIsChatting}
        onUpdateChatId={setCurrentChatId}
        onUpdateTaskType={setTaskType}
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
