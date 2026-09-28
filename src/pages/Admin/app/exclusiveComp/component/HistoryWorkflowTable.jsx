import React, { useMemo } from 'react';
import moment from 'moment';
import { UserHead } from 'ming-ui';
import { ConfigProvider, Empty } from 'ming-ui/antd-components';
import { Table } from 'src/ming-ui/antd-components/AsyncAntd';
import { START_APP_TYPE } from 'src/pages/workflow/WorkflowList/utils';
import { navigateTo } from 'src/router/navigation/navigateTo';
import IsAppAdmin from '../../../components/IsAppAdmin';

const renderEmpty = () => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={_l('暂无数据')} />;

export const getHistoryWorkflowColumns = ({ projectId }) => [
  {
    title: _l('工作流'),
    dataIndex: 'id',
    render: (value, record) => {
      const workflowType = START_APP_TYPE[record.startAppType] || {};

      return (
        <div className="workfloeRowName flexRow alignItemsCenter">
          <IsAppAdmin
            className="workflowCheckWrap"
            appId={record.app ? record.app.id : undefined}
            desc={record.app ? record.app.name : undefined}
            appName={record.name}
            defaultIcon={workflowType.iconName}
            iconColor={workflowType.iconColor}
            createType={2}
            ckeckSuccessCb={() => navigateTo(`/workflowedit/${value}`)}
          />
        </div>
      );
    },
  },
  {
    title: _l('类型'),
    dataIndex: 'startAppType',
    width: 150,
    render: value => (START_APP_TYPE[value] || {}).text,
  },
  {
    title: _l('添加时间'),
    dataIndex: 'addedTime',
    width: 300,
    render: value => (value ? moment(value).format(_l('YYYY-MM-DD HH:mm')) : '_'),
  },
  {
    title: _l('添加人'),
    dataIndex: 'addedBy',
    width: 300,
    render: value => {
      const addedBy = value || {};

      return (
        <div className="flexRow textSecondary minWidth0">
          <UserHead size={28} user={{ userHead: addedBy.avatar, accountId: addedBy.accountId }} projectId={projectId} />
          <div className="mLeft12 ellipsis flex minWidth0 LineHeight28">{addedBy.fullName}</div>
        </div>
      );
    },
  },
];

export default function HistoryWorkflowTable({ loading, list, projectId }) {
  const columns = useMemo(() => getHistoryWorkflowColumns({ projectId }), [projectId]);

  return (
    <ConfigProvider renderEmpty={renderEmpty}>
      <Table
        loading={loading}
        className="workflowTable"
        rowClassName="workflowTableTitleRow"
        columns={columns}
        dataSource={list}
        rowKey={record => record.id}
        pagination={false}
      />
    </ConfigProvider>
  );
}
