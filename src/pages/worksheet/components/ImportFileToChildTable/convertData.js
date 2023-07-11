import _ from 'lodash';
import { postWithToken } from 'worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget.js';

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

// 需要产品确认 ATTACHMENT AUTO_ID

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
              case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
                for (let i = 0; i < control.options.length; i++) {
                  const option = control.options[i];
                  if (option.value === item[key]) {
                    value = JSON.stringify([option.key]);
                    break;
                  }
                }
                break;
              case WIDGETS_TO_API_TYPE_ENUM.MONEY:
              case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
                temp = parseFloat(item[key]);
                if (!_.isNaN(temp)) {
                  value = temp;
                }
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
  if (serverHandleControls.length) {
    const needHandleRows = data
      .map((row = [], rowIndex) => ({
        rowIndex,
        cells: Object.keys(mapConfig)
          .map(key => {
            if (mapConfig[key]) {
              const control = _.find(controls, { controlId: mapConfig[key] });
              return (
                control &&
                _.includes(serverHandleControls, control.controlId) &&
                !_.isUndefined(row[key]) && {
                  controlId: mapConfig[key],
                  value: row[key],
                }
              );
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
            const value = safeParse(cell.value);
            switch (control.type) {
              case WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE:
              case WIDGETS_TO_API_TYPE_ENUM.AREA_CITY:
              case WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY:
                // rows[index][control.controlId] = '';
                break;
              case WIDGETS_TO_API_TYPE_ENUM.USER_PICKER:
                rows[index][control.controlId] = JSON.stringify(
                  value.map(n => ({
                    accountId: n.id,
                    fullname: n.name,
                    avatar: n.avatar,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT:
                rows[index][control.controlId] = JSON.stringify(
                  value.map(n => ({
                    departmentId: n.id,
                    departmentName: n.name,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE:
                rows[index][control.controlId] = JSON.stringify(
                  value.map(n => ({
                    organizeId: n.id,
                    organizeName: n.name,
                  })),
                );
                break;
              case WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET:
                rows[index][control.controlId] = JSON.stringify(
                  value.map(n => ({
                    sid: n.id,
                    name: n.name,
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
