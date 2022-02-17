import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Dialog } from 'ming-ui';
import PorTalTable from './portalCon/PortalTable';
import PortalBar from './portalCon/PortalBar';
import cx from 'classnames';
import autoSize from 'ming-ui/decorators/autoSize';
const AutoSizePorTalTable = autoSize(PorTalTable, { onlyWidth: true });
import ChangeRoleDialog from './ChangeRoleDialog';
import { auditPassExAccountToNewRole, refusePassExAccount } from 'src/api/externalPortal';
import ReviewFree from './ReviewFree';
import { pageSize, renderText } from './util';

const Wrap = styled.div`
  padding: 16px 32px 0;
  .topAct {
    padding-bottom: 16px;
    display: flex;
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
        color: #2196f3;
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
      background: #2196f3;
      border-radius: 3px;
      vertical-align: middle;
      line-height: 32px;
      color: #fff;
      padding: 0 12px;
      &:hover {
        background: #1e88e5;
      }
    }
  }
`;
function PendingReview(props) {
  const {
    portal = {},
    getList,
    setControls,
    setControlsSetting,
    setCount,
    appId,
    getCount,
    changePageIndex,
    setFilter,
    setKeyWords,
    setBaseInfo,
  } = props;
  const {
    roleList = [],
    controls = [],
    list,
    unApproveCount,
    pageIndex,
    keyWords,
    filters = [],
    controlsSYS = [],
    baseInfo = {},
  } = portal;
  // const showPortalControlIds = []; //当前要显示的配置列
  const [show, setShow] = useState(false);
  const [showPassDrop, setShowPassDrop] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  //controls 信息收集的配置项
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    setFilter([]);
    setKeyWords('');
  }, []);
  //筛选
  useEffect(() => {
    fetch();
  }, [keyWords, filters]);
  const fetch = () => {
    if (loading) {
      return;
    }
    changePageIndex(1);
    setLoading(true);
    getList(3, () => {
      setLoading(false);
    });
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
          ].includes(o.controlId),
      )
      .map(o => {
        if (o.controlId === 'portal_name') {
          columns.push({
            ...o,
            id: o.controlId,
            name: _l('用户'),
            width: 150,
            render: (control, data) => {
              return (
                <div className="userImgBox">
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
        } else {
          columns.push({
            ...o,
            id: o.controlId,
            name: o.controlName,
            width: 120,
            render: (control, data) => {
              return <div className="ellipsis">{renderText({ ...o, value: data[o.controlId] })}</div>;
            },
          });
        }
      });
    columns.push({
      id: 'action',
      name: _l('操作'),
      fixed: 'right',
      width: 150,
      render: (text, data, index) => {
        return (
          <React.Fragment>
            <div
              className="addUser InlineBlock Hand ThemeColor3 Bold"
              onClick={() => {
                setSelectedIds([data.rowid]);
                setShowPassDrop(true);
              }}
            >
              {_l('同意')}
            </div>
            <div
              className="reject InlineBlock Hand Red mLeft25"
              onClick={() => {
                rejectDialog([data.rowid]);
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
    refusePassExAccount({
      appId,
      rowIds: rowIds,
    }).then(res => {
      getCount(appId);//重新获取总计数
      fetch();
    });
  };

  const rejectDialog = rowIds => {
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认拒绝吗？')}</span>,
      buttonType: 'danger',
      description: _l('拒绝后会从列表中删除此用户'),
      onOk: () => {
        editAppApplyStatus(rowIds || selectedIds);
      },
    });
  };

  return (
    <Wrap>
      <div className="topAct">
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
        <PortalBar
          keys={['search', 'refresh', 'filter']}
          columns={columns}
          onChange={data => {}}
          appId={appId}
          comp={() => {
            return (
              <div
                className="setList InlineBlock TxtTop Hand"
                onClick={() => {
                  setShow(true);
                }}
              >
                {_l('配置免审名单')}
              </div>
            );
          }}
          refresh={() => {
            getList(3, () => {
              setLoading(false);
            });
            getCount(appId);//重新获取总计数
          }}
        />
      </div>
      <AutoSizePorTalTable
        pageSize={pageSize}
        columns={columns}
        controls={controls}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        list={list}
        pageIndex={pageIndex}
        total={unApproveCount}
        changePage={pageIndex => {
          changePageIndex(pageIndex);
          getList(3);
          setSelectedIds([]);
        }}
      />
      {showPassDrop && (
        <ChangeRoleDialog
          title={_l('选择角色')}
          roleList={roleList}
          setChangeRoleDialog={setShowPassDrop}
          changeRoleDialog={showPassDrop}
          onOk={roleId => {
            auditPassExAccountToNewRole({
              appId,
              roleId,
              rowIds: selectedIds,
            }).then(res => {
              if (res.success) {
                getCount(appId);//重新获取总计数
                fetch();
              }
            });
          }}
        />
      )}
      {show && (
        <ReviewFree
          show={show}
          appId={appId}
          controls={controls}
          onCancel={() => {
            setShow(false);
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
