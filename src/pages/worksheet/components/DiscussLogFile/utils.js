// 讨论 tab 只在有计数时展示数量，超过两位时与折叠态入口保持 99+ 口径。
export function formatDiscussTabText(text, count) {
  const discussionCount = Number(count);

  if (!discussionCount) {
    return text;
  }

  return `${text}(${discussionCount > 99 ? '99+' : discussionCount})`;
}

// 复用移动端/折叠态的外部门户讨论计数规则：门户不可见内部讨论时只统计外部讨论。
export function getRecordDiscussionEntityType({ isPortal, allowExAccountDiscuss, exAccountDiscussEnum }) {
  if (isPortal && allowExAccountDiscuss && exAccountDiscussEnum === 1) {
    return 2;
  }

  return 0;
}

// RecordInfoRight 每次 render 都会创建新数组；这里按内容判断，避免引用变化造成计数接口循环请求。
export function hasHiddenTabsChanged(prevHiddenTabs = [], nextHiddenTabs = []) {
  if (prevHiddenTabs.length !== nextHiddenTabs.length) {
    return true;
  }

  return prevHiddenTabs.some((tab, index) => tab !== nextHiddenTabs[index]);
}

// 讨论计数与列表查询保持同一流程上下文口径；普通记录场景不传空的流程参数。
export function getRecordDiscussionsCountArgs({
  worksheetId,
  rowId,
  isPortal,
  allowExAccountDiscuss,
  exAccountDiscussEnum,
  workId,
  instanceId,
}) {
  const args = {
    sourceId: worksheetId + '|' + rowId,
    sourceType: 8,
    entityType: getRecordDiscussionEntityType({
      isPortal,
      allowExAccountDiscuss,
      exAccountDiscussEnum,
    }),
  };

  if (workId) {
    args.workId = workId;
  }

  if (instanceId) {
    args.instanceId = instanceId;
  }

  return args;
}

// 只有真实可见的记录详情右栏讨论 tab 需要取数，隐藏态由折叠入口负责。
export function shouldLoadRecordDiscussionCount({
  isWorksheetDiscuss,
  isOpenNewAddedRecord,
  configLoading,
  isHide,
  worksheetId,
  rowId,
  hasDiscussTab,
}) {
  return (
    !isWorksheetDiscuss && !isOpenNewAddedRecord && !configLoading && !isHide && worksheetId && rowId && hasDiscussTab
  );
}

export function shouldLoadRecordHeaderDiscussionCount({ loading, sideVisible, discussVisible, portalNotHasDiscuss }) {
  return !loading && !sideVisible && discussVisible && !portalNotHasDiscuss;
}

// 需求是从其它 tab 切回讨论时刷新；当前已在讨论 tab 时重复点击不再请求。
export function shouldReloadDiscussionCountOnTabClick({ tabId, currentStatus }) {
  return tabId === 1 && currentStatus !== 1;
}
