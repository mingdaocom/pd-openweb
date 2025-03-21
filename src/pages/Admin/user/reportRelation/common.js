import structureController from 'src/api/structure';
import projectSettingController from 'src/api/projectSetting';
import Config from '../../config';
import { dialogSelectUser } from 'ming-ui/functions';

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
        return Promise.reject();
      },
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
        return Promise.reject();
      },
    );
}

export function selectUser({ title, accountId, unique, isSetParent, callback }) {
  dialogSelectUser({
    fromAdmin: true,
    SelectUserSettings: {
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      filterResigned: false,
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
