import _ from 'lodash';

export const TYPES = {
  NEW_FRIENDS: 'NEW_FRIENDS',
  ALL_CONTACTS: 'ALL_CONTACTS',
  CONTACTS: 'CONTACTS',
  ALL_GROUPS: 'ALL_GROUPS',
  FRIENDS: 'FRIENDS',
  OTHERS: 'OTHERS',
  PROJECT_CONTACTS: 'PROJECT_CONTACTS',
  PROJECT_GROUPS: 'PROJECT_GROUPS',

  INBOX: 'INBOX',
};

export const gatherProjects = () => {
  const projects = md.global.Account.projects;
  return _.map(projects, ({ projectId, companyName }) => ({
    name: companyName,
    projectId,
    list: [
      {
        name: _l('部门'),
        type: TYPES.PROJECT_CONTACTS,
        projectId,
      },
      {
        name: _l('群组'),
        type: TYPES.PROJECT_GROUPS,
        projectId,
      },
    ],
  }));
};

export const SIDER_BAR_LIST = [
  {
    name: _l('新的好友'),
    type: TYPES.NEW_FRIENDS,
  },
  {
    name: _l('应用消息'),
    type: TYPES.INBOX,
  },
  {
    dividor: true,
  },
  {
    name: _l('所有联系人'),
    type: TYPES.ALL_CONTACTS,
  },
  {
    name: _l('我的群组'),
    type: TYPES.ALL_GROUPS,
  },
  {
    name: _l('好友'),
    type: TYPES.FRIENDS,
  },
];

// {
//   name: _l('其他协作关系'),
//   type: TYPES.OTHERS,
//   icon: 'help',
//   tip: _l('Ta们是被您的好友或同事邀请加入协作模块与您共同协作'),
// }

export const SEARCH_GROUP_TYPES = {
  ALL: -1,
  CREATED: 0,
  JOINED: 1,
};

export const GROUP_STATUS = {
  ALL: -1,
  CLOSED: 0,
  OPEN: 1,
  DELTED: 2,
};
