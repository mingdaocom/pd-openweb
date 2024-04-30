import React, { Fragment, useState, useEffect } from 'react';
import { Icon, Dialog, UserHead } from 'ming-ui';
import { Button, Table, Input } from 'antd';
import styled from 'styled-components';
import privatePlatformAdminApi from 'src/api/privatePlatformAdmin';
import { useClientRect } from '../common';
import { dialogSelectUser } from 'ming-ui/functions';
import _ from 'lodash';

const Wrap = styled.div`
  .ant-table-thead th {
    color: #757575;
    background: #fff;
  }
  .headerOperate {
    justify-content: space-between;
    .icon-search {
      right: 10px;
    }
    .ant-input {
      padding-right: 30px;
    }
  }
  .tableWrapper {
    min-height: 0;
  }
`;

const columns = [
  {
    title: _l('姓名'),
    dataIndex: 'fullname',
    key: 'fullname',
    render: (_, data) => {
      return (
        <div className="flexRow valignWrapper">
          <UserHead
            key={data.accountId}
            size={32}
            user={{
              accountId: data.accountId,
              userHead: data.avatar,
            }}
          />
          <div className="mLeft10">{data.fullname}</div>
        </div>
      );
    },
  },
  {
    title: _l('手机'),
    dataIndex: 'mobilePhone',
    key: 'mobilePhone',
  },
  {
    title: _l('邮箱'),
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: _l('操作'),
    dataIndex: 'operate',
    key: 'operate',
    render: () => {
      return <a className="removeUser">{_l('移除')}</a>;
    },
  },
];

const Admin = props => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [total, setTotal] = useState(0);
  const [keywords, setKeywords] = useState('');
  const [rect, ref] = useClientRect();
  const pageSize = 10;
  const tableHeight = _.get(rect, 'height');

  const handleAddUser = () => {
    dialogSelectUser({
      fromType: 0,
      sourceId: md.global.Account.accountId,
      showMoreInvite: false,
      SelectUserSettings: {
        filterAccountIds: list.map(u => u.accountId),
        callback: users => {
          privatePlatformAdminApi
            .addPlatformAdmins({
              accountIds: users.map(u => u.accountId),
            })
            .then(data => {
              data && getPlatformAdmins();
            });
        },
      },
    });
  };

  const handleRemoveUser = user => {
    Dialog.confirm({
      title: _l('确定移除%0 ?', user.fullname),
      onOk: () => {
        privatePlatformAdminApi
          .removePlatformAdmins({
            accountIds: [user.accountId],
          })
          .then(data => {
            data && getPlatformAdmins();
          });
      },
    });
  };

  const getPlatformAdmins = () => {
    setLoading(true);
    privatePlatformAdminApi
      .getPlatformAdmins({
        pageIndex,
        pageSize,
        keywords,
      })
      .then(data => {
        const { count, list } = data;
        setLoading(false);
        setList(list);
        setTotal(count);
      });
  };

  useEffect(
    () => {
      getPlatformAdmins();
    },
    [pageIndex, keywords],
  );

  return (
    <Wrap className="privateCardWrap big h100 flexColumn">
      <div className="Font17 bold mBottom8">{_l('管理员')}</div>
      <div className="Gray_9e mBottom18">
        {_l('平台管理员账号管理，可从管理员所属组织中直接添加管理员成员，也可移除成员')}
      </div>
      <div className="flexRow valignWrapper headerOperate">
        <Button type="primary" onClick={handleAddUser}>
          <Icon icon="add" />
          {_l('管理员')}
        </Button>
        <div className="flexRow valignWrapper searchWrapper Relative">
          <Input
            placeholder={_l('请输入姓名')}
            defaultValue=""
            onKeyDown={event => {
              if (event.which === 13) {
                setKeywords(event.target.value.trim());
                setPageIndex(1);
              }
            }}
          />
          <Icon className="Absolute Gray_9e Font17" icon="search" />
        </div>
      </div>
      <div className="flexColumn flex mTop20 tableWrapper" ref={ref}>
        <Table
          loading={loading}
          columns={columns}
          dataSource={list}
          locale={{
            emptyText: _l('暂无数据'),
          }}
          pagination={{
            position: ['none', 'bottomCenter'],
            pageSize,
            total,
            onChange: page => {
              setPageIndex(page);
            },
          }}
          scroll={{
            scrollToFirstRowOnChange: false,
            y: `${tableHeight > 500 ? tableHeight - 130 : 500}px`,
          }}
          onRow={record => {
            return {
              onClick: e => {
                const { target } = e;
                if (target.classList.contains('removeUser')) {
                  handleRemoveUser(record);
                }
              },
            };
          }}
        />
      </div>
    </Wrap>
  );
};

export default Admin;
