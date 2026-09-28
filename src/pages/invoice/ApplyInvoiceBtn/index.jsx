import React, { useState } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { withOpeners } from 'ming-ui/hooks/useFunctionWrapComponent';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { INVOICE_STATUS } from '../constant';
import { useInvoiceApplyDialog } from '../InvoiceApply';

function ApplyInvoiceBtn(props) {
  const {
    className,
    component: Component = 'div',
    componentProps,
    icon = '',
    orderInfo = {},
    isOpenInvoice,
    invoiceStatus,
    invoiceId,
    onCallback = () => {},
    landPageOpen = false,
  } = props;
  const { orderId, orderStatus, payAccountId, amount } = orderInfo;
  const [previousInvoice, setPreviousInvoice] = useState({ invoiceStatus, invoiceId });
  const [status, setStatus] = useState(invoiceStatus);
  const [id, setId] = useState(invoiceId);

  if (previousInvoice.invoiceStatus !== invoiceStatus || previousInvoice.invoiceId !== invoiceId) {
    setPreviousInvoice({ invoiceStatus, invoiceId });
    setStatus(invoiceStatus);
    setId(invoiceId);
  }

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
    <Component
      {...componentProps}
      className={className}
      onClick={e => {
        e.stopPropagation();
        if (landPageOpen) {
          navigateTo(`/invoice/${orderId}`);
          return;
        }

        props.openInvoiceApplyDialog({
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
      {icon && <Icon icon={icon} className="Font15 textSecondary mRight8" />}
      {isApply ? _l('申请开票') : _l('查看开票进度')}
    </Component>
  );
}

export default withOpeners(ApplyInvoiceBtn, {
  openInvoiceApplyDialog: useInvoiceApplyDialog,
});
