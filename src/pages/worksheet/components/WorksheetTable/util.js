import { emitter } from 'worksheet/util';
import _ from 'lodash';
import { updateRulesData, checkRuleLocked } from 'src/components/newCustomFields/tools/filterFn';

const KEY_MAP = {
  DELETE: 8,
  TAB: 9,
  ENTER: 13,
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  BOTTOM: 40,
  ESC: 27,
};

function checkCellFullVisible(element) {
  const left = element.offsetLeft;
  const top = element.offsetTop;
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  let newLeft;
  let newTop;
  const scrollLeft = element.parentElement.parentElement.scrollLeft;
  const scrollTop = element.parentElement.parentElement.scrollTop;
  const gridWidth = element.parentElement.parentElement.clientWidth;
  const gridHeight = element.parentElement.parentElement.clientHeight;
  const rightVisible = left + width <= scrollLeft + gridWidth;
  const leftVisible = left >= scrollLeft;
  const topVisible = top >= scrollTop;
  const bottomVisible = top + height <= scrollTop + gridHeight;
  if (!leftVisible) {
    newLeft = left;
  }
  if (!rightVisible) {
    newLeft = left + width - gridWidth;
  }
  if (!topVisible) {
    newTop = top;
  }
  if (!bottomVisible) {
    newTop = top + height - gridHeight;
  }
  return {
    fullvisible: rightVisible && leftVisible && topVisible && bottomVisible,
    newLeft,
    newTop,
  };
}

export function handleLifeEffect(
  tableId,
  {
    showColumnWidthChangeMask,
    tableType,
    isSubList,
    cache = {},
    onCellEnter = () => {},
    onCellLeave = () => {},
    addNewRow = () => {},
    setScroll,
    focusCell,
    handleTableKeyDown,
  } = {},
) {
  const tableElement = document.querySelector(`.sheetViewTable.id-${tableId}-id`);
  const $tableElement = $(`.sheetViewTable.id-${tableId}-id`);
  function handleCellEnter(e) {
    const $target = $(e.originalEvent.target).closest('.cell');
    const classMatch = $target.attr('class').match(/.*(row-[0-9]+) .*/);
    if (classMatch && $tableElement) {
      $tableElement.find('.cell').removeClass('hover');
      $tableElement.find('.' + classMatch[1]).addClass('hover');
      if (tableType === 'classic') {
        $tableElement.find('.cell').removeClass('grayHover');
        if (!$target[0].classList.contains('col-0')) {
          $target.addClass('grayHover');
        }
      }
      onCellEnter($target[0]);
    }
  }
  function handleCellLeave() {
    if ($tableElement) {
      $tableElement.find('.cell').removeClass('hover');
      if (tableType === 'classic') {
        $tableElement.find('.cell').removeClass('grayHover');
      }
      onCellLeave();
    }
  }
  function handleSwitchCell(e) {
    let nextCellIsRowStart;
    let nextCellIsRowEnd;
    let nextCellIsColumnStart;
    let nextCellIsColumnEnd;
    let newIndex = 1;
    if (_.isUndefined(cache.focusIndex)) {
      return;
    }
    const isMac = /Mac/.test(navigator.userAgent);
    const fastSwitch = (isMac && e.metaKey) || (!isMac && e.ctrlKey);
    if (fastSwitch) {
      e.stopPropagation();
      e.preventDefault();
    }
    switch (e.keyCode) {
      case KEY_MAP.LEFT:
        newIndex = cache.focusIndex - 1;
        if (newIndex % cache.columnCount === 0) {
          return;
        }
        if (fastSwitch) {
          nextCellIsRowStart = true;
          newIndex = cache.focusIndex - (cache.focusIndex % cache.columnCount) + 1;
        }
        break;
      case KEY_MAP.TOP:
        newIndex = cache.focusIndex - cache.columnCount;
        if (fastSwitch) {
          nextCellIsColumnStart = true;
          newIndex = cache.focusIndex % cache.columnCount;
        }
        break;
      case KEY_MAP.RIGHT:
      case KEY_MAP.TAB:
        newIndex = cache.focusIndex + 1;
        if (newIndex % cache.columnCount === 0) {
          if (e.keyCode === KEY_MAP.TAB) {
            newIndex += 1;
            nextCellIsRowStart = true;
          } else {
            return;
          }
        }
        if (fastSwitch) {
          nextCellIsRowEnd = true;
          newIndex = Math.ceil(cache.focusIndex / cache.columnCount) * cache.columnCount - 1;
        }
        if ((newIndex % cache.columnCount) - 1 === cache.fixedColumnCount) {
          // 冻结列下一列可能不可见
          nextCellIsRowStart = true;
        }
        break;
      case KEY_MAP.BOTTOM:
        newIndex = cache.focusIndex + cache.columnCount;
        if (fastSwitch) {
          nextCellIsColumnEnd = true;
          newIndex = (cache.rowCount - 1) * cache.columnCount + (cache.focusIndex % cache.columnCount);
        }
        break;
      default:
        break;
    }
    if (newIndex < 1) {
      return;
    }
    if (newIndex > cache.rowCount * cache.columnCount - 1) {
      if (e.action === 'text_enter_to_next' && isSubList) {
        addNewRow();
        setTimeout(() => {
          focusCell(newIndex);
        }, 100);
      }
      return;
    }
    const nextFocusElement = tableElement.querySelector('.cell-' + newIndex);
    if (nextFocusElement) {
      const result = checkCellFullVisible(nextFocusElement);
      if (!result.fullvisible) {
        setScroll(result.newLeft, result.newTop);
      }
    }
    if (nextCellIsRowStart) {
      setScroll(0);
    }
    if (nextCellIsRowEnd) {
      setScroll(10000);
    }
    if (nextCellIsColumnStart) {
      setScroll(undefined, 0);
    }
    if (nextCellIsColumnEnd) {
      setScroll(undefined, 10000);
    }
    focusCell(newIndex);
    e.stopPropagation();
    e.preventDefault();
  }
  function removeReadOnlyTip() {
    const readOnlyTip = tableElement.querySelector('.readOnlyTip');
    if (readOnlyTip) {
      readOnlyTip.parentElement.removeChild(readOnlyTip);
    }
  }
  function handleKeyDown(e) {
    // console.log({ ..._.pick(e, ['key', 'keyCode']), tagName: e.target.tagName });
    if (tableType !== 'classic' || (!isSubList && !!document.querySelector('.workSheetRecordInfo'))) {
      return;
    }
    removeReadOnlyTip();
    if (e.key === 'Enter') {
      const focusElement = tableElement.querySelector(`.cell-${cache.focusIndex}`);
      if (
        focusElement &&
        (!focusElement.classList.contains('editable') ||
          focusElement.className.match(/control-(30|31|38|32|33|47|37|25)/))
      ) {
        showReadOnlyTip(
          focusElement,
          Math.floor(cache.focusIndex / cache.columnCount) === cache.rowCount - 1 && cache.rowCount !== 1,
        );
        return;
      }
    }
    if (
      !cache.hasEditingCell &&
      _.includes([KEY_MAP.TAB, KEY_MAP.BOTTOM, KEY_MAP.TOP, KEY_MAP.LEFT, KEY_MAP.RIGHT], e.keyCode)
    ) {
      handleSwitchCell(e);
    } else {
      handleTableKeyDown(cache.focusIndex, e);
    }
  }
  function handleOuterClick(e) {
    removeReadOnlyTip();
    if (
      e.target.closest('.cellNeedFocus,.mdDialog,.mui-dialog-container,.UploadFilesTriggerWrap,.rc-trigger-popup') ||
      (!isSubList && e.target.closest('.recordInfoCon'))
    ) {
      return;
    }
    if (!e.target.closest(`.sheetViewTable.id-${tableId}-id`)) {
      try {
        if (_.get(safeParse(window.tempCopyForSheetView), 'tableId') === tableId) {
          window.tempCopyForSheetView = undefined;
        }
      } catch (err) {}
      focusCell(-10000);
    }
  }
  emitter.addListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + tableId, showColumnWidthChangeMask);
  $tableElement.on('mouseenter', '.cell:not(.row-head)', handleCellEnter);
  $tableElement.on('mouseleave', '.cell:not(.row-head)', handleCellLeave);

  emitter.addListener('TRIGGER_TABLE_KEYDOWN_' + tableId, handleKeyDown);
  window.addEventListener('keydown', handleKeyDown);
  document.body.addEventListener('click', handleOuterClick);
  return () => {
    emitter.removeListener('TRIGGER_CHANGE_COLUMN_WIDTH_MASK_' + tableId, showColumnWidthChangeMask);
    $tableElement.off('mouseenter', '.cell:not(.row-head)', handleCellEnter);
    $tableElement.off('mouseleave', '.cell:not(.row-head)', handleCellLeave);
    window.removeEventListener('keydown', handleKeyDown);
    emitter.removeListener('TRIGGER_TABLE_KEYDOWN_' + tableId, handleKeyDown);
    document.body.removeEventListener('click', handleOuterClick);
  };
}

export function columnWidthFactory({
  width, // 表格宽度
  visibleColumns, // 可见字段
  sheetColumnWidths, // 列宽
}) {
  // 撑不满时重设宽度
  let averageWidth;
  function getWidth(i) {
    const control = visibleColumns[i];
    return control.width || sheetColumnWidths[control.controlId] || 200;
  }
  if (_.sum([...new Array(visibleColumns.length)].map((a, i) => getWidth(i))) < width) {
    let widths = visibleColumns.map(c => sheetColumnWidths[c.controlId] || c.width).filter(_.identity);
    averageWidth = (width - _.sum(widths)) / (visibleColumns.length - widths.length);
  }
  return (index, noAverage) => {
    const control = visibleColumns[index] || {};
    return control.width || sheetColumnWidths[control.controlId] || (!noAverage && averageWidth) || 200;
  };
}

export function getControlFieldPermissionsAfterRules(row, controls, rules) {
  const formData = updateRulesData({
    rules,
    recordId: row.rowid,
    data: controls.map(c => ({ ...c, value: row[c.controlId] })),
  });
  const isLock = !/^temp/.test(row.rowid) && checkRuleLocked(rules, formData, row.rowid);
  const fieldPermissions = {};
  formData.forEach(item => {
    if (isLock) {
      fieldPermissions[row.rowid + '-' + item.controlId] =
        (item.fieldPermission[0] || '1') + '0' + (item.fieldPermission[2] || '1');
      return;
    }
    fieldPermissions[row.rowid + '-' + item.controlId] = item.fieldPermission || '111';
  });
  return fieldPermissions;
}

export function getRulePermissions({ data = [], controls, rules, isSubList, columns } = {}) {
  const result = {};
  data.forEach(row => {
    const controlFieldPermissions = getControlFieldPermissionsAfterRules(row, controls, rules);
    if (!_.isEmpty(controlFieldPermissions)) {
      Object.keys(controlFieldPermissions).forEach(key => {
        result[key] = controlFieldPermissions[key];
      });
    }
  });
  return result;
}

function getTextHeight(text = '', width, style = '') {
  let result;
  const div = document.createElement('div');
  div.innerText = text;
  div.style = style;
  div.style.width = width + 'px';
  div.style.position = 'absolute';
  div.style.left = '-10000px';
  div.style.bottom = '-10000px';
  document.body.appendChild(div);
  result = div.clientHeight;
  document.body.removeChild(div);
  return result;
}

export function getTableHeadHeight(columns) {
  const textHeight = Math.max(
    ...columns.map(c =>
      getTextHeight(c.controlName, c.width, 'font-size: 13px;line-height: 1.3em;word-break: break-all;'),
    ),
  );
  if (textHeight < 18) {
    return 18;
  }
  if (textHeight > 68) {
    return 68;
  }
  return textHeight;
}

export function showReadOnlyTip(target, isLastRow) {
  const source = document.createElement('div');
  source.classList.add('readOnlyTip');
  source.innerText = _l('当前字段不可编辑');
  source.style.display = 'block';
  if (!isLastRow) {
    source.style.borderTop = 'none';
    source.style.top = target.offsetTop + target.offsetHeight - 3 + 'px';
  } else {
    source.style.borderBottom = 'none';
    source.style.top = target.offsetTop - 30 + 3 + 'px';
  }
  source.style.left = target.offsetLeft + 'px';
  source.style.width = target.clientWidth + 'px';
  target.parentElement.appendChild(source);
}
