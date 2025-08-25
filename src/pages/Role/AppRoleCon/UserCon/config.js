export const pageSize = 100;

export const getIcon = data => {
  return [0].includes(data.memberType)
    ? 'business'
    : [1, 2].includes(data.memberType)
      ? 'department'
      : [4].includes(data.memberType)
        ? 'limit-principal'
        : [3].includes(data.memberType)
          ? 'user'
          : '';
};

export const getColor = data => {
  return [0, 1].includes(data.memberType) ? '#1677ff' : [3].includes(data.memberType) ? '#ffad00' : '#eaeaea';
};

export const getTxtColor = data => {
  return [0, 1, 3].includes(data.memberType) ? 'White' : 'Gray_9e';
};

export const userStatusList = [
  {
    value: 0,
    tag: _l('全组织'),
    text: _l('部门'),
    key: 50,
  },
  {
    value: 1,
    tag: _l('部门树'),
    text: _l('部门'),
    key: 21,
  },
  {
    value: 2,
    text: _l('部门'),
    key: 20,
  },
  {
    value: 3,
    text: _l('组织角色'),
    key: 40,
  },
  {
    value: 4,
    text: _l('职位'),
    key: 30,
  },
  {
    value: 5,
    text: _l('人员'),
    key: 10,
  },
];

export const initData = {
  pageIndex: 1,
  pageSize: pageSize,
  keywords: '',
  searchMemberType: 0,
  sort: [
    // {
    //   fieldType: 10,
    //   isASC: true,
    // },
    // {
    //   fieldType: 20,
    //   isASC: false,
    // },
  ],
};
