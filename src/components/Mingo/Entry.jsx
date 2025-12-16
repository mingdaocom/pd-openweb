import React from 'react';
import { MINGO_TASK_TYPE } from './ChatBot/enum';
import CustomBot from './modules/AgentPromptGenBot';
import CreateRecordBot from './modules/CreateRecordBot';
import CreateWorksheetBot from './modules/CreateWorksheetBot';
import CreateWorksheetDataBot from './modules/CreateWorksheetDataBot';
// import CustomBot from './modules/CustomBot';
import HelpBot from './modules/HelpBot';

export default function MingoEntry({
  taskType,
  sheetList,
  base,
  updateIsChatting = () => {},
  setTitle = () => {},
  setCurrentChatId = () => {},
  onUpdateTaskType = () => {},
  onClose = () => {},
  onBack = () => {},
}) {
  if (taskType === MINGO_TASK_TYPE.MINGDAO_HELP_ASSISTANT) {
    const isLocal = md.global.Config.IsLocal && !location.hostname.includes('nocoly.com'); //除nocoly外的私有部署环境   初始状态不显示对话框
    return (
      <HelpBot
        taskType={taskType}
        updateIsChatting={updateIsChatting}
        setCurrentChatId={setCurrentChatId}
        onUpdateTaskType={onUpdateTaskType}
        onClose={onClose}
        onBack={onBack}
        disabled={isLocal}
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
  } else if (taskType === MINGO_TASK_TYPE.CUSTOM_BOT) {
    return <CustomBot base={base} onClose={onClose} onBack={onBack} />;
  }
  return null;
}
