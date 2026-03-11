import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, UserHead, UserName } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import SearchApp from 'src/pages/Admin/components/SearchApp';
import SelectUser from 'src/pages/Admin/components/SelectUser';
import { dateConvertToUserZone } from 'src/utils/project';
import AppDisplay from './modules/AppDisplay';

const STATUS = [
  { text: _l('全部状态'), value: '' },
  { text: _l('进行中'), value: 1 },
  { text: _l('完成'), value: 0 },
  { text: _l('失败'), value: 2 },
];
const PAGE_SIZE = 50;

const SearchWrap = styled.div`
  margin-bottom: 20px;
  .w180 {
    width: 180px;
  }
`;

export default function UpgradeRecords({ projectId, type }) {
  const [{ pageIndex, pageSize, loading, list, total, userInfo, appId, status }, setState] = useSetState({
    pageIndex: 1,
    pageSize: 50,
    loading: false,
    list: [],
    total: 0,
    userInfo: [],
    appId: '',
    status: '',
  });
  const promiseRef = useRef(null);

  const getDataList = useCallback(
    (params = {}) => {
      if (promiseRef.current && promiseRef.current.abort) {
        promiseRef.current.abort();
      }

      setState({ loading: true });

      const finalAppId = params.appId || appId;
      const finalUserInfo = params.userInfo || userInfo;
      const finalStatus = !_.isUndefined(params.status) ? params.status : status;
      const finalPageIndex = params.pageIndex || pageIndex;

      promiseRef.current = appManagementAjax.getUpgradeLogsByProject({
        projectId,
        appIds: finalAppId ? [finalAppId] : [],
        operator: finalUserInfo.length ? finalUserInfo[0].accountId : '',
        pageIndex: finalPageIndex,
        pageSize: PAGE_SIZE,
        status: finalStatus,
      });

      promiseRef.current
        .then(({ records = [], total }) => {
          setState({ list: records, total, loading: false, pageIndex: finalPageIndex });
        })
        .catch(() => {
          setState({ loading: false });
        });
    },
    [projectId],
  );

  const columns = useMemo(
    () => [
      {
        title: _l('应用'),
        dataIndex: 'apps',
        ellipsis: true,
        render: apps => {
          return <AppDisplay apps={apps} />;
        },
      },
      {
        title: _l('状态'),
        width: 100,
        dataIndex: 'status',
        ellipsis: true,
        render: status => {
          return <span>{_.find(STATUS, { value: status })?.text}</span>;
        },
      },
      {
        title: _l('操作人'),
        dataIndex: 'creater',
        width: 160,
        render: creator => {
          const { accountId, fullName, avatar } = creator;
          return (
            <div className="flexRow alignItemsCenter">
              <UserHead
                className="circle"
                user={{
                  userHead: avatar,
                  accountId: accountId,
                }}
                size={24}
                projectId={projectId}
              />
              <UserName
                className="textPrimary Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                projectId={projectId}
                user={{
                  userName: fullName,
                  accountId: accountId,
                }}
              />
            </div>
          );
        },
      },
      {
        title: _l('操作时间'),
        dataIndex: 'createTime',
        width: 180,
        ellipsis: true,
        render: createTime => {
          return <div>{createTime ? dateConvertToUserZone(createTime) : '-'}</div>;
        },
      },
    ],
    [projectId, type],
  );

  useEffect(() => {
    getDataList({ appId, userInfo, status });
  }, [appId, userInfo, status]);

  return (
    <Fragment>
      <div className="orgManagementContent flexColumn">
        <SearchWrap className="searchWrap flexRow">
          <SearchApp
            className="w180"
            projectId={projectId}
            onChange={value => setState({ appId: value, pageIndex: 1 })}
          />
          <SelectUser
            className="mdAntSelect w180 mLeft15"
            placeholder={_l('搜索操作者')}
            projectId={projectId}
            userInfo={userInfo}
            isAdmin
            changeData={data => setState({ userInfo: data, pageIndex: 1 })}
          />
          <Dropdown
            className="w180 mLeft15"
            placeholder={_l('全部状态')}
            data={STATUS}
            value={status}
            border
            onChange={value => setState({ status: value, pageIndex: 1 })}
          />
        </SearchWrap>
        <div className="flex minHeight0">
          <PageTableCon
            className="flex"
            paginationInfo={{ pageIndex, pageSize }}
            loading={loading}
            columns={columns}
            dataSource={list}
            count={total}
            getDataSource={getDataList}
          />
        </div>
      </div>
    </Fragment>
  );
}
