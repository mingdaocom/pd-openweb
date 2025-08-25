import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import paymentAjax from 'src/api/payment';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import { PAY_STATUS } from '../config';

const TableWrap = styled(PageTableCon)`
  .ant-table-body {
    height: calc(100% - 60px) !important;
  }
`;

export default class PaymentDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
    };
    this.columns = [
      { title: _l('交易单号'), dataIndex: 'merchantOrderId', width: 350 },
      {
        title: _l('支付内容'),
        dataIndex: 'description',
        width: 250,
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      { title: _l('支付金额'), dataIndex: 'amount', width: 160 },
      {
        title: _l('支付状态'),
        dataIndex: 'payOrderType',
        width: 160,
        render: (text, record) => {
          const { status } = record;
          return (_.find(PAY_STATUS, item => item.value === status) || {}).label;
        },
      },
      {
        title: _l('支付方式'),
        dataIndex: 'payOrderType',
        width: 160,
        render: (text, record) => {
          return record.payOrderType === 0 ? _l('支付宝') : _l('微信');
        },
      },
      // {
      //   title: _l('付款人'),
      //   dataIndex: 'createAId',
      //   width: 260,
      //   render: (text, record) => {
      //     const { accountId, accountName, avatar } = record;
      //     return (
      //       <div className="flexRow">
      //         <UserHead
      //           className="circle"
      //           user={{
      //             userHead: avatar,
      //             accountId: accountId,
      //           }}
      //           size={24}
      //           projectId={props.projectId}
      //         />
      //         <UserName
      //           className="Gray Font13 pLeft5 pRight10 pTop3 flex ellipsis"
      //           user={{
      //             userName: accountName,
      //             accountId: accountId,
      //           }}
      //         />
      //       </div>
      //     );
      //   },
      // },
      // { title: _l('付款人ID'), dataIndex: 'accountId', width: 300 },
      {
        title: _l('支付时间'),
        dataIndex: 'updateTime',
        width: 200,
        render: (text, record) => {
          const { status } = record;
          return _.includes([2, 6, 7], status) ? '-' : text;
        },
      },
    ];
  }

  componentDidMount() {
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    const { orderInfo, projectId } = this.props;
    paymentAjax
      .getPayOrderDetailList({
        projectId,
        orderId: orderInfo.orderId,
      })
      .then(({ payOrderDetails = [], dataCount }) => {
        this.setState({ loading: false, list: payOrderDetails, count: dataCount });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };

  render() {
    const { onClose = () => {} } = this.props;
    const { loading, list, pageIndex, count } = this.state;

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <div>
            <i className="icon-backspace Font22 ThemeHoverColor3 Hand" onClick={onClose} />
            <span className="Font17 bold mLeft10">{_l('交易明细')}</span>
          </div>
        </div>
        <div className="orgManagementContent">
          <TableWrap
            paginationInfo={{ pageIndex, pageSize: 50 }}
            loading={loading}
            columns={this.columns}
            dataSource={list}
            count={count}
            getDataSource={this.getList}
          />
        </div>
      </div>
    );
  }
}
