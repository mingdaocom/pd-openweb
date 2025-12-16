import React from 'react';
import cx from 'classnames';
import { Dropdown } from 'ming-ui';
import externalPortalAjax from 'src/api/externalPortal';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { renderText } from 'src/pages/Role/PortalCon/tabCon/util';
import { userStatusList } from './config';

const renderHeader = (filterStatus, setFilterStatus, setFastFilters, filterStatusNum) => {
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
};

const renderControl = (text, data) => {
  let portal_status = safeParse(data.portal_status, 'array')[0];
  //正常、未激活（添加用户后用户未注册）停用
  if (portal_status === '5') {
    return <span className="Gray_9e">{_l('未激活')}</span>;
  }
  return (userStatusList.filter(o => o.value + '' !== '5').find(o => o.value === portal_status) || {}).text;
};

export const getColumns = (controls, roleList, filterStatus, setFilterStatus, setFastFilters, filterStatusNum) => {
  let columns = [];
  let controlsFormat = controls
    .filter(o => !['portal_avatar', 'partal_id'].includes(o.controlId))
    .map(o => {
      return { ...o, row: o.controlId === 'portal_email' ? 1 : o.controlId === 'portal_logintime' ? 5 : o.row };
    })
    .sort((a, b) => {
      return a.row - b.row;
    });

  controlsFormat.map(o => {
    if (o.controlId === 'portal_name') {
      columns.push({
        ...o,
        id: o.controlId,
        className: 'nameWrapTr',
        name: _l('用户'),
        minW: 240,
        render: (text, data) => {
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
    } else if (o.controlId === 'portal_role') {
      columns.push({
        ...o,
        id: o.controlId,
        name: _l('角色'),
        render: (text, data) => {
          let role = '';
          try {
            let d = safeParse(data['portal_role'], 'array');
            role = d[0] || '';
          } catch (error) {
            console.log(error);
            role = '';
          }
          const roleName = (roleList.find(o => o.roleId === role) || {}).name;
          return (
            <span className="overflow_ellipsis WordBreak" title={roleName}>
              {roleName}
            </span>
          );
        },
      });
    } else if (o.controlId === 'portal_status') {
      columns.push({
        ...o,
        id: o.controlId,
        name: _l('状态'),
        renderHeader: () => renderHeader(filterStatus, setFilterStatus, setFastFilters, filterStatusNum),
        render: renderControl,
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
        render: (text, data) => {
          return <div className="ellipsis TxtMiddle">{renderText({ ...o, value: data[o.controlId] })}</div>;
        },
      });
    }
  });
  return columns;
};

export const getColumnsShowControls = ({
  columns,
  showPortalControlIds,
  updateActivationStatus,
  setChangeRoleDialog,
  setSelectedIds,
  getList,
  delOne,
  updateListByStatus,
  appId,
}) => {
  return columns
    .filter(o => showPortalControlIds.includes(o.id))
    .concat({
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: (text, data) => {
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
          if (md.global.Config.IsLocal) {
            dataList = [{ value: '1', text: _l('激活') }, ...dataList];
          }
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

        const onAction = o => {
          if (!data.rowid) return;
          if (portal_status === '5') {
            if (o.value === '7') {
              externalPortalAjax.removeUsers({ appId, rowIds: [data.rowid] }).then(() => {
                setSelectedIds([]); //清除选择
                getList(); //重新获取当前页面数据
              });
            } else if (o.value === '1') {
              updateActivationStatus([data.rowid]);
            } else {
              externalPortalAjax.reinviteExAccount({ appId, rowIds: [data.rowid] }).then(res => {
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
        };

        return (
          <DropOption
            dataList={dataList}
            onAction={onAction}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [-180, 0],
            }}
          />
        );
      },
    });
};
