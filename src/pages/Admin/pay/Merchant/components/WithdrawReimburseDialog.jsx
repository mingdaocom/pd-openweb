import React, { useState, useRef } from 'react';
import { Dialog, FunctionWrap, Input, VerifyPasswordConfirm } from 'ming-ui';
import paymentAjax from 'src/api/payment';
import styled from 'styled-components';
import cx from 'classnames';

const InputWrap = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  &.focusWrap {
    border: 1px solid #1e88e5;
  }
  .ming.Input {
    border: none;
    &::placeholder {
      color: #bfbfbf;
    }
  }
`;

function WithdrawReimburseDialog(props) {
  const {
    projectId,
    type,
    title,
    okText,
    buttonType,
    label,
    desc,
    min,
    max,
    orderInfo = {},
    onCancel = () => {},
    updateList = () => {},
  } = props;
  const { merchantNo, orderId, merchantOrderId, taxAmount, description } = orderInfo;
  const [amount, setAmount] = useState();
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef();

  const onOk = () => {
    if (type === 'reimburse') {
      // 退款
      paymentAjax
        .applyRefund({
          projectId,
          merchantNo,
          orderId,
          merchantOrderId,
          amount: +amount,
          taxFee: taxAmount,
          description,
        })
        .then(res => {
          if (res) {
            updateList();
            alert(_l('退款成功'));
          } else {
            alert(_l('退款失败'), 2);
          }
        });
    } else {
      // 提现
      paymentAjax
        .applyWithDraw({
          projectId,
          merchantNo,
          amount: +amount,
          description,
        })
        .then(res => {
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
    <Dialog
      width={560}
      visible
      title={title}
      buttonType={buttonType}
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
          alert(`金额大于可${type === 'reimburse' ? '退款' : '提现'}额，请重新输入`, 2);
          return;
        }
        onCancel();
        VerifyPasswordConfirm.confirm({
          allowNoVerify: false,
          isRequired: true,
          closeImageValidation: false,
          onOk,
        });
      }}
    >
      <div className="Font14 Gray_75 mBottom10">{label}</div>
      <InputWrap className={cx('flexRow alignItemsCenter pRight16', { focusWrap: isFocus })}>
        <Input
          ref={inputRef}
          className="flex"
          value={!isFocus && (amount || amount === 0) ? _l('%0元', amount) : amount}
          placeholder={
            isFocus
              ? undefined
              : type === 'reimburse'
              ? _l('最多可退款%0元', max)
              : _l('最多可提现%0元', max > 0 ? max : 0)
          }
          onChange={value => {
            let val = value
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
          onFocus={e => setIsFocus(true)}
        />
        <div className="Hand ThemeColor Hover_51" onClick={() => setAmount(max > 0 ? max : 0)}>
          {type === 'reimburse' ? _l('全部退款') : _l('全部提现')}
        </div>
      </InputWrap>
      {desc ? desc : ''}
    </Dialog>
  );
}

export default props => FunctionWrap(WithdrawReimburseDialog, props);
