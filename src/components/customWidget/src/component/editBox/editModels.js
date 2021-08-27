import editFiller from '../widgets/defaultWidget/editFiller';
import editHide from '../widgets/defaultWidget/editHide';
import textareaInput from '../widgets/textareaInput/editModel';
import phoneNumber from '../widgets/phoneNumber/editModel';
import numberInput from '../widgets/numberInput/editModel';
import moneyAmount from '../widgets/moneyAmount/editModel';
import options from '../widgets/options/editModel';
import dropdown from '../widgets/dropdown/editModel';
import emailInput from '../widgets/emailInput/editModel';
import dateInput from '../widgets/dateInput/editModel';
import credInput from '../widgets/credInput/editModel';
import areaInput from '../widgets/areaInput/editModel';
import attachment from '../widgets/attachment/editModel';
import splitLine from '../widgets/splitLine/editModel';
import ReadonlyWidgetEditModel from '../widgets/readonlyWidget/editModel';
import remark from '../widgets/remark/editModel';
import detailed from '../widgets/detailed/editModel';
import formula from '../widgets/formula/editModel';
import userPicker from '../widgets/userPicker/editModel';
import groupPicker from '../widgets/groupPicker/editModel';
import datetimeRange from '../widgets/datetimeRange/editModel';
import moneyCn from '../widgets/moneyCn/editModel';
import score from '../widgets/score/editModel';
import relation from '../widgets/relation/editModel';
import relateSheet from '../widgets/relateSheet/editModel';
import sheetField from '../widgets/sheetField/editModel';
import concatenate from '../widgets/concatenate/editModel';
import newformula from '../widgets/newformula/editModel';
import autoid from '../widgets/autoid/editModel';
import Switch from '../widgets/switch/editModel';
import Subtotal from '../widgets/subtotal/editModel';
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
    EditModel: ReadonlyWidgetEditModel,
  };
});

let editModels = [
  editFiller,
  editHide,
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
export const getEditModel = type => {
  let EditModel;
  editModels.forEach(item => {
    if (item.type === type) {
      EditModel = item.EditModel;
      return false;
    }
  });
  return EditModel;
};
