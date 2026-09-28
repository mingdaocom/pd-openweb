export const CHANGE_STATUS = {
  ADDED: '新增',
  UPDATED: '更新',
  DELETED: '删除',
};

export function getChangeStatusLabel(status) {
  switch (status) {
    case CHANGE_STATUS.ADDED:
      return _l('新增');
    case CHANGE_STATUS.UPDATED:
      return _l('更新');
    case CHANGE_STATUS.DELETED:
      return _l('删除');
    default:
      return '';
  }
}
