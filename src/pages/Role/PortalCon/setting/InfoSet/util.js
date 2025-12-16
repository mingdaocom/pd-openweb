import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_DATA } from 'src/pages/widgetConfig/config/widget';
import { enumWidgetType } from 'src/pages/widgetConfig/util';

export const initData = (enumType, type, controlId) => {
  const tempDefault = {
    ...DEFAULT_DATA[enumType],
    size: 12,
    type: type || enumWidgetType[enumType],
    controlId: controlId ? controlId : uuidv4(),
    fieldPermission: '110', //默认收集
  };
  if (tempDefault.advancedSetting) {
    tempDefault.advancedSetting.showselectall = '0';
  }
  return tempDefault;
};
