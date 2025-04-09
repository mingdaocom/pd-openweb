import React, { useState, Fragment } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Icon, Button } from 'ming-ui';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import SelectUser from 'src/pages/Admin/components/SelectUser/index';
import DelegationTable from './component/DelegationTable';
import TodoEntrustModal from 'src/pages/workflow/MyProcess/TodoEntrust/TodoEntrustModal';

const ActionWrap = styled.div`
  justify-content: space-between;
  .searchUser {
    width: 200px;
  }
  .addBtn {
    padding: 0 26px !important;
  }
`;

function DelegationManage(props) {
  const projectId = _.get(props, 'match.params.projectId');

  const [searchUser, setSearchUser] = useState([]);
  const [addModal, setAddModal] = useState({ visible: false, data: null });
  const [refreshFlag, setRefreshFlag] = useState(true);

  const onEdit = value => {
    setAddModal({
      visible: true,
      data: {
        ...value,
        startDate: value.startDate ? moment(value.startDate) : undefined,
        endDate: moment(value.endDate),
      },
    });
  };

  const onSearch = data => setSearchUser(data.map(l => l.accountId));

  const renderActionWrap = () => {
    return (
      <ActionWrap className="valignWrapper mBottom8">
        <SelectUser
          isAdmin
          className="searchUser"
          placeholder={_l('搜索委托人')}
          projectId={projectId}
          userInfo={[]}
          changeData={onSearch}
        />
        <Button type="primary" radius className="addBtn" onClick={() => setAddModal({ visible: true, data: null })}>
          <Icon icon="add" />
          <span className="mLeft4">{_l('委托')}</span>
        </Button>
      </ActionWrap>
    );
  };

  return (
    <Fragment>
      <div className="orgManagementWrap flex flexColumn deputeManageContent">
        <AdminTitle prefix={_l('待办委托')} />

        <div className="orgManagementHeader flexRow Font17 bold">{_l('待办委托')}</div>
        <div className="orgManagementContent">
          {renderActionWrap()}
          <DelegationTable projectId={projectId} principals={searchUser} refreshFlag={refreshFlag} onEdit={onEdit} />
        </div>
      </div>
      {addModal.visible && (
        <TodoEntrustModal
          type={2}
          editEntrustData={addModal.data}
          companyId={projectId}
          setTodoEntrustModalVisible={() => setAddModal({ visible: false, data: null })}
          onUpdate={() => setRefreshFlag(!refreshFlag)}
        />
      )}
    </Fragment>
  );
}

export default DelegationManage;
