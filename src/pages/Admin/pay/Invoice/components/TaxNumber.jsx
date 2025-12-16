import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { LoadDiv, UserHead } from 'ming-ui';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import PurchaseExpandPack from 'src/pages/Admin/components/PurchaseExpandPack';
import EmptyIndexContent from 'src/pages/Admin/pay/components/EmptyIndexContent';
import { InvoiceConfirmDialog } from 'src/pages/invoice/InvoiceConfirm';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { TAX_STATUS_TEXT } from '../config';
import CreateTaxNumber from './CreateTaxNumber';

const ExplainWrap = styled.div`
  background: #f2fafe;
  border-radius: 3px;
  font-size: 13px;
  padding: 12px;
  margin-bottom: 8px;
`;

const TaxNumber = forwardRef((props, ref) => {
  const { projectId, createTaxVisible, onCreateTax, featureType, curTaxNo, onShowCreateTaxBtn } = props;
  const [loading, setLoading] = useState(true);
  const [taxList, setTaxList] = useState({ list: [], total: 0 });
  const [pageIndex, setPageIndex] = useState(1);
  const [detailEmail, setDetailEmail] = useState('');

  useImperativeHandle(ref, () => ({
    getTaxList,
  }));

  useEffect(() => {
    props.taxList && !props.taxList.length ? setLoading(false) : getTaxList(); //上层获取到列表为空，不重复获取列表数据
  }, []);

  const getTaxList = ({ pageIndex = 1 } = {}) => {
    setLoading(true);
    merchantInvoiceApi
      .getTaxInfoList({ projectId, pageFilter: { pageIndex, pageSize: 50 } })
      .then(({ taxInfos, dataCount }) => {
        setTaxList({ list: taxInfos || [], total: dataCount || 0 });
        setLoading(false);
        setPageIndex(pageIndex);
        !!taxInfos?.length && onShowCreateTaxBtn();
      })
      .catch(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return <LoadDiv />;
  }

  if (createTaxVisible) {
    return (
      <CreateTaxNumber
        projectId={projectId}
        curTaxNo={curTaxNo}
        email={detailEmail}
        curTaxInfo={_.find(taxList.list, { taxNo: curTaxNo })}
      />
    );
  }

  const columns = [
    { title: _l('税号'), dataIndex: 'taxNo', width: 180, fixed: 'left' },
    { title: _l('公司名称'), dataIndex: 'companyName', ellipsis: true, width: 300, fixed: 'left' },
    { title: _l('邮箱'), dataIndex: 'email', ellipsis: true, width: 180 },
    {
      title: _l('状态'),
      dataIndex: 'planType',
      width: 120,
      render: (text, record) => {
        return (
          <span style={{ color: record.planType === 5 ? '#4CAF50' : record.planType === 99 ? '#f44336' : '#1677ff' }}>
            {TAX_STATUS_TEXT[record.planType]}
          </span>
        );
      },
    },
    {
      title: _l('操作人'),
      dataIndex: 'operator',
      width: 150,
      render: (text, record) => {
        const { operator = {} } = record;
        const { accountId, fullname, avatar } = operator;
        return (
          <div className="flexRow">
            <UserHead
              className="circle"
              user={{ userHead: avatar, accountId: accountId }}
              size={24}
              projectId={projectId}
            />
            <div className="mLeft8 ellipsis flex mRight20">{fullname}</div>
          </div>
        );
      },
    },
    {
      title: _l('创建时间'),
      dataIndex: 'createTime',
      width: 180,
      render: value => <span>{value ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>,
    },
    {
      title: _l('到期时间'),
      dataIndex: 'planExpiredTime',
      width: 120,
      render: value => <span>{value && value.substr(0, 4) !== '0001' ? moment(value).format('YYYY-MM-DD') : '-'}</span>,
    },

    {
      title: _l('操作'),
      dataIndex: 'operate',
      width: 'fit-content',
      fixed: 'right',
      render: (text, record) => {
        const { planType } = record;

        return (
          <Fragment>
            <span
              className="Hand ThemeColor mRight24 Hover_51"
              onClick={() => {
                onCreateTax(record.taxNo);
                setDetailEmail(record.email);
              }}
            >
              {_l('详情')}
            </span>
            <PurchaseExpandPack
              className="Hand ThemeColor Hover_51"
              text={planType === 5 ? _l('续费') : _l('付费开通')}
              type="invoice"
              projectId={projectId}
              extraParam={planType === 5 ? `${record.taxNo}/renew` : record.taxNo}
              onClick={
                featureType === '2'
                  ? () => buriedUpgradeVersionDialog(projectId, VersionProductType.invoice)
                  : undefined
              }
            />
            {planType !== 99 && (
              <span
                className="Hand ThemeColor Hover_51 mLeft24"
                onClick={() => {
                  InvoiceConfirmDialog({ isLandPage: false, isTest: true, taxNo: record.taxNo, projectId });
                }}
              >
                {_l('开票测试')}
              </span>
            )}
          </Fragment>
        );
      },
    },
  ];

  return _.isEmpty(taxList.list) ? (
    <EmptyIndexContent type="invoice" onBtnClick={() => onCreateTax()} />
  ) : (
    <div className="flex flexColumn overflowHidden">
      <ExplainWrap>
        <div>
          {md.global.Config.IsLocal
            ? _l('1、每个开票税号开通后，到期后自动停用，付费开通后可继续使用')
            : _l('1、每个开票税号开通后，享有 7 天免费试用，到期后自动停用，付费开通后可继续使用')}
        </div>
        <div>{_l('2、一个税号仅可绑定一个组织，不可重复开通')}</div>
        <div>{_l('3、用户提交开票申请后，需由管理员在 开票记录 审核并确认，用户才能下载发票')}</div>
        <div>
          <span>{_l('4、审核操作通常由财务人员完成，建议在')}</span>
          <span
            className="mLeft3 mRight3 ThemeColor ThemeHoverColor2 pointer"
            onClick={() => navigateTo(`/admin/sysroles/${projectId}`)}
          >
            {_l('组织-管理员')}
          </span>
          <span>{_l('中配置财务角色，并将相关人员加入角色执行审核开票')}</span>
        </div>
      </ExplainWrap>
      <PageTableCon
        loading={loading}
        columns={columns.filter(item => (md.global.Config.IsLocal ? item.dataIndex !== 'email' : true))}
        dataSource={taxList.list}
        count={taxList.total}
        paginationInfo={{ pageIndex, pageSize: 50 }}
        getDataSource={getTaxList}
      />
    </div>
  );
});

export default TaxNumber;
