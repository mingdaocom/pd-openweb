import React, { Fragment, useCallback, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { Popup } from 'antd-mobile';
import { match } from 'path-to-regexp';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import paymentApi from 'src/api/payment';
import userApi from 'src/api/user';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getPathWithoutSubPath } from 'src/utils/platform/navigation/path';
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

  const orderId = props.orderId || invoiceParams(getPathWithoutSubPath(location.pathname))?.params?.orderId; //支付订单id
  const isMobile = browserIsMobile();

  const getInfo = useCallback(async () => {
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
  }, [orderId]);

  useEffect(() => {
    Promise.resolve().then(getInfo);
  }, [getInfo]);

  if (statusType === 'loading') {
    return isLandPage ? (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    ) : !isMobile ? (
      <Modal open width={800}>
        <div className="Height80 flexRow alignItemsCenter">
          <LoadDiv />
        </div>
      </Modal>
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

export function useInvoiceApplyDialog() {
  return useFunctionWrapComponent(InvoiceApply);
}
