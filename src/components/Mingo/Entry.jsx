import React from 'react';
import Agent from 'src/components/Agent';
// import CustomBot from './modules/CustomBot';
import MingoWelcome from './ChatBot/components/MingoWelcome';
import { MINGO_TASK_TYPE } from './ChatBot/enum';
import CustomBot from './modules/AgentPromptGenBot';
import AppInfoOptimizationBot from './modules/AppInfoOptimizationBot';
import CreateRecordBot from './modules/CreateRecordBot';
import CreateWorksheetBot from './modules/CreateWorksheetBot';
import CreateWorksheetDataBot from './modules/CreateWorksheetDataBot';

export default function MingoEntry({
  taskType,
  sheetList,
  base,
  updateIsChatting = () => {},
  setTitle = () => {},
  onUpdateTaskType = () => {},
  onClose = () => {},
  onBack = () => {},
}) {
  if (taskType === MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT) {
    // 抽屉默认态：直接渲染新 mingo 首页 MingoWelcome（原由已下线的人工客服 HelpBot 托管）。
    // 点击首页建议/输入提交时切到对应任务（如 CREATE_APP_ASSIGNMENT 走新 agent）。
    return (
      <MingoWelcome
        onStartTask={task => {
          updateIsChatting(true);
          onUpdateTaskType(task.type);
        }}
      />
    );
  } else if (taskType === MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT) {
    return (
      <CreateWorksheetBot
        sheetList={sheetList}
        base={base}
        setTitle={setTitle}
        onClose={() => {
          onBack();
          onClose();
        }}
      />
    );
  } else if (taskType === MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT) {
    return <CreateRecordBot base={base} onClose={onClose} onBack={onBack} />;
  } else if (taskType === MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT) {
    return <CreateWorksheetDataBot base={base} onClose={onClose} onBack={onBack} />;
  } else if (taskType === MINGO_TASK_TYPE.APP_INFO_OPTIMIZATION) {
    return <AppInfoOptimizationBot base={base} onClose={onClose} onBack={onBack} />;
  } else if (taskType === MINGO_TASK_TYPE.CUSTOM_BOT) {
    return <CustomBot base={base} onClose={onClose} onBack={onBack} />;
  } else if (taskType === MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT) {
    return <Agent />;
  }

  return null;
}
