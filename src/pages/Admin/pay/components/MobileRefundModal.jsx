import React, { useState, useRef } from 'react';
import { Popup, Button } from 'antd-mobile';
import { Input, FunctionWrap } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import paymentAjax from 'src/api/payment';

const Wrap = styled(Popup)`
  .popupContent {
    padding: 24px 20px 8px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
`;

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

function AgreeOrRefuseRefund(props) {
  const { visible, status, amount, onClose = () => {}, onOk = () => {} } = props;
  const isRefund = status === 4;

  return (
    <Wrap bodyClassName="popupContent" visible={visible} onClose={onClose}>
      <div className="Font17 bold mBottom16">{isRefund ? _l('是否拒绝退款?') : _l('是否同意退款?')}</div>
      <div className="Font12 Gray_9e mBottom24">
        {isRefund ? '' : _l('同意退款后，申请的退款金额 ¥%0 将原路退回到用户账户中', amount)}
      </div>
      <div className="flexRow">
        <Button className="flex mRight5 Font14 bold Gray_75" onClick={onClose}>
          <span>{_l('取消')}</span>
        </Button>
        <Button
          className="flex mLeft5 Font14 bold"
          color={isRefund ? 'danger' : 'primary'}
          onClick={() => {
            onClose();
            onOk();
          }}
        >
          {isRefund ? _l('拒绝') : _l('同意')}
        </Button>
      </div>
    </Wrap>
  );
}

export const agreeOrRefuseRefundConfirm = props => FunctionWrap(AgreeOrRefuseRefund, props);

function RefundConfirm(props) {
  const {
    visible,
    max = 0,
    projectId,
    merchantNo,
    orderId,
    merchantOrderId,
    taxAmount,
    description,
    refundSourceType,
    viewId,
    onClose = () => {},
    refundSuccuss = () => {},
  } = props;
  const [amount, setAmount] = useState(props.amount);
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef();

  const onChange = value => {
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
  };

  const onBlur = e => {
    setIsFocus(false);
    if (e.target.value) {
      setAmount(parseFloat(e.target.value).toFixed(3).slice(0, -1));
    }
  };

  // 确认退款
  const onOk = () => {
    if (_.isUndefined(amount)) {
      alert(_l('请输入退款金额'), 2);
      return;
    }
    if (Number(amount) <= 0) {
      alert(_l('至少退款0.01元'), 2);
      return;
    }
    if (Number(amount) > max) {
      alert('金额大于可退款额，请重新输入', 2);
      return;
    }

    onClose();
    paymentAjax
      .applyRefund({
        projectId,
        merchantNo,
        orderId,
        merchantOrderId,
        amount,
        taxFee: taxAmount,
        description,
        refundSourceType,
        viewId,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          refundSuccuss();
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  return (
    <Wrap bodyClassName="popupContent" visible={visible} onClose={onClose}>
      <div className="Font17 bold mBottom16 Red">{_l('您是否确定退款?')}</div>
      <div className="bold mBottom10">{_l('退款金额')}</div>
      <InputWrap className={cx('flexRow alignItemsCenter pRight16 mBottom24', { focusWrap: isFocus })}>
        <Input
          ref={inputRef}
          className="flex"
          value={!isFocus && (amount || amount === 0) ? _l('%0元', amount) : amount}
          placeholder={isFocus ? undefined : _l('最多可退款%0元', max)}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={e => setIsFocus(true)}
        />
        <div className="Hand ThemeColor Hover_51 Font14" onClick={() => setAmount(max > 0 ? max : 0)}>
          {_l('全部退款')}
        </div>
      </InputWrap>
      <div className="flexRow">
        <Button className="flex mRight5 Font14 bold Gray_75" onClick={onClose}>
          <span>{_l('取消')}</span>
        </Button>
        <Button className="flex mLeft5 Font14 bold" color="danger" onClick={onOk}>
          {_l('退款')}
        </Button>
      </div>
    </Wrap>
  );
}

export const refundConfirmFunc = props => FunctionWrap(RefundConfirm, props);
