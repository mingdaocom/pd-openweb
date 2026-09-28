import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Input, Modal, Radio } from 'ming-ui/antd-components';
import orderAjax from 'src/api/order';
import projectAjax from 'src/api/project';
import { applyInvoiceConfig, newInvoiceConfig } from './config';

const ApplyInvoiceWrap = styled.ul`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  &.newInvoiceConfig {
    transition: max-height ease-in 0.25s;
    max-height: 0;
    overflow: hidden;
    &.expanded {
      max-height: 400px;
    }
  }
  li {
    flex-shrink: 0;
    padding: 8px 0;
    line-height: 36px;
    width: 100%;
    &.half {
      width: 48%;
    }
    .name {
      font-weight: 400;
      position: relative;
      padding-left: 5px;
      &::before {
        position: absolute;
        content: '*';
        left: 0;
        top: 2px;
        color: var(--color-error);
        display: inline-block;
        vertical-align: middle;
      }
    }
    input {
      width: 100%;
    }
  }
`;

const InvoiceContentWrap = styled.div`
  overflow: auto;
`;

export default function InvoiceSetting(props) {
  const { projectId, orderId, onClose } = props;
  const [data, setData] = useSetState({});
  const [submitting, setSubmitting] = useState(false);
  const requestPending = useRef(false);

  useEffect(() => {
    projectAjax.getProjectFinance({ projectId }).then(data => {
      //没有发票设置时，invoiceType返回0，需要默认为1
      setData({ ...data, invoiceType: data.invoiceType || 1 });
    });
  }, []);

  const saveSetting = () => {
    const formConfig = data.invoiceType === 1 ? applyInvoiceConfig : [...applyInvoiceConfig, ...newInvoiceConfig];
    const error = formConfig.some(({ key }) => !data[key]);

    if (error) {
      const errInfo = _.find(formConfig, ({ key }) => !data[key]) || {};
      alert(_l('请输入%0', errInfo.text), 2);
      return;
    }

    if (requestPending.current) return;

    requestPending.current = true;
    setSubmitting(true);

    const para =
      data.invoiceType === 2
        ? _.pick(data, [
            'companyName',
            'price',
            'address',
            'recipientName',
            'taxNumber',
            'contactPhone',
            'taxBank',
            'taxBankNumber',
            'taxRegAddress',
            'taxRegContactPhone',
          ])
        : _.pick(data, ['companyName', 'price', 'address', 'recipientName', 'taxNumber', 'contactPhone']);
    orderAjax
      .applyInvoice({ projectId, orderId, ...para, invoiceType: data.invoiceType })
      .then(res => {
        if (!res) {
          alert(_l('申请失败'), 2);
          return;
        }

        alert(_l('申请成功'));
      })
      .finally(() => {
        requestPending.current = false;
        setSubmitting(false);
        onClose();
      });
  };

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      width={480}
      title={<div className="Font17">{_l('申请发票')}</div>}
      onCancel={onClose}
      onOk={saveSetting}
      confirmLoading={submitting}
      okText={_l('保存')}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <InvoiceContentWrap>
        <ApplyInvoiceWrap>
          {applyInvoiceConfig.map(item => {
            const { key, text, verify, half } = item;
            return (
              <li className={cx({ half })} key={key}>
                <div className="name">{text}</div>
                <Input
                  value={data[key]}
                  onChange={e => setData({ [key]: e.target.value })}
                  placeholder={_l('请输入%0', text)}
                  onBlur={e => {
                    const value = e.target.value;

                    if (verify && value && !verify.test(value)) {
                      setData({ [key]: '' });
                      alert(_l('%0填写格式有误', text), 2);
                    }
                  }}
                />
              </li>
            );
          })}
        </ApplyInvoiceWrap>
        <Radio.Group
          style={{ marginTop: '16px' }}
          options={[
            { value: 1, text: _l('普票') },
            { value: 2, text: _l('增票') },
          ].map(({ text, ...option }) => ({ ...option, label: text }))}
          value={data.invoiceType}
          onChange={event =>
            setData({
              invoiceType: event.target.value,
            })
          }
        />

        <ApplyInvoiceWrap className={cx('newInvoiceConfig', { expanded: data.invoiceType === 2 })}>
          {newInvoiceConfig.map(item => {
            const { key, text, verify } = item;
            return (
              <li key={key}>
                <div className="name">{text}</div>
                <Input
                  value={data[key]}
                  onChange={e => setData({ [key]: e.target.value })}
                  placeholder={_l('请输入%0', text)}
                  onBlur={e => {
                    const value = e.target.value;

                    if (verify && value && !verify.test(value)) {
                      alert(_l('%0填写格式有误', text), 2);
                      setData({ [key]: '' });
                    }
                  }}
                />
              </li>
            );
          })}
        </ApplyInvoiceWrap>
      </InvoiceContentWrap>
    </Modal>
  );
}
