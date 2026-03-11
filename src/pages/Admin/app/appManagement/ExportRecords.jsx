import React, { Fragment, useCallback, useEffect, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, UserHead, UserName } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import SearchApp from 'src/pages/Admin/components/SearchApp';
import SelectUser from 'src/pages/Admin/components/SelectUser';
import { dateConvertToUserZone } from 'src/utils/project';
import AppDisplay from './modules/AppDisplay';

const SearchWrap = styled.div`
  margin-bottom: 20px;
  .w180 {
    width: 180px;
  }
`;

const TableColumn = styled(PageTableCon)`
  .showVisibilityIcon {
    visibility: hidden;
    color: var(--color-text-tertiary);
  }
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    .showVisibilityIcon {
      visibility: visible;
    }
  }
`;

const PAGE_SIZE = 50;

export default function ExportRecords({ projectId, type }) {
  const [{ pageIndex, loading, list, total, userInfo, appId }, setState] = useSetState({
    pageIndex: 1,
    loading: false,
    list: [],
    total: 0,
    userInfo: [],
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
      const finalPageIndex = params.pageIndex || pageIndex;

      promiseRef.current = appManagementAjax.getExportsByProject({
        projectId,
        appIds: finalAppId ? [finalAppId] : [],
        operator: finalUserInfo.length ? finalUserInfo[0].accountId : '',
        pageIndex: finalPageIndex,
        pageSize: PAGE_SIZE,
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

  const getPassword = useCallback((record, passwordType) => {
    appManagementAjax
      .getExportPassword({
        appId: record?.apps?.[0]?.appId,
        id: record.id,
        passwordType: passwordType === 'exportPassword' ? 0 : 1,
      })
      .then(password => {
        setState(prevState => ({
          list: prevState.list.map(item => {
            if (item.id === record.id) {
              return {
                ...item,
                [passwordType]: password,
                [`show_${passwordType}`]: true,
              };
            }
            return item;
          }),
        }));
      })
      .catch(() => {});
  }, []);

  const checkPassword = useCallback(
    (record, passwordType) => {
      const hasPassword = passwordType === 'exportPassword' ? record.hasExportPassword : record.hasLockPassword;
      const showPassword = record[`show_${passwordType}`];
      const password = record[passwordType];

      if (!hasPassword) return;

      if (password) {
        setState(prevState => ({
          list: prevState.list.map(item => {
            if (item.id === record.id) {
              return {
                ...item,
                [`show_${passwordType}`]: !showPassword,
              };
            }
            return item;
          }),
        }));
      } else {
        getPassword(record, passwordType);
      }
    },
    [getPassword],
  );

  const renderPassword = useCallback(
    (record, passwordType) => {
      const hasPassword = passwordType === 'exportPassword' ? record.hasExportPassword : record.hasLockPassword;
      const showPassword = record[`show_${passwordType}`];
      const password = record[passwordType];

      if (!hasPassword) {
        return null;
      }

      return (
        <span
          className={cx('Hand', { hoverColorPrimary: !showPassword })}
          onClick={() => checkPassword(record, passwordType)}
        >
          {showPassword ? password : '******'}
          {hasPassword && (
            <Icon
              icon={showPassword ? 'visibility_off' : 'visibility'}
              className="showVisibilityIcon Font14 mLeft5 Hand"
              onClick={e => {
                e.stopPropagation();
                checkPassword(record, passwordType);
              }}
            />
          )}
        </span>
      );
    },
    [checkPassword],
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
        title: _l('操作人'),
        dataIndex: 'operator',
        width: 160,
        render: operator => {
          const { accountId, fullname, avatarSmall } = operator;
          return (
            <div className="flexRow alignItemsCenter">
              <UserHead
                className="circle"
                user={{
                  userHead: avatarSmall,
                  accountId: accountId,
                }}
                size={24}
                projectId={projectId}
              />
              <UserName
                className="textPrimary Font13 pLeft5 pRight10 pTop3 flex ellipsis"
                projectId={projectId}
                user={{
                  userName: fullname,
                  accountId: accountId,
                }}
              />
            </div>
          );
        },
      },
      {
        title: _l('导出时间'),
        dataIndex: 'createTime',
        width: 180,
        ellipsis: true,
        render: createTime => {
          return <div>{createTime ? dateConvertToUserZone(createTime) : '-'}</div>;
        },
      },
      {
        title: _l('导出密码'),
        dataIndex: 'exportPassword',
        width: 150,
        ellipsis: true,
        render: (text, record) => renderPassword(record, 'exportPassword'),
      },
      {
        title: _l('应用锁密码'),
        dataIndex: 'lockPassword',
        width: 150,
        ellipsis: true,
        render: (text, record) => renderPassword(record, 'lockPassword'),
      },
      {
        title: '',
        dataIndex: 'downLoadUrl',
        width: 100,
        render: downLoadUrl => {
          return downLoadUrl ? (
            <a href={downLoadUrl} target="_blank" rel="noopener noreferrer" className="ThemeColor3">
              {_l('下载')}
            </a>
          ) : (
            <span className="textTertiary">{_l('下载')}</span>
          );
        },
      },
    ],
    [projectId, type],
  );

  useEffect(() => {
    getDataList({ userInfo, appId });
  }, [projectId, appId, userInfo]);

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
            unique
            userInfo={userInfo}
            isAdmin
            changeData={data => setState({ userInfo: data, pageIndex: 1 })}
          />
        </SearchWrap>
        <div className="flex minHeight0">
          <TableColumn
            className="flex"
            paginationInfo={{ pageIndex, pageSize: PAGE_SIZE }}
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
