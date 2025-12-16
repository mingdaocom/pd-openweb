import _ from 'lodash';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import { isIllegal } from 'src/pages/worksheet/views/CalendarView/util';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { getAdvanceSetting } from 'src/utils/control';

const { sheet, board, calendar, gallery, structure, gunter, detail, resource, map } = VIEW_DISPLAY_TYPE;

export const getViewActionInfo = ({
  view = {},
  worksheetInfo = {},
  calendarview = {},
  sheetSwitchPermit,
  batchOptVisible,
  appDetail = {},
  isHideTabBar,
  hideAddRecord,
  hasDebugRoles,
  isGroupFilter,
}) => {
  const { navGroup = [], childType, advancedSetting = {}, viewControl, viewControls = [] } = view;
  const { appnavtype } = advancedSetting;
  const { appNaviStyle } = appDetail;
  const { allowAdd, template = {} } = worksheetInfo;
  const { controls = [] } = template;
  const viewType = String(view.viewType);
  const { calendarData = {} } = calendarview;
  let { begindate = '', enddate = '', calendarcids = '[]' } = getAdvanceSetting(view);
  const canDelete = isOpenPermit(permitList.delete, sheetSwitchPermit, view.viewId);
  const showCusTomBtn = isOpenPermit(permitList.execute, sheetSwitchPermit, view.viewId);
  let isHaveSelectControl = true;
  let canAddRecord =
    !hideAddRecord && isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) && allowAdd && !batchOptVisible; // 新建记录
  const isBottomNav = appNaviStyle === 2 && location.href.includes('mobile/app'); // 底部导航(含底部tab)
  let recordActionWrapBottom = !isHideTabBar && isBottomNav ? 70 : 20;
  const isPublic = _.get(window, 'shareState.isPublicView');
  let showBatchBtn = false; // 批量操作
  let showBackBtn = !(isBottomNav && md.global.Account.isPortal);

  switch (viewType) {
    case sheet:
      showBatchBtn =
        !hideAddRecord &&
        (canDelete || showCusTomBtn) &&
        !batchOptVisible &&
        (_.isEmpty(navGroup) || isGroupFilter || appnavtype !== '1') &&
        !isPublic;
      break;
    case board:
      isHaveSelectControl =
        viewControl === 'create' || (viewControl && _.find(controls, item => item.controlId === viewControl));
      canAddRecord = canAddRecord && isHaveSelectControl;
      break;
    case calendar:
      const { calendarInfo = [] } = calendarData;

      try {
        calendarcids = JSON.parse(calendarcids);
      } catch (error) {
        console.log(error);
        calendarcids = [];
      }
      if (calendarcids.length <= 0) {
        calendarcids = [{ begin: begindate, end: enddate }]; //兼容老数据
      }
      const isDelete =
        calendarcids[0].begin &&
        calendarInfo.length > 0 &&
        (!calendarInfo[0].startData || !calendarInfo[0].startData.controlId);
      isHaveSelectControl = !(!calendarcids[0].begin || isDelete);
      canAddRecord = canAddRecord && isHaveSelectControl;
      break;
    case gallery:
      break;
    case structure:
      isHaveSelectControl =
        viewControl === 'create' ||
        (viewControl && _.find(controls, item => item.controlId === viewControl)) ||
        !_.isEmpty(viewControls);
      canAddRecord = canAddRecord && advancedSetting.hierarchyViewType !== '3' && isHaveSelectControl;
      break;
    case gunter:
      const timeControls = controls.filter(
        item =>
          !SYS.includes(item.controlId) &&
          (_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
      );
      const timeControlsIds = timeControls.map(o => o.controlId);
      isHaveSelectControl =
        begindate &&
        timeControlsIds.includes(begindate) &&
        enddate &&
        timeControlsIds.includes(enddate) &&
        !isIllegal(controls.find(item => item.controlId === begindate) || {}) &&
        !isIllegal(controls.find(item => item.controlId === enddate) || {});
      canAddRecord = canAddRecord && isHaveSelectControl;
      break;
    case detail:
      canAddRecord = canAddRecord && childType !== 1;
      recordActionWrapBottom = childType === 1 ? recordActionWrapBottom + 100 : recordActionWrapBottom;
      break;
    case resource:
      const viewControlInfo =
        (
          setSysWorkflowTimeControlFormat(
            controls.filter(item => _.includes([1, 2, 27, 48, 9, 10, 11, 26, 29], item.type)),
            sheetSwitchPermit,
          ) || []
        ).find(it => it.controlId === view.viewControl) || {};
      isHaveSelectControl = viewControlInfo.controlId;
      canAddRecord = canAddRecord && isHaveSelectControl;
      break;
    case map:
      isHaveSelectControl =
        viewControl &&
        _.find(setSysWorkflowTimeControlFormat(controls, sheetSwitchPermit), item => item.controlId === viewControl);
      canAddRecord = canAddRecord && isHaveSelectControl;
      break;
  }

  // 导航模式
  if (!isHideTabBar && isBottomNav && hasDebugRoles) {
    recordActionWrapBottom = recordActionWrapBottom + 40;
  }

  return {
    canAddRecord, //新建记录
    recordActionWrapBottom, // 记录操作位置
    showBackBtn, // 返回按钮
    showBatchBtn, // 批量操作（仅表视图）
  };
};

export const getDefaultValueInCreate = (mobileNavGroupFilters = []) => {
  if (_.isEmpty(mobileNavGroupFilters)) return;
  let data = mobileNavGroupFilters[0];
  if ([9, 10, 11, 28].includes(data.dataType)) {
    return { [data.controlId]: JSON.stringify([data.values[0]]) };
  } else if ([26, 27, 48].includes(data.dataType)) {
    let value = '';
    const id = _.get(data, 'values[0]');
    const name = _.get(data, 'navNames[0]');
    if (id && name) {
      value = JSON.stringify([safeParse(name)]);
    } else {
      value = '[]';
    }
    return { [data.controlId]: value };
  } else if ([29, 35].includes(data.dataType)) {
    return {
      [data.controlId]: JSON.stringify([
        {
          sid: data.values[0],
          name: data.navNames[0] || '',
        },
      ]),
    };
  }
};

// 分组数据平铺
export const getFlatSheetRows = ({ groupData, unfoldedKeys = [], isFilterUnfolded = true }) => {
  return groupData
    .filter(v => (isFilterUnfolded ? _.includes(unfoldedKeys || [], v.key) : true))
    .reduce((rows, item) => rows.concat(item.rows), []);
};
