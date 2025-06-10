import _, { find, get, identity, includes, isArray, isEmpty, sortBy, sum } from 'lodash';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { CARD_WIDTH_SETTING } from 'src/pages/worksheet/common/ViewConfig/config';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';

export function findSheet(id, sheetList = []) {
  let result = null;
  for (let i = 0; i < sheetList.length; i++) {
    const current = sheetList[i];
    if (current.workSheetId == id) {
      result = current;
      break;
    }
    if (current.type === 2) {
      result = findSheet(id, current.items);
      if (result) {
        break;
      }
    }
  }
  return result;
}

export function getSheetListFirstId(sheetList = [], isCharge = true) {
  let result = null;
  for (let i = 0; i < sheetList.length; i++) {
    const current = sheetList[i];
    if (current.type === 2) {
      result = getSheetListFirstId(current.items, isCharge);
      if (result) {
        break;
      }
    } else if (isCharge ? true : [1, 4].includes(current.status) && !current.navigateHide) {
      result = current.workSheetId;
      break;
    }
  }
  return result;
}

export const moveSheetCache = (appId, groupId) => {
  const storage = JSON.parse(localStorage.getItem(`mdAppCache_${md.global.Account.accountId}_${appId}`)) || {};
  const worksheets = storage.worksheets.map(data => {
    if (data.groupId === groupId) {
      data.worksheetId = '';
    }
    return data;
  });
  storage.worksheets = worksheets;
  storage.lastWorksheetId = '';
  safeLocalStorageSetItem(`mdAppCache_${md.global.Account.accountId}_${appId}`, JSON.stringify(storage));
};

export const getHighAuthSheetSwitchPermit = (sheetSwitchPermit, worksheetId) => {
  return sheetSwitchPermit.map(l => ({ ...l, state: true, viewIds: (l.viewIds || []).concat(worksheetId) }));
};

// 本地存储当前选中菜单
export const saveSelectExtensionNavType = (worksheetId, navType, navValue) => {
  const sheetConfigNavInfo = localStorage.getItem('sheetConfigNavInfo')
    ? JSON.parse(localStorage.getItem('sheetConfigNavInfo'))
    : {};
  if (!sheetConfigNavInfo[worksheetId]) {
    sheetConfigNavInfo[worksheetId] = {};
  }
  sheetConfigNavInfo[worksheetId][navType] = navValue;
  const sheetIds = Object.keys(sheetConfigNavInfo);
  if (sheetIds.length > 10) {
    delete sheetConfigNavInfo[sheetIds[0]];
  }
  localStorage.setItem('sheetConfigNavInfo', JSON.stringify(sheetConfigNavInfo));
};

export function getListStyle(listStyleStrOfView, listStyleStrOfWorksheet) {
  let availableListStyle;
  let listStyleOfWorksheet;
  let listStyleOfView;
  if (!listStyleStrOfWorksheet && listStyleStrOfView) {
    availableListStyle = safeParse(listStyleStrOfView);
  } else if (listStyleStrOfWorksheet && !listStyleStrOfView) {
    availableListStyle = safeParse(listStyleStrOfWorksheet);
  } else {
    listStyleOfWorksheet = safeParse(listStyleStrOfWorksheet);
    listStyleOfView = safeParse(listStyleStrOfView);
    availableListStyle = sortBy([listStyleOfWorksheet, listStyleOfView], 'time').pop();
  }
  return availableListStyle;
}

export function getSheetColumnWidthsOfStyles(columnStyles) {
  const sheetColumnWidthsMap = new Map();
  columnStyles.forEach(item => {
    sheetColumnWidthsMap.set(item.cid, item.width);
  });
  return Object.fromEntries(sheetColumnWidthsMap);
}

export function getSheetColumnWidthsMap(
  view = { advancedSetting: { liststyle: '' } },
  worksheetInfo = { advancedSetting: { liststyle: '' }, template: { controls: [] } },
) {
  const listStyleStrOfWorksheet = worksheetInfo.advancedSetting.liststyle;
  const listStyleStrOfView = view.advancedSetting.liststyle;
  if (!listStyleStrOfView && !listStyleStrOfWorksheet) return {};
  const { time, styles } = getListStyle(listStyleStrOfView, listStyleStrOfWorksheet);
  return {
    time,
    map: getSheetColumnWidthsOfStyles(styles),
  };
}

export function getCardWidth(view) {
  const cardwidth = _.get(view, 'advancedSetting.cardwidth');

  if (!cardwidth) return undefined;

  const cardWidth = CARD_WIDTH_SETTING[cardwidth] || Number(cardwidth);
  const positionIsLeftOrRight =
    Number(cardwidth) < 5 &&
    ['0', '1'].includes(_.get(getCoverStyle(view), 'coverPosition') || (view.viewType === 3 ? '2' : '1'));

  return positionIsLeftOrRight ? cardWidth + 96 : cardWidth;
}

export function getSheetOperatesButtons(view, { buttons = [], printList = [] } = {}) {
  const actionColumn = safeParse(get(view, 'advancedSetting.actioncolumn'), 'array');
  let result = [];
  actionColumn.forEach(c => {
    if (c.type === 'btn') {
      const matchBtn = find(buttons, b => b.btnId === c.id);
      if (matchBtn) {
        result.push({ ...matchBtn, type: 'custom_button' });
      }
    } else if (c.type === 'print') {
      const printItem = find(printList, p => p.id === c.id);
      if (printItem) {
        result.push({
          name: printItem.name,
          icon: 'print',
          color: '#2196f3',
          type: 'print',
          btnId: printItem.id,
          printItem,
        });
      }
    } else if (includes(['copy', 'share', 'delete', 'sysprint'], c.type)) {
      result.push({
        btnId: c.type,
        type: c.type,
        color:
          {
            delete: '#F44336',
          }[c.type] || '#2196f3',
        name: {
          copy: _l('复制'),
          share: _l('分享'),
          delete: _l('删除'),
          sysprint: _l('打印'),
        }[c.type],
        icon: {
          copy: 'copy',
          share: 'share',
          delete: 'trash',
          sysprint: 'print',
        }[c.type],
      });
    }
  });
  return result.filter(identity);
}

export function getSheetOperatesButtonsStyle(view) {
  const { icon = 1, style = 1, btncount = 3, primarycount = 1 } = safeParse(get(view, 'advancedSetting.acstyle'));
  return {
    showIcon: icon === 1,
    style: {
      1: 'standard',
      2: 'text',
      3: 'icon',
    }[style],
    visibleNum: Number(btncount),
    primaryNum: Number(primarycount),
  };
}

function getTextWidth(text = '1', fontSize = 13) {
  let result;
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.fontWeight = 'bold';
  div.style.left = '-10000px';
  div.style.top = '-10000px';
  div.style.zIndex = '99999';
  div.style.fontSize = `${fontSize}px`;
  div.innerHTML = text;
  document.body.appendChild(div);
  result = div.clientWidth;
  document.body.removeChild(div);
  return result;
}

export function getOperatesButtonsWidth({ buttons, style, visibleNum, showIcon } = {}) {
  const fontSize = 12;
  const iconWidth = 20;
  const marginRight = 6;
  const iconMarginRight = 4;
  const buttonPadding = 8 * 2;
  const cellPadding = 10 * 2;
  const showMore = buttons.length > visibleNum;
  const moreButtonWidth = 28;
  const cellBorderWidth = 1 * 2;
  function getButtonWidth(button, { noMarginRight = false } = {}) {
    let buttonWidth = 0;
    let textWidth = 0;
    if (style === 'icon') {
      buttonWidth = 28 + (noMarginRight ? 0 : marginRight);
    } else if (style === 'text') {
      textWidth = getTextWidth(button.name, fontSize);
      if (textWidth > 200) {
        textWidth = 200;
      }
      buttonWidth = textWidth + buttonPadding + (showIcon && button.icon ? iconWidth + iconMarginRight : 0);
    } else if (style === 'standard') {
      textWidth = getTextWidth(button.name, fontSize);
      if (textWidth > 200) {
        textWidth = 200;
      }
      buttonWidth =
        textWidth +
        buttonPadding +
        (showIcon && button.icon ? iconWidth + iconMarginRight : 0) +
        (noMarginRight ? 0 : marginRight) +
        2;
    }
    return buttonWidth;
  }
  const visibleButtons = buttons.slice(0, visibleNum);
  let sumWidth = sum(
    visibleButtons.map((buttion, i) =>
      getButtonWidth(buttion, {
        noMarginRight: i === visibleButtons.length - 1 && !showMore,
      }),
    ),
  );
  if (showMore) {
    sumWidth += moreButtonWidth;
  }
  return sumWidth + cellPadding + cellBorderWidth;
}

export function filterButtonBySheetSwitchPermit(
  buttons = [],
  sheetSwitchPermit,
  viewId,
  row = {
    allowedit: true,
    allowdelete: true,
  },
) {
  return (buttons = buttons.filter(button => {
    if (button.type === 'delete') {
      return isOpenPermit(permitList.recordDelete, sheetSwitchPermit, viewId) && row.allowdelete;
    } else if (button.type === 'share') {
      return (
        (isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) ||
          isOpenPermit(permitList.embeddedLink, sheetSwitchPermit, viewId)) &&
        !md.global.Account.isPortal
      );
    } else if (button.type === 'copy') {
      return isOpenPermit(permitList.recordCopySwitch, sheetSwitchPermit, viewId) && row.allowedit;
    } else if (button.type === 'sysprint') {
      return isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId);
    }
    return true;
  }));
}

function getSheetStylesOfObject(object) {
  const listStyle = get(object, 'advancedSetting.liststyle');
  return listStyle
    ? {
        updateTime: safeParse(listStyle).time,
        columnStyles: safeParse(listStyle).styles.reduce((a, b) => Object.assign({}, a, { [b.cid]: b }), {}),
        sheetColumnWidths: safeParse(listStyle).styles.reduce((a, b) => ({ ...a, [b.cid]: b.width }), {}),
      }
    : {
        columnStyles: {},
        sheetColumnWidths: {},
      };
}

export function getSheetStylesOfRelateRecordTable({ control, viewId, worksheetInfo } = {}) {
  if (get(control, 'advancedSetting.widths')) {
    const widths = safeParse(get(control, 'advancedSetting.widths'), 'array');
    if (isArray(widths)) {
      let result = {};
      widths.forEach((width, i) => {
        if (control.showControls && control.showControls[i]) {
          result[control.showControls[i]] = width;
        }
      });
      if (!isEmpty(result)) {
        return { sheetColumnWidths: result };
      }
    } else {
      if (!isEmpty(widths)) {
        return { sheetColumnWidths: widths };
      }
    }
  }
  const worksheetSheetStyles = getSheetStylesOfObject(worksheetInfo);
  let result = {};
  if (!viewId) {
    result = worksheetSheetStyles;
  } else {
    const view = find(worksheetInfo.views, { viewId });
    if (view && view.viewType === 0) {
      result = getSheetStylesOfObject(view);
    } else {
      result = getSheetStylesOfObject(
        find(worksheetInfo.views, v => v.viewType === 0 && !!get(v, 'advancedSetting.liststyle')),
      );
    }
    if (isEmpty(result) || result.updateTime < worksheetSheetStyles.updateTime) {
      result = worksheetSheetStyles;
    }
  }
  return result;
}
