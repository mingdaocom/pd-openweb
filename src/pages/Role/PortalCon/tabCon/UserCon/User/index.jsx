import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import Table from 'src/pages/Role/component/Table';
import AddUserByTelDialog from 'src/pages/Role/PortalCon/components/AddUserByTelDialog';
import AddUserDialog from 'src/pages/Role/PortalCon/components/AddUserDialog';
import ChangeRoleDialog from 'src/pages/Role/PortalCon/components/ChangeRoleDialog';
import UserInfoWrap from 'src/pages/Role/PortalCon/components/UserInfoWrap';
import { pageSizeForPortal } from 'src/pages/Role/PortalCon/tabCon/config';
import { formatDataForPortalControl, formatPortalData } from 'src/pages/Role/PortalCon/tabCon/util';
import * as actions from '../../../redux/actions';
import HeaderCon from './Header';
import { Wrap } from './style';
import { getColumns, getColumnsShowControls } from './util';

function User(props) {
  const {
    portal = {},
    setControls,
    updateListByStatus,
    activateExAccounts,
    appId,
    changePageIndex,
    getList,
    getCount,
    setKeyWords,
    setFilter,
    updateListByRoleid,
    setHideIds,
    setFastFilters,
    setBaseInfo,
    setSortControls,
    handleChangeSort,
    setTelFilters,
    commonCount,
    portalSetModel,
  } = props;
  const {
    roleList = [],
    controls = [],
    showPortalControlIds,
    list,
    pageIndex,
    keyWords,
    baseInfo = {},
    fastFilters = [],
    filters,
    telFilters,
  } = portal;

  const { isSendMsgs } = baseInfo;
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [addUserByTelDialog, setAddUserByTelDialog] = useState(false); //单个邀请
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentData, setCurrentData] = useState([]); //当前用户详情
  const [currentId, setCurrentId] = useState(''); //当前用户详情
  const [filterStatus, setFilterStatus] = useState('');
  const filterStatusNum = useRef();
  const filtersTag = useRef();

  useEffect(() => {
    filterStatusNum.current = '';
    filtersTag.current = {};
  }, []);

  useEffect(() => {
    setFilterStatus((props.portal.fastFilters.find(o => o.controlId === 'portal_status') || {}).value || '');
    filterStatusNum.current = (props.portal.fastFilters.find(o => o.controlId === 'portal_status') || {}).value || '';
    setSelectedIds([]);
  }, [props.portal.fastFilters]);

  //controls 信息收集的配置项
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    setFilter([]);
    setKeyWords('');
    setSortControls([]);
    setTelFilters('');
  }, []);

  useEffect(() => {
    if (!props.version) {
      return;
    }
    getShowControls();
  }, [props.version]);
  //筛选
  useEffect(() => {
    if (_.isEqual(filtersTag.current, { keyWords, filters, telFilters })) {
      return;
    }
    changePageIndex(1);
    getUserList();
    filtersTag.current = { keyWords, filters, telFilters };
  }, [keyWords, filters, telFilters]);

  const getShowControls = () => {
    externalPortalAjax
      .getViewShowControls({
        appId,
      })
      .then(res => {
        const { controls, showControlIds = [] } = res;
        setHideIds(showControlIds);
        setControls(controls);
      });
  };
  const getUserList = () => {
    getCount(appId); //重新获取总计数
    getList(0, () => {});
  };

  useEffect(() => {
    setColumns(getColumns(controls, roleList, filterStatus, setFilterStatus, setFastFilters, filterStatusNum, appId));
  }, [controls, showPortalControlIds, roleList]);

  const [showControls, setShowControls] = useState([]); //显示列

  useEffect(() => {
    const columnsShowControls = getColumnsShowControls({
      columns,
      showPortalControlIds,
      updateActivationStatus,
      setChangeRoleDialog: setChangeRoleDialog,
      setSelectedIds,
      getList,
      delOne,
      updateListByStatus,
      appId,
    });
    setShowControls(columnsShowControls);
  }, [columns, showPortalControlIds, list]);

  const delOne = id => {
    Dialog.confirm({
      title: <span className="Red">{_l('注销%0个成员', 1)}</span>,
      buttonType: 'danger',
      okText: _l('注销'),
      description: _l('被注销的成员不能通过外部门户的链接登录到此应用内。'),
      onOk: () => {
        externalPortalAjax
          .removeUsers({
            appId,
            rowIds: [id],
          })
          .then(() => {
            setSelectedIds([]); //清除选择
            getCount(appId); //重新获取总计数
            getList(); //重新获取当前页面数据
            setShowUserInfoDialog(false);
          });
      },
    });
  };

  //激活
  const updateActivationStatus = selectedIds => {
    activateExAccounts({
      rowIds: list
        .filter(o => safeParse(o.portal_status, 'array')[0] === '5' && selectedIds.includes(o.rowid))
        .map(o => o.rowid),
      cb: () => setSelectedIds([]),
    });
  };

  const onSaveUserDetail = (data, ids) => {
    let newCell = formatDataForPortalControl(data.filter(o => ids.includes(o.controlId)));
    ///更新数据 /////
    externalPortalAjax.saveUserDetailForBackgroud({ appId, rowId: currentId, newCell }).then(() => {
      getUserList();
      getCount(appId);
      setCurrentData([]);
      setCurrentId('');
      alert(_l('更新成功'));
    });
  };
  return (
    <Wrap className="flex flexColumn overflowHidden" len={showControls.length}>
      <HeaderCon
        {...props}
        setSelectedIds={setSelectedIds}
        selectedIds={selectedIds}
        showControls={showControls}
        setChangeRoleDialog={setChangeRoleDialog}
        setAddUserByTelDialog={setAddUserByTelDialog}
        getUserList={getUserList}
        setAddUserDialog={setAddUserDialog}
        updateActivationStatus={updateActivationStatus}
      />
      <Table
        pageSize={pageSizeForPortal}
        columns={showControls}
        controls={controls}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        showCheck
        list={list.map(o => {
          return { ...o, id: o.rowid };
        })}
        pageIndex={pageIndex}
        total={commonCount}
        onScrollEnd={() => {
          if (list.length >= commonCount || list.length < pageIndex * pageSizeForPortal || props.portal.loading) {
            return;
          }
          changePageIndex(pageIndex + 1);
          getList();
        }}
        handleChangeSortHeader={sorter => {
          handleChangeSort(sorter);
        }}
        loading={props.portal.loading}
        clickRow={(info, id) => {
          setCurrentId(id);
          let data = controls.map(it => {
            return { ...it, value: (list.find(item => item.rowid === id) || {})[it.controlId] };
          });
          setCurrentData(data);
          setShowUserInfoDialog(true);
        }}
      />
      {changeRoleDialog && (
        <ChangeRoleDialog
          title={_l('选择角色')}
          setChangeRoleDialog={setChangeRoleDialog}
          changeRoleDialog={changeRoleDialog}
          roleList={roleList}
          onOk={roleId => {
            updateListByRoleid({ roleId: roleId, rowIds: selectedIds }, () => {
              setSelectedIds([]); //清除选择
              changePageIndex(1);
              getUserList();
            });
          }}
        />
      )}
      {addUserDialog && (
        <AddUserDialog
          setAddUserDialog={setAddUserDialog}
          show={addUserDialog}
          getUserList={getUserList}
          appId={appId}
          isSendMsgs={isSendMsgs}
          changeIsSendMsgs={isSendMsgs => {
            const { baseInfo = {} } = portal;
            setBaseInfo({ ...baseInfo, isSendMsgs });
          }}
        />
      )}
      {addUserByTelDialog && (
        <AddUserByTelDialog
          setAddUserByTelDialog={setAddUserByTelDialog}
          show={addUserByTelDialog}
          getUserList={getUserList}
          appId={appId}
          registerMode={_.get(portalSetModel, ['registerMode'])}
          roleList={roleList}
          roleId={!fastFilters || fastFilters.length <= 0 ? '' : fastFilters[0].values[0]} //角色与左侧一致
          isSendMsgs={isSendMsgs}
          changeIsSendMsgs={isSendMsgs => {
            const { baseInfo = {} } = portal;
            setBaseInfo({ ...baseInfo, isSendMsgs });
          }}
        />
      )}
      {showUserInfoDialog && (
        <UserInfoWrap
          show={showUserInfoDialog}
          showClose={true}
          appId={appId}
          width={'640px'}
          currentData={formatPortalData(currentData)}
          setShow={setShowUserInfoDialog}
          onOk={onSaveUserDetail}
        />
      )}
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(User);
