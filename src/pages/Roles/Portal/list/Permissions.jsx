import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Radio, Dialog } from 'ming-ui';
import PorTalTable from './portalCon/PortalTable';
import PortalBar from './portalCon/PortalBar';
import autoSize from 'ming-ui/decorators/autoSize';
import { TEXTS } from 'src/pages/Roles/config.js';

const AutoSizePorTalTable = autoSize(PorTalTable);
import { editDefaultExRole, removeExRole } from 'src/api/externalPortal';
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
        background: rgba(76, 175, 80, 0.1);
        color: rgba(76, 175, 80, 1);
      }
    }
    .reject {
      &.isAct {
        background: rgba(244, 67, 54, 0.1);
        color: rgba(244, 67, 54, 1);
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
function Permissions(props) {
  const { portal = {}, openPortalRoleSet, baseSetResult, type, setPortalRoleList } = props;
  const { appId = '', projectId = '' } = baseSetResult;
  const { roleList = [], defaultRole } = portal;
  const [selectedIds, setSelectedIds] = useState([]);
  //controls 信息收集的配置项
  const [columns, setColumns] = useState([]);
  useEffect(() => {
    getExRolesCulmns();
  }, [roleList]);
  const getExRolesCulmns = () => {
    setColumns([
      {
        id: 'name',
        name: _l('权限'),
      },
      {
        id: 'description',
        name: _l('权限描述'),
        className: 'tableCellPortal',
        render: (text, data, index) => {
          return data.description || TEXTS[data.permissionWay];
        },
      },
      {
        id: 'role',
        name: () => {
          return (
            <div>
              {_l('默认权限')}
              <span data-tip={_l('外部成员首次登录后默认分配的权限')} className="mLeft5 Font14 tip-right">
                <i className="icon-help Gray_9e" />
              </span>
            </div>
          );
        },
        render: (text, data, index) => {
          return (
            <Radio
              className="GSelect-department--checkbox mRight0"
              checked={data.isDefault}
              text={''}
              onClick={() => {
                editDefaultExRole({ appId, defaultRoleId: data.roleId }).then(res => {
                  setPortalRoleList(
                    roleList.map(o => {
                      if (o.roleId === data.roleId) {
                        return { ...o, isDefault: true };
                      } else {
                        return { ...o, isDefault: false };
                      }
                    }),
                  );
                });
              }}
            />
          );
        },
      },
      {
        id: 'action',
        name: _l('操作'),
        fixed: 'right',
        width: 200,
        render: (text, data, index) => {
          return (
            <React.Fragment>
              <div
                className="addUser InlineBlock Hand ThemeColor3 Bold"
                onClick={() => {
                  openPortalRoleSet(data.roleId);
                }}
              >
                {_l('角色设置')}
              </div>
              <div
                className="reject InlineBlock Hand Red mLeft25"
                onClick={() => {
                  if (data.isDefault) {
                    alert(_l('你不能删除默认角色！'), 2);
                    return;
                  }
                  delDialog(data);
                }}
              >
                {_l('删除')}
              </div>
            </React.Fragment>
          );
        },
      },
    ]);
  };
  const delDialog = data => {
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认删除此角色吗？')}</span>,
      buttonType: 'danger',
      description: '',
      onOk: () => {
        removeExRole({
          appId,
          roleId: data.roleId,
        }).then(res => {
          if (res) {
            setPortalRoleList(roleList.filter(o => o.roleId !== data.roleId));
          } else {
            alert(_l('删除失败，请稍后重试'), 2);
          }
        });
      },
    });
  };
  return (
    <Wrap>
      <div className="topAct">
        <PortalBar
          keys={[]}
          columns={columns}
          onChange={data => {}}
          downFn={() => {}}
          comp={() => {
            return (
              <div
                className="InlineBlock TxtTop Hand setList"
                onClick={() => {
                  openPortalRoleSet('');
                }}
              >
                {_l('添加角色')}
              </div>
            );
          }}
        />
      </div>
      <AutoSizePorTalTable
        columns={columns}
        noShowCheck
        list={roleList}
        pageIndex={1}
        total={50}
        scrolly="calc(100vh - 510px)"
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        type={type}
      />
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Permissions);
