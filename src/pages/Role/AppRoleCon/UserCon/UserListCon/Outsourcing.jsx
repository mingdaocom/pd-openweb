import React, { useState, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { Icon, UserHead } from 'ming-ui';
import Table from 'src/pages/Role/component/Table';
import cx from 'classnames';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';
import { getIcon, getColor, getTxtColor } from 'src/pages/Role/AppRoleCon/UserCon/config';
import moment from 'moment';
const pageSize = 1000;
const Wrap = styled.div`
  padding: 20px 10px 20px 10px;
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 15);
  }
  .wrapTr.nameWrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 30);
  }
  .wrapTr.roleTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 40);
  }
`;
const WrapBar = styled.div`
  .addUser {
    line-height: 37px;
    background: #2196f3;
    border-radius: 3px;
    color: #fff;
    padding: 0 12px;
    display: inline-block;
  }
  .search .roleSearch {
    width: 244px;
    height: 37px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
`;

function Others(props) {
  const {
    appRole = {},
    SetAppRolePagingModel,
    getOutList,
    appId,
    setSelectedIds,
    projectId,
    delUserRole,
    changeUserRole,
    isAdmin,
  } = props;
  const { selectedIds = [] } = appRole;
  const [{ keyWords, pageIndex, total, roleId, userList, appRolePagingModel, loading, selectedAll }, setState] =
    useSetState({
      appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
      keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
      pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
      total: _.get(props, ['appRole', 'outsourcing', 'totalCount']) || 0,
      roleId: _.get(props, ['roleId']),
      userList: _.get(props, ['appRole', 'outsourcing', 'memberModels']) || [],
      loading: props.appRole.loading,
      selectedAll: false,
    });
  useEffect(() => {
    getOutList({ appId }, true);
  }, []);
  useEffect(() => {
    setState({
      appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
      keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
      pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
      total: _.get(props, ['appRole', 'outsourcing', 'totalCount']) || 0,
      user: _.get(props, ['appRole', 'user']) || {},
      userList: _.get(props, ['appRole', 'outsourcing', 'memberModels']) || [],
      loading: props.appRole.loading,
    });
  }, [props.appRole]);
  const canEdit = isAdmin;
  const columns = [
    {
      id: 'name',
      className: 'nameWrapTr',
      name: _l('用户'),
      minW: 240,
      renderHeader: () => {
        return (
          <div className="flex">
            <span className={cx('name', { pLeft40: !canEdit })}>{_l('用户')}</span>
          </div>
        );
      },
      render: (text, data, index) => {
        return (
          <div className={cx('name flexRow alignItemsCenter', { pLeft40: !canEdit })}>
            {data.memberType === 5 ? (
              <UserHead
                key={data.accountId}
                projectId={projectId}
                size={32}
                user={{
                  ...data,
                  accountId: data.id,
                  userHead: data.avatar,
                }}
                className={'roleAvatar'}
              />
            ) : (
              <div className={'iconBG flexRow alignItemsCenter TxtCenter'} style={{ background: getColor(data) }}>
                <Icon icon={getIcon(data)} className={cx('Font24 flex', getTxtColor(data))} />
              </div>
            )}
            <div className={'memberInfo flex pLeft8 flexRow alignItemsCenter'}>
              <span className={'memberName overflow_ellipsis Block TxtLeft breakAll'} title={data.name}>
                {data.name}
              </span>
              {[2].includes(data.memberType) && (
                <span className={'memberTag mLeft8'}>
                  <span className={'tag'}>{_l('仅当前部门')}</span>
                </span>
              )}
              {data.isOwner && (
                <span className={'ownerTag mLeft8'}>
                  <span className={'tag'}>{_l('拥有者')}</span>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'roleName',
      name: _l('角色'),
      minW: 240,
      className: 'nameWrapTr roleTr',
      render: (text, data, index) => {
        return (
          <div className="flex flexRow">
            <span className="roleName overflow_ellipsis breakAll" title={data.roleName.join('；')}>
              {data.roleName.join('；')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'operater',
      name: _l('操作人'),
    },
    {
      id: 'operateTime',
      name: _l('添加时间'),
      // sorter: true,
      className: 'timeTr',
      minW: 130,
      render: (text, data, index) => {
        return createTimeSpan(data.operateTime);
      },
    },
    {
      id: 'option',
      name: '',
      className: 'optionWrapTr',
      render: (text, data, index) => {
        const dataList = [
          {
            value: 0,
            text: _l('修改角色'),
          },
          {
            value: 1,
            text: <span className="">{_l('移出')}</span>,
          },
        ];

        return (
          <DropOption
            dataList={dataList}
            onAction={o => {
              if (o.value === 1) {
                delUserRole([data.id]);
              } else {
                changeUserRole([data.id]);
              }
            }}
            popupAlign={{
              points: ['tr', 'br'],
              offset: [-180, 0],
            }}
          />
        );
      },
    },
  ];
  const handleSearch = keyWords => {
    setState({ keyWords });
    SetAppRolePagingModel({
      ...appRolePagingModel,
      pageIndex: 1,
      keywords: keyWords,
    });
  };
  const onSearch = _.debounce(keywords => handleSearch(keywords), 500);
  return (
    <Wrap className={cx('flex flexColumn overflowHidden', { isAllType: roleId !== 'all' })}>
      <div className="bar flexRow alignItemsCenter barActionCon">
        <div className="title flex">
          <span className="Font17 Bold">{props.title}</span>
          <span className="Gray_9e mLeft10">{_l('%0个外协用户', total || 0)}</span>
        </div>
        {selectedIds.length > 0 && (
          <div>
            <span
              className={cx('toOthers InlineBlock Hand mLeft10')}
              onClick={() => {
                changeUserRole(selectedIds, selectedAll);
              }}
            >
              {_l('修改角色')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                delUserRole(selectedIds, selectedAll);
              }}
            >
              {_l('移出')}
            </span>
          </div>
        )}
        {selectedIds.length <= 0 && (
          <WrapBar>
            <div className="search InlineBlock">
              <SearchInput
                className="roleSearch"
                placeholder={props.placeholder || _l('搜索')}
                value={keyWords}
                onChange={onSearch}
              />
            </div>
          </WrapBar>
        )}
      </div>
      <Table
        selectedAll={selectedAll}
        setSelectedAll={isCheck => {
          setState({
            selectedAll: isCheck,
          });
        }}
        pageSize={pageSize}
        columns={columns.filter(o => (canEdit ? true : o.id !== 'option'))}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck={canEdit}
        list={
          pageIndex <= 1 && loading
            ? []
            : !keyWords
            ? userList
            : userList.filter(o => o.name.toLocaleLowerCase().indexOf(keyWords.toLocaleLowerCase()) >= 0)
        }
        pageIndex={pageIndex}
        total={total}
        onScrollEnd={() => {
          if (userList.length >= total || userList.length < pageSize * pageIndex || loading) {
            return;
          }
          setState({ pageIndex: pageIndex + 1 });
          SetAppRolePagingModel({
            ...appRolePagingModel,
            pageIndex: pageIndex + 1,
          });
          getOutList({ appId }, true);
        }}
        handleChangeSortHeader={sorter => {
          const { field, order } = sorter;
          let data = appRolePagingModel.sort.filter(o => o.fieldType !== (field === 'operateTime' ? 10 : 20));
          if (field === 'operateTime') {
            data = [...data, { fieldType: 10, isASC: order === 'ascend' }];
          } else {
            data = [...data, { fieldType: 20, isASC: order === 'ascend' }];
          }
          SetAppRolePagingModel({
            ...appRolePagingModel,
            pageIndex: 1,
            sort: data,
          });
          getOutList({ appId }, true);
        }}
        loading={loading}
      />
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Others);
