import React, { Fragment, useEffect, useState } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Icon, LoadDiv, UserHead, UserName } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import IsAppAdmin from 'src/pages/Admin/components/IsAppAdmin';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import { INVOICE_STATUS, INVOICE_STATUS_OPTIONS } from 'src/pages/invoice/constant';
import { navigateTo } from 'src/router/navigateTo';
import { INVOICE_TYPE } from '../config';

const DetailDrawer = styled(Drawer)`
  .ant-drawer-header {
    border-color: var(--color-border-tertiary);
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-close {
        margin-right: 0;
        color: var(--color-text-tertiary);
      }
    }
  }

  .statusWrap {
    display: flex;
    padding: 12px;
    border-radius: 3px;
    background-color: var(--color-background-tertiary);
    font-size: 14px;
    .Warning {
      color: var(--color-warning);
    }
  }
  .groupTitle {
    padding: 20px 0 8px 0;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 2px solid var(--color-border-secondary);
  }
  .groupContent {
    display: flex;
    flex-wrap: wrap;
    margin-top: 4px;
  }
  .formItem {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    flex: 0 0 33.3333%;
    max-width: 33.3333%;
    padding-right: 24px;
    margin-top: 10px;
    height: 36px;
    font-size: 14px;
  }
  .labelText {
    color: var(--color-text-secondary);
    margin-right: 20px;
    white-space: nowrap;
  }
  .overflow_ellipsis_line2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box !important;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .productTable {
    .ant-table .ant-table-thead tr th {
      background-color: var(--color-background-tertiary) !important;
      &:hover {
        background-color: var(--color-background-hover) !important;
      }
    }
    tbody {
      background-color: var(--color-background-card);
    }
    .emptyBox .emptyIcon {
      background-color: var(--color-background-disabled);
    }
  }
`;

export default function InvoiceDetail(props) {
  const { onClose, invoiceId, projectId, onViewDetail } = props;
  const [loading, setLoading] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState({});
  const {
    status,
    invoiceOutputType,
    message,
    invoiceUrl,
    isBlue,
    invoiceDetails = [],
    price,
    taxRateAmount,
    deductAmount,
    processId,
    isFastRed,
  } = invoiceDetail;

  useEffect(() => {
    invoiceId && getInvoiceDetail();
  }, [invoiceId]);

  const getInvoiceDetail = () => {
    setLoading(true);
    merchantInvoiceApi
      .getInvoice({ invoiceId })
      .then(res => {
        setInvoiceDetail(res || {});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const detailData = [
    {
      key: 'buyer',
      title: _l('购方信息'),
      fields: [
        { key: 'invoiceTitle', label: _l('发票抬头') },
        { key: 'invoiceOutputType', label: _l('抬头类型'), render: value => (value === 1 ? _l('企业') : _l('个人')) },
        { key: 'email', label: _l('邮箱') },
        ...(invoiceOutputType === 1
          ? [
              { key: 'taxPayerNo', label: _l('税号') },
              { key: 'bankName', label: _l('开户行') },
              { key: 'bankCode', label: _l('开户行账号') },
              { key: 'address', label: _l('地址') },
              { key: 'phoneNumber', label: _l('电话') },
            ]
          : []),
      ],
    },
    {
      key: 'seller',
      title: _l('销方信息'),
      fields: [
        { key: 'companyName', label: _l('开票主体') },
        { key: 'taxNo', label: _l('开票税号') },
      ],
    },
    {
      key: 'invoice',
      title: _l('发票信息'),
      fields: [
        { key: 'invoiceNo', label: _l('发票号码') },
        { key: 'invoiceId', label: _l('开票单号') },
        { key: 'invoiceType', label: _l('发票类型'), render: value => INVOICE_TYPE[value] },
        {
          key: 'createTime',
          label: _l('申请时间'),
          render: (value, record) => (
            <span>{record.invoiceUrl ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          ),
        },
        {
          key: 'invoiceTime',
          label: _l('开票时间'),
          render: (value, record) => (
            <span>{record.invoiceUrl ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>
          ),
        },
        { key: 'invoiceTerminalCode', label: _l('数电账号') },
        {
          key: 'account',
          label: _l('申请人'),
          render: (value, record) => {
            const { accountId, fullname, avatar, isPortal } = record.account || {};

            return (
              <div className="flexRow">
                <UserHead className="circle" user={{ userHead: avatar, accountId }} size={24} projectId={projectId} />
                {isPortal ? (
                  <div className="pLeft5">{fullname}</div>
                ) : (
                  <UserName
                    className="textPrimary Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                    projectId={projectId}
                    user={{ userName: fullname, accountId }}
                  />
                )}
              </div>
            );
          },
        },
        {
          key: 'operator',
          label: _l('开票人'),
          render: (value, record) => {
            const { accountId, fullname, avatar, isPortal } = record.operator || {};

            if (_.isEmpty(record.operator) || !accountId) {
              return '-';
            }

            return (
              <div className="flexRow">
                <UserHead className="circle" user={{ userHead: avatar, accountId }} size={24} projectId={projectId} />
                {isPortal ? (
                  <div className="pLeft5">{fullname}</div>
                ) : (
                  <UserName
                    className="textPrimary Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                    projectId={projectId}
                    user={{ userName: fullname, accountId }}
                  />
                )}
              </div>
            );
          },
        },
        {
          key: 'price',
          label: _l('发票金额'),
          render: value => <span className={cx({ textError: value < 0 })}>{value}</span>,
        },
        {
          key: 'taxRate',
          label: _l('发票税率'),
          render: (value, record) => (!record.productId ? '-' : value * 100 + '%'),
        },
        {
          key: 'isFastRed',
          label: _l('发票状态'),
          render: (value, record) =>
            record.invoiceUrl ? value ? <span className="textError">{_l('已红冲-全额')}</span> : _l('正常') : '-',
        },
        {
          key: 'isBlue',
          label: _l('红蓝标志'),
          render: (value, record) => (
            <div>
              <span>{value ? _l('蓝票') : _l('红票')}</span>
              {record.sourceInvoiceId && (
                <Fragment>
                  <span className="mLeft5 mRight5">|</span>
                  <span
                    className={`Hand ${!value ? 'colorPrimary' : 'textError'}`}
                    onClick={() => onViewDetail(record.sourceInvoiceId)}
                  >
                    {!value ? _l('蓝票信息') : _l('红票信息')}
                  </span>
                </Fragment>
              )}
            </div>
          ),
        },
        { key: 'redConfirmSerialNo', label: _l('红字发票信息确认单编号') },

        ...[
          { key: 'invoiceUrl', label: _l('PDF地址') },
          { key: 'ofdUrl', label: _l('OFD地址') },
          { key: 'xmlUrl', label: _l('XML地址') },
        ].map(({ key, label }) => ({
          key,
          label,
          render: value => (
            <span
              className={cx('WordBreak overflow_ellipsis_line2', { 'colorPrimary Hand Hover_51': value })}
              onClick={() => value && window.open(value)}
            >
              {value || '-'}
            </span>
          ),
        })),
      ],
    },
    {
      key: 'app',
      title: _l('应用信息'),
      fields: [
        {
          key: 'app',
          label: _l('所属应用'),
          render: (text, record) => {
            const { sourceInfo = {}, orderId, invoiceId } = record;
            const { appColor, appIconUrl, appName, appId } = sourceInfo;

            if (orderId === invoiceId) {
              return '-';
            }

            return (
              <IsAppAdmin
                appId={appId}
                appName={appName}
                iconUrl={appIconUrl}
                iconColor={appColor}
                projectId={props.projectId}
                passCheckManager={true}
              />
            );
          },
        },
        {
          key: 'worksheet',
          label: processId ? _l('所属工作流') : _l('所属表单'),
          render: (value, record) => {
            const { sourceInfo = {}, orderId, invoiceId } = record;
            const { workSheetName, worksheetId } = sourceInfo;

            if (orderId === invoiceId) {
              return '-';
            }

            return (
              <span
                title={workSheetName}
                className={cx({ 'Hand hoverColorPrimary': !!worksheetId })}
                onClick={() => {
                  if (record.processId) {
                    window.open(`/workflowedit/${record.processId}`);
                    return;
                  }

                  worksheetId && navigateTo(`/worksheet/${worksheetId}`);
                }}
              >
                {workSheetName}
              </span>
            );
          },
        },
        {
          key: 'orderId',
          label: processId ? _l('工作流ID') : _l('订单编号'),
          render: (value, record) => (
            //record.orderId === record.invoiceId 测试票
            <span
              className={cx({ 'colorPrimary ThemeHoverColor2 pointer': record.orderId !== record.invoiceId && value })}
              onClick={() => {
                if (record.processId) {
                  window.open(`/workflowedit/${record.processId}`);
                  return;
                }

                record.orderId !== record.invoiceId &&
                  value &&
                  window.open(`/admin/transaction/${projectId}?orderId=${value}`);
              }}
            >
              {record.processId ? record.processId : record.orderId === record.invoiceId ? '-' : value}
            </span>
          ),
        },
      ],
    },
    { key: 'product', title: _l('商品信息') },
  ];

  const columns = [
    { title: _l('序号'), dataIndex: 'indexNumber', width: 60 },
    { title: _l('项目名称'), dataIndex: 'categoryName', width: 160 },
    { title: _l('税收分类编码'), dataIndex: 'categoryCode', width: 180 },
    { title: _l('规格型号'), dataIndex: 'specification', width: 100 },
    { title: _l('单位'), dataIndex: 'unit', width: 80 },
    { title: _l('含税单价'), dataIndex: 'price', width: 100 },
    { title: _l('数量'), dataIndex: 'quantity', width: 80 },
    { title: _l('含税金额'), dataIndex: 'totalAmount', width: 100 },
    { title: _l('税率'), dataIndex: 'taxRate', width: 80, render: value => value * 100 + '%' },
    { title: _l('税额'), dataIndex: 'totalTax', width: 100 },
  ];

  return (
    <DetailDrawer visible width={1100} title={_l('发票详情-%0', invoiceId)} onClose={onClose}>
      {loading && <LoadDiv className="mTop20" />}

      {!loading && (
        <Fragment>
          <div className="statusWrap">
            <div className="flex flexRow alignItemsCenter">
              <div className="bold">{_l('状态：')}</div>
              <div
                className={cx({
                  Green: status === INVOICE_STATUS.INVOICED,
                  Red: status === INVOICE_STATUS.FAILED,
                  Warning: status === INVOICE_STATUS.CANCELLED,
                })}
              >
                {(_.find(INVOICE_STATUS_OPTIONS, item => item.value === status) || {}).label}
              </div>
              {status === INVOICE_STATUS.FAILED && (
                <Tooltip title={message}>
                  <Icon icon="info_outline" className="textTertiary Font14 mLeft5" />
                </Tooltip>
              )}
            </div>
            {invoiceUrl && (
              <span className="colorPrimary Hand Hover_51" onClick={() => window.open(invoiceUrl)}>
                {_l('查看')}
              </span>
            )}
          </div>

          {detailData.map(group => (
            <div key={group.key}>
              <div className="groupTitle">{group.title}</div>

              {group.key !== 'product' ? (
                <div className="groupContent">
                  {group.fields.map(field => {
                    //蓝票的发票状态为正常时不显示 红字发票信息确认单编号
                    if (field.key === 'redConfirmSerialNo' && !isFastRed && isBlue) {
                      return null;
                    }

                    return (
                      <div className="formItem" key={field.key}>
                        <div className="labelText">{field.label}</div>
                        <div>
                          {field.render
                            ? field.render(invoiceDetail[field.key], invoiceDetail)
                            : invoiceDetail[field.key] || '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <div className="flexRow mTop20 mBottom20">
                    <div>
                      <span className="labelText">{_l('发票金额:')}</span>
                      <span className="colorPrimary">{price}</span>
                      <span>{_l('元')}</span>
                    </div>
                    <div className="mLeft50">
                      <span className="labelText">{_l('税额:')}</span>
                      <span className="colorPrimary">{taxRateAmount}</span>
                      <span>{_l('元')}</span>
                    </div>
                    <div className="mLeft50">
                      <span className="labelText">{_l('不含税金额:')}</span>
                      <span className="colorPrimary">{deductAmount}</span>
                      <span>{_l('元')}</span>
                    </div>
                  </div>
                  <PageTableCon
                    className="productTable"
                    columns={columns}
                    dataSource={invoiceDetails.map((item, index) => ({ ...item, indexNumber: index + 1 }))}
                  />
                </div>
              )}
            </div>
          ))}
        </Fragment>
      )}
    </DetailDrawer>
  );
}
