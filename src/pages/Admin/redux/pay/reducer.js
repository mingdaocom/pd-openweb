import { combineReducers } from 'redux';

export const showHeader = (state = true, action) => {
  switch (action.type) {
    case 'SHOW_HEADER':
      return action.showHeader;
    default:
      return state;
  }
};

export const merchantData = (
  state = {
    merchantLoading: false,
    merchantList: [],
  },
  action,
) => {
  switch (action.type) {
    case 'MERCHANT_DATA':
      return action.data;
    default:
      return state;
  }
};
export const transactionDetailsData = (
  state = {
    transactionDetailsLoading: false,
    transactionDetailsList: [],
  },
  action,
) => {
  switch (action.type) {
    case 'TRANSACTION_DETAIL_DATA':
      return action.data;
    default:
      return state;
  }
};

export default combineReducers({
  showHeader,
  merchantData,
  transactionDetailsData,
});
