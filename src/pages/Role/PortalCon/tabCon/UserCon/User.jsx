import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon, MenuItem } from 'ming-ui';
import appManagement from 'src/api/appManagement';
import externalPortalAjax from 'src/api/externalPortal';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import Table from 'src/pages/Role/component/Table';
import AddUserByTelDialog from 'src/pages/Role/PortalCon/components/AddUserByTelDialog';
import AddUserDialog from 'src/pages/Role/PortalCon/components/AddUserDialog';
import ChangeRoleDialog from 'src/pages/Role/PortalCon/components/ChangeRoleDialog';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import UserInfoWrap from 'src/pages/Role/PortalCon/components/UserInfoWrap';
import * as actions from '../../redux/actions';
import PortalBar from '../portalComponent/PortalBar';
import { formatPortalData, pageSize, renderText } from '../util';

const Wrap = styled.div(
  ({ len }) => `
  .toRole {
    color: #5a5a5a;
    &:hover {
      color: #2196f3;
    }
  }
  padding: 16px 10px 0 10px;
  .wrapTr .Dropdown--input {
    padding: 0 !important;
  }
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(100% - 70px - 38px) / ${len - 1});
  }
  .wrapTr.nameWrapTr {
    width: calc(calc(100% - 70px - 38px) / ${len - 1}); !important;
    overflow: hidden;
  }
  .moreop {
    color: #9e9e9e;
  }
  .topAct {
    padding-right: 22px;
    min-height: 54px;
    padding-bottom: 16px;
    display: flex;
    justify-content: right;
    .act {
      .topActDrop {
        width: 180px;
        height: 36px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
        .Dropdown--input {
          display: flex;
          line-height: 36px;
          padding: 0 10px !important;
          .value {
            flex: 1;
          }
          i {
            &::before {
              line-height: 36px;
            }
          }
        }
      }
    }
    .toRole {
      border-radius: 3px 3px 3px 3px;
      padding: 0 12px;
      border: 1px solid #dddddd;
      line-height: 32px;
      display: inline-block;
      &:hover {
        border: 1px solid #2196f3;
        color: #2196f3;
      }
    }
    .addUser {
      height: 32px;
      overflow: hidden;
      vertical-align: top;
      line-height: 32px;
      border-radius: 3px;
      color: #fff;
      background: #2196f3;
      i::before {
        line-height: 32px;
        color: #fff;
      }
      .lAdd {
        padding-left: 12px;
        padding-right: 10px;
        border-radius: 3px 0 0 3px;
      }
      .rAdd {
        border-radius: 0 3px 3px 0;
        padding-right: 6px;
      }
      .rAdd,
      .lAdd {
        cursor: pointer;
        height: 32px;
        display: inline-block;
        background: #2196f3;
        &:hover {
          background: #1e88e5;
        }
      }
    }
    .changeRole,
    .del,
    .download {
      padding: 0 16px;
      height: 32px;
      border-radius: 3px;
      line-height: 32px;
      text-align: center;
      background: #f3faff;
      color: #2196f3;
      &:hover {
        background: #ebf6fe;
      }
    }
    .del {
      background: rgba(244, 67, 54, 0.1);
      color: rgba(244, 67, 54, 1);
      &:hover {
        background: #fee6e5;
      }
    }
  }
  .isCurmemberType {
    color: #2196f3;
  }
  .topActDrop .Dropdown--input {
    display: flex;
    align-items: center;
    & > span.value {
      display: inline-block;
      flex: 1;
    }
    .icon {
      display: block;
    }
  }
`,
);
const WrapPop = styled.div`
  &.uploadUser {
    padding: 6px 0;
    background: #ffffff;
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.13),
      0 2px 6px rgba(0, 0, 0, 0.1);
    opacity: 1;
    border-radius: 3px;
    .Item {
      .Item-content {
        padding-left: 32px;
      }
    }

    .icon {
      color: #9e9e9e;
    }
    span {
      line-height: 36px;
      display: inline-block;
      vertical-align: top;
    }
  }
`;
const userStatusList = [
  {
    value: '1',
    text: _l('正常'),
  },
  {
    value: '4',
    text: _l('停用'),
  },
  {
    value: '5',
    text: _l('未激活'),
  },
];
function User(props) {
  const {
    portal = {},
    setList,
    setControls,
    updateListByStatus,
    setCount,
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
    setQuickTag,
    canEditApp,
    roleId,
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
  const [popupVisible, setPopupVisible] = useState(false);
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    getCount(appId); //重新获取总计数
    getList(0, () => {
      setLoading(false);
    });
  };

  useEffect(() => {
    let columns = [];
    controls
      .map(o => {
        if (o.controlId === 'portal_email') {
          return { ...o, row: 1 };
        } else {
          return o;
        }
      })
      .sort((a, b) => {
        return a.row - b.row;
      })
      .filter(o => !['portal_avatar', 'partal_id'].includes(o.controlId))
      .map(o => {
        if (o.controlId === 'portal_name') {
          columns.push({
            ...o,
            id: o.controlId,
            className: 'nameWrapTr',
            name: _l('用户'),
            minW: 240,
            render: (text, data, index) => {
              return (
                <div className="userImgBox Hand flex overflowHidden">
                  <span className="name overflow_ellipsis Block TxtLeft breakAll">{data['portal_name']}</span>
                </div>
              );
            },
          });
        } else if (o.controlId === 'portal_mobile') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('手机号'),
          });
        } else if (o.controlId === 'portal_email') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('邮箱'),
            render: (text, data, index) => {
              return (
                <div className="flex overflowHidden">
                  <div className="overflow_ellipsis Block breakAll" title={data['portal_email']}>
                    {data['portal_email']}
                  </div>
                </div>
              );
            },
          });
        } else if (o.controlId === 'portal_role') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('角色'),
            render: (text, data, index) => {
              let role = '';
              try {
                let d = safeParse(data['portal_role'], 'array');
                role = d[0] || '';
              } catch (error) {
                role = '';
              }
              return (roleList.find(o => o.roleId === role) || {}).name;
            },
          });
        } else if (o.controlId === 'portal_status') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('状态'),
            renderHeader: () => {
              return (
                <React.Fragment>
                  <Dropdown
                    isAppendToBody
                    data={[{ value: '', text: '所有状态' }].concat(userStatusList)}
                    value={filterStatus}
                    renderValue={_l('状态')}
                    menuClass="Width120"
                    className={cx('InlineBlock topActDrop', { isCurmemberType: !!filterStatusNum.current })}
                    onChange={newValue => {
                      setFilterStatus(newValue);
                      setFastFilters({
                        controlId: 'portal_status',
                        value: newValue,
                        DataType: 6,
                        SpliceType: 1,
                        FilterType: 2, //等于
                        DateRange: 0,
                        DateRangeType: 1,
                      });
                    }}
                  />
                </React.Fragment>
              );
            },
            render: (text, data, index) => {
              let portal_status = safeParse(data.portal_status, 'array')[0];
              //正常、未激活（添加用户后用户未注册）停用
              if (portal_status === '5') {
                return <span className="Gray_9e">{_l('未激活')}</span>;
              }
              return (userStatusList.filter(o => o.value + '' !== '5').find(o => o.value === portal_status) || {}).text;
            },
          });
        } else {
          let pram = [15, 16].includes(o.type) ? { minW: 130 } : {};
          columns.push({
            ...o,
            ...pram,
            id: o.controlId,
            name: o.controlName,
            className: [15, 16].includes(o.type) ? 'timeTr' : '',
            sorter: [15, 16].includes(o.type),
            render: (text, data, index) => {
              return <div className="ellipsis TxtMiddle">{renderText({ ...o, value: data[o.controlId] })}</div>;
            },
          });
        }
      });

    setColumns(columns);
  }, [controls, showPortalControlIds, roleList]);
  const [showControls, setShowControls] = useState([]); //显示列

  useEffect(() => {
    setShowControls(
      columns
        .filter(o => showPortalControlIds.includes(o.id))
        .concat({
          id: 'option',
          className: 'optionWrapTr',
          name: '',
          render: (text, data, index) => {
            let dataList = [];
            let portal_status = safeParse(data.portal_status, 'array')[0];
            //正常、未激活（添加用户后用户未注册）停用
            if (portal_status === '5') {
              dataList = [
                {
                  value: '6',
                  text: _l('重新邀请'),
                },
                {
                  value: '7',
                  text: _l('取消邀请并移除'),
                },
              ];
            } else {
              dataList = [
                {
                  value: '8',
                  text: _l('修改角色'),
                },
                ...userStatusList,
                {
                  value: '9',
                  text: <span className="Red">{_l('注销')}</span>,
                },
              ]
                .filter(o => o.value + '' !== '5')
                .map(it => {
                  if (it.value === '1') {
                    return { ...it, text: _l('启用%15005') };
                  } else {
                    return it;
                  }
                })
                .filter(it => it.value + '' !== portal_status);
            }
            return (
              <DropOption
                dataList={dataList}
                onAction={o => {
                  if (portal_status === '5') {
                    if (o.value === '7') {
                      externalPortalAjax
                        .removeUsers({
                          appId,
                          rowIds: [data.rowid],
                        })
                        .then(res => {
                          setSelectedIds([]); //清除选择
                          getList(); //重新获取当前页面数据
                        });
                    } else {
                      externalPortalAjax
                        .reinviteExAccount({
                          appId,
                          rowIds: [data.rowid],
                        })
                        .then(res => {
                          res ? alert(_l('重新邀请成功')) : alert(_l('重新邀请失败，请稍后再试'), 2);
                        });
                    }
                  } else {
                    if (o.value === '8') {
                      setSelectedIds([data.rowid]);
                      setChangeRoleDialog(true);
                    } else if (o.value === '9') {
                      delOne(data.rowid);
                    } else {
                      updateListByStatus({
                        newState: o.value,
                        rowIds: [data.rowid],
                        cb: () => {
                          setSelectedIds([]); //清除选择
                        },
                      });
                    }
                  }
                }}
                popupAlign={{
                  points: ['tr', 'br'],
                  offset: [-180, 0],
                }}
              />
            );
          },
        }),
    );
  }, [columns, showPortalControlIds]);

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
          .then(res => {
            setSelectedIds([]); //清除选择
            getCount(appId); //重新获取总计数
            getList(); //重新获取当前页面数据
            setShowUserInfoDialog(false);
          });
      },
    });
  };

  //导出
  const down = isAll => {
    const { worksheetId, appId, projectId } = baseInfo;
    appManagement.getToken({ worksheetId, viewId: '' }).then(token => {
      const args = {
        token,
        accountId: md.global.Account.accountId,
        worksheetId,
        appId,
        projectId,
        exportControlsId: showControls.map(o => o.controlId).filter(o => !!o),
        filterControls: filters,
        keywords: keyWords,
        rowIds: isAll ? [] : selectedIds,
        fastFilters,
        pageIndex,
        pageSize,
        excludeRowIds: [],
      };
      window
        .mdyAPI('', '', args, {
          ajaxOptions: {
            url: `${md.global.Config.WorksheetDownUrl}/ExportExcel/ExprotExPortal`,
          },
          customParseResponse: true,
        })
        .then(() => {
          setSelectedIds([]); //清除选择
        });
    });
  };

  //批量删除用户
  const deleteRows = () => {
    externalPortalAjax
      .removeUsers({
        appId,
        rowIds: selectedIds,
      })
      .then(res => {
        setSelectedIds([]); //清除选择
        getCount(appId); //重新获取总计数
        getList(); //重新获取当前页面数据
      });
  };
  const deleteRowsDialog = () => {
    return Dialog.confirm({
      title: <span className="Red">{_l('注销%0个成员', selectedIds.length || 1)}</span>,
      buttonType: 'danger',
      okText: _l('注销'),
      description: _l('被注销的成员不能通过外部门户的链接登录到此应用内。'),
      onOk: () => {
        deleteRows();
      },
    });
  };
  return (
    <Wrap className="flex flexColumn overflowHidden" len={showControls.length}>
      <div className="topAct justifyContentLeft">
        <div className={cx('title flexRow alignItemsCenter flex')}>
          <span className={cx('Font17 Bold pLeft20 mLeft20 WordBreak overflow_ellipsis mRight20')} title={props.title}>
            {props.title}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex-shrink-0">
            <span
              className="changeRole InlineBlock Hand"
              onClick={() => {
                setChangeRoleDialog(true);
              }}
            >
              {_l('更改角色')}
            </span>
            <span
              className={cx('download InlineBlock Hand mLeft10')}
              onClick={() => {
                down();
              }}
            >
              {_l('导出')}
            </span>
            <span
              className={cx('download InlineBlock Hand mLeft10')}
              onClick={() => {
                let NoList = list.filter(o => safeParse(o.portal_status, 'array')[0] === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('未激活的用户不能启用'), 2);
                }
                Dialog.confirm({
                  title: <span className="">{_l('启用%0个用户', selectedIds.length || 1)}</span>,
                  buttonType: '',
                  okText: _l('启用%15005'),
                  description: _l('启用只对“停用”状态的用户生效；用户被启用后可以通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 1,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('启用%15005')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                let NoList = list.filter(o => safeParse(o.portal_status, 'array')[0] === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('未激活的用户不能停用'), 2);
                }
                Dialog.confirm({
                  title: <span className="Red">{_l('停用%0个用户', selectedIds.length || 1)}</span>,
                  buttonType: 'danger',
                  okText: _l('停用'),
                  description: _l('停用只对“正常”状态的用户生效；用户被停用后将不能通过外部门户链接登录此应用'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 4,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //清除选择
                      },
                    });
                  },
                });
              }}
            >
              {_l('停用')}
            </span>
            <span className={cx('del InlineBlock Hand mLeft10')} onClick={deleteRowsDialog}>
              {_l('注销')}
            </span>
          </div>
        )}
        {selectedIds.length <= 0 && (
          <div className="InlineFlex flex-shrink-0">
            <PortalBar
              keys={['search', 'refresh', 'columns', 'filter', 'down']}
              onChange={data => {}}
              down={down}
              appId={appId}
              comp={() => {
                return (
                  <React.Fragment>
                    {roleId !== 'all' && canEditApp && (
                      <div
                        className="toRole Hand mRight14 TxtTop Bold"
                        onClick={() => {
                          setQuickTag({ roleId: roleId, tab: 'roleSet' });
                        }}
                      >
                        {_l('编辑角色')}
                      </div>
                    )}
                    <div className="addUser InlineBlock Hand Bold">
                      <span
                        className="lAdd"
                        onClick={() => {
                          setAddUserByTelDialog(true);
                        }}
                      >
                        {_l('邀请用户')}
                      </span>
                      |
                      <Trigger
                        popupVisible={popupVisible}
                        action={['click']}
                        onPopupVisibleChange={popupVisible => {
                          setPopupVisible(popupVisible);
                        }}
                        popup={
                          <WrapPop className="Hand InlineBlock mTop6 uploadUser">
                            <MenuItem
                              className=""
                              onClick={evt => {
                                setAddUserDialog(true);
                                setPopupVisible(false);
                              }}
                            >
                              <Icon className="Font18 TxtMiddle mRight6" type="new_excel" />
                              <span className=""> {_l('从Excel导入数据')}</span>
                            </MenuItem>
                          </WrapPop>
                        }
                        popupAlign={{ points: ['tr', 'br'], offset: [8, 0] }}
                      >
                        <span
                          className="rAdd hand"
                          onClick={() => {
                            setPopupVisible(!popupVisible);
                          }}
                        >
                          <Icon className="TxtMiddle mLeft6 " type="arrow-down" />
                        </span>
                      </Trigger>
                    </div>
                  </React.Fragment>
                );
              }}
              refresh={() => {
                getUserList();
              }}
            />
          </div>
        )}
      </div>
      <Table
        pageSize={pageSize}
        columns={showControls}
        controls={controls}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck
        list={list.map(o => {
          return { ...o, id: o.rowid };
        })}
        pageIndex={pageIndex}
        total={commonCount}
        onScrollEnd={() => {
          if (list.length >= commonCount || list.length < pageIndex * pageSize || props.portal.loading) {
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
          onOk={(data, ids) => {
            let newCell = data.filter(o => ids.includes(o.controlId)).map(formatControlToServer);
            ///更新数据 /////
            externalPortalAjax
              .saveUserDetailForBackgroud({
                appId,
                rowId: currentId,
                newCell,
              })
              .then(res => {
                getUserList();
                getCount(appId);
                setCurrentData([]);
                setCurrentId('');
                alert(_l('更新成功'));
              });
          }}
          onDel={() => {
            delOne(currentId);
          }}
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
