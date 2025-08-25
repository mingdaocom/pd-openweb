import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, UserHead } from 'ming-ui';
import delegationAjax from 'src/pages/workflow/api/delegation';
import PageTableCon from '../../components/PageTableCon';
import PointImg from '../images/point.png';

const TableWrap = styled.div`
  td.ant-table-column-sort {
    background: #fff;
  }
  .pointImg {
    width: 39px;
  }
  .userCon {
    max-width: 168px;
    min-width: 88px;
  }
  .actionIcon {
    opacity: 0;
  }
  .ant-table-row:hover .actionIcon {
    opacity: 1 !important;
  }
`;

const PAGE_SIZE = 20;
const OPTIONS = [
  {
    label: _l('编辑'),
    key: 1,
  },
  {
    label: _l('结束委托'),
    key: 2,
  },
];

const renderUser = (user, projectId) => {
  return (
    <div className="userCon valignWrapper">
      <UserHead
        user={{
          userHead: user.avatar,
          accountId: user.accountId,
        }}
        size={28}
        projectId={projectId}
      />
      <span className="mLeft8 flex ellipsis">{user.fullName || user.fullname}</span>
    </div>
  );
};

function DeputeTable(props) {
  const { projectId, principals, refreshFlag, onEdit = () => {} } = props;
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [showMenu, setShowMenu] = useState(false);

  const columns = [
    {
      title: _l('委托人'),
      dataIndex: 'id',
      key: 'principal',
      width: 'auto',
      render: (id, record) => renderUser(record.principal, record.companyId),
    },
    {
      title: '',
      dataIndex: 'id',
      key: 'icon',
      width: 71,
      render: () => <img className="pointImg" src={PointImg} />,
    },
    {
      title: _l('受托人'),
      dataIndex: 'id',
      key: ' trustee',
      width: 'auto',
      render: (id, record) => renderUser(record.trustee, record.companyId),
    },
    {
      title: _l('委托时间'),
      dataIndex: 'startDate',
      key: 'startDate',
      width: 280,
      render: (startDate, record) => (
        <div>
          {moment(startDate || record.createDate).format('YYYY-MM-DD HH:mm')}
          <span className="mLeft6 mRight6">-</span>
          {moment(record.endDate).format('YYYY-MM-DD HH:mm')}
        </div>
      ),
    },
    {
      title: _l('委托范围'),
      dataIndex: 'apks',
      key: 'apks',
      width: 120,
      render: (id, record) => <div>{!record.apks ? _l('所有工作流') : _l('%0个应用', record.apks.length)}</div>,
    },
    {
      title: _l('创建时间'),
      dataIndex: 'createDate',
      key: 'createDate',
      width: 120,
      sorter: true,
      defaultSortOrder: 'ascend',
      sortDirections: ['ascend', 'descend', 'ascend'],
      render: createDate => <div>{moment(createDate).format('YYYY-MM-DD')}</div>,
    },
    {
      title: _l('创建人'),
      dataIndex: 'createBy',
      key: 'createBy',
      width: 'auto',
      render: (id, record) => renderUser(record.createBy, record.companyId),
    },
  ];

  useEffect(() => {
    getData();
  }, [principals, refreshFlag]);

  const getData = param => {
    if (loading) return;

    if (_.get(param, 'pageIndex')) {
      setPageIndex(param.pageIndex);
    }

    setLoading(true);
    delegationAjax
      .getListByCompanyId({
        companyId: projectId,
        keyword: '',
        pageIndex: _.get(param, 'pageIndex') || pageIndex,
        pageSize: PAGE_SIZE,
        principals: principals,
      })
      .then(res => {
        setData(res);
        setLoading(false);
      });
  };

  const onClickOp = (opType, item) => {
    setShowMenu(false);

    if (opType === 1) {
      onEdit(item);
      return;
    }

    delegationAjax
      .update(
        _.assign({}, _.pick(item, ['companyId', 'endDate', 'id', 'startDate']), {
          principal: _.get(item, 'principal.accountId'),
          trustee: _.get(item, 'trustee.accountId'),
          apkIds: (item.apks || []).map(l => l.id),
          status: 0,
        }),
      )
      .then(res => {
        if (res) {
          alert(_l('结束委托'));
          getData();
        }
      });
  };

  const onChange = (pagination, filters, sorter) => {
    if (_.isEmpty(data)) return;

    if (!_.isEmpty(sorter)) {
      setData({
        count: data.count,
        list: data.list.sort((a, b) =>
          sorter.order === 'descend'
            ? new Date(b.createDate) - new Date(a.createDate)
            : new Date(a.createDate) - new Date(b.createDate),
        ),
      });
    }
  };

  return (
    <TableWrap>
      <PageTableCon
        className=""
        tableSetting={{
          showSorterTooltip: false,
        }}
        loading={loading}
        columns={columns}
        dataSource={_.get(data, 'list') || []}
        count={_.get(data, 'count')}
        getDataSource={getData}
        hideMoreActionTitle={true}
        moreAction={true}
        fixedShowCols={false}
        paginationInfo={{ pageIndex, pageSize: PAGE_SIZE }}
        onChange={onChange}
        moreActionContent={record => (
          <Trigger
            popupVisible={showMenu === record.id}
            onPopupVisibleChange={visible => setShowMenu(visible ? record.id : false)}
            action={['click']}
            popup={() => {
              return (
                <Menu style={{ left: 'initial', right: 0, width: 138, position: 'static' }}>
                  {OPTIONS.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => onClickOp(item.key, record)}
                      style={{ height: 44, lineHeight: '44px' }}
                    >
                      <div className="h100">{item.label}</div>
                    </MenuItem>
                  ))}
                </Menu>
              );
            }}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [0, 10],
              overflow: { adjustX: true, adjustY: true },
            }}
          >
            <Icon icon="moreop" className="Gray_bd Font18 Hover_49 Hand TxtMiddle actionIcon" />
          </Trigger>
        )}
      />
    </TableWrap>
  );
}

export default DeputeTable;
