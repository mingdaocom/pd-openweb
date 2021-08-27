import sheetAjax from 'src/api/worksheet';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';

/**
 * 获取当前表info(包含template)
 */
export function getWorksheetInfo(worksheetId) {
  return (dispatch, getState) => {
    dispatch({
      type: 'COLUMNRULES_FETCH_START',
    });
    dispatch({
      type: 'COLUMNRULES_WORKSHEETID',
      data: worksheetId,
    });
    sheetAjax
      .getWorksheetInfo({
        worksheetId: worksheetId,
        getTemplate: true,
        getViews: true,
      })
      .then(data => {
        if (data.roleType !== 2) {
          dispatch({
            type: 'NORIGHT',
          });
        } else {
          let controls = data.template.controls.filter(item => !_.includes(SYS, item.controlId));
          controls = _.sortBy(controls, o => o.row);
          dispatch({
            type: 'COLUMNRULES_LOAD_SUCCESS',
          });
          dispatch({
            type: 'WORKSHEET_NAME',
            data: data.name,
          });
          dispatch({
            type: 'WORKSHEET_CONTROLS',
            data: data.template.controls,
          });
          dispatch({
            type: 'WORKSHEET_RULE_CONTROLS',
            data: controls,
          });
          dispatch({
            type: 'WORKSHEET_INFO',
            data,
          });
        }
      });
  };
}
