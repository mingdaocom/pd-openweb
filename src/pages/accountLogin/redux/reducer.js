import _ from 'lodash';
import { combineReducers } from 'redux';
import { AccountNextActions } from '../config';
import { getRequest } from 'src/util';

const initData = () => {
  let request = getRequest();
  return {
    dialCode: '',
    emailOrTel: '', // 邮箱或手机
    verifyCode: '', // 验证码
    password: '', // 8-20位，需包含字母和数字
    fullName: '', // 姓名
    regcode: '', // 企业码
    isCheck: false,
    inviteInfo: [],
    confirmation: request.confirmation || '',
    isLink: !!request.confirmation || location.href.indexOf('linkInvite') >= 0 || location.href.indexOf('join') >= 0,
    projectId: request.projectId || '',
    onlyRead: false,
    onlyReadName: false,
    loginForAdd: false,
    hasCheckPrivacy: false,
    isApplyJoin: false, // 主动申请加入网络
    TPParams: {
      unionId: request.unionId || '',
      state: request.state || '',
      tpType: parseInt(request.tpType) || 0,
    },
    logo: '',
    hasGetLogo: false,
    isDefaultLogo: false,
    state: request.state || '',
  };
};

export const accountInfo = (state = initData(), action) => {
  switch (action.type) {
    case 'UPDATE_INFO':
      return { ...state, ...action.data };
    case 'RESET':
      return initData();
    default:
      return state;
  }
};

export const step = (state = 'register', action) => {
  switch (action.type) {
    case 'UPDATE_STEP':
      return action.data || 'register';
    default:
      return state;
  }
};

const defaultNextAction = () => {
  let request = getRequest();
  //url 中的 tpType 参数为 7 或 8 ，则直接进去
  return (request.ReturnUrl || '').indexOf('type=privatekey') > -1 ||
    (request.tpType && [7, 8].includes(parseInt(request.tpType)))
    ? AccountNextActions.login
    : AccountNextActions.createProject;
};

export const nextAction = (state = defaultNextAction(), action) => {
  switch (action.type) {
    case 'UPDATE_DEFAULTACCOUNTVERIFYNEXTACTION':
      return action.data || defaultNextAction();
    default:
      return state;
  }
};

export const warnningData = (state = [], action) => {
  switch (action.type) {
    case 'UPDATE_WARN':
      return action.data || [];
    default:
      return state;
  }
};

const getCompany = () => {
  let request = getRequest();
  return {
    companyName: '',
    departmentId: '',
    jobId: '', // 加入网络使用
    workSiteId: '',
    jobNumber: '',
    job: '', // 加入网络使用
    email: '', // 邮箱
    scaleId: '', // 预计人数
    code: request.code || '',
  };
};

export const company = (state = getCompany(), action) => {
  switch (action.type) {
    case 'UPDATE_COMPANY':
      return { ...state, ...action.data };
    case 'CLEAR_COMPANY':
      return getCompany();
    default:
      return state;
  }
};

export const userCard = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_USERCARD':
      return action.data || {};
    case 'CLEAR_USERCARD':
      return {};
    default:
      return state;
  }
};

const defaultState = {
  loading: true,
  lineLoading: false,
  createAccountLoading: false,
  isFrequentLoginError: false,
};

export const stateList = (state = defaultState, action) => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.data };
    case 'UPDATE_LOADING':
      return { ...state, loading: action.data };
    case 'UPDATE_CREATEACCOUNTLOADING':
      return { ...state, createAccountLoading: action.data || false };
    case 'UPDATE_ISFREQUENT':
      return { ...state, isFrequentLoginError: action.data || false };
    case 'CLEAR_STATE':
      return defaultState;
    default:
      return state;
  }
};

export default combineReducers({ accountInfo, warnningData, company, userCard, stateList, step, nextAction });
