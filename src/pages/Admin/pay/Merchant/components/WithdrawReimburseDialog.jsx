import React, { Fragment, useCallback, useRef, useState } from 'react';
import _ from 'lodash';
import { VerifyPasswordConfirm } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import paymentAjax from 'src/api/payment';

function WithdrawReimburseDialog(props) {
  const {
    projectId,
    type,
    title,
    okText,
    buttonType,
    label,
    desc,
    max,
    viewId,
    refundSourceType,
    cancelPasswordVerify,
    confirmModal,
    orderInfo = {},
    onCancel = () => {},
    updateList = () => {},
    updateStatus = () => {},
  } = props;
  const { merchantNo, orderId, merchantOrderId, taxAmount, description } = orderInfo;
  const [amount, setAmount] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef();

  const onRefund = () => {
    // 退款
    updateStatus(true);
    paymentAjax
      .applyRefund({
        projectId,
        merchantNo,
        orderId,
        merchantOrderId,
        amount: +amount,
        taxFee: taxAmount,
        description,
        refundSourceType,
        viewId,
      })
      .then(res => {
        if (res) {
          updateList();
          alert(refundSourceType === 1 ? _l('操作成功') : _l('退款成功'));
        } else {
          alert(refundSourceType === 1 ? _l('操作失败') : _l('退款失败'), 2);
        }
      })
      .catch(() => {
        updateStatus(false);
      });
  };

  const onOk = () => {
    if (type === 'reimburse') {
      // 校验是否有申请中的发票，如果存在，则提示
      refundSourceType === 1
        ? onRefund()
        : merchantInvoiceApi.isTipsForRefund({ orderId, refundAmount: +amount }).then(res => {
            if (res) {
              confirmModal.confirm({
                title: _l('确认继续退款？'),
                content: _l('当前订单正在申请开票，全额退款后，系统会将开票状态改为已取消'),
                okButtonProps: {
                  danger: true,
                },
                okText: _l('继续退款'),
                onOk: onRefund,
              });
            } else {
              onRefund();
            }
          });
    } else {
      // 提现
      paymentAjax.applyWithDraw({ projectId, merchantNo, amount: +amount, description }).then(res => {
        if (res) {
          setTimeout(updateList, 1000);
          alert(_l('提现成功'));
        } else {
          alert(_l('提现失败'), 2);
        }
      });
    }
  };

  return (
    <Modal
      width={560}
      open
      mask={{ closable: true }}
      keyboard
      title={title}
      okButtonProps={{ danger: buttonType === 'danger' }}
      okText={okText}
      onCancel={onCancel}
      onOk={() => {
        if (_.isUndefined(amount)) {
          alert(_l(`请输入${type === 'reimburse' ? '退款' : '提现'}金额`), 2);
          return;
        }

        if (type === 'reimburse' && Number(amount) <= 0) {
          alert(_l('至少退款0.01元'), 2);
          return;
        }

        if (Number(amount) <= 0) {
          alert(_l(`输入的${type === 'reimburse' ? '退款' : '提现'}金额须大于0`), 2);
          return;
        }

        if (Number(amount) > max) {
          alert(type === 'reimburse' ? _l('金额大于可退款额，请重新输入') : _l('金额大于可提现额，请重新输入'), 2);
          return;
        }

        onCancel();

        if (cancelPasswordVerify) {
          onOk();
          return;
        }

        VerifyPasswordConfirm.confirm({
          allowNoVerify: false,
          isRequired: true,
          closeImageValidation: false,
          onOk,
        });
      }}
    >
      <div className="Font14 textSecondary mBottom10">{label}</div>
      <Input
        ref={inputRef}
        className="w100"
        value={!isFocus && (amount || amount === 0) ? _l('%0元', amount) : amount}
        placeholder={
          isFocus
            ? undefined
            : type === 'reimburse'
              ? _l('最多可退款%0元', max)
              : _l('最多可提现%0元', max > 0 ? max : 0)
        }
        suffix={
          <div className="Hand colorPrimary Hover_51" onClick={() => setAmount(max > 0 ? max : 0)}>
            {type === 'reimburse' ? _l('全部退款') : _l('全部提现')}
          </div>
        }
        onChange={e => {
          let val = e.target.value
            .replace(/[^-\d.]/g, '')
            .replace(/^\./g, '')
            .replace(/^-/, '$#$')
            .replace(/-/g, '')
            .replace('$#$', '-')
            .replace(/^-\./, '-')
            .replace('.', '$#$')
            .replace(/\./g, '')
            .replace('$#$', '.');

          if (val === '.') {
            val = '';
          }

          setAmount(val);
        }}
        onBlur={e => {
          setIsFocus(false);
          if (e.target.value) {
            setAmount(parseFloat(e.target.value).toFixed(3).slice(0, -1));
          }
        }}
        onFocus={() => setIsFocus(true)}
      />
      {desc ? desc : ''}
    </Modal>
  );
}

export function useWithdrawReimburseDialog() {
  const { open, holder } = useFunctionWrapComponent(WithdrawReimburseDialog);
  const [modal, modalContextHolder] = Modal.useModal();
  const openDialog = useCallback(options => open({ ...options, confirmModal: modal }), [modal, open]);

  return {
    open: openDialog,
    holder: (
      <Fragment>
        {holder}
        {modalContextHolder}
      </Fragment>
    ),
  };
}
