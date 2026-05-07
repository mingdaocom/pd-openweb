import { MINGO_TASK_TYPE } from '../ChatBot/enum';
import { title as createRecordBotTitle } from './CreateRecordBot/config';
import { title as createWorksheetBotTitle } from './CreateWorksheetBot/config';
import { title as createWorksheetDataBotTitle } from './CreateWorksheetDataBot/config';

export function getTitleOfTaskType(taskType) {
  if (taskType === MINGO_TASK_TYPE.CREATE_WORKSHEET_ASSIGNMENT) {
    return createWorksheetBotTitle;
  }

  if (taskType === MINGO_TASK_TYPE.CREATE_WORKSHEET_DATA_ASSIGNMENT) {
    return createWorksheetDataBotTitle;
  }

  if (taskType === MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT) {
    return createRecordBotTitle;
  }

  if (taskType === MINGO_TASK_TYPE.APP_INFO_OPTIMIZATION) {
    return _l('优化应用信息');
  }

  return '';
}
