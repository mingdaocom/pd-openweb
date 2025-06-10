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
    label: _l('邮箱'),
    key: 'emailAttr',
    errorMsg: _l('请输入LDAP Server邮箱字段名称'),
    desc: _l('LDAP服务器中对应本系统用户邮箱的字段'),
  },
  {
    label: _l('用户姓名'),
    key: 'fullnameAttr',
    showCheckbox: true,
    checkedField: 'mustFullname',
    placeholder: 'displayname',
  },
  {
    label: _l('部门'),
    key: 'departmentAttr',
    showCheckbox: true,
    checkedField: 'mustDepartment',
    placeholder: 'department',
  },
  {
    label: _l('职位'),
    key: 'jobAttr',
    showCheckbox: true,
    checkedField: 'mustJob',
    placeholder: 'title',
  },
  {
    label: _l('联系电话'),
    key: 'workphoneAttr',
    showCheckbox: true,
    checkedField: 'mustWorkphone',
    placeholder: 'telephoneNumber',
  },
];

export const loginSetting = [
  {
    label: _l('登录账号'),
    key: 'searchFilter',
    desc: _l('LDAP服务器中作为登录账号的字段'),
    errorMsg: _l('请输入LDAP Server账户字段名称'),
  },
  {
    label: _l('显示名称'),
    key: 'accountTxtType',
    compType: 'dropDown',
    desc: _l('在登录界面中显示给用户的名称。根据实际使用的登录账号字段进行设置'),
  },
];

export const accountTxtInfo = [
  { value: 10, text: _l('用户名') },
  { value: 12, text: _l('手机号') },
  { value: 13, text: _l('邮箱') },
  { value: 100, text: _l('自定义') },
];
