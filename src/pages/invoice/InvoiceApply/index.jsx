import React, { Fragment, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { Popup } from 'antd-mobile';
import { match } from 'path-to-regexp';
import { Dialog, FunctionWrap, LoadDiv } from 'ming-ui';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import paymentApi from 'src/api/payment';
import userApi from 'src/api/user';
import { browserIsMobile } from 'src/utils/common';
import { INVOICE_STATUS } from '../constant';
import InvoiceStatus from '../InvoiceStatus';
import Apply from './Apply';

const invoiceParams = match('/invoice/:orderId');

const InvoiceApply = props => {
  const { onCancel, isLandPage, onApplySuccess, onCancelSuccess } = props;
  const [statusType, setStatusType] = useState('loading'); // statusType: apply | status | loading | edit
  const [orderInfo, setOrderInfo] = useState({});
  const [accountEmail, setAccountEmail] = useState('');
  const [invoiceDetail, setInvoiceDetail] = useState({});

  const orderId = props.orderId || invoiceParams(location.pathname)?.params?.orderId; //支付订单id
  const isMobile = browserIsMobile();

  useEffect(() => {
    getInfo();
  }, []);

  const getInfo = async () => {
    const orderRes = await paymentApi.getPayOrder({ orderId });
    setOrderInfo(orderRes);

    const isApply =
      orderRes.status === 1 && orderRes.invoiceStatus === INVOICE_STATUS.UN_INVOICED && !orderRes.invoiceId;

    if (isApply) {
      const accountInfo = md.global.Account.accountId ? await userApi.getAccountBaseInfo() : null;
      setAccountEmail(accountInfo?.email || '');
      setStatusType('apply');
    } else {
      if (orderRes.orderId) {
        const invoiceRes = await merchantInvoiceApi.getInvoice({ orderId });
        setInvoiceDetail(invoiceRes);
      }
      setStatusType('status');
    }
  };

  if (statusType === 'loading') {
    return isLandPage ? (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    ) : !isMobile ? (
      <Dialog visible width={800} footer={null}>
        <div className="Height80 flexRow alignItemsCenter">
          <LoadDiv />
        </div>
      </Dialog>
    ) : (
      <Popup position="bottom" className="mobileModal topRadius" visible>
        <div className="flexRow alignItemsCenter" style={{ height: 200 }}>
          <LoadDiv />
        </div>
      </Popup>
    );
  }

  return (
    <Fragment>
      <DocumentTitle title={_l('申请开票')} />

      {['apply', 'edit'].includes(statusType) && (
        <Apply
          onCancel={onCancel}
          orderInfo={orderInfo}
          isLandPage={isLandPage}
          accountEmail={accountEmail}
          invoiceDetail={invoiceDetail}
          isEdit={statusType === 'edit'}
          onChangeStatusType={setStatusType}
          onApplySuccess={
            isLandPage
              ? () => {
                  setStatusType('loading');
                  merchantInvoiceApi.getInvoice({ orderId }).then(res => {
                    setInvoiceDetail(res);
                    setStatusType('status');
                  });
                }
              : onApplySuccess
          }
        />
      )}

      {statusType === 'status' && (
        <InvoiceStatus
          onCancel={onCancel}
          orderInfo={orderInfo}
          isLandPage={isLandPage}
          invoiceDetail={invoiceDetail}
          onChangeStatusType={setStatusType}
          onCancelSuccess={
            isLandPage
              ? () => setInvoiceDetail({ ...invoiceDetail, status: INVOICE_STATUS.CANCELLED })
              : onCancelSuccess
          }
        />
      )}
    </Fragment>
  );
};

export default InvoiceApply;

export const InvoiceApplyDialog = props => FunctionWrap(InvoiceApply, { ...props });
