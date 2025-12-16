import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { INVOICE_STATUS } from '../constant';
import { InvoiceApplyDialog } from '../InvoiceApply';

export default function ApplyInvoiceBtn(props) {
  const {
    className,
    icon = '',
    orderInfo = {},
    isOpenInvoice,
    invoiceStatus,
    invoiceId,
    onCallback = () => {},
    landPageOpen = false,
  } = props;
  const { orderId, orderStatus, payAccountId, amount } = orderInfo;
  const [status, setStatus] = useState(invoiceStatus);
  const [id, setId] = useState(invoiceId);

  useEffect(() => {
    setStatus(invoiceStatus);
    setId(invoiceId);
  }, [invoiceStatus, invoiceId]);

  const isApply = status === INVOICE_STATUS.UN_INVOICED && !id;

  if (
    !isOpenInvoice ||
    ![1, 5].includes(orderStatus) ||
    (isApply &&
      ((payAccountId && (!_.get(md, 'global.Account.accountId') || md.global.Account.accountId !== payAccountId)) ||
        amount === 0))
  )
    return null; //1:已支付 5:部分退款

  return (
    <div
      className={className}
      onClick={e => {
        e.stopPropagation();
        if (landPageOpen) {
          navigateTo(`/invoice/${orderId}`);
          return;
        }
        InvoiceApplyDialog({
          orderId,
          onApplySuccess: resId => {
            setStatus(INVOICE_STATUS.UN_INVOICED);
            setId(resId);
            onCallback();
          },
          onCancelSuccess: () => {
            setStatus(INVOICE_STATUS.CANCELLED);
            onCallback();
          },
        });
      }}
    >
      {icon && <Icon icon={icon} className="Font15 Gray_75 mRight8" />}
      {isApply ? _l('申请开票') : _l('查看开票进度')}
    </div>
  );
}
