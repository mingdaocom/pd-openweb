import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import userApi from 'src/api/user';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { getMyPermissions, hasPermission } from 'src/utils/services/security/permission';
import { INVOICE_STATUS } from '../constant';
import InvoiceStatus from '../InvoiceStatus';
import Confirm from './Confirm';

const InvoiceConfirm = props => {
  const { isLandPage = true, isTest, onConfirmSuccess = () => {} } = props;
  const [statusType, setStatusType] = useState('loading'); // statusType:  confirm | loading | status
  const [invoiceDetail, setInvoiceDetail] = useState({});
  const [productList, setProductList] = useState([]);

  const orderId = props.orderId || props.match?.params?.orderId; //支付订单id
  const projectId = props.projectId || props.match?.params?.projectId;

  const myPermissions = isLandPage ? getMyPermissions(projectId) : [];
  const hasInvoicePermission = hasPermission(myPermissions, PERMISSION_ENUM.INVOICE);

  useEffect(() => {
    isLandPage && !hasInvoicePermission ? setStatusType('status') : getInfo();
  }, []);

  const getInfo = async () => {
    if (isTest) {
      const accountInfo = md.global.Account.accountId ? await userApi.getAccountBaseInfo() : null;
      getProductList(props.taxNo, props.projectId, products => {
        setInvoiceDetail({
          invoiceOutputType: 2,
          invoiceType: 2,
          invoiceTitle: accountInfo.fullname,
          email: accountInfo.email,
          productId: products[0]?.value,
          price: 1,
        });
        setStatusType('confirm');
      });
      return;
    }

    const invoiceRes = await merchantInvoiceApi.getInvoice({ orderId });
    const { invoiceId, status, taxNo, projectId, defaultProduct } = invoiceRes || {};

    if (status === INVOICE_STATUS.UN_INVOICED && invoiceId) {
      getProductList(taxNo, projectId, products => {
        setInvoiceDetail({
          ...invoiceRes,
          productId: products.map(item => item.value).includes(defaultProduct) ? defaultProduct : undefined,
        });
        setStatusType('confirm');
      });
    } else {
      setInvoiceDetail(invoiceRes || {});
      setStatusType('status');
    }
  };

  const getProductList = (taxNo, projectId, cb = () => {}) => {
    merchantInvoiceApi.getInvoiceProducts({ taxNo, projectId }).then(res => {
      const list = _.uniqBy(res.products, 'categoryName').map(item => ({
        label: item.categoryName,
        value: item.productId,
      }));
      setProductList(list);
      cb(list);
    });
  };

  if (statusType === 'loading') {
    return isLandPage ? (
      <div className="w100 h100 flexRow alignItemsCenter justifyContentCenter">
        <LoadDiv />
      </div>
    ) : (
      <Modal open width={800}>
        <div className="Height80 flexRow alignItemsCenter">
          <LoadDiv />
        </div>
      </Modal>
    );
  }

  return (
    <Fragment>
      {statusType === 'confirm' && (
        <Confirm
          onCancel={props.onCancel}
          taxNo={props.taxNo}
          projectId={projectId}
          isTest={isTest}
          isLandPage={isLandPage}
          invoiceDetail={invoiceDetail}
          productList={productList}
          onConfirmSuccess={
            isLandPage
              ? () => {
                  setStatusType('loading');
                  merchantInvoiceApi.getInvoice({ orderId }).then(res => {
                    setInvoiceDetail(res);
                    setStatusType('status');
                  });
                }
              : onConfirmSuccess
          }
        />
      )}

      {statusType === 'status' && (
        <InvoiceStatus
          fromType="confirm"
          onCancel={props.onCancel}
          isLandPage={isLandPage}
          projectId={projectId}
          invoiceDetail={invoiceDetail}
          onChangeStatusType={setStatusType}
          noAuth={isLandPage && !hasInvoicePermission}
          onUpdateInvoice={res => setInvoiceDetail(res)}
        />
      )}
    </Fragment>
  );
};

export default InvoiceConfirm;

export function useInvoiceConfirmDialog() {
  return useFunctionWrapComponent(InvoiceConfirm);
}
