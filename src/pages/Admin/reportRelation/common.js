const structureController = require('src/api/structure');
const projectSettingController = require('src/api/projectSetting');
import Config from '../config';
import 'src/components/dialogSelectUser/dialogSelectUser';

export function getAuth() {
  return projectSettingController
    .getStructureForAll({
      projectId: Config.projectId,
    })
    .then(
      res => {
        return res;
      },
      () => {
        return $
          .Deferred()
          .resolve(false)
          .promise();
      }
    );
}

export function setStructureForAll(params) {
  return projectSettingController
    .setStructureForAll({
      projectId: Config.projectId,
      ...params,
    })
    .then(
      res => {
        return res;
      },
      () => {
        alert(_l('操作失败'), 2);
        return $
          .Deferred()
          .reject()
          .promise();
      }
    );
}

export function setStructureSelfEdit(params) {
  return projectSettingController
    .setStructureSelfEdit({
      projectId: Config.projectId,
      ...params,
    })
    .then(
      res => {
        return res;
      },
      () => {
        alert(_l('操作失败'), 2);
        return $
          .Deferred()
          .reject()
          .promise();
      }
    );
}

export function selectUser({ title, accountId, unique, isSetParent, callback }) {
  $({}).dialogSelectUser({
    fromAdmin: true,
    SelectUserSettings: {
      projectId: Config.projectId,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      unique: !!unique,
      showTabs: ['structureUsers'],
      extraTabs: [
        {
          id: 'structureUsers',
          name: '所有人',
          type: 4,
          page: true,
          actions: {
            getUsers: function (args) {
              args = $.extend({}, args, {
                accountId,
                projectId: Config.projectId,
                isSetParent,
              });
              return structureController.getAllowChooseUsers(args);
            },
          },
        },
      ],
      callback: function (accounts) {
        if (typeof callback === 'function') {
          callback(accounts);
        }
      },
    },
  });
}

export function searchUser({ keywords, pageIndex = 1, pageSize = 100 }) {
  return structureController.getStructureUsers({
    projectId: Config.projectId,
    keywords,
    pageIndex,
    pageSize,
  });
}
