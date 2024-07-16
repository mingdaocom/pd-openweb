import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Drawer } from 'antd';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';

const AuthListDrawer = styled(Drawer)`
  color: #333;
  .ant-drawer-mask {
    background-color: transparent;
  }
  .ant-drawer-content-wrapper {
    box-shadow: 0px 3px 24px 1px rgba(0, 0, 0, 0.16);
  }
  .ant-drawer-header {
    border-bottom: 0;
    padding: 24px;
    .ant-drawer-header-title {
      flex-direction: row-reverse;
      .ant-drawer-title {
        font-size: 17px;
        font-weight: 600;
      }
      .ant-drawer-close {
        padding: 0;
        margin-right: 0;
        margin-top: -20px;
      }
    }
  }
  .ant-drawer-body {
    padding: 0px;
    display: flex;
    flex-direction: column;

    .empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .iconCon {
        width: 130px;
        height: 130px;
        text-align: center;
        background: #f5f5f5;
        border-radius: 50%;
        color: #c2c3c3;
        i {
          line-height: 130px;
        }
      }
    }
  }
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 12px;
  margin: 0 24px;
  border-bottom: 1px solid #e0e0e0;
  &.titleItem {
    padding: 12px;
    color: #757575;
  }
  &:not(.titleItem):hover {
    background: #f5f5f5;
  }
  .applyUser,
  .name,
  .apps {
    flex: 3;
    width: 0;
  }
  .createdDate {
    flex: 4;
  }
  .status,
  .operate {
    flex: 2;
  }

  .reject {
    color: #f44336;
  }
  .agree {
    color: #4caf50;
  }
  .reviewing {
    color: #2196f3;
  }
`;

export default function AuthorizationList(props) {
  const { hasManageAuth, companyId, onClose, onApproveSuccess } = props;
  const [fetchState, setFetchState] = useSetState({ loading: true, pageIndex: 1, noMore: false });
  const [authorizationList, setAuthorizationList] = useState([]);
  const statusObj = {
    0: { color: 'reject', text: _l('已拒绝') },
    1: { color: 'reviewing', text: _l('待审核') },
    3: { color: 'agree', text: _l('已同意') },
  };

  useEffect(() => {
    onFetchList();
  }, [fetchState.loading, fetchState.pageIndex]);

  const onFetchList = () => {
    if (!fetchState.loading) {
      return;
    }
    packageVersionAjax
      .getAuthorizationList(
        {
          companyId,
          isOwner: !hasManageAuth,
          pageIndex: fetchState.pageIndex,
          pageSize: 50,
          status: [0, 1, 3],
        },
        { isIntegration: true },
      )
      .then(res => {
        if (res) {
          setAuthorizationList(fetchState.pageIndex > 1 ? authorizationList.concat(res) : res);
          setFetchState({ loading: false, noMore: res.length < 50 });
        }
      });
  };

  const onUpdateStatus = (id, status) => {
    packageVersionAjax.updateAuthorizeStatus({ id, status }, { isIntegration: true }).then(res => {
      if (res) {
        alert(status === 3 ? _l('同意使用') : _l('拒绝使用'));
        const newList = authorizationList.map(item => {
          return item.id === id ? { ...item, status } : item;
        });
        setAuthorizationList(newList);
        onApproveSuccess();
      }
    });
  };

  const onScrollEnd = () => {
    if (!fetchState.loading && !fetchState.noMore) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  const columns = [
    {
      dataIndex: 'applyUser',
      title: _l('申请人'),
      render: item => (
        <div className="flexRow alignItemsCenter">
          <img src={(item.ownerAccount || {}).avatar} width={24} height={24} className="circle" />
          <span className="mLeft10 ellipsis" title={(item.ownerAccount || {}).fullName}>
            {(item.ownerAccount || {}).fullName}
          </span>
        </div>
      ),
    },
    {
      dataIndex: 'name',
      title: _l('名称'),
      render: item => (
        <div className="ellipsis" title={item.name}>
          {item.name}
        </div>
      ),
    },
    {
      dataIndex: 'apps',
      title: _l('授权应用'),
      render: item => (
        <div className="ellipsis" title={(item.apks || []).map(app => app.name).join(', ')}>
          {(item.apks || []).map(app => app.name).join(', ')}
        </div>
      ),
    },
    { dataIndex: 'createdDate', title: _l('申请时间') },
    {
      dataIndex: 'status',
      title: _l('状态'),
      render: item => (
        <span className={(statusObj[item.status] || {}).color}>{(statusObj[item.status] || {}).text}</span>
      ),
    },
    {
      dataIndex: 'operate',
      title: _l('操作'),
      render: item =>
        item.status === 1 ? (
          <div>
            <span className="agree pointer" onClick={() => onUpdateStatus(item.id, 3)}>
              {_l('同意')}
            </span>
            <span className="mLeft16 reject pointer" onClick={() => onUpdateStatus(item.id, 0)}>
              {_l('拒绝')}
            </span>
          </div>
        ) : null,
    },
  ];

  return (
    <AuthListDrawer
      visible
      title={_l('API 申请使用审核')}
      width={840}
      placement="right"
      closeIcon={<i className="icon-close Font18" />}
      onClose={onClose}
    >
      <ListItem className="titleItem">
        {columns
          .filter(item => hasManageAuth || !_.includes(['applyUser', 'operate'], item.dataIndex))
          .map((item, index) => {
            return (
              <div key={index} className={item.dataIndex}>
                {item.title}
              </div>
            );
          })}
      </ListItem>

      {fetchState.loading && fetchState.pageIndex === 1 ? (
        <LoadDiv className="mTop10" />
      ) : authorizationList.length ? (
        <ScrollView className="flex" onScrollEnd={onScrollEnd}>
          {authorizationList.map((dataItem, i) => {
            return (
              <ListItem>
                {columns
                  .filter(item => hasManageAuth || !_.includes(['applyUser', 'operate'], item.dataIndex))
                  .map((item, j) => {
                    return (
                      <div key={`${i}-${j}`} className={item.dataIndex}>
                        {item.render ? item.render(dataItem) : dataItem[item.dataIndex]}
                      </div>
                    );
                  })}
              </ListItem>
            );
          })}
        </ScrollView>
      ) : (
        <div className="empty">
          <div className="iconCon">
            <Icon icon="connect" className="Font64" />
          </div>
          <div className="mTop24 Font16 Gray_9e">{_l('暂无使用申请')}</div>
        </div>
      )}
    </AuthListDrawer>
  );
}
