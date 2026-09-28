import { includes } from 'lodash';

/** 判断账号是否属于不可重复选择的账号集合。 */
export function isAccountIncluded(user, selectedAccountIds = []) {
  return includes(selectedAccountIds || [], user.accountId);
}

/** 判断账号是否已选中或属于不可重复选择的账号集合。 */
export function isAccountChecked(user, selectedUsers = [], selectedAccountIds = []) {
  return selectedUsers.some(item => item.accountId === user.accountId) || isAccountIncluded(user, selectedAccountIds);
}
