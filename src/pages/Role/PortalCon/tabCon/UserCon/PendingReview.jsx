import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import noVerifyAjax from 'src/api/noVerify';
import Table from 'src/pages/Role/component/Table';
import ChangeRoleDialog from 'src/pages/Role/PortalCon/components/ChangeRoleDialog';
import ReviewFree from 'src/pages/Role/PortalCon/components/ReviewFree';
import UserInfoWrap from 'src/pages/Role/PortalCon/components/UserInfoWrap';
import { renderText as renderCellText } from 'src/utils/control';
import * as actions from '../../redux/actions';
import PortalBar from '../portalComponent/PortalBar';
import { formatDataForPortalControl, formatPortalData, pageSize, renderText } from '../util';

const Wrap = styled.div`
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(100%  - 38px) / 6);
  }
  .wrapTr.nameWrapTr {
    width: calc(calc(100%  - 38px) / 6); !important;
    overflow: hidden;
  }
  padding: 16px 10px 0 10px;
  .topAct {
    padding-right: 22px;
    min-height: 54px;
    padding-bottom: 16px;
    display: flex;
    justify-content: right;
    .pass,
    .reject {
      width: 61px;
      height: 32px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 3px;
      color: #bdbdbd;
      line-height: 32px;
      text-align: center;
    }
    .pass {
      &.isAct {
        background: #f3faff;
        color: #1677ff;
        &:hover {
          background: #ebf6fe;
        }
      }
    }
    .reject {
      &.isAct {
        background: rgba(244, 67, 54, 0.1);
        color: rgba(244, 67, 54, 1);
        &:hover {
          background: #fee6e5;
        }
      }
    }
    .setList {
      height: 32px;
      color: #1677ff;
      vertical-align: middle;
      line-height: 32px;
      padding: 0 12px;
      background: #f5f5f5;
      border-radius: 3px;
      &:hover {
        color: #1e88e5;
      }
      &.isOpen {
        background: #ffffff;
        border: 1px solid #1677ff;
      }
    }
  }
`;
const WrapRejectBtn = styled.div`
  color: red;
  &:hover {
    color: red;
  }
`;
function PendingReview(props) {
  const {
    portal = {},
    getList,
    appId,
    getCount,
    changePageIndex,
    setFilter,
    setKeyWords,
    projectId,
    onChangePortalVersion,
    setSortControls,
    handleChangeSort,
    setTelFilters,
  } = props;
  const { roleList = [], controls = [], unApproveCount, pageIndex, keyWords, filters = [], telFilters } = portal;
  const [show, setShow] = useState(false);
  const [showPassDrop, setShowPassDrop] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({});
  const [showUserInfoDialog, setShowUserInfoDialog] = useState(false);
  const [currentData, setCurrentData] = useState([]); //当前用户详情
  const [currentId, setCurrentId] = useState(''); //当前用户id

  //controls 信息收集的配置项
  const [columns, setColumns] = useState([]);
  //当前免审名单相关信息
  const getInfo = () => {
    noVerifyAjax.get({ appId }).then(res => {
      setIsOpen(res.status === 0);
      setData(res);
    });
  };
  useEffect(() => {
    getInfo();
    setFilter([]);
    setKeyWords('');
    setSortControls([]);
    setTelFilters('');
    fetch();
  }, []);

  const prevValuesRef = useRef({ keyWords, filters, telFilters });

  //筛选
  useEffect(() => {
    const prevValues = prevValuesRef.current;
    if (prevValues && !_.isEqual(prevValues, { keyWords, filters, telFilters })) {
      prevValuesRef.current = { keyWords, filters, telFilters };
      fetch();
    }
  }, [keyWords, filters, telFilters]);
  const fetch = () => {
    changePageIndex(1);
    getList(3);
    setSelectedIds([]);
  };
  useEffect(() => {
    let columns = [];
    controls
      .filter(
        o =>
          ![
            'portal_avatar',
            'partal_regtime',
            'portal_regtime',
            'portal_role',
            'portal_status',
            'portal_openid',
            'partal_id',
          ].includes(o.controlId),
      )
      .map(o => {
        if (o.controlId === 'portal_name') {
          columns.push({
            ...o,
            id: o.controlId,
            className: 'nameWrapTr',
            name: _l('用户'),
            minW: 240,
            render: (control, data) => {
              return (
                <div className="userImgBox overflowHidden">
                  <span className="name overflow_ellipsis Block TxtLeft breakAll" title={data['portal_name']}>
                    {data['portal_name']}
                  </span>
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
            render: (text, data) => {
              return (
                <div className="flex overflowHidden">
                  <div className="overflow_ellipsis Block breakAll" title={data['portal_email']}>
                    {data['portal_email']}
                  </div>
                </div>
              );
            },
          });
        } else {
          let pram = [15, 16].includes(o.type) ? { minW: 130 } : {};
          columns.push({
            ...o,
            ...pram,
            id: o.controlId,
            name: o.controlName,
            sorter: [15, 16].includes(o.type),
            render: (control, data) => {
              return (
                <div className="ellipsis TxtMiddle" title={renderCellText({ ...o, value: data[o.controlId] })}>
                  {renderText({ ...o, value: data[o.controlId] })}
                </div>
              );
            },
          });
        }
      });
    columns.push({
      id: 'action',
      name: _l('操作'),
      fixed: 'right',
      render: (text, data) => {
        return (
          <React.Fragment>
            <div
              className="addUser InlineBlock Hand ThemeColor3 Bold"
              onClick={e => {
                setSelectedIds([data.rowid]);
                setShowPassDrop(true);
                e.stopPropagation();
              }}
            >
              {_l('同意')}
            </div>
            <div
              className="reject InlineBlock Hand Red mLeft25"
              onClick={e => {
                rejectDialog([data.rowid]);
                e.stopPropagation();
              }}
            >
              {_l('拒绝')}
            </div>
          </React.Fragment>
        );
      },
    });
    setColumns(columns);
  }, [controls]);

  //拒绝
  const editAppApplyStatus = rowIds => {
    externalPortalAjax
      .refusePassExAccount({
        appId,
        rowIds: rowIds,
      })
      .then(() => {
        getCount(appId); //重新获取总计数
        fetch();
      });
  };

  const rejectDialog = rowIds => {
    if (selectedIds.length <= 0 && (rowIds || []).length <= 0) {
      return;
    }
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认拒绝吗？')}</span>,
      buttonType: 'danger',
      description: _l('拒绝后会从列表中删除此用户'),
      onOk: () => {
        editAppApplyStatus(rowIds || selectedIds);
        setShowUserInfoDialog(false);
      },
    });
  };

  return (
    <Wrap className="flex flexColumn overflowHidden">
      <div className="topAct">
        <div className={cx('title flexRow alignItemsCenter', { flex: selectedIds.length > 0 })}>
          <span className={cx('Font17 Bold pLeft20 mLeft20')}>{props.title}</span>
        </div>
        {selectedIds.length > 0 && (
          <React.Fragment>
            <span
              className={cx('pass InlineBlock Hand', { isAct: selectedIds.length > 0 })}
              onClick={() => {
                if (selectedIds.length > 0) {
                  setShowPassDrop(true);
                }
              }}
            >
              {_l('同意')}
            </span>
            <span
              className={cx('reject InlineBlock Hand mLeft10', { isAct: selectedIds.length > 0 })}
              onClick={() => {
                rejectDialog();
              }}
            >
              {_l('拒绝')}
            </span>
          </React.Fragment>
        )}
        {selectedIds.length <= 0 && (
          <PortalBar
            keys={['search', 'refresh', 'filter']}
            columns={columns}
            onChange={() => {}}
            appId={appId}
            comp={() => {
              return (
                <div
                  className={cx('setList InlineBlock TxtTop Hand', { isOpen })}
                  onClick={() => {
                    setShow(true);
                  }}
                >
                  {isOpen ? _l('已设置免审') : _l('免审设置')}
                </div>
              );
            }}
            refresh={() => {
              getList(3);
              getCount(appId); //重新获取总计数
            }}
          />
        )}
      </div>
      <Table
        showCheck
        showTips
        pageSize={pageSize}
        columns={columns}
        controls={controls}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        list={
          pageIndex <= 1 && props.portal.loading
            ? []
            : props.portal.list.map(o => {
                return { ...o, id: o.rowid };
              })
        }
        pageIndex={pageIndex}
        total={unApproveCount}
        onScrollEnd={() => {
          if (
            props.portal.list.length >= unApproveCount ||
            props.portal.list.length < pageIndex * pageSize ||
            props.portal.loading
          ) {
            return;
          }
          changePageIndex(pageIndex + 1);
          getList(3);
        }}
        loading={props.portal.loading}
        handleChangeSortHeader={sorter => {
          handleChangeSort(sorter, 3);
        }}
        clickRow={(info, id) => {
          let data = controls.map(it => {
            return { ...it, value: (props.portal.list.find(item => item.rowid === id) || {})[it.controlId] };
          });
          setCurrentId(id);
          setCurrentData(data);
          setShowUserInfoDialog(true);
        }}
      />
      {showPassDrop && (
        <ChangeRoleDialog
          title={_l('选择角色')}
          roleList={roleList}
          setChangeRoleDialog={setShowPassDrop}
          changeRoleDialog={showPassDrop}
          onOk={roleId => {
            externalPortalAjax
              .auditPassExAccountToNewRole({
                appId,
                roleId,
                rowIds: selectedIds,
              })
              .then(res => {
                if (res.success) {
                  fetch();
                  getCount(appId); //重新获取总计数
                } else {
                  alert(_l('操作失败,请稍后再试'), 3);
                }
              });
          }}
        />
      )}
      {show && (
        <ReviewFree
          onChangePortalVersion={onChangePortalVersion}
          data={data}
          show={show}
          canChooseOtherApp={true}
          setData={setData}
          getInfo={() => {
            getInfo();
          }}
          projectId={projectId}
          appId={appId}
          controls={controls}
          onCancel={() => {
            setShow(false);
          }}
        />
      )}
      {showUserInfoDialog && (
        <UserInfoWrap
          show={showUserInfoDialog}
          showClose={true}
          appId={appId}
          width={'640px'}
          currentData={formatPortalData(
            currentData.map(o => {
              if (o.controlId === 'portal_status') {
                return { ...o, value: '["1"]' };
              } else {
                return o;
              }
            }),
          )}
          setShow={setShowUserInfoDialog}
          onOk={(data, ids) => {
            let newCell = formatDataForPortalControl(
              data.filter(o =>
                [...ids, 'portal_role', 'portal_status'] //角色和状态默认更新
                  .includes(o.controlId),
              ),
            );
            ///更新数据 /////
            externalPortalAjax
              .auditPassExAccountToNewRole({
                appId,
                roleId: (newCell.find(o => o.controlId === 'portal_role') || {}).value,
                rowIds: [currentId],
                newCell,
              })
              .then(res => {
                if (res.success) {
                  getCount(appId); //重新获取总计数
                  fetch();
                } else {
                  alert(_l('操作失败，请稍后再试'), 3);
                }
              });
          }}
          okText={_l('同意')}
          title={_l('用户信息')}
          renderCancel={() => {
            return (
              <WrapRejectBtn
                className="btn rejectBtn Hand mLeft10"
                onClick={() => {
                  rejectDialog([currentId]);
                }}
              >
                {_l('拒绝')}
              </WrapRejectBtn>
            );
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

export default connect(mapStateToProps, mapDispatchToProps)(PendingReview);
