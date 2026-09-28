import { renderText as renderCellText } from 'src/utils/domain/control/display';
import { getCardTitleFieldForView } from 'src/utils/services/worksheet/view';

export const getMobileCardTitle = (row, controls, view) => {
  const titleControl = getCardTitleFieldForView(row, controls, view) || {};
  const titleText = titleControl.controlId ? renderCellText(titleControl) || _l('未命名') : _l('未命名');

  return {
    titleControl,
    titleText,
  };
};
