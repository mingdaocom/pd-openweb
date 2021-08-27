import defaultModel from '../widgets/defaultWidget/settingsModel';
import textareaInput from '../widgets/textareaInput/settingsModel';
import phoneNumber from '../widgets/phoneNumber/settingsModel';
import numberInput from '../widgets/numberInput/settingsModel';
import moneyAmount from '../widgets/moneyAmount/settingsModel';
import options from '../widgets/options/settingsModel';
import dropdown from '../widgets/dropdown/settingsModel';
import emailInput from '../widgets/emailInput/settingsModel';
import dateInput from '../widgets/dateInput/settingsModel';
import credInput from '../widgets/credInput/settingsModel';
import areaInput from '../widgets/areaInput/settingsModel';
import attachment from '../widgets/attachment/settingsModel';
import splitLine from '../widgets/splitLine/settingsModel';
import ReadonlyWidgetSettingsModel from '../widgets/readonlyWidget/settingsModel';
import remark from '../widgets/remark/settingsModel';
import detailed from '../widgets/detailed/settingsModel';
import formula from '../widgets/formula/settingsModel';
import userPicker from '../widgets/userPicker/settingsModel';
import groupPicker from '../widgets/groupPicker/settingsModel';
import datetimeRange from '../widgets/datetimeRange/settingsModel';
import moneyCn from '../widgets/moneyCn/settingsModel';
import score from '../widgets/score/settingsModel';
import relation from '../widgets/relation/settingsModel';
import relateSheet from '../widgets/relateSheet/settingsModel';
import sheetField from '../widgets/sheetField/settingsModel';
import concatenate from '../widgets/concatenate/settingsModel';
import newformula from '../widgets/newformula/settingsModel';
import autoid from '../widgets/autoid/settingsModel';
import Switch from '../widgets/switch/settingsModel';
import Subtotal from '../widgets/subtotal/settingsModel';
import config from '../../config';

let readonlyWidgets = [
  config.READONLY_WIDGETS.APPLICANT,
  config.READONLY_WIDGETS.APPLI_DATE,
  config.READONLY_WIDGETS.DEPARTMENT,
  config.READONLY_WIDGETS.POSITION,
  config.READONLY_WIDGETS.WORK_PLCAE,
  config.READONLY_WIDGETS.COMPANY,
  config.READONLY_WIDGETS.WORK_PHONE,
  config.READONLY_WIDGETS.MOBILE_PHONE,
  config.READONLY_WIDGETS.JOB_NUMBER,
].map(widget => {
  return {
    type: widget.type,
    SettingsModel: ReadonlyWidgetSettingsModel,
  };
});

let settingsModels = [
  textareaInput,
  phoneNumber,
  numberInput,
  moneyAmount,
  options,
  dropdown,
  emailInput,
  dateInput,
  credInput,
  areaInput,
  attachment,
  splitLine,
  detailed,
  formula,
  userPicker,
  groupPicker,
  datetimeRange,
  moneyCn,
  remark,
  score,
  relation,
  relateSheet,
  sheetField,
  concatenate,
  newformula,
  autoid,
  Switch,
  Subtotal,
].concat(readonlyWidgets);

/**
 * 根据widget的type取得一个widget的settingsModel
 * @param {number} type widget的type
 * @return {object} settingsModel model
 */
export const getSettingsModel = type => {
  let SettingsModel;
  settingsModels.forEach(item => {
    if (item.type === type) {
      SettingsModel = item.SettingsModel;
      return false;
    }
  });
  if (SettingsModel === undefined) {
    SettingsModel = defaultModel.SettingsModel;
  }
  return SettingsModel;
};
