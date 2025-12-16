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

export default function Apply(props) {
  const {
    onCancel,
    orderInfo,
    isLandPage,
    accountEmail,
    invoiceDetail,
    onApplySuccess = () => {},
    isEdit,
    onChangeStatusType,
  } = props;
  const { description, amount, refundAmount, orderId } = orderInfo;
  const price = amount - refundAmount || 0;
  const title = isEdit ? _l('修改开票') : _l('申请开票');

  const [formData, setFormData] = useSetState(
    isEdit
      ? invoiceDetail
      : {
          invoiceOutputType: 1,
          invoiceType: 2,
          contentType: 1,
          email: accountEmail,
        },
  );
  const [submitting, setSubmitting] = useState(false);

  const isMobile = browserIsMobile();

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

  const onValidate = () => {
    if (!price) {
      alert(_l('开票金额不能为0'), 3);
      return;
    }

    if (!formData.invoiceTitle) {
      alert(_l('请输入发票抬头'), 3);
      return;
    }

    if (formData.invoiceOutputType === 1 && !formData.taxPayerNo) {
      alert(_l('请输入税号'), 3);
      return;
    }

    if (window.isPublicWorksheet && !formData.email) {
      alert(_l('请输入邮箱'), 3);
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert(_l('请输入正确的邮箱'), 3);
      return;
    }

    return true;
  };

  const onOk = () => {
    if (onValidate()) {
      setSubmitting(true);
      merchantInvoiceApi
        .create({
          orderId,
          ..._.pick(formData, ['invoiceOutputType', 'invoiceType', 'invoiceTitle', 'taxPayerNo', 'email']),
        })
        .then(res => {
          if (res) {
            !isLandPage && onCancel();
            alert(isEdit ? _l('修改成功') : _l('申请开票成功'));
            onApplySuccess(res);
          }
          setSubmitting(false);
        })
        .catch(() => {
          setSubmitting(false);
        });
    }
  };

  const renderContent = () => {
    return (
      <Fragment>
        <InvoiceForm
          type={isEdit ? 'edit' : 'apply'}
          orderInfo={{ price, description, orderId }}
          formData={formData}
          setFormData={setFormData}
        />
        {(isLandPage || isMobile) && (
          <div className="flexRow justifyContentCenter pBottom30 pLeft20 pRight20">
            {!isMobile && (isEdit || invoiceDetail.invoiceId) && (
              <Button type="link" className="cancelBtn" onClick={() => onChangeStatusType('status')}>
                {_l('取消')}
              </Button>
            )}
            <Button onClick={onOk} radius={isMobile} fullWidth={isMobile} disabled={submitting}>
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
      description={_l('管理员审核确认之后，发票将由合作服务商百望发送至您的邮箱')}
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
