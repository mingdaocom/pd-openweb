import React, { Fragment, useEffect, useMemo } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Dialog, LoadDiv, UserHead, VerifyPasswordConfirm } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import CustomTableCom from 'src/pages/Admin/components/CustomTableCom';
import SelectUser from 'src/pages/Admin/components/SelectUser';
import { downloadFile } from 'src/pages/Admin/util';
import { getRequest } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';

const DialogWrap = styled(Dialog)`
  .mui-dialog-body {
    min-height: 0;
    overflow: hidden !important;
  }
`;

const DialogContent = styled.div`
  font-size: 13px;
  height: calc(100vh - 150px);
  .description {
    width: 100%;
    padding: 10px 16px;
    background: rgba(33, 150, 243, 0.05);
    border-radius: 4px;
    font-weight: 600;
    margin: 20px 0;
    border-radius: 3px;
  }
  .minWidth120 {
    min-width: 200px;
  }
  .w200 {
    width: 200px;
  }
  .width150 {
    width: 150px;
  }
`;

export default function ViewInactive({ projectId }) {
  const [
    {
      users,
      dayRange,
      pageIndex,
      orderBy,
      loading,
      inactiveDialogVisible,
      totalCount,
      isFirstInactiveUsers,
      queryDate,
      exportLoading,
      defaultSorter,
      userInfo,
    },
    setState,
  ] = useSetState({
    users: [],
    dayRange: 0,
    pageIndex: 1,
    pageSize: 10,
    orderBy: 11,
    inactiveDialogVisible: false,
    totalCount: 0,
    isFirstInactiveUsers: false,
    queryDate: undefined,
    exportLoading: false,
    defaultSorter: { sortFiled: 'lastUseAppTime', order: 'desc' },
    userInfo: [],
  });

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'user',
        title: _l('姓名'),
        className: 'flex minWidth120 pLeft10 pRight5',
        render: item => {
          const { headImageUrl, name, accountId } = item;

          return (
            <div className="flexRow userInfo alignItemsCenter">
              <UserHead
                className="circle"
                user={{ userHead: headImageUrl, accountId }}
                size={32}
                projectId={projectId}
              />
              <span className="mLeft10 overflow_ellipsis">{name || ''}</span>
            </div>
          );
        },
      },
      {
        dataIndex: 'department',
        title: _l('部门'),
        className: 'flex pRight8 overflowHidden pRight5',
        render: item => {
          const { departments = [] } = item;
          return (
            <div className="ellipsis">
              <Tooltip placement="bottom" title={departments.map(it => it).join(';')} mouseEnterDelay={0.5}>
                <span className="ellipsis InlineBlock wMax100 space">{departments.map(it => it).join(';')}</span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        dataIndex: 'job',
        title: _l('职位'),
        className: 'width150 pRight5',
        render: item => {
          const { jobs = [] } = item;
          return (
            <div className="ellipsis">
              <Tooltip placement="bottom" title={jobs.map(it => it).join(';')} mouseEnterDelay={0.5}>
                <span className="ellipsis InlineBlock wMax100 space">{jobs.map(it => it).join(';')}</span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        dataIndex: 'lastUseAppTime',
        title: _l('最后使用应用时间'),
        className: 'width150',
        sorter: true,
      },
      {
        dataIndex: 'lastLoginTime',
        title: _l('最后登录平台时间'),
        className: 'width150',
        sorter: true,
      },
    ];
  }, []);

  const getIsFirstInactiveUsers = () => {
    appManagementAjax
      .isFirstInactiveUsers({
        projectId,
        toViewUrl: `${md.global.Config.WebUrl}admin/analytics/${projectId}/byUser?inactive=true`,
      })
      .then(res => {
        setState({ isFirstInactiveUsers: res });
      });
  };

  const queryInactiveUsers = () => {
    appManagementAjax
      .queryInactiveUsers({
        projectId,
        toViewUrl: `${md.global.Config.WebUrl}admin/analytics/${projectId}/byUser?inactive=true`,
      })
      .then(({ queryStatus }) => {
        if (queryStatus === 2) {
          alert(_l('每天仅可查询执行一次，已有用户点击查询执行，请明日重试！'), 3);
        } else {
          setState({ pageIndex: 1, dayRange: 0 });
        }
      });
  };

  const getInactiveUsers = (params = {}) => {
    setState({ loading: true });
    appManagementAjax
      .pagedInactiveUsers({
        projectId,
        dayRange: !_.isUndefined(params?.dayRange) ? params?.dayRange : dayRange,
        pageIndex: params?.pageIndex || pageIndex,
        pageSize: 50,
        orderBy,
        userIds: params?.userIds || userInfo.map(item => item.accountId),
      })
      .then(({ queryStatus, users = [], totalCount, queryDate }) => {
        setState({ queryStatus, users, totalCount, loading: false, isFirstInactiveUsers: false, queryDate });
      })
      .catch(() => {
        setState({ loading: false, queryStatus: 0, users: [], totalCount: 0 });
      });
  };

  const handleExport = () => {
    if (exportLoading || loading) return;

    setState({ exportLoading: true });
    VerifyPasswordConfirm.confirm({
      allowNoVerify: false,
      isRequired: false,
      closeImageValidation: false,
      onOk: () => {
        const url = `${md.global.Config.AjaxApiUrl}download/exportInactiveUsers`;
        let projectName = getCurrentProject(projectId, true).companyName;
        let date = moment().format('YYYYMMDDHHmmss');
        const fileName = `${projectName}_${_l('非活跃成员')}_${date}` + '.xlsx';

        downloadFile({
          url,
          params: {
            projectId,
            dayRange,
            orderBy,
            userIds: userInfo.map(item => item.accountId),
          },
          exportFileName: fileName,
          callback: () => {
            setState({ exportLoading: false });
          },
        });
      },
      onCancel: () => {
        setState({ exportLoading: false });
      },
    });
  };

  useEffect(() => {
    if (!inactiveDialogVisible) return;
    getInactiveUsers();
  }, [inactiveDialogVisible, dayRange, pageIndex, orderBy]);

  useEffect(() => {
    getIsFirstInactiveUsers();
    const { inactive } = getRequest();
    if (inactive) {
      setState({ inactiveDialogVisible: true });
    }
  }, []);

  const renderConfirmDialog = () => {
    Dialog.confirm({
      title: _l('查询非活跃成员'),
      description: (
        <span>
          {_l('查询最近 7 天，组织中未发生应用访问、记录创建或附件上传的成员，每天仅可')}
          <span className="bold">{_l('查询执行')}</span>
          {_l('一次')}
        </span>
      ),
      okText: _l('查询'),
      onOk: queryInactiveUsers,
    });
  };

  useEffect(() => {
    if (!inactiveDialogVisible) {
      setState({
        pageIndex: 1,
        dayRange: 0,
        orderBy: 11,
        totalCount: 0,
        queryDate: undefined,
      });
    }
  }, [inactiveDialogVisible]);

  return (
    <Fragment>
      <div
        className="colorPrimary Hand"
        onClick={() => (isFirstInactiveUsers ? renderConfirmDialog() : setState({ inactiveDialogVisible: true }))}
      >
        {_l('查询非活跃成员')}
      </div>

      <DialogWrap
        width={1000}
        visible={inactiveDialogVisible}
        title={
          <div className="flexRow alignItemsCenter pRight10">
            <div className="">{_l('查询非活跃成员')}</div>
            <div className="flex"></div>
            <div className="colorPrimary Hand Font14 Normal" onClick={renderConfirmDialog}>
              {_l('重新查询')}
            </div>
            <Button
              type="primary"
              className="mLeft30 pLeft24 pRight24 minWidth0"
              disabled={exportLoading || loading}
              onClick={handleExport}
            >
              {_l('导出')}
            </Button>
          </div>
        }
        footer={null}
        onCancel={() => setState({ inactiveDialogVisible: false, userInfo: [], pageIndex: 1, dayRange: 0 })}
      >
        <DialogContent className="h100 flexColumn">
          <div className="flexRow alignItemsCenter">
            <div>{_l('查询时间')}</div>
            <Select
              className="mLeft16 mRight16 w200"
              value={dayRange}
              options={[
                { label: _l('最近7天'), value: 0 },
                { label: _l('最近30天'), value: 1 },
                { label: _l('最近90天'), value: 2 },
                { label: _l('最近半年'), value: 3 },
                { label: _l('最近1年'), value: 4 },
              ]}
              onChange={value => setState({ dayRange: value, pageIndex: 1 })}
            />
            <SelectUser
              className="userSelect mdAntSelect"
              style={{ width: '200px' }}
              projectId={projectId}
              userInfo={userInfo}
              placeholder={_l('搜索成员')}
              maxCount={100}
              isAdmin
              changeData={data => {
                setState({ userInfo: data, pageIndex: 1 });
                getInactiveUsers({ userIds: data.map(item => item.accountId), pageIndex: 1 });
              }}
            />
            <div className="flex"></div>
            <div className="textSecondary">{_l('当前列表为 %0 之前的数据', queryDate)}</div>
          </div>
          <div className="description">
            {_.includes([0, 1, 2], dayRange)
              ? _l('最近 %0 天，', dayRange === 0 ? 7 : dayRange === 1 ? 30 : 90)
              : dayRange === 3
                ? _l('最近半年，')
                : _l('最近 1 年，')}
            {_l('组织中未发生应用访问、记录创建或附件上传的成员')}
          </div>
          {loading ? (
            <div className="flex mHeigh0 flexRow alignItemsCenter justifyCenter">
              <LoadDiv />
            </div>
          ) : (
            <CustomTableCom
              className="flex mHeigh0"
              dataSource={users}
              columns={columns}
              loading={loading}
              defaultSorter={defaultSorter}
              dealSorter={({ sortFiled, order }) => {
                setState({
                  pageIndex: 1,
                  defaultSorter: { sortFiled, order },
                  orderBy:
                    sortFiled === 'lastUseAppTime'
                      ? order === 'desc'
                        ? 11
                        : 10
                      : sortFiled === 'lastLoginTime'
                        ? order === 'desc'
                          ? 21
                          : 20
                        : '',
                });
              }}
              total={totalCount}
              pageIndex={pageIndex}
              changePage={pageIndex => setState({ pageIndex })}
            />
          )}
        </DialogContent>
      </DialogWrap>
    </Fragment>
  );
}
