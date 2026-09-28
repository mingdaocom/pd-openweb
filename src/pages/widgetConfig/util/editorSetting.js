import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { NO_CONTENT_CONTROL } from 'src/utils/domain/control/config';
import { getOptions } from 'src/utils/domain/control/options';
import { getMaxControlsCount } from 'src/utils/platform/runtime/config';

/** 提示字段数量达到表单上限，并返回是否应阻止继续添加。 */
export const isExceedMaxControlLimit = (controls = [], addCount = 0) => {
  const existedControls = controls.filter(item => !NO_CONTENT_CONTROL.includes(item.type)) || [];
  const maxControlsCount = getMaxControlsCount();

  if (existedControls.length + addCount > maxControlsCount) {
    alert(_l('表单中添加字段数量已达上限（%0个)', maxControlsCount), 3);
    return true;
  }

  return false;
};

/** 根据实际表单容器宽度计算矩阵选项的百分比宽度。 */
export const getItemOptionWidth = (data, fromType) => {
  let itemWidth = 100;
  const options = getOptions(data);
  const displayWidth =
    fromType === 'public'
      ? (document.querySelector('.publicWorksheetForm .rowsWrap') || {}).clientWidth
      : (document.querySelector('#widgetDisplayWrap .rowsWrap') || {}).clientWidth;
  const widthSize = data.size / 12;
  const { direction = '2', width = '200' } = getAdvanceSetting(data);

  if (displayWidth && direction === '0') {
    const boxWidth = (displayWidth - 8 * 2) * widthSize;
    const optionsWidth = boxWidth - 14 * 2;
    const num = Math.floor(optionsWidth / Number(width)) || 1;
    itemWidth = 100 / (num > options.length ? options.length : num);
  }

  return itemWidth;
};
