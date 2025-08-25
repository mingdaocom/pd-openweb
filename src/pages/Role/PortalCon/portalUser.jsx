import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import Api from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import Dialog from 'ming-ui/components/Dialog';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import externalPortalAjax from 'src/api/externalPortal';
import UserInfoWrap from 'src/pages/Role/PortalCon/components/UserInfoWrap';
import { formatDataForPortalControl, formatPortalData } from 'src/pages/Role/PortalCon/tabCon/util.js';
import { canEditData } from 'src/pages/worksheet/redux/actions/util';

const WrapHasPend = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  .hasPendC {
    position: relative;
    top: 40%;
  }
  .hasPendCon {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f8f8f8;
    margin: 0 auto;
    text-align: center;
    i {
      line-height: 100px;
      font-size: 60px;
    }
  }
`;
const Wrap = styled.div`
  .saveBtn {
    width: 45%;
    border-radius: 22px !important;
    float: right;
    margin-right: 12px;
  }
`;
const WrapRejectBtn = styled.div`
  width: 45%;
  background: #ffffff;
  border-radius: 22px !important;
  opacity: 1;
  border: 1px solid #dddddd;
  color: red;
  &:hover {
    color: red;
  }
  &.disable {
    opacity: 0.5;
    cursor: not-allowed !important;
  }
`;

export default function User(props) {
  const { appId, id } = props.match.params;
  const [{ disable, currentData, loading, hasPending }, setState] = useSetState({
    disable: false,
    currentData: [],
    loading: true,
    hasPending: false,
  });
  useEffect(() => {
    Api.getApp({ appId: appId }, { silent: true }).then(data => {
      if (canEditData(data.permissionType)) {
        // 获取当前用户详情
        externalPortalAjax
          .getFilterRows({
            pageSize: 1,
            pageIndex: 1,
            keyWords: '',
            filterControls: [],
            fastFilters: [],
            appId,
            PotralStatus: 3, //3待审核
            sortControls: [],
            rowId: id,
          })
          .then(res => {
            if (_.get(res, 'data').length <= 0) {
              // alert(_l('当前用户已完成审批'), 3);
              setState({
                hasPending: true,
                loading: false,
              });
              return;
            }
            let data = _.get(res, 'template.controls').map(it => {
              return { ...it, value: (_.get(res, 'data').find(item => item.rowid === id) || {})[it.controlId] };
            });
            setState({
              currentData: data,
              loading: false,
            });
          });
      } else {
        alert(_l('暂无权限操作'), 3);
      }
    });
  }, []);
  //拒绝
  const editAppApplyStatus = rowIds => {
    externalPortalAjax
      .refusePassExAccount({
        appId,
        rowIds: rowIds,
      })
      .then(() => {
        alert(_l('已拒绝该用户申请'));
        setState({ disable: true });
      });
  };
  const rejectDialog = rowIds => {
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认拒绝吗？')}</span>,
      buttonType: 'danger',
      description: _l('拒绝后会从列表中删除此用户'),
      onOk: () => {
        editAppApplyStatus(rowIds);
      },
      style: { width: '90%' },
    });
  };
  if (loading) {
    return <LoadDiv />;
  }
  if (hasPending) {
    return (
      <WrapHasPend>
        <div className="flexColumn alignItemsCenter hasPendC">
          <div className="hasPendCon">
            <Icon className="Font60 Hand Gray_bd" icon="how_to_reg" />
          </div>
          <div className="TxtCenter mTop16 Font17 Bold">{_l('用户已审核')}</div>
        </div>
      </WrapHasPend>
    );
  }
  return (
    <Wrap>
      <UserInfoWrap
        show={true}
        isPage
        disable={disable}
        appId={appId}
        currentData={formatPortalData(
          currentData.map(o => {
            if (o.controlId === 'portal_status') {
              return { ...o, value: '["1"]' };
            } else {
              return o;
            }
          }),
        )}
        setShow={() => {}}
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
              rowIds: [id],
              newCell,
            })
            .then(res => {
              if (res.success) {
                alert(_l('已通过该用户申请'));
                setState({ disable: true });
              } else {
                alert(_l('操作失败，请稍后再试'), 3);
              }
            });
        }}
        width={'100%'}
        okText={_l('同意')}
        title={_l('用户信息')}
        renderCancel={() => {
          return (
            <WrapRejectBtn
              className={cx('btn rejectBtn Hand', { disable })}
              onClick={() => {
                if (disable) {
                  return;
                }
                rejectDialog([id]);
              }}
            >
              {_l('拒绝')}
            </WrapRejectBtn>
          );
        }}
      />
    </Wrap>
  );
}
