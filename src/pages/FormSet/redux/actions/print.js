import sheetAjax from 'src/api/worksheet';
import { getProjectLicenseSupportInfo } from 'src/api/project';

export function loadPrint({ worksheetId }) {
  return (dispatch, getState) => {
    dispatch({
      type: 'PRINT_FETCH_START',
    });
    sheetAjax
      .getPrintList({
        worksheetId,
      })
      .then(data => {
        dispatch({
          type: 'PRINT_LOAD_SUCCESS',
        });
        dispatch({
          type: 'PRINT_LIST', // 打印模板
          data: data,
        });
      })
      .then(err => {});
  };
}

export function editPrintName({ id, name }) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId = '' } = stateList;
    sheetAjax
      .editPrintName({
        id,
        name,
      })
      .then(res => {
        if(res){
          // alert(_l('修改成功'))
        } else {
          alert(_l('修改失败'))
          dispatch(loadPrint({ worksheetId }));
        }
        // dispatch(loadPrint({ worksheetId }));
      })
      .then(err => {});
  };
}

export function editPrintRange({ id, range, viewsIds }) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId = '' } = stateList;
    sheetAjax
      .editPrintRange({
        range,
        id,
        viewsIds,
      })
      .then(res => {
        if(res){
          // alert(_l('修改成功'))
        } else {
          alert(_l('修改失败'))
          dispatch(loadPrint({ worksheetId }));
        }
        // dispatch(loadPrint({ worksheetId }));
      })
      .then(err => {});
  };
}

export function deletePrint(id) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { worksheetId = '' } = stateList;
    sheetAjax
      .deletePrint({
        id,
      })
      .then(res => {
        dispatch(loadPrint({ worksheetId }));
      })
      .then(err => {});
  };
}
// 更改print
export function updatePrint(id, data) {
  return (dispatch, getState) => {
    const stateList = getState().formSet;
    let { printData = [] } = stateList;
    let dataP = printData.filter(item => item.id === id);
    let da = [];
    printData.map(o => {
      if (o.id !== id) {
        da.push(o);
      } else {
        da.push({
          ...dataP[0],
          ...data,
        });
      }
    });
    dispatch({
      type: 'PRINT_LIST',
      data: da,
    });
  };
}
