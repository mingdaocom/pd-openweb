import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import { Button, Dialog } from 'ming-ui';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import 'src/pages/Mobile/index.less';
import { browserIsMobile } from 'src/utils/common';
import InvoiceForm from '../components/InvoiceForm';
import '../common.less';

export default function InvoiceConfirm(props) {
  const {
    onCancel,
    isTest,
    onConfirmSuccess = () => {},
    isLandPage,
    invoiceDetail,
    productList,
    projectId,
    taxNo,
  } = props;
  const [formData, setFormData] = useSetState({ ...invoiceDetail, contentType: 1 });
  const [submitting, setSubmitting] = useState(false);

  const isMobile = browserIsMobile();
  const title = isTest ? _l('开票测试') : _l('审核开票');
  const description = isTest
    ? _l(
        '本操作将生成个人抬头的正式发票（非演示票），发票会入账并发送至您指定的邮箱。如不需要，请及时在电子税务局/百望进行红冲或作废',
      )
    : _l('审核确认后，发票将由合作服务商百望发送至用户填写的邮箱');

  useEffect(() => {
    window.addEventListener('keydown', keyDownListener, false);
    return () => {
      window.removeEventListener('keydown', keyDownListener, false);
    };
  }, []);

  // ESC关闭弹窗
  const keyDownListener = e => {
    e.keyCode === 27 && _.isFunction(onCancel) && onCancel();
  };

  const onOk = () => {
    if (!formData.productId) {
      alert(_l('请选择开票类目'), 3);
      return;
    }

    if (isTest && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert(_l('请输入正确的邮箱'), 3);
      return;
    }

    setSubmitting(true);
    merchantInvoiceApi[isTest ? 'testInvoice' : 'confirmInvoice'](
      isTest
        ? { projectId, productId: formData.productId, orderId: taxNo, email: formData.email }
        : { projectId, productId: formData.productId, orderId: invoiceDetail?.orderId },
    )
      .then(res => {
        if (res) {
          !isLandPage && onCancel();
          alert(isTest ? _l('开票成功') : _l('审核成功'));
          onConfirmSuccess();
        } else {
          alert(isTest ? _l('开票失败') : _l('审核失败'), 2);
        }
        setSubmitting(false);
      })
      .catch(() => {
        setSubmitting(false);
      });
  };

  const renderContent = () => {
    return (
      <Fragment>
        <InvoiceForm
          type={isTest ? 'test' : 'confirm'}
          productList={productList}
          orderInfo={{ price: formData.price, description: formData.payTitle }}
          formData={formData}
          setFormData={setFormData}
        />
        {isLandPage && (
          <div className="TxtCenter pBottom30 pLeft20 pRight20">
            <Button onClick={onOk} disabled={submitting}>
              {_l('确认')}
            </Button>
          </div>
        )}
      </Fragment>
    );
  };

  if (isLandPage) {
    return (
      <div className="landPageWrapper">
        {isLandPage && <div className="Font28 bold TxtCenter pBottom20 pTop30">{title}</div>}
        {renderContent()}
      </div>
    );
  }

  return !isMobile ? (
    <Dialog
      visible
      title={title}
      description={description}
      overlayClosable={false}
      className="invoiceDialog"
      width={800}
      onCancel={onCancel}
      okText={_l('确认')}
      okDisabled={submitting}
      onOk={onOk}
    >
      {renderContent()}
    </Dialog>
  ) : (
    <Popup position="bottom" className="mobileModal topRadius invoicePopup" visible onMaskClick={onCancel}>
      <div className="flexRow header LineHeight24">
        <div className="Font20 bold Gray">{title}</div>
        <div className="closeIcon TxtCenter" onClick={onCancel}>
          <icon className="icon icon-close" />
        </div>
      </div>
      {renderContent()}
    </Popup>
  );
}
