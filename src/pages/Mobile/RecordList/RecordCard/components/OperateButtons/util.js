import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getWorksheetShareUrl } from 'mobile/components/RecordInfo/RecordFooter';
import { handleSystemPrintRecord, handleTemplateRecordPrint } from 'worksheet/common/recordInfo/RecordForm/PrintList';
import { handleDeleteRecord, handleShareRecord } from '../RecordOperate';

const NOT_SUPPORT_BUTTON_TYPE = ['copy'];
// 2: word模版打印, 5: excel模版打印；钉钉/微信/WeLink/WxWork 不支持
const TEMPLATE_PRINT_TYPE = [2, 5];
// 3: 二维码打印, 4: 条码打印；仅明道APP支持
const CODE_PRINT_TYPE = [3, 4];
// 6: 云打印
const CLOUD_PRINT_TYPE = 6;
// 系统打印
const SYSTEM_PRINT = 0;

export const filterPrintButton = buttons => {
  return buttons.filter(({ type, printItem }) => {
    if (type === 'print') {
      const printType = printItem?.type;

      if (TEMPLATE_PRINT_TYPE.includes(printType)) {
        return !window.isDingTalk && !window.isWeiXin && !window.isWeLink && !window.isWxWork;
      }

      if (CODE_PRINT_TYPE.includes(printType)) return !!window.isMingDaoApp;
      if (printType === CLOUD_PRINT_TYPE || printType === SYSTEM_PRINT) return true;

      return false;
    }

    return !NOT_SUPPORT_BUTTON_TYPE.includes(type);
  });
};

export const getVisibleButtons = (buttons, index) => _.slice(buttons, 0, index);

export const getPrintAuthInfo = async ({ appId, worksheetId, viewId, rowIds = [], printId = '' }) => {
  const clientIdPromise = worksheetAjax.getSystemPrintClientId({ appId, worksheetId, printId }, { silent: true });
  const shareShortUrlsPromise =
    rowIds.length && viewId
      ? worksheetAjax
          .getRowsShortUrl({
            appId,
            viewId,
            worksheetId,
            rowIds,
          })
          .catch(() => ({}))
      : Promise.resolve({});
  const shareUrlPromise =
    rowIds.length && viewId
      ? getWorksheetShareUrl({ appId, worksheetId, recordId: rowIds[0], viewId })
      : Promise.resolve({});

  const [clientIdData, shareShortUrls, shareUrl] = await Promise.all([
    clientIdPromise,
    shareShortUrlsPromise,
    shareUrlPromise,
  ]);
  const clientId = _.isString(clientIdData)
    ? clientIdData
    : _.get(clientIdData, 'clientId') || _.get(clientIdData, 'data.clientId') || _.get(clientIdData, 'data');

  return {
    clientId,
    shareShortUrls,
    shareUrl,
  };
};

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
  appDetail,
}) => {
  const { style, showIcon, primaryNum } = operatesButtonsStyle;
  const { view, controls, base, sheetSwitchPermit, worksheetInfo } = context;
  const { appId, viewId, worksheetId } = base || {};
  const recordId = row.rowid;

  const getButtonViewColor = button => {
    return !button.color || button.color === 'transparent' ? 'var(--color-primary)' : button.color;
  };

  const getSystemButtonClick = button => async () => {
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
    } else if (button.type === 'sysprint') {
      const customWin = !window.isMingDaoApp ? window.open('about:blank') : null;

      disableCustomButton(button.btnId, true);

      try {
        const currentRowIds = [recordId].filter(Boolean);
        const printAuthInfo = await getPrintAuthInfo({
          appId,
          worksheetId,
          viewId,
          rowIds: currentRowIds,
        }).catch(() => ({}));

        if (!printAuthInfo.clientId) {
          alert(_l('打印授权失败，请稍后重试'), 3);
          safeClose(customWin);
          return;
        }

        await handleSystemPrintRecord({
          worksheetId,
          viewId,
          appId,
          projectId: worksheetInfo.projectId,
          recordId,
          rowIds: currentRowIds,
          ...printAuthInfo,
          customWin,
          appDetail,
          worksheetInfo,
          getType: 1,
          isDefault: true,
        });
      } catch {
        safeClose(customWin);
      } finally {
        disableCustomButton(button.btnId, false);
      }
    } else if (button.type === 'print') {
      disableCustomButton(button.btnId, true);

      const isSystemPrint = button.printItem.type === SYSTEM_PRINT;
      const printAuthInfo = isSystemPrint
        ? await getPrintAuthInfo({
            appId,
            worksheetId,
            viewId,
            rowIds: [recordId].filter(Boolean),
          }).catch(() => ({}))
        : {};

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
              viewId,
              worksheetId,
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
              ...(isSystemPrint
                ? {
                    appDetail,
                    worksheetInfo,
                    ...printAuthInfo,
                  }
                : {}),
              updatePrintStatus: ({ printLoading }) => {
                disableCustomButton(button.printItem.id, printLoading);
                disableCustomButton(button.btnId, printLoading);
              },
            });
          } else {
            alert(_l('无法打印”%0”', button.printItem.name), 3);
            disableCustomButton(button.printItem.id);
            disableCustomButton(button.btnId, false);
            safeClose(customWin);
          }
        })
        .catch(() => disableCustomButton(button.btnId, false));
    }
  };

  const normalizeButton = (button, index) => {
    const nextButton = {
      ...button,
      icon: button.icon || (style === 'icon' ? 'custom_actions' : ''),
      color: getButtonViewColor(button),
      style,
      showIcon,
      showAsPrimary: style === 'standard' && index < primaryNum,
    };

    if (button.type === 'group_ref') {
      return {
        ...nextButton,
        buttons: (button.buttons || []).map(normalizeButton),
      };
    }

    if (button.type !== 'custom_button') {
      nextButton.onClick = getSystemButtonClick(button);
    }

    return nextButton;
  };

  return buttons.map(normalizeButton);
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
