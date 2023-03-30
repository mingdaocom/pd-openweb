import userController from 'src/api/user';
import externalPortalCotroller from 'src/api/externalPortal';
import addressBookController from 'src/api/addressBook';

export function getAccounts({
  list,
  includeUndefinedAndMySelf,
  includeSystemField,
  prefixOnlySystemField,
  filterAccountIds,
  prefixAccountIds,
  prefixAccounts,
}) {
  let prefixUsers = [];
  let users = [...list];
  var filterMe = filterAccountIds.indexOf(md.global.Account.accountId) !== -1;
  var filterUndefined = filterAccountIds.indexOf('user-undefined') !== -1;
  var hasPrefix = (includeUndefinedAndMySelf && !(filterMe && filterUndefined)) || prefixAccountIds.length;
  var prefixAccountLength = prefixAccountIds.length;
  if (includeSystemField) {
    if (prefixOnlySystemField) {
      prefixUsers = users.filter(l => _.startsWith(l.accountId, 'user'));
      users = users.filter(l => !_.startsWith(l.accountId, 'user'));
    } else {
      prefixUsers = users.splice(0, 7);
    }
  } else {
    if (hasPrefix) {
      if (includeUndefinedAndMySelf) {
        if (filterMe && filterUndefined) {
          prefixUsers = users.splice(0, prefixAccountLength);
        } else if (filterMe || filterUndefined) {
          prefixUsers = users.splice(0, 1 + prefixAccountLength);
        } else {
          prefixUsers = users.splice(0, 2 + prefixAccountLength);
        }
      } else {
        prefixUsers = users.splice(0, prefixAccountLength);
      }
    }
  }
  if (prefixAccounts && prefixAccounts.length) {
    prefixUsers = prefixUsers.concat(prefixAccounts || []);
  }
  return {
    prefixUsers,
    users,
  };
}

export function getUsers(args) {
  if (args.type === 'external') {
    return externalPortalCotroller
      .getUsersByApp({
        projectId: args.projectId,
        appId: args.appId,
        pageIndex: args.pageIndex || 1,
        pageSize: 25,
        keywords: args.keywords || '',
        filterAccountIds: args.filterAccountIds || [],
      })
      .then(res => {
        let result = res.map(user => ({
          accountId: user.accountId,
          avatar: user.avatar,
          fullname: user.name,
          phone: user.mobilePhone,
        }));
        const currentAccount = result.find(item => item.accountId === md.global.Account.accountId);
        if (
          !args.hidePortalCurrentUser &&
          (args.includeSystemField || args.includeUndefinedAndMySelf) &&
          md.global.Account.isPortal
        ) {
          result = [
            {
              accountId: 'user-self',
              avatar: 'https://p1.mingdaoyun.cn/UserAvatar/user-self.png?imageView2/1/w/100/h/100/q/90',
              fullname: '当前用户',
            },
          ].concat(result);
        } else if (currentAccount) {
          result = [
            {
              ...currentAccount,
              fullname: _l('我自己'),
            },
          ].concat(result);
        }
        return result;
      });
  } else if (args.type === 'range') {
    return userController
      .getProjectContactUserListByApp({
        pageIndex: 1,
        pageSize: 100,
        projectId: args.projectId,
        keywords: args.keywords,
        filterAccountIds: args.filterAccountIds || [],
        ...(_.isObject(args.selectRangeOptions) ? args.selectRangeOptions : {}),
      })
      .then(res => _.get(res, 'users.list') || []);
  } else if (args.keywords) {
    return addressBookController
      .getUserAddressbookByKeywords({
        keywords: args.keywords || '',
        filterAccountIds: args.filterAccountIds || [],
        currentProjectId: args.projectId,
      })
      .then(res => res.list);
  } else {
    return userController.getOftenMetionedUser({
      count: args.mentionedCount,
      filterAccountIds: args.filterAccountIds || [],
      includeUndefinedAndMySelf: args.includeUndefinedAndMySelf || false,
      includeSystemField: args.includeSystemField || false,
      prefixAccountIds: args.prefixAccountIds || [],
      projectId: args.projectId,
    });
  }
}
