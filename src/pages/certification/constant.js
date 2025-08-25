export const TYPES = [
  {
    key: 'enterprise',
    text: _l('组织认证'),
    description: _l('使用组织营业执照等相关证件认证'),
    value: 2,
  },
  {
    key: 'personal',
    text: _l('个人认证'),
    description: _l('扫码完成人脸识别，自动审核，无需等待'),
    value: 1,
  },
];

export const SOURCE_TYPE = {
  personal: 0,
  project: 1,
  market: 2,
};

export const ENTERPRISE_TYPE = {
  ENTERPRISE: 1,
  GOVERNMENT: 2,
  SOCIAL_ORGANIZATION: 3,
};

export const ENTERPRISE_TYPE_OPTIONS = [
  { text: _l('企业'), value: 1 },
  { text: _l('政府/事业单位'), value: 2 },
  { text: _l('社会组织'), value: 3 },
];

export const ENTERPRISE_FIELD_LABEL = {
  [ENTERPRISE_TYPE.ENTERPRISE]: {
    businessLicense: { label: _l('营业执照'), requiredMsg: _l('请上传营业执照') },
    companyName: { label: _l('公司名称'), requiredMsg: _l('请输入公司名称') },
    creditCode: {
      label: _l('组织信用代码'),
      requiredMsg: _l('请输入组织信用代码'),
      validMsg: _l('请输入有效的组织信用代码'),
    },
    creditValidDate: { label: _l('营业执照有效期'), requiredMsg: _l('请输入营业执照有效期') },
  },
  [ENTERPRISE_TYPE.GOVERNMENT]: {
    businessLicense: {
      label: _l('事业单位法人证书/统一社会信用代码证书'),
      requiredMsg: _l('请上传事业单位法人证书/统一社会信用代码证书'),
    },
    companyName: { label: _l('单位名称'), requiredMsg: _l('请输入单位名称') },
    creditCode: {
      label: _l('社会信用代码'),
      requiredMsg: _l('请输入社会信用代码'),
      validMsg: _l('请输入有效的社会信用代码'),
    },
    creditValidDate: { label: _l('证书有效期'), requiredMsg: _l('请输入证书有效期') },
  },
  [ENTERPRISE_TYPE.SOCIAL_ORGANIZATION]: {
    businessLicense: { label: _l('相关证书'), requiredMsg: _l('请上传相关证书') },
    companyName: { label: _l('组织名称'), requiredMsg: _l('请输入组织名称') },
    creditCode: {
      label: _l('组织信用代码'),
      requiredMsg: _l('请输入组织信用代码'),
      validMsg: _l('请输入有效的组织信用代码'),
    },
    creditValidDate: { label: _l('证书有效期'), requiredMsg: _l('请输入证书有效期') },
  },
};

export const RESULT_TYPES = {
  //个人认证错误码包含：0，2，8，9，16
  0: _l('认证失败'),
  2: _l('已存在相同认证信息'),
  3: _l('人员三要素认证失败'),
  6: _l('法人姓名不一致'),
  7: _l('参数错误'),
  8: _l('验证码错误或过期'),
  9: _l('认证信息不存在'),
  10: _l('证件超过有效期'),
  11: _l('法人手机号码有误'),
  12: _l('法人身份证号有误'),
  13: _l('法人姓名校验不通过'),
  14: _l('法人手机号码与姓名和身份证不一致'),
  16: _l('人脸识别失败'),
  17: _l('联系人手机号有误'),
  18: _l('联系人身份证号有误'),
  19: _l('联系人姓名校验不通过'),
  20: _l('联系人手机号码与姓名和身份证不一致'),
};

export const FACE_CERT_RESULT_TYPES = {
  2: _l('图形验证码错误'),
  3: _l('今天人脸识别次数已用完'),
  5: _l('操作频繁，5分钟后再试'),
};

export const VERIFY_STATUS = {
  NORMAL: 'normal',
  SUCCESS: 'success',
  LOADING: 'loading',
  RE_SCAN: 'reScan',
};

export const CERT_PAGE_TITLE = {
  personal: _l('个人认证'),
  enterprise: _l('组织认证'),
  success: _l('认证成功'),
};

export const CERT_STATUS = {
  NORMAL: 0,
  USED: 1,
  EXPIRED: 2,
};
