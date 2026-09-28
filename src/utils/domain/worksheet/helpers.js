import _, { find, get, identity, includes, isArray, isEmpty, sortBy } from 'lodash';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { isTreeTableView } from 'src/utils/domain/worksheet/tree';

/**
 * 在包含分组的工作表导航树中递归查找指定工作表。
 */
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

/**
 * 获取工作表导航树中首个可访问工作表的标识。
 */
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

/**
 * 将高权限工作表加入每项功能开关的可用视图范围。
 */
export const getHighAuthSheetSwitchPermit = (sheetSwitchPermit, worksheetId) => {
  return sheetSwitchPermit.map(l => ({ ...l, state: true, viewIds: (l.viewIds || []).concat(worksheetId) }));
};

/**
 * 在视图与工作表列样式中选择更新时间较新的有效配置。
 */
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

/**
 * 将列样式数组转换为按控件标识索引的列宽对象。
 */
function getSheetColumnWidthsOfStyles(columnStyles) {
  const sheetColumnWidthsMap = new Map();
  columnStyles.forEach(item => {
    sheetColumnWidthsMap.set(item.cid, item.width);
  });
  return Object.fromEntries(sheetColumnWidthsMap);
}

/**
 * 汇总当前生效的列样式更新时间与列宽映射。
 */
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

/**
 * 按视图操作列配置组装可用的按钮、分组、打印及系统操作。
 */
export function getSheetOperatesButtons(view, { buttons = [], printList = [] } = {}) {
  const actionColumn = safeParse(get(view, 'advancedSetting.actioncolumn'), 'array');
  let result = [];
  actionColumn.forEach(c => {
    if (c.type === 'btn') {
      const matchBtn = find(buttons, b => b.btnId === c.id);

      // 过滤已停用的按钮（status === 0）
      if (matchBtn && matchBtn.status !== 0) {
        result.push({ ...matchBtn, type: 'custom_button' });
      }
    } else if (c.type === 'group') {
      const layoutKey = c.source === 'detail' ? 'detailgroup' : 'listgroup';
      const groupLayout = safeParse(get(view, `advancedSetting.${layoutKey}`), 'array');
      const groupDef = (groupLayout || []).find(g => g && g.type === 'group' && g.id === c.id);

      if (!groupDef) {
        return;
      }

      // 行内操作里分组优先于单按钮，组内按钮可能已不在 actioncolumn 中，这里按分组布局展开并过滤停用按钮。
      const memberButtons = (groupDef.btns || [])
        .map(id => find(buttons, b => b.btnId === id))
        .filter(Boolean)
        .filter(b => b.status !== 0)
        .map(b => ({ ...b, type: 'custom_button' }));

      if (!memberButtons.length) {
        return;
      }

      result.push({
        type: 'group_ref',
        btnId: `group:${c.source || 'list'}:${c.id}`,
        id: c.id,
        source: c.source,
        name: groupDef.name,
        icon: groupDef.icon,
        iconUrl: groupDef.iconUrl,
        iconColor: groupDef.iconColor,
        buttons: memberButtons,
      });
    } else if (c.type === 'print') {
      const printItem = find(printList, p => p.id === c.id);

      if (printItem) {
        result.push({
          name: printItem.name,
          icon: 'print',
          color: '#1677ff',
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
          }[c.type] || '#1677ff',
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

/**
 * 展开操作分组并提取所有实际按钮标识。
 */
export function getSheetOperateButtonIds(buttons = []) {
  return _.flatMap(buttons, button =>
    button.type === 'group_ref' && _.isArray(button.buttons)
      ? button.buttons.map(member => member.btnId)
      : [button.btnId],
  ).filter(Boolean);
}

/**
 * 将视图操作列样式配置转换为按钮展示参数。
 */
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

// 能配置列样式（liststyle）的视图：普通表格视图，以及层级视图的表格形态（树形表格视图）。
// 树形表格视图同样能保存列样式，指定它为关联视图时应继承它的列样式，而不是回退到别的视图。
function isColumnStyleView(view) {
  return Number(get(view, 'viewType')) === 0 || isTreeTableView(view);
}

function getSheetStylesOfObject(object) {
  const listStyle = get(object, 'advancedSetting.liststyle');

  if (!listStyle) {
    return {
      columnStyles: {},
      sheetColumnWidths: {},
    };
  }

  const { time: updateTime, styles = [] } = safeParse(listStyle);
  const columnStyles = {};
  const sheetColumnWidths = {};

  styles.forEach(item => {
    columnStyles[item.cid] = item;
    sheetColumnWidths[item.cid] = item.width;
  });

  return {
    updateTime,
    columnStyles,
    sheetColumnWidths,
  };
}

/**
 * 解析关联记录、子表或查询记录表格应使用的列宽与列样式。
 * 未继承工作表样式时使用字段列宽；启用继承时在指定视图与数据管理视图中选择有效配置。
 *
 * 数据管理视图（viewId === worksheetId）不在 getWorksheetInfo 返回的 views 里，它的列样式
 * 需要调用方另外用 GetWorksheetViewById 取到后通过 manageView 传入。worksheetInfo 上的
 * liststyle 只是「应用到所有视图」时写的工作表级样式，两者不等价，仅作为兜底。
 */
export function getSheetStylesOfRelateRecordTable({ control, viewId, worksheetInfo, manageView } = {}) {
  const useColumnStyle = get(control, 'advancedSetting.usecolumnstyle') === '1';

  // 未开启：使用字段本身设置的列宽，不继承列样式
  if (!useColumnStyle) {
    let sheetColumnWidths = {};

    if (get(control, 'advancedSetting.widths')) {
      const widths = safeParse(get(control, 'advancedSetting.widths'), 'array');

      if (isArray(widths)) {
        widths.forEach((width, i) => {
          if (control.showControls && control.showControls[i]) {
            sheetColumnWidths[control.showControls[i]] = width;
          }
        });
      } else if (!isEmpty(widths)) {
        sheetColumnWidths = widths;
      }
    }

    return { columnStyles: {}, sheetColumnWidths };
  }

  // 开启：继承视图/数据管理视图的列样式（不再使用字段自身列宽）
  // 优先用调用方拉到的数据管理视图；没传或它没配过列样式时，回退工作表级样式
  const manageViewStyles = manageView && getSheetStylesOfObject(manageView);
  const worksheetSheetStyles = get(manageViewStyles, 'updateTime')
    ? manageViewStyles
    : getSheetStylesOfObject(worksheetInfo);
  let result = {};

  if (!viewId) {
    result = worksheetSheetStyles;
  } else {
    const view = find(get(worksheetInfo, 'views'), { viewId });

    if (view && isColumnStyleView(view)) {
      result = getSheetStylesOfObject(view);
    } else {
      result = getSheetStylesOfObject(
        find(get(worksheetInfo, 'views'), v => isColumnStyleView(v) && !!get(v, 'advancedSetting.liststyle')),
      );
    }

    // 指定的关联视图自己配过列样式时一律以它为准，不再比更新时间——数据管理视图/工作表级
    // 改得更晚也不应覆盖用户显式指定的视图。只有该视图没配过列样式才回退。
    // 用 updateTime 判断"配过没有"：getSheetStylesOfObject 在没有 liststyle 时只返回空的
    // columnStyles/sheetColumnWidths 而不带 updateTime；不能用 isEmpty(result)，它恒有两个键、永远非空
    if (!result.updateTime) {
      result = worksheetSheetStyles;
    }
  }

  return result;
}

/**
 * 从视图分组设置中读取首个分组控件标识。
 */
export function getGroupControlId(view) {
  const groupId = get(safeParse(get(view, 'advancedSetting.groupsetting'), 'array'), '[0].controlId');
  return groupId;
}

/**
 * 将分组键转换为对应控件类型可用的工作表筛选条件。
 */
export function getFiltersForGroupedView(control, groupKey) {
  if (String(groupKey) === '-1') {
    return {
      controlId: control.controlId,
      dataType: control.type,
      spliceType: 1,
      filterType: 7,
    };
  }

  if (
    includes(
      [
        WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU,
        WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT,
        WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN,
        WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET,
        WIDGETS_TO_API_TYPE_ENUM.USER_PICKER,
        WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE,
        WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT,
      ],

      control.type,
    )
  ) {
    return {
      controlId: control.controlId,
      dataType: control.type,
      spliceType: 1,
      filterType: 51,
      dynamicSource: [],
      values: [groupKey],
    };
  }

  if (control.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
    return {
      controlId: control.controlId,
      dataType: control.type,
      spliceType: 1,
      filterType: 2,
      dynamicSource: [],
      values: [groupKey],
    };
  }

  return {};
}
