import ajax from 'src/pages/hr/approval/api/system';
import 'src/components/dialogSelectUser/dialogSelectUser';

/**
 * hr 审批用的选人
 * @param title
 * @param projectId
 * @param callback
 * @param role 是否需要角色tab
 * @param unique 是否唯一选择
 * @param filterAccountIds 需要过滤的用户
 * @param superior //是否是需要直属上司的tab
 * @constructor
 */
const SelectUser = function (title, projectId, callback, role = false, unique = false, filterAccountIds = [], superior = true) {
  if (role) {
    $({}).dialogSelectUser({
      title,
      zIndex: 11,
      sourceId: '',
      fromType: 4,
      showMoreInvite: false,
      SelectUserSettings: {
        projectId,
        filterAll: true,
        filterFriend: true,
        filterOthers: true,
        filterOtherProject: true,
        filterAccountIds,
        showTabs: ['conactUser', 'department', 'subordinateUser', 'roleUsers'],
        unique,
        extraTabs: [
          {
            id: 'roleUsers',
            name: _l('角色'),
            type: 4,
            page: false,
            actions: {
              getUsers: args => ajax.getRolePublicList(Object.assign({}, args, { superior })),
            },
          },
        ],
        callback: (users) => {
          const newUsers = [];
          users.forEach((user) => {
            const strs = user.accountId.split('_');
            const newUser = {
              accountId: strs[0],
              avatar: user.avatar,
              fullname: user.fullname,
              department: user.department,
            };

            if (strs.length > 1) {
              newUser.roleId = strs[1];
              if (strs[1] === '2' || strs[1] === '4') newUser.fullname = user.department;
              else newUser.fullname = user.department + '(' + user.fullname + ')';
            }
            newUsers.push(newUser);
          });

          callback(newUsers);
        },
      },
    });
  } else {
    $({}).dialogSelectUser({
      title,
      zIndex: 11,
      sourceId: '',
      fromType: 4,
      showMoreInvite: false,
      SelectUserSettings: {
        projectId,
        filterAll: true,
        filterOthers: true,
        filterFriend: true,
        filterOtherProject: true,
        filterAccountIds,
        unique,
        showTabs: ['conactUser', 'department', 'subordinateUser'],
        callback: (users) => {
          callback(users);
        },
      },
    });
  }
};

export default SelectUser;
