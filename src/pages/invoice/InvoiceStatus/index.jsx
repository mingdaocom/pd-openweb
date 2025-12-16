import React, { Fragment, useState } from 'react';
import { ActionSheet, Popup } from 'antd-mobile';
import cx from 'classnames';
import moment from 'moment';
import { Button, Dialog, Icon } from 'ming-ui';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import 'src/pages/Mobile/index.less';
import { browserIsMobile } from 'src/utils/common';
import { INVOICE_STATUS, STATUS_INFO_APPLY, STATUS_INFO_CONFIRM } from '../constant';
import './index.less';

export default function InvoiceStatus(props) {
  const {
    onCancel,
    isLandPage,
    fromType = 'apply', // apply | confirm
    orderInfo,
    invoiceDetail,
    noAuth,
    projectId,
    onCancelSuccess = () => {},
    onChangeStatusType = () => {},
    onUpdateInvoice = () => {},
  } = props;
  const { orderId } = orderInfo || {};
  const {
    status,
    price,
    invoiceTitle,
    taxPayerNo,
    createTime,
    invoiceUrl,
    invoiceOutputType,
    invoiceRemark,
    account,
    invoiceId,
    message,
  } = invoiceDetail;
  const isError =
    fromType === 'apply' ? !orderId || (isLandPage && ![1, 5].includes(orderInfo.status)) : !invoiceId || noAuth;
  const statusInfo =
    fromType === 'apply'
      ? STATUS_INFO_APPLY[isError ? 'error' : status]
      : STATUS_INFO_CONFIRM[isError ? (noAuth ? 'noAuth' : 'error') : status];

  const isMobile = browserIsMobile();

  const [syncing, setSyncing] = useState(false);

  const onCancelApply = () => {
    const onCancelInvoice = () => {
      merchantInvoiceApi.cancelInvoice({ orderId }).then(res => {
        if (res) {
          !isLandPage && onCancel();
          onCancelSuccess();
          alert(_l('取消成功'));
        } else {
          alert(_l('取消失败'), 2);
        }
      });
    };

    if (isMobile) {
      let actionHandler = ActionSheet.show({
        extra: (
          <div className="flexColumn w100">
            <div className="bold Gray Font17 pTop10">{_l('取消申请')}</div>
            <div className="pTop10 Gray_75">{_l('确定取消申请该发票吗？')}</div>
            <div className="invoiceStatusFooterBtns mTop24">
              <Button radius className="cancelBtn flex" onClick={() => actionHandler.close()}>
                {_l('取消')}
              </Button>
              <Button
                radius
                className="flex"
                type="danger"
                onClick={() => {
                  actionHandler.close();
                  onCancelInvoice();
                }}
              >
                {_l('确认')}
              </Button>
            </div>
          </div>
        ),
      });
    } else {
      Dialog.confirm({
        title: _l('取消申请'),
        description: _l('确定取消申请该发票吗？'),
        buttonType: 'danger',
        onOk: onCancelInvoice,
      });
    }
  };

  const onOk = () => {
    switch (status) {
      case INVOICE_STATUS.INVOICED:
        window.open(invoiceUrl);
        break;
      case INVOICE_STATUS.UN_INVOICED:
      case INVOICE_STATUS.FAILED:
      case INVOICE_STATUS.CANCELLED:
        //修改或重新申请
        onChangeStatusType(status === INVOICE_STATUS.UN_INVOICED ? 'edit' : 'apply');
        break;
      case INVOICE_STATUS.PROCESSING:
        setSyncing(true);
        merchantInvoiceApi
          .syncInvoice({ projectId, orderId: invoiceDetail.orderId })
          .then(res => {
            res?.message ? alert(res.message, 2) : res?.invoice && onUpdateInvoice(res.invoice);
            setSyncing(false);
          })
          .catch(() => setSyncing(false));
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    return (
      <Fragment>
        <div className={`flexRow alignItemsCenter ${isLandPage ? 'mBottom4' : 'mBottom12'}`}>
          <span className="Gray_75 bold">{_l('发票金额：')}</span>
          <span style={{ color: isLandPage ? '#4CAF50' : '#151515' }} className={cx('bold', { Font24: isLandPage })}>
            {'￥' + (price || '0')}
          </span>
        </div>
        <div className="mBottom12">
          <span className="Gray_75 bold">{_l('抬头类型：')}</span>
          <span>{invoiceOutputType === 1 ? _l('企业') : _l('个人')}</span>
        </div>
        <div className="mBottom12">
          <span className="Gray_75 bold">{_l('发票抬头：')}</span>
          <span>{invoiceTitle}</span>
        </div>

        {fromType === 'confirm' && (
          <div className="mBottom12">
            <span className="Gray_75 bold">{_l('发票内容：')}</span>
            <span>{_l('按类目汇总')}</span>
          </div>
        )}

        {invoiceOutputType === 1 && (
          <div className="mBottom12">
            <span className="Gray_75 bold">{_l('税号：')}</span>
            <span>{taxPayerNo}</span>
          </div>
        )}

        <div>
          <span className="Gray_75 bold">{_l('申请时间：')}</span>
          <span>{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
        </div>
      </Fragment>
    );
  };

  const renderFooterBtns = (radius = false) => {
    if (
      fromType === 'apply' &&
      (status === INVOICE_STATUS.PROCESSING ||
        (!window.isPublicWorksheet &&
          status !== INVOICE_STATUS.INVOICED &&
          md.global.Account.accountId !== account?.accountId))
    )
      return isLandPage ? null : (
        <div className="invoiceStatusFooterBtns">
          <Button type="primary" radius={radius} onClick={onCancel}>
            {_l('关闭')}
          </Button>
        </div>
      );

    return (
      <div className="invoiceStatusFooterBtns">
        {(!isLandPage || status === INVOICE_STATUS.UN_INVOICED) && (
          <Button
            type="link"
            className={cx({ cancelBtn: status === INVOICE_STATUS.UN_INVOICED })}
            radius={radius}
            onClick={status === INVOICE_STATUS.UN_INVOICED ? onCancelApply : onCancel}
          >
            {status === INVOICE_STATUS.UN_INVOICED ? _l('取消申请') : _l('取消')}
          </Button>
        )}

        {statusInfo.okText && (
          <Button type="primary" radius={radius} onClick={onOk} disabled={syncing}>
            {statusInfo.okText}
          </Button>
        )}
      </div>
    );
  };

  if (isLandPage) {
    return (
      <div className="invoiceStatusLandPage">
        <div className="cardWrap">
          <Icon className="Font50" style={{ color: statusInfo.color }} icon={statusInfo.icon} />
          <div className="mTop16 Font28 bold">{statusInfo.title}</div>
          {((status === INVOICE_STATUS.UN_INVOICED && invoiceRemark) || isError) && (
            <div className="Gray_75 mTop12">
              {isError
                ? fromType === 'confirm'
                  ? message
                  : !orderId
                    ? _l('当前订单不存在或者订单编号错误')
                    : _l('当前订单状态可能已退款或未支付成功')
                : invoiceRemark}
            </div>
          )}

          {!isError && (
            <Fragment>
              <div className="w100 mTop40">{renderContent()}</div>
              {renderFooterBtns()}
            </Fragment>
          )}
        </div>
      </div>
    );
  }

  return !isMobile ? (
    <Dialog
      className="invoiceStatusDialog"
      visible
      width={800}
      title={<span className={cx({ Red: status === INVOICE_STATUS.FAILED })}>{statusInfo.title}</span>}
      description={status === INVOICE_STATUS.UN_INVOICED && invoiceRemark && invoiceRemark}
      onCancel={onCancel}
      footer={renderFooterBtns()}
    >
      {renderContent()}
    </Dialog>
  ) : (
    <Popup position="bottom" className="mobileModal topRadius" visible onMaskClick={onCancel}>
      <div className="flexRow header LineHeight24 pBottom0">
        <div className={`Font20 bold ${status === INVOICE_STATUS.FAILED ? 'Red' : 'Gray'}`}>{statusInfo.title}</div>
        <div className="closeIcon TxtCenter" onClick={onCancel}>
          <icon className="icon icon-close" />
        </div>
      </div>
      <div className="pLeft15 pRight15">
        {status === INVOICE_STATUS.UN_INVOICED && invoiceRemark && (
          <div className="Gray_75 mTop12">{invoiceRemark}</div>
        )}
        <div className="mTop16">{renderContent()}</div>
      </div>
      {renderFooterBtns(true)}
    </Popup>
  );
}
