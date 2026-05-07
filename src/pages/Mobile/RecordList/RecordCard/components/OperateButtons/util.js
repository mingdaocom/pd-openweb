import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { handleTemplateRecordPrint } from 'worksheet/common/recordInfo/RecordForm/PrintList';
import { handleDeleteRecord, handleShareRecord } from '../RecordOperate';

const NOT_SUPPORT_BUTTON_TYPE = ['copy', 'sysprint'];
// 2: word模版打印, 5: excel模版打印
const TEMPLATE_PRINT_TYPE = [2, 5];
// 6: 云打印
const CLOUD_PRINT_TYPE = 6;

export const filterPrintButton = buttons => {
  return buttons.filter(({ type, printItem }) => {
    if (type === 'print') {
      const printType = printItem?.type;

      const supportTemplatePrint = !window.isWxWork && TEMPLATE_PRINT_TYPE.includes(printType);
      const supportCloudPrint = printType === CLOUD_PRINT_TYPE;

      return supportTemplatePrint || supportCloudPrint;
    }

    return !NOT_SUPPORT_BUTTON_TYPE.includes(type);
  });
};

export const getVisibleButtons = (buttons, index) => _.slice(buttons, 0, index);

const safeClose = win => {
  if (!win) return;
  try {
    win.close();
  } catch (e) {
    console.log('关闭窗口失败:', e);
  }
};

export const setAttrToButtons = ({
  buttons,
  row = {},
  operatesButtonsStyle,
  context = {},
  onDeleteSuccess,
  disableCustomButton,
}) => {
  const { style, showIcon, primaryNum } = operatesButtonsStyle;
  const { view, controls, base, sheetSwitchPermit, worksheetInfo } = context;
  const { appId, viewId, worksheetId } = base || {};
  const recordId = row.rowid;
  return buttons.map((button, index) => ({
    ...button,
    icon: button.icon || (style === 'icon' ? 'custom_actions' : ''),
    color: button.color === 'transparent' ? 'var(--color-primary)' : button.color,
    style,
    showIcon,
    showAsPrimary: style === 'standard' && index < primaryNum,
    ...(button.type !== 'custom_button' && {
      onClick: () => {
        const { entityName = _l('记录') } = row;

        if (window.isPublicApp) {
          alert(_l('预览模式下，不能操作'), 3);
          return;
        }

        if (button.type === 'delete') {
          if (row.sys_lock) {
            alert(_l('%0已锁定', entityName), 3);
            return;
          }

          handleDeleteRecord({
            worksheetId,
            recordId,
            view,
            onDeleteSuccess,
          });
        } else if (button.type === 'share') {
          handleShareRecord({
            recordBase: { appId, worksheetId, viewId, recordId },
            controls,
            rowData: row,
            switchPermit: sheetSwitchPermit,
          });
        } else if (button.type === 'print') {
          let customWin = null;

          if (!window.isMingDaoApp && TEMPLATE_PRINT_TYPE.includes(button.printItem.type)) {
            customWin = window.open('about:blank');
          }

          worksheetAjax
            .getPrintList({
              viewId,
              worksheetId,
              rowIds: [recordId].filter(Boolean),
            })
            .then(templates => {
              if (_.find(templates, template => template.id === button.printItem.id && !template.disabled)) {
                handleTemplateRecordPrint({
                  worksheetId,
                  viewId,
                  recordId,
                  appId,
                  projectId: worksheetInfo.projectId,
                  template: button.printItem,
                  attriData: controls
                    .filter(o => o.attribute === 1)
                    .map(o => ({
                      ...o,
                      value: _.get(row, o.controlId),
                    })),
                  customWin,
                  updatePrintStatus: ({ printLoading }) => disableCustomButton(button.printItem.id, printLoading),
                });
              } else {
                alert(_l('无法打印“%0”', button.printItem.name), 3);
                disableCustomButton(button.printItem.id);
                safeClose(customWin);
              }
            });
        }
      },
    }),
  }));
};

export const getRowDetail = ({ recordId, viewId, worksheetId }) => {
  return new Promise((resolve, reject) => {
    worksheetAjax
      .getRowDetail({
        checkView: true,
        getType: 1,
        rowId: recordId,
        viewId,
        worksheetId,
      })
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};
