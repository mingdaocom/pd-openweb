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
    min-height: 54px;
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
    setSortControls,
    handleChangeSort,
    setTelFilters,
  } = props;
  const {
    roleList = [],
    controls = [],
    showPortalControlIds,
    list,
    commonCount,
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
  const [loading, setLoading] = useState(false);
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState(false);
  const [addUserByTelDialog, setAddUserByTelDialog] = useState(false); //????????????
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentData, setCurrentData] = useState([]); //??????????????????
  const [currentId, setCurrentId] = useState(''); //??????????????????
  const [filterRoleType, setFilterRoleType] = useState(''); //????????????
  const [filterStatus, setFilterStatus] = useState('');
  useEffect(() => {
    setFilterRoleType(((fastFilters.find(o => o.controlId === 'portal_role') || {}).values || [])[0] || '');
    setFilterStatus((fastFilters.find(o => o.controlId === 'portal_status') || {}).value || '');
  }, [fastFilters]);
  const [userStatusList, setUserStatusList] = useState([
    {
      value: '1',
      text: _l('??????'),
    },
    {
      value: '4',
      text: _l('??????'),
    },
    {
      value: '5',
      text: _l('?????????'),
    },
  ]);
  //controls ????????????????????????
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    setFilter([]);
    setKeyWords('');
    setSortControls([]);
    setTelFilters('');
  }, []);

  useEffect(() => {
    getShowControls();
  }, [props.version]);
  //??????
  useEffect(() => {
    changePageIndex(1);
    getUserList();
  }, [keyWords, filters, telFilters]);

  const getShowControls = () => {
    getViewShowControls({
      appId,
    }).then(res => {
      const { controls, showControlIds = [] } = res;
      setHideIds(showControlIds);
      setControls(controls);
    });
  };
  const getUserList = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    getCount(appId); //?????????????????????
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
      .filter(o => !['portal_avatar', 'partal_id'].includes(o.controlId))
      .map(o => {
        if (o.controlId === 'portal_name') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('??????'),
            width: 150,
            render: (text, data, index) => {
              return (
                <div className="userImgBox Hand flex">
                  <span className="name">{data['portal_name']}</span>
                </div>
              );
            },
          });
        } else if (o.controlId === 'portal_mobile') {
          columns.push({
            ...o,
            id: o.controlId,
            name: '?????????',
            className: 'tableCellPortal',
            width: 150,
          });
        } else if (o.controlId === 'portal_role') {
          columns.push({
            ...o,
            id: o.controlId,
            name: '??????',
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
                  value={role || undefined} //??????
                  className={cx('flex')}
                  onChange={newValue => {
                    updateListByRoleid({ roleId: newValue, rowIds: [data.rowid] }, () => {
                      setSelectedIds([]); //????????????
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
            name: '????????????',
            width: 120,
            render: (text, data, index) => {
              //????????????????????????????????????????????????????????????
              if (data.portal_status + '' === '5') {
                return (
                  <Dropdown
                    isAppendToBody
                    className={cx('flex', { isNo: data.portal_status + '' === '5' })}
                    data={[
                      {
                        value: '6',
                        text: _l('????????????'),
                      },
                      {
                        value: '7',
                        text: _l('?????????????????????'),
                      },
                    ]}
                    placeholder={_l('?????????')}
                    noChangeValue={true}
                    onChange={newValue => {
                      if (newValue === '7') {
                        removeUsers({
                          appId,
                          rowIds: [data.rowid],
                        }).then(res => {
                          setSelectedIds([]); //????????????
                          getList(); //??????????????????????????????
                        });
                      } else {
                        reinviteExAccount({
                          appId,
                          rowIds: [data.rowid],
                        }).then(res => {
                          res ? alert(_l('??????????????????')) : alert(_l('????????????????????????????????????'), 2);
                        });
                      }
                    }}
                  />
                );
              }
              return (
                <Dropdown
                  isAppendToBody
                  data={userStatusList.filter(o => o.value + '' !== '5')}
                  value={data.portal_status + ''}
                  className={cx('flex')}
                  onChange={newValue => {
                    updateListByStatus({
                      newState: newValue,
                      rowIds: [data.rowid],
                      cb: () => {
                        setSelectedIds([]); //????????????
                      },
                    });
                  }}
                />
              );
            },
          });
        } else {
          columns.push({
            ...o,
            id: o.controlId,
            name: o.controlName,
            sorter: [15, 16].includes(o.type),
            render: (text, data, index) => {
              return <div className="ellipsis">{renderText({ ...o, value: data[o.controlId] })}</div>;
            },
          });
        }
      });
    setColumns(columns);
  }, [controls, showPortalControlIds, roleList]);
  const [showControls, setShowControls] = useState([]); //?????????

  useEffect(() => {
    setShowControls(columns.filter(o => showPortalControlIds.includes(o.id)));
  }, [columns, showPortalControlIds]);
  //??????
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
        setSelectedIds([]); //????????????
      });
    });
  };

  //??????????????????
  const deleteRows = () => {
    removeUsers({
      appId,
      rowIds: selectedIds,
    }).then(res => {
      setSelectedIds([]); //????????????
      getCount(appId); //?????????????????????
      getList(); //??????????????????????????????
    });
  };

  return (
    <Wrap>
      <div className="topAct">
        {selectedIds.length <= 0 ? (
          <React.Fragment>
            <div className="act InlineBlock">
              <span className="Gray_75 LineHeight36 InlineBlock">{_l('??????')}</span>
              <Dropdown
                isAppendToBody
                data={[{ value: '', text: '????????????' }].concat(
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
                    filterType: 2, //??????
                    DateRange: 0,
                    DateRangeType: 1,
                  });
                }}
              />
            </div>
            <div className="act InlineBlock mLeft50">
              <span className="Gray_75 LineHeight36 InlineBlock">{_l('????????????')}</span>
              <Dropdown
                isAppendToBody
                data={[{ value: '', text: '????????????' }].concat(userStatusList)}
                value={filterStatus}
                className={cx('flex InlineBlock topActDrop mLeft16')}
                onChange={newValue => {
                  setFilterStatus(newValue);
                  setFastFilters({
                    controlId: 'portal_status',
                    value: newValue,
                    DataType: 6,
                    SpliceType: 1,
                    FilterType: 2, //??????
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
              {_l('????????????')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft32')}
              onClick={() => {
                let NoList = list.filter(o => o.portal_status + '' === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('??????????????????????????????', 2));
                }
                Dialog.confirm({
                  title: <span className="Red">{_l('??????%0?????????', selectedIds.length || 1)}</span>,
                  buttonType: 'danger',
                  okText: _l('??????'),
                  description: _l('??????????????????????????????????????????????????????????????????????????????????????????????????????????????????'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 4,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //????????????
                      },
                    });
                  },
                });
              }}
            >
              {_l('??????')}
            </span>
            <span
              className={cx('download InlineBlock Hand mLeft10')}
              onClick={() => {
                let NoList = list.filter(o => o.portal_status + '' === '5').map(o => o.rowid);
                if (_.intersection(NoList, selectedIds).length > 0) {
                  return alert(_l('??????????????????????????????', 2));
                }
                Dialog.confirm({
                  title: <span className="">{_l('??????%0?????????', selectedIds.length || 1)}</span>,
                  buttonType: '',
                  okText: _l('??????'),
                  description: _l('???????????????????????????????????????????????????????????????????????????????????????????????????????????????'),
                  onOk: () => {
                    updateListByStatus({
                      newState: 1,
                      rowIds: selectedIds,
                      cb: () => {
                        setSelectedIds([]); //????????????
                      },
                    });
                  },
                });
              }}
            >
              {_l('??????')}
            </span>
            <span
              className={cx('download InlineBlock Hand mLeft32')}
              onClick={() => {
                down();
              }}
            >
              {_l('??????')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                Dialog.confirm({
                  title: <span className="Red">{_l('??????%0?????????', selectedIds.length || 1)}</span>,
                  buttonType: 'danger',
                  okText: _l('??????'),
                  description: _l('???????????????????????????????????????????????????????????????????????????'),
                  onOk: () => {
                    deleteRows();
                  },
                });
              }}
            >
              {_l('??????')}
            </span>
          </div>
        )}
        {selectedIds.length <= 0 && (
          <PortalBar
            keys={['search', 'refresh', 'columns', 'filter', 'down']}
            onChange={data => {}}
            down={down}
            appId={appId}
            comp={() => {
              return (
                <div className="addUser InlineBlock Hand Bold">
                  <span
                    className="lAdd"
                    onClick={() => {
                      setAddUserByTelDialog(true);
                    }}
                  >
                    {_l('????????????')}
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
                          <span className=""> {_l('???Excel????????????')}</span>
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
              );
            }}
            refresh={() => {
              getUserList();
            }}
          />
        )}
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
        handleChangeSortHeader={sorter => {
          handleChangeSort(sorter);
        }}
        clickRow={(info, id) => {
          setCurrentData(info);
          setCurrentId(id);
          setShowUserInfoDialog(true);
        }}
      />
      {changeRoleDialog && (
        <ChangeRoleDialog
          title={_l('????????????')}
          setChangeRoleDialog={setChangeRoleDialog}
          changeRoleDialog={changeRoleDialog}
          roleList={roleList}
          onOk={roleId => {
            updateListByRoleid({ roleId: roleId, rowIds: selectedIds }, () => {
              setSelectedIds([]); //????????????
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
          roleList={roleList}
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
          currentData={currentData
            .filter(o => !['portal_avatar', 'portal_status', 'portal_role'].includes(o.controlId)) //???????????????
            .map(o => {
              if (['portal_name', 'portal_mobile', 'partal_regtime', 'portal_openid'].includes(o.controlId)) {
                return { ...o, disabled: true };
              } else {
                return o;
              }
            })}
          setCurrentData={setCurrentData}
          setShow={setShowUserInfoDialog}
          onOk={(data, ids) => {
            ///???????????? /////
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
