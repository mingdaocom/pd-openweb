import { getCardTitleFieldForView } from 'src/pages/worksheet/views/util.js';
import { renderText as renderCellText } from 'src/utils/control';

export const getMobileCardTitle = (row, controls, view) => {
  const titleControl = getCardTitleFieldForView(row, controls, view) || {};
  const titleText = titleControl.controlId ? renderCellText(titleControl) || _l('未命名') : _l('未命名');

  return {
    titleControl,
    titleText,
  };
};
