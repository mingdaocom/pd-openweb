/**
 * form errors
 */
/**
 * form errors
 */
const FormError = {
  /**
   * error types
   */
  types: {
    REQUIRED: 'REQUIRED',
    MINLENGTH: 'MINLENGTH',
    MAXLENGTH: 'MAXLENGTH',
    MOBILEPHONE: 'MOBILEPHONE',
    TELEPHONE: 'TELEPHONE',
    EMAIL: 'EMAIL',
    IDCARD: 'IDCARD',
    PASSPORT: 'PASSPORT',
    HKPASSPORT: 'HKPASSPORT',
    TWPASSPORT: 'TWPASSPORT',
    UNIQUE: 'UNIQUE',
  },
  /**
   * error messages
   */
  messages: {
    REQUIRED: (label) => {
      return `${_l('请填写%0', label)}`;
    },
    REQUIRED_SELECT: (label) => {
      return `${_l('请选择%0', label)}`;
    },
    MINLENGTH: (number) => {
      return `${_l('内容长度不能小于%0', number)}`;
    },
    MAXLENGTH: (number) => {
      return `${_l('内容长度不能大于%0', number)}`;
    },
    MOBILEPHONE: _l('不是有效的手机号码'),
    TELEPHONE: _l('不是有效的座机号码'),
    EMAIL: _l('不是有效的邮箱地址'),
    IDCARD: _l('不是有效的身份证号码'),
    PASSPORT: _l('不是有效的护照号码'),
    HKPASSPORT: _l('不是有效的港澳通行证号码'),
    TWPASSPORT: _l('不是有效的台湾通行证号码'),
    UNIQUE: (label) => {
      return `${_l('%0不允许重复', label)}`;
    },
  },
};

export default FormError;
