import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Icon, MenuItem, Dialog, Dropdown } from 'ming-ui';
import PorTalTable from './portalCon/PortalTable';
import PortalBar from './portalCon/PortalBar';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import autoSize from 'ming-ui/decorators/autoSize';
const AutoSizePorTalTable = autoSize(PorTalTable, {});
import ChangeRoleDialog from './ChangeRoleDialog';
import AddUserDialog from './AddUserDialog';
import AddUserByTelDialog from './AddUserByTelDialog';
import appManagement from 'src/api/appManagement';
import {
  removeUsers,
  getViewShowControls,
  saveUserDetailForBackgroud,
  reinviteExAccount,
} from 'src/api/externalPortal';
import UserInfoDialog from '../components/UserInfoDialog';
import 'uploadAttachment';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { pageSize, renderText } from './util';

const Wrap = styled.div`
  padding: 16px 32px 0;
  .topAct {
    padding-bottom: 16px;
    display: flex;
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
    .addUser {
      height: 32px;
      background: #2196f3;
      border-radius: 3px;
      vertical-align: top;
      line-height: 32px;
      color: #fff;
      padding: 0 6px 0 12px;
      i::before {
        line-height: 32px;
        color: #fff;
      }
      &:hover {
        background: #1e88e5;
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
`;
const WrapPop = styled.div`
  &.uploadUser {
    padding: 6px 0;
    background: #ffffff;
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.1);
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
  } = props;
  const {
    roleList = [],
    controls = [],
    controlsSYS = [],
    showPortalControlIds,
    list,
    commonCount,
    pageIndex,
    keyWords,
    baseInfo = {},
    fastFilters = [],
    filters,
  } = portal;
  const { isSendMsgs } = baseInfo;

  const [popupVisible, setPopupVisible] = useState(false);
  const [changeRoleDialog, setChangeRoleDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [addUserByTelDialog, setAddUserByTelDialog] = useState(false); //单个邀请
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentData, setCurrentData] = useState([]); //当前用户详情
  const [currentId, setCurrentId] = useState(''); //当前用户详情
  const [filterRoleType, setFilterRoleType] = useState(''); //所有角色
  const [filterStatus, setFilterStatus] = useState('');
  useEffect(() => {
    setFilterRoleType(((fastFilters.find(o => o.controlId === 'portal_role') || {}).values || [])[0] || '');
    setFilterStatus((fastFilters.find(o => o.controlId === 'portal_status') || {}).value || '');
  }, [fastFilters]);
  const [userStatusList, setUserStatusList] = useState([
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
  ]);
  //controls 信息收集的配置项
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    setFilter([]);
    setKeyWords('');
  }, []);

  useEffect(() => {
    getShowControls();
  }, [controls]);
  //筛选
  useEffect(() => {
    changePageIndex(1);
    getUserList();
  }, [keyWords, filters]);

  const getShowControls = () => {
    getViewShowControls({
      appId,
    }).then(res => {
      const { controls, showControlIds = [] } = res;
      setHideIds(showControlIds);
    });
  };
  const getUserList = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    getCount(appId);//重新获取总计数
    getList(0, () => {
      setLoading(false);
    });
  };

  useEffect(() => {
    let columns = [];
    controls
      .sort((a, b) => {
        return a.row - b.row;
      })
      .filter(o => !['portal_avatar', 'portal_regtime'].includes(o.controlId))
      .map(o => {
        if (o.controlId === 'portal_name') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('用户'),
            width: 150,
            render: (text, data, index) => {
              return (
                <div className="userImgBox Hand flex">
                  {/* <img src={data['portal_avatar']} alt="" srcset="" /> */}
                  <span className="name">{data['portal_name']}</span>
                </div>
              );
            },
          });
        } else if (o.controlId === 'portal_mobile') {
          columns.push({
            ...o,
            id: o.controlId,
            name: '手机号',
            className: 'tableCellPortal',
            width: 150,
          });
        } else if (o.controlId === 'portal_role') {
          columns.push({
            ...o,
            id: o.controlId,
            name: '角色',
            width: 120,
            render: (text, data, index) => {
              let role = '';
              try {
                let d = JSON.parse(data['portal_role']);
                role = d[0] || '';
              } catch (error) {
                role = '';
              }
              return (
                <Dropdown
                  isAppendToBody
                  data={roleList.map(o => {
                    return { ...o, value: o.roleId, text: o.name };
                  })}
                  value={role || undefined} //成员
                  className={cx('flex')}
                  onChange={newValue => {
                    updateListByRoleid({ roleId: newValue, rowIds: [data.rowid] }, () => {
                      setSelectedIds([]); //清除选择
                    });
                  }}
                />
              );
            },
          });
        } else if (o.controlId === 'portal_status') {
          columns.push({
            ...o,
            id: o.controlId,
            name: '成员状态',
            width: 120,
            render: (text, data, index) => {
              //正常、未激活（添加用户后用户未注册）停用
              if (data.portal_status === '5') {
                return (
                  <Dropdown
                    isAppendToBody
                    className={cx('flex', { isNo: data.portal_status === '5' })}
                    data={[
                      {
                        value: '6',
                        text: _l('重新邀请'),
                      },
                      {
                        value: '7',
                        text: _l('取消邀请并移除'),
                      },
                    ]}
                    placeholder={_l('未激活')}
                    noChangeValue={true}
                    onChange={newValue => {
                      if (newValue === '7') {
                        removeUsers({
                          appId,
                          rowIds: [data.rowid],
                        }).then(res => {
                          setSelectedIds([]); //清除选择
                          getList(); //重新获取当前页面数据
                        });
                      } else {
                        reinviteExAccount({
                          appId,
                          rowIds: [data.rowid],
                        }).then(res => {
                          res ? alert(_l('重新邀请成功')) : alert(_l('重新邀请失败，请稍后再试'), 2);
                        });
                      }
                    }}
                  />
                );
              }
              return (
                <Dropdown
                  isAppendToBody
                  data={userStatusList.filter(o => o.value !== '5')}
                  value={data.portal_status}
                  className={cx('flex')}
                  onChange={newValue => {
                    updateListByStatus({
                      newState: newValue,
                      rowId: data.rowid,
                    });
                  }}
                />
              );
            },
          });
        } else if (!['portal_avatar', 'partal_regtime', 'portal_openid'].includes(o.controlId)) {
          columns.push({
            ...o,
            id: o.controlId,
            name: o.controlName,
            render: (text, data, index) => {
              return <div className="ellipsis">{renderText({ ...o, value: data[o.controlId] })}</div>;
            },
          });
        }
      });
    setColumns(columns);
  }, [controls, showPortalControlIds, roleList]);
  const [showControls, setShowControls] = useState([]); //显示列

  useEffect(() => {
    setShowControls(
      columns.filter(o => showPortalControlIds.includes(o.id) || controlsSYS.map(o => o.controlId).includes(o.id)),
    );
  }, [columns, showPortalControlIds]);
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
        exportControlsId: showControls.map(o => o.controlId),
        filterControls: filters,
        keywords: keyWords,
        rowIds: isAll ? [] : selectedIds,
        fastFilters,
        pageIndex,
        pageSize,
        excludeRowIds: [],
      };
      fetch(`${md.global.Config.WorksheetDownUrl}/ExportExcel/ExprotExPortal`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(args),
      }).then(res => {
        setSelectedIds([]); //清除选择
      });
    });
  };

  //批量删除用户
  const deleteRows = () => {
    removeUsers({
      appId,
      rowIds: selectedIds,
    }).then(res => {
      setSelectedIds([]); //清除选择
      getCount(appId);//重新获取总计数
      getList(); //重新获取当前页面数据
    });
  };
  return (
    <Wrap>
      <div className="topAct">
        {selectedIds.length <= 0 ? (
          <React.Fragment>
            <div className="act InlineBlock">
              <span className="Gray_75 LineHeight36 InlineBlock">{_l('角色')}</span>
              <Dropdown
                isAppendToBody
                data={[{ value: '', text: '所有角色' }].concat(
                  roleList.map(o => {
                    return { ...o, value: o.roleId, text: o.name };
                  }),
                )}
                value={filterRoleType}
                className={cx('flex InlineBlock topActDrop mLeft16')}
                onChange={newValue => {
                  setFilterRoleType(newValue);
                  setFastFilters({
                    controlId: 'portal_role',
                    values: [newValue],
                    dataType: 44,
                    spliceType: 1,
                    filterType: 2, //等于
                    DateRange: 0,
                    DateRangeType: 1,
                  });
                }}
              />
            </div>
            <div className="act InlineBlock mLeft50">
              <span className="Gray_75 LineHeight36 InlineBlock">{_l('成员状态')}</span>
              <Dropdown
                isAppendToBody
                data={[{ value: '', text: '所有状态' }].concat(userStatusList)}
                value={filterStatus}
                className={cx('flex InlineBlock topActDrop mLeft16')}
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
            </div>
          </React.Fragment>
        ) : (
          <div>
            <span
              className="changeRole InlineBlock Hand"
              onClick={() => {
                setChangeRoleDialog(true);
              }}
            >
              {_l('更改角色')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                Dialog.confirm({
                  title: <span className="Red">{_l('删除%0个成员', selectedIds.length || 1)}</span>,
                  buttonType: 'danger',
                  description: _l('被删除的成员不能通过外部门户的链接登录到此应用内'),
                  onOk: () => {
                    deleteRows();
                  },
                });
              }}
            >
              {_l('删除')}
            </span>
            <span
              className={cx('download InlineBlock Hand mLeft10')}
              onClick={() => {
                down();
              }}
            >
              {_l('导出')}
            </span>
          </div>
        )}
        <PortalBar
          keys={['search', 'refresh', 'columns', 'filter', 'down']}
          onChange={data => {}}
          down={down}
          appId={appId}
          comp={() => {
            return (
              <div className="addUser InlineBlock Hand Bold">
                <span
                  className="mRight10"
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
                  popupAlign={{ points: ['tr', 'br'], offset: [8, 7] }}
                >
                  <Icon
                    className="TxtMiddle mLeft6"
                    onClick={() => {
                      setPopupVisible(!popupVisible);
                    }}
                    type="arrow-down"
                  />
                </Trigger>
              </div>
            );
          }}
          refresh={() => {
            getUserList();
          }}
        />
      </div>
      <AutoSizePorTalTable
        pageSize={pageSize}
        columns={showControls}
        controls={controls}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        list={list}
        pageIndex={pageIndex}
        total={commonCount}
        changePage={pageIndex => {
          changePageIndex(pageIndex);
          getList();
          setSelectedIds([]);
        }}
        clickRow={(info, id) => {
          setCurrentData(info);
          setCurrentId(id);
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
          isSendMsgs={isSendMsgs}
          changeIsSendMsgs={isSendMsgs => {
            const { baseInfo = {} } = portal;
            setBaseInfo({ ...baseInfo, isSendMsgs });
          }}
        />
      )}
      {showUserInfoDialog && (
        <UserInfoDialog
          show={showUserInfoDialog}
          appId={appId}
          currentData={currentData.map(o => {
            if (['portal_name', 'portal_mobile'].includes(o.controlId)) {
              return { ...o, disabled: true };
            } else {
              return o;
            }
          })}
          setCurrentData={setCurrentData}
          setShow={setShowUserInfoDialog}
          onOk={(data, ids) => {
            ///更新数据 /////
            saveUserDetailForBackgroud({
              appId,
              rowId: currentId,
              newCell: data.filter(o => ids.includes(o.controlId)).map(formatControlToServer),
            }).then(res => {
              setList(
                list.map(o => {
                  if (o.rowid === currentId) {
                    return { ...o, ...res.data };
                  } else {
                    return o;
                  }
                }),
              );
              setCurrentData([]);
              setCurrentId('');
            });
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
