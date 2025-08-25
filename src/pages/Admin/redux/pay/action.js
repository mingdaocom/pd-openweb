export const changeShowHeader = showHeader => dispatch => {
  dispatch({ type: 'SHOW_HEADER', showHeader });
};

export const getMerchantData = () => (dispatch, getState) => {
  const { merchantData } = getState().orgManagePage.pay || {};
  dispatch({ type: 'MERCHANT_DATA', data: { ...merchantData, merchantLoading: true } });

  let merchantList = [
    {
      merchantNum: 'PR2131232132',
      name: 'Name',
      status: 1,
      overage: '',
      paymentMethod: [],
      actionStatus: [1],
    },
    {
      merchantNum: 'PR2131232132',
      name: 'Name',
      status: 2,
      overage: '',
      paymentMethod: [1],
      actionStatus: [2],
    },
    {
      merchantNum: 'PR2131232132',
      name: 'Name',
      status: 3,
      overage: '',
      paymentMethod: [2],
      actionStatus: [1, 3],
    },
    {
      merchantNum: 'PR2131232132',
      name: 'Name',
      status: 4,
      overage: _l('10万'),
      paymentMethod: [1, 2],
      actionStatus: [3],
    },
  ];

  dispatch({ type: 'MERCHANT_DATA', data: { ...merchantData, merchantLoading: false, merchantList } });
};

export const getTransactionDetailsData = () => (dispatch, getState) => {
  const { transactionDetailsData } = getState().orgManagePage.pay || {};
  dispatch({ type: 'TRANSACTION_DETAIL_DATA', data: { ...transactionDetailsData, transactionDetailsLoading: true } });

  let transactionDetailsList = [
    {
      merchantNum: 'MD2132134243',
      orderNum: 'MD2132134243',
      transactionNum: 'MD2132134243',
      refundAmount: 0,
      settlementAmount: 100,
      transactionAmount: 100,
      handlingFee: 0.6,
      application: {
        appId: '1c5cbbf0-e962-48ad-8a1a-171ea7760b08',
        appName: 'bbbba',
        appIconColor: '#9D26B0',
        appIconUrl: 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg',
        status: 1,
        createType: 0,
      },
      appItem: {
        id: '5cb6f4f02efe2f000154f9ca',
        name: 'sheet2',
        status: 1,
        type: 0,
        create: 0,
        sectionId: '5cb6f4e429a1e1197ce9b254',
      },
      record: _l('记录'),
      payTime: '2024-01-01 09:00:00',
      orderStatus: 3,
      payWay: 1,
      invoicingStatus: 3,
      reimburseStatus: 3,
    },
  ];

  dispatch({
    type: 'TRANSACTION_DETAIL_DATA',
    data: { ...transactionDetailsData, transactionDetailsLoading: false, transactionDetailsList },
  });
};
