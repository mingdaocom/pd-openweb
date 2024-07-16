export const formListTop = [
  {
    label: _l('用户目录类型'),
    key: 'type',
    compType: 'select',
    errorMsg: _l('请选择用户目录类型'),
  },
  {
    label: _l('服务器IP'),
    key: 'serverIP',
    desc: _l('如：192.168.1.1'),
    errorMsg: _l('请输入LDAP服务器IP'),
  },
  {
    label: _l('端口'),
    key: 'port',
    desc: 'enableSSL',
    errorMsg: _l('请输入LDAP Server端口号'),
  },
  {
    label: _l('账户'),
    key: 'user',
    desc: _l('读取LDAP Server 预填用户如：CN=Admin,CN=Users,DC=XXX,DC=YYY'),
    errorMsg: _l('请输入账户'),
  },
  {
    label: _l('密码'),
    key: 'password',
    compType: 'password',
    errorMsg: _l('请输入密码'),
  },
  {
    label: _l('账户搜索范围'),
    key: 'searchScope',
    compType: 'tab',
    desc: _l('满足搜索范围的账户可登录平台'),
  },
  {
    label: 'BaseDN',
    key: 'domainPath',
    desc: _l('查找用户信息路径，如：dc=XXX,dc=YYY'),
    // errorMsg: _l('请输入基本域路径')
  },
  {
    label: _l('DN/组名'),
    key: 'DNGroup',
    compType: 'group',
  },
];

export const formListBottom = [
  {
    label: _l('用户帐号'),
    key: 'searchFilter',
    desc: _l('LDAP Server 登录账户字段，用于与系统用户信息匹配字段'),
    errorMsg: _l('请输入LDAP Server账户字段名称'),
  },
  {
    label: _l('Email'),
    key: 'emailAttr',
    desc: _l('LDAP Server 登录账户字段，用于与系统用户信息匹配字段'),
    errorMsg: _l('请输入LDAP Server邮箱字段名称'),
  },
  {
    label: _l('用户姓名'),
    key: 'fullnameAttr',
    desc: _l('同步至系统用户姓名。'),
    showCheckbox: true,
    checkedField: 'mustFullname',
    placeholder: 'displayname',
  },
  {
    label: _l('部门'),
    key: 'departmentAttr',
    desc: _l('同步至系统用户部门。'),
    showCheckbox: true,
    checkedField: 'mustDepartment',
    placeholder: 'department',
  },
  {
    label: _l('职位'),
    key: 'jobAttr',
    desc: _l('同步至系统用户职位。'),
    showCheckbox: true,
    checkedField: 'mustJob',
    placeholder: 'title',
  },
  {
    label: _l('联系电话'),
    key: 'workphoneAttr',
    desc: _l('同步至系统用户联系电话。'),
    showCheckbox: true,
    checkedField: 'mustWorkphone',
    placeholder: 'telephoneNumber',
  },
];
