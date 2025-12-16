import React, { Fragment, useCallback, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, Input, LoadDiv, Menu, MenuItem, RadioGroup } from 'ming-ui';
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
    background-color: #f8f8f8;
    margin-bottom: 24px;
    gap: 12px;
    .greenColor {
      color: #4caf50;
    }
  }
  .formItem {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    .label {
      width: 90px;
      padding-right: 10px;
      color: #757575;
      position: relative;
    }
    input {
      border-color: #ddd;
      font-size: 13px;
      &::placeholder {
        color: #bdbdbd;
      }
      &:disabled {
        background-color: #f7f7f7;
        border-color: #f7f7f7;
        &:hover {
          border-color: #f7f7f7;
        }
      }
    }
    .titleSearchInput {
      position: relative;
      .icon-search {
        position: absolute;
        left: 8px;
        top: 10px;
      }

      &.isEnterPrise {
        input {
          padding-left: 32px;
        }
      }

      .titleMenuWrap {
        right: 0;
        width: auto;
        max-height: 170px;
        overflow: auto;
        .emptyText {
          height: 36px;
          line-height: 36px;
          padding: 0 16px;
          color: #757575;
        }
      }
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

export default function InvoiceForm(props) {
  const { type, orderInfo, formData, productList = [], setFormData } = props; //type: apply | confirm | test | edit
  const { price, description, orderId } = orderInfo;
  const [showTitleList, setShowTitleList] = useState(false);
  const [titleList, setTitleList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const isConfirmOrTest = ['confirm', 'test'].includes(type);

  const getTitleList = keyword => {
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
  };

  const debouncedGetTitleList = useCallback(
    _.debounce(value => {
      if (value) {
        setShowTitleList(true);
        getTitleList(value);
      } else {
        setShowTitleList(false);
      }
    }, 500),
    [],
  );

  const renderFieldComponent = key => {
    if (isConfirmOrTest && !(type === 'test' && key === 'email')) {
      switch (key) {
        case 'invoiceOutputType':
        case 'contentType':
        case 'invoiceType':
          return <div className="flex">{RADIO_DATA[key].find(item => item.value === formData[key])?.text}</div>;
        case 'productId':
          return (
            <Dropdown
              border
              isAppendToBody
              className="flex"
              value={formData[key]}
              data={productList}
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
          <RadioGroup
            checkedValue={formData[key]}
            data={RADIO_DATA[key]}
            onChange={value => {
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
          <Dropdown
            border
            isAppendToBody
            className="flex"
            value={formData[key]}
            data={INVOICE_TYPE_OPTIONS}
            onChange={value => setFormData({ [key]: value })}
          />
        );
      case 'invoiceTitle':
        const isEnterPrise = formData.invoiceOutputType === 1;
        return (
          <div className={cx('flex titleSearchInput', { isEnterPrise })}>
            {isEnterPrise && <Icon icon="search" className="Font16 Gray_9e" />}
            <Input
              className="w100"
              placeholder={_l('请输入发票抬头')}
              value={formData.invoiceTitle}
              onChange={value => {
                setFormData({ invoiceTitle: value });
                isEnterPrise && debouncedGetTitleList(value);
              }}
            />
            {showTitleList && (
              <Menu className="titleMenuWrap" onClickAway={() => setShowTitleList(false)}>
                {listLoading ? (
                  <LoadDiv className="mTop10" />
                ) : (
                  <Fragment>
                    {!titleList.length && <div className="emptyText">{_l('没有搜索到该企业')}</div>}
                    {titleList.map((item, i) => (
                      <MenuItem
                        key={i}
                        onMouseDown={() => {
                          setFormData({ invoiceTitle: item.text, taxPayerNo: item.value });
                          setShowTitleList(false);
                        }}
                      >
                        {item.text}
                      </MenuItem>
                    ))}
                  </Fragment>
                )}
              </Menu>
            )}
          </div>
        );
      case 'taxPayerNo':
      case 'email':
        return (
          <div className="flex">
            <Input
              className="w100"
              placeholder={key === 'taxPayerNo' ? '' : _l('请输入邮箱')}
              value={formData[key]}
              disabled={key === 'taxPayerNo'}
              onChange={value => setFormData({ [key]: value })}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Wrapper className="InvoiceFormContainer">
      <div className="contentWrap">
        <div className={cx('topInfoBlock', { pAll25: type === 'test' })}>
          <div className="flexRow alignItemsCenter">
            <span className="Gray_75">{_l('开票金额：')}</span>
            <span className="greenColor Font32 bold">{'￥' + price}</span>
          </div>
          {type !== 'test' && (
            <div>
              <span className="Gray_75">{_l('支付内容：')}</span>
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

        {isConfirmOrTest && (
          <div className="formItem">
            <div className="label">{_l('开票类目')}</div>
            {renderFieldComponent('productId')}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
