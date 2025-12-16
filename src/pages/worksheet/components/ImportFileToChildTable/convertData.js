import _, { trim } from 'lodash';
import moment from 'moment';
import { onValidator } from 'src/components/Form/core/formUtils';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';
import { postWithToken } from 'src/utils/common';

function getSelectedOptionKeys(text = '', options, isMultiple) {
  if (!text.trim()) {
    return '';
  }
  if (isMultiple) {
    text = text.split(',');
  }
  let result = [];
  const canImportOptions = options.filter(o => !o.isDeleted);
  for (let i = 0; i < canImportOptions.length; i++) {
    const option = canImportOptions[i];
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

function getDateStringValue(dateString) {
  let showFormat;
  if (/^\d{4}年\d{1,2}月\d{1,2}日/.test(dateString)) {
    showFormat = 'YYYY年M月D日 HH:mm:ss';
  }
  dateString = dateString.replace(/(凌晨|早上|上午)$/, 'AM');
  dateString = dateString.replace(/(中午|下午|晚上)$/, 'PM');
  if (new Date(moment(dateString, showFormat).valueOf()).toString() !== 'Invalid Date') {
    return moment(dateString, showFormat).format();
  }
  return;
}

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
                temp = getSelectedOptionKeys(item[key], control.options);
                if (temp && temp !== '[]') {
                  value = temp;
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
                temp = getSelectedOptionKeys(item[key], control.options, true);
                if (temp && temp !== '[]') {
                  value = temp;
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.MONEY:
              case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
                temp = parseFloat((item[key] || '').replace(/,/g, ''));
                if (!_.isNaN(temp)) {
                  value = temp;
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.DATE:
              case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
                value = item[key] ? getDateStringValue(item[key]) : value;
                break;
              case WIDGETS_TO_API_TYPE_ENUM.TIME:
                if (/^\w\w:\w\w(:\w\w)?$/.test(trim(item[key]))) {
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
      const resData = await postWithToken(
        `${md.global.Config.WorksheetDownUrl}/Import/HandlerPreview`,
        { worksheetId, tokenType: 7 },
        {
          projectId,
          worksheetId,
          controlId,
          rows: needHandleRows,
        },
      );
      if (_.isArray(resData)) {
        resData.forEach(item => {
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
                if (cell.value && serverHandleControlValueCache[`${control.controlId}-${item.rowIndex}`]) {
                  rows[index][control.controlId] = JSON.stringify({
                    code: cell.value,
                    name: serverHandleControlValueCache[`${control.controlId}-${item.rowIndex}`],
                  });
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER:
                if (cell.value && cell.value !== '[]') {
                  rows[index][control.controlId] = JSON.stringify(
                    safeParse(cell.value, 'array').map(n => ({
                      accountId: n.id,
                      fullname: n.name,
                      avatar: n.avatarUrl,
                    })),
                  );
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT:
                if (cell.value && cell.value !== '[]') {
                  rows[index][control.controlId] = JSON.stringify(
                    safeParse(cell.value, 'array').map(n => ({
                      departmentId: n.id,
                      departmentName: n.name,
                    })),
                  );
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE:
                if (cell.value && cell.value !== '[]') {
                  rows[index][control.controlId] = JSON.stringify(
                    safeParse(cell.value, 'array').map(n => ({
                      organizeId: n.id,
                      organizeName: n.name,
                    })),
                  );
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
                if (cell.value && cell.value !== '[]') {
                  rows[index][control.controlId] = JSON.stringify(
                    safeParse(cell.value, 'array').map(n => ({
                      sid: n.id,
                      name: n.name,
                      sourcevalue: JSON.stringify({ rowid: n.id, name: n.name }),
                    })),
                  );
                }
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
