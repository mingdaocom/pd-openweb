import _ from 'lodash';
import { postWithToken } from 'worksheet/util';
import moment from 'moment';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import { getShowFormat } from 'src/pages/widgetConfig/util/setting';
import { onValidator } from 'src/components/newCustomFields/tools/DataFormat';

function getSelectedOptionKeys(text = '', options, isMultiple) {
  if (!text.trim()) {
    return '';
  }
  if (isMultiple) {
    text = text.split(',');
  }
  let result = [];
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (isMultiple ? _.includes(text, option.value) : option.value === text) {
      result.push(option.key);
    }
  }
  return JSON.stringify(result);
}

const localHandleTypes = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.MONEY,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.DATE,
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME,
  WIDGETS_TO_API_TYPE_ENUM.TIME,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.SWITCH,
  WIDGETS_TO_API_TYPE_ENUM.SCORE,
  WIDGETS_TO_API_TYPE_ENUM.RICH_TEXT,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
];

async function convert({ projectId, worksheetId, controlId, mapConfig = [], controls = [], data = [] }) {
  const rows = [];
  const serverHandleControls = [];
  data.forEach((item, rowIndex) => {
    const row = {};
    Object.keys(mapConfig).forEach(key => {
      if (mapConfig[key]) {
        const control = _.find(controls, { controlId: mapConfig[key] });
        if (control) {
          if (_.includes(localHandleTypes, control.type)) {
            let temp = '';
            let value = '';
            switch (control.type) {
              case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN:
              case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
                value = getSelectedOptionKeys(item[key], control.options);
                break;
              case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
                value = getSelectedOptionKeys(item[key], control.options, true);
                break;
              case WIDGETS_TO_API_TYPE_ENUM.MONEY:
              case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
                temp = parseFloat(item[key]);
                if (!_.isNaN(temp)) {
                  value = temp;
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.DATE:
              case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
                if (new Date(moment(item[key], getShowFormat(control)).valueOf()).toString() !== 'Invalid Date') {
                  value = moment(item[key], getShowFormat(control)).format();
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.TIME:
                if (/^\w\w:\w\w(:\w\w)?$/.test(item[key])) {
                  value = item[key];
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.EMAIL:
              case WIDGETS_TO_API_TYPE_ENUM.CRED:
              case WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE:
              case WIDGETS_TO_API_TYPE_ENUM.TELEPHONE:
                if (!onValidator({ item: { ...control, value: item[key] } }).errorType) {
                  value = item[key];
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
                value = _.includes(['✓', '开启', '是'], (item[key] || '').trim()) ? '1' : '0';
                break;
              default:
                value = item[key];
            }
            row[control.controlId] = value;
          } else {
            serverHandleControls.push(control.controlId);
          }
        }
      }
    });
    rows[rowIndex] = row;
  });
  const serverHandleControlValueCache = {};
  if (serverHandleControls.length) {
    const needHandleRows = data
      .map((row = [], rowIndex) => ({
        rowIndex,
        cells: Object.keys(mapConfig)
          .map(key => {
            if (mapConfig[key]) {
              const control = _.find(controls, { controlId: mapConfig[key] });
              if (control && _.includes(serverHandleControls, control.controlId) && !_.isUndefined(row[key])) {
                serverHandleControlValueCache[`${mapConfig[key]}-${rowIndex}`] = row[key];
                return {
                  controlId: mapConfig[key],
                  value: row[key],
                };
              }
            }
            return undefined;
          })
          .filter(_.identity),
      }))
      .filter(item => item && item.cells && !_.isEmpty(item.cells));
    if (needHandleRows.length) {
      const res = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/Import/HandlerPreview`,
        { worksheetId, tokenType: 7 },
        {
          projectId,
          worksheetId,
          controlId,
          rows: needHandleRows,
        },
      );
      if (_.isArray(_.get(res, 'data.data'))) {
        res.data.data.forEach(item => {
          const index = Number(item.rowIndex);
          item.cells.forEach(cell => {
            const control = _.find(controls, { controlId: cell.controlId });
            if (!control) {
              return;
            }
            switch (control.type) {
              case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE:
              case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY:
              case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY:
                if (serverHandleControlValueCache[`${control.controlId}-${item.rowIndex}`]) {
                  rows[index][control.controlId] = JSON.stringify({
                    code: cell.value,
                    name: serverHandleControlValueCache[`${control.controlId}-${item.rowIndex}`],
                  });
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER:
                rows[index][control.controlId] = JSON.stringify(
                  safeParse(cell.value, 'array').map(n => ({
                    accountId: n.id,
                    fullname: n.name,
                    avatar: n.avatarUrl,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT:
                rows[index][control.controlId] = JSON.stringify(
                  safeParse(cell.value, 'array').map(n => ({
                    departmentId: n.id,
                    departmentName: n.name,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE:
                rows[index][control.controlId] = JSON.stringify(
                  safeParse(cell.value, 'array').map(n => ({
                    organizeId: n.id,
                    organizeName: n.name,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
                rows[index][control.controlId] = JSON.stringify(
                  safeParse(cell.value, 'array').map(n => ({
                    sid: n.id,
                    name: n.name,
                    sourcevalue: JSON.stringify({ rowid: n.id, name: n.name }),
                  })),
                );
                break;
              default:
                break;
            }
          });
        });
      }
    }
  }
  return rows;
}

export default convert;
