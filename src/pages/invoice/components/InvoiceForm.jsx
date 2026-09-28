import React, { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Dropdown, Input, Radio, Select } from 'ming-ui/antd-components';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import { INVOICE_TYPE_OPTIONS, RADIO_DATA } from '../constant';

const Wrapper = styled.div`
  width: 100%;
  .contentWrap {
    max-width: 900px;
    margin: 0 auto;
    padding-block: 10px;
  }
  .topInfoBlock {
    width: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 18px 24px 24px;
    background-color: var(--color-background-secondary);
    margin-bottom: 24px;
    gap: 12px;
    .greenColor {
      color: var(--color-success);
    }
  }
  .formItem {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .label {
      width: 90px;
      padding-right: 10px;
      color: var(--color-text-secondary);
      position: relative;
    }
  }

  @media screen and (max-width: 840px) {
    .contentWrap {
      padding-inline: 20px;
    }
    .formItem {
      flex-direction: column;
      align-items: normal;
      .label {
        margin-bottom: 10px;
      }
    }
  }
`;

const optionalFields = [
  { key: 'bankName', label: _l('开户行') },
  { key: 'bankCode', label: _l('开户行账号') },
  { key: 'address', label: _l('地址') },
  { key: 'phoneNumber', label: _l('电话') },
];

export default function InvoiceForm(props) {
  const { type, orderInfo, formData, productList = [], setFormData } = props; //type: apply | confirm | test | edit
  const { price, description, orderId } = orderInfo;
  const [showTitleList, setShowTitleList] = useState(false);
  const [titleList, setTitleList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [isExpand, setIsExpand] = useState(false);

  const isConfirmOrTest = ['confirm', 'test'].includes(type);

  const getTitleList = useCallback(
    keyword => {
      setListLoading(true);
      merchantInvoiceApi
        .companySearch({ keyword, orderId })
        .then(res => {
          const list = res.map(item => ({ text: item.companyName, value: item.taxNo }));
          setTitleList(list);
          setListLoading(false);
        })
        .catch(() => {
          setListLoading(false);
        });
    },
    [orderId],
  );

  const debouncedGetTitleList = useMemo(
    () =>
      _.debounce(value => {
        if (value) {
          setShowTitleList(true);
          getTitleList(value);
        } else {
          setShowTitleList(false);
        }
      }, 500),
    [getTitleList],
  );

  useEffect(() => () => debouncedGetTitleList.cancel(), [debouncedGetTitleList]);

  const renderFieldComponent = key => {
    if (isConfirmOrTest && !(type === 'test' && key === 'email')) {
      switch (key) {
        case 'invoiceOutputType':
        case 'contentType':
        case 'invoiceType':
          return <div className="flex">{RADIO_DATA[key].find(item => item.value === formData[key])?.label}</div>;
        case 'productId':
          return (
            <Select
              className="flex"
              value={formData[key]}
              options={productList}
              onChange={value => setFormData({ [key]: value })}
            />
          );
        default:
          return <div className="flex">{formData[key] || '-'}</div>;
      }
    }

    switch (key) {
      case 'invoiceOutputType':
      case 'contentType':
        return (
          <Radio.Group
            value={formData[key]}
            options={RADIO_DATA[key]}
            onChange={event => {
              const value = event.target.value;

              setFormData({
                [key]: value,
                invoiceTitle: value === 2 ? _.get(md, 'global.Account.fullname') || '' : '',
                taxPayerNo: '',
              });
            }}
          />
        );
      case 'invoiceType':
        return (
          <Select
            className="flex"
            value={formData[key]}
            options={INVOICE_TYPE_OPTIONS}
            onChange={value => setFormData({ [key]: value })}
          />
        );
      case 'invoiceTitle': {
        const isEnterPrise = formData.invoiceOutputType === 1;
        const titleMenuItems = listLoading
          ? [{ key: 'loading', disabled: true, label: <LoadDiv className="mTop10 mBottom10" /> }]
          : titleList.length
            ? titleList.map((item, index) => ({
                key: item.value || `${item.text}-${index}`,
                label: item.text,
                onClick: () => {
                  setFormData({ invoiceTitle: item.text, taxPayerNo: item.value });
                  setShowTitleList(false);
                },
              }))
            : [{ key: 'empty', disabled: true, label: _l('没有搜索到该企业') }];

        return (
          <div className="flex">
            <Dropdown
              trigger={['click']}
              open={showTitleList}
              placement="bottomLeft"
              menu={{ items: titleMenuItems, style: { maxHeight: 170, overflowY: 'auto' } }}
              onOpenChange={open => {
                if (!open) {
                  setShowTitleList(false);
                }
              }}
            >
              <Input
                className="w100"
                prefix={isEnterPrise ? <Icon icon="search" className="Font16 textTertiary" /> : null}
                placeholder={_l('请输入发票抬头')}
                value={formData.invoiceTitle}
                onChange={event => {
                  const value = event.target.value;
                  setFormData({ invoiceTitle: value });
                  isEnterPrise && debouncedGetTitleList(value);
                }}
              />
            </Dropdown>
          </div>
        );
      }

      default:
        return (
          <div className="flex">
            <Input
              className="w100"
              placeholder={key === 'taxPayerNo' ? '' : _l('请输入')}
              value={formData[key]}
              disabled={key === 'taxPayerNo'}
              onChange={event => setFormData({ [key]: event.target.value })}
            />
          </div>
        );
    }
  };

  return (
    <Wrapper className="InvoiceFormContainer">
      <div className="contentWrap">
        <div className={cx('topInfoBlock', { pAll25: type === 'test' })}>
          <div className="flexRow alignItemsCenter">
            <span className="textSecondary">{_l('开票金额：')}</span>
            <span className="greenColor Font32 bold">{'￥' + price}</span>
          </div>
          {type !== 'test' && (
            <div>
              <span className="textSecondary">{_l('支付内容：')}</span>
              <span>{isConfirmOrTest ? formData.payTitle : description}</span>
            </div>
          )}
        </div>

        <div className="formItem">
          <div className="label">{_l('抬头类型')}</div>
          {renderFieldComponent('invoiceOutputType')}
        </div>
        <div className="formItem">
          <div className="label">{_l('发票类型')}</div>
          {renderFieldComponent('invoiceType')}
        </div>
        <div className="formItem">
          <div className="label">
            {_l('发票抬头')}
            {!isConfirmOrTest && <span className="Red bold">*</span>}
          </div>
          {renderFieldComponent('invoiceTitle')}
        </div>

        {formData.invoiceOutputType === 1 && (
          <div className="formItem">
            <div className="label">
              {_l('税号')}
              {!isConfirmOrTest && <span className="Red bold">*</span>}
            </div>
            {renderFieldComponent('taxPayerNo')}
          </div>
        )}

        {['confirm', 'test'].includes(type) && (
          <div className="formItem">
            <div className="label">{_l('开票内容')}</div>
            {renderFieldComponent('contentType')}
          </div>
        )}

        <div className="formItem">
          <div className="label">
            {_l('邮箱')}
            {!isConfirmOrTest && window.isPublicWorksheet && <span className="Red bold">*</span>}
          </div>
          {renderFieldComponent('email')}
        </div>

        {(isExpand || isConfirmOrTest) &&
          formData.invoiceOutputType === 1 &&
          optionalFields.map(item => (
            <div className="formItem">
              <div className="label">{item.label}</div>
              {renderFieldComponent(item.key)}
            </div>
          ))}

        {isConfirmOrTest ? (
          <div className="formItem">
            <div className="label">{_l('开票类目')}</div>
            {renderFieldComponent('productId')}
          </div>
        ) : (
          formData.invoiceOutputType === 1 && (
            <div
              className="textSecondary TxtCenter pointer mTop10 hoverColorPrimary"
              onClick={() => setIsExpand(!isExpand)}
            >
              {isExpand ? _l('收起') : _l('展开更多')}
            </div>
          )
        )}
      </div>
    </Wrapper>
  );
}
