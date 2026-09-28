import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, SearchInput, UserHead } from 'ming-ui';
import { Dropdown as AntdDropdown, Button, Checkbox, Modal, Space, Tooltip } from 'ming-ui/antd-components';
import AppManagement from 'src/api/appManagement.js';
import departmentController from 'src/api/department';
import { downloadFile } from 'src/pages/Admin/util';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { getColor, getIcon, getTxtColor, pageSize } from 'src/pages/Role/AppRoleCon/UserCon/config';
import { userStatusList } from 'src/pages/Role/AppRoleCon/UserCon/config.js';
import Table from 'src/pages/Role/component/Table';
import { sysRoleType } from 'src/pages/Role/config.js';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { APP_ROLE_TYPE } from 'src/utils/domain/worksheet/constants';
import { dateConvertToUserZone } from 'src/utils/platform/runtime/timeZone';
import { getTranslateInfo } from 'src/utils/services/app';
import { getCurrentProject } from 'src/utils/services/project';

const SearchInputCon = styled(SearchInput)`
  width: 244px;
`;

const ACTION_BUTTON_STYLE = { height: 32 };

const Wrap = styled.div`
  padding: 20px 10px 20px 10px;
  &.conExternal {
    padding: 20px 0;
  }
  .wrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 15);
  }
  .wrapTr.nameWrapTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 20);
  }
  .wrapTr.roleTr:not(.checkBoxTr):not(.optionWrapTr) {
    width: calc(calc(calc(100% - 70px - 38px) / 100) * 35);
  }

  .isCurmemberType {
    color: var(--color-primary);
  }
  .isMyRoleW {
    padding: 0px 7px;
    line-height: 18px;
    height: 18px;
    background: var(--color-primary);
    border-radius: 9px 9px 9px 9px;
    color: var(--color-white);
    .tag {
      font-size: 12px;
      font-weight: 400;
    }
  }
`;
const WrapBar = styled.div``;

const userChooseList = [
  {
    value: 0,
    label: _l('所有类型'),
  },
  {
    value: 10,
    label: _l('人员'),
  },
  {
    value: 20,
    label: _l('部门'),
  },
  {
    value: 30,
    label: _l('组织角色'),
  },
  {
    value: 40,
    label: _l('职位'),
  },
];
const ALL_MEMBER_TYPE_KEY = 'all';

const getNumTxt = user => {
  let l = [];

  if (user.departementCount > 0) {
    l.push(_l('%0个部门', user.departementCount));
  }

  if (user.organizeRoleCount > 0) {
    l.push(_l('%0组织角色', user.organizeRoleCount));
  }

  if (user.jobCount > 0) {
    l.push(_l('%0个职位', user.jobCount));
  }

  if (user.userCount > 0) {
    l.push(_l('%0名人员', user.userCount));
  }

  return l.join('、');
};

const getTotalCountTxt = (total = 0, searchMemberType = 0) => {
  if (total <= 0) {
    return '';
  }

  switch (searchMemberType) {
    case 20:
      return _l('%0个部门', total);
    case 30:
      return _l('%0组织角色', total);
    case 40:
      return _l('%0个职位', total);
    default:
      return _l('%0名人员', total);
  }
};

const sanitizeExportFileNameSegment = text =>
  String(text || '')
    .trim()
    .replace(/[/\\:*?"<>|]/g, '_');

const buildAppRoleExportFileName = appDetail => {
  const appName = sanitizeExportFileNameSegment(appDetail.name || appDetail.appName || '');
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  const timeStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(
    d.getMinutes(),
  )}${pad(d.getSeconds())}`;
  return `${_l('应用角色')}_${appName}_${timeStr}.xlsx`;
};

const getTranslatedRoleNames = (roleName = [], roleInfos = [], appId) => {
  return roleName.map(name => {
    const role = roleInfos.find(o => o.name === name);

    return role ? getTranslateInfo(appId, null, role.roleId).name || role.name : name;
  });
};

function User(props) {
  const ajaxRef = useRef(null);
  const {
    appRole = {},
    SetAppRolePagingModel,
    getUserList,
    appId,
    setSelectedIds,
    projectId,
    delUserRole,
    changeUserRole,
    isAdmin,
    canEditUser,
    canEditApp,
    appDetail = {},
    setQuickTag,
    isExternal,
    transferApp,
    changeExternalManager,
    isOwner,
  } = props;
  const { selectedIds = [], roleInfos = [], roleLimitInfo = {} } = appRole;
  const [
    {
      keyWords,
      memberType,
      pageIndex,
      total,
      roleId,
      userList,
      appRolePagingModel,
      loading,
      selectedAll,
      popupVisible,
      countTxt,
      fullDepartmentInfo,
    },
    setState,
  ] = useSetState({
    appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
    keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
    memberType: _.get(props, ['appRole', 'appRolePagingModel', 'searchMemberType']) || 0,
    pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
    total: _.get(props, ['appRole', 'user', 'totalCount']) || 0,
    user: _.get(props, ['appRole', 'user']) || {},
    roleId: _.get(props, ['roleId']),
    userList: _.get(props, ['appRole', 'userList']) || [],
    loading: props.appRole.loading,
    selectedAll: false,
    popupVisible: false,
    countTxt: getNumTxt(_.get(props, ['appRole', 'user']) || {}),
    fullDepartmentInfo: [],
  });
  useEffect(() => {
    setState({
      appRolePagingModel: _.get(props, ['appRole', 'appRolePagingModel']) || {},
      keyWords: _.get(props, ['appRole', 'appRolePagingModel', 'keywords']) || '',
      memberType: _.get(props, ['appRole', 'appRolePagingModel', 'searchMemberType']),
      pageIndex: _.get(props, ['appRole', 'appRolePagingModel', 'pageIndex']) || 1,
      total: _.get(props, ['appRole', 'user', 'totalCount']) || 0,
      user: _.get(props, ['appRole', 'user']) || {},
      userList: _.get(props, ['appRole', 'userList']) || [],
      loading: props.appRole.loading,
      countTxt: getNumTxt(_.get(props, ['appRole', 'user']) || {}),
    });
  }, [props.appRole]);
  const isRoleCharger = (
    (_.get(props, ['appRole', 'roleInfos']) || []).find(o => o.roleId === _.get(props, ['appRole', 'roleId'])) || {}
  ).canSetMembers; //是否当前角色的负责人或者有权管理改角色
  const isRunner = appDetail.permissionType === APP_ROLE_TYPE.RUNNER_ROLE; //运营者
  const canEdit =
    !window.isPublicApp && //非分享状态
    (isRoleCharger || isAdmin) &&
    !(isRunner && ['all', 'apply', 'outsourcing'].includes(roleId)); //运营者不可编辑全部|审批|外协
  useEffect(() => {
    setState({
      roleId: _.get(props, ['roleId']),
      selectedAll: false,
    });
    //兼容非管理员，渲染问题
    if (!canEditUser && _.get(props, ['appRole', 'roleId']) === 'all') {
      return;
    }

    getUserList({ appId }, true);
  }, [props.roleId]);
  //获取部门全路径
  const getDepartmentFullName = (departmentData = []) => {
    const departmentIds = departmentData.filter(it => !fullDepartmentInfo[it]);
    const isExternal = _.isEmpty(getCurrentProject(projectId)); // 是否为外协人员

    if (_.isEmpty(departmentIds) || isExternal) {
      return;
    }

    departmentController
      .getDepartmentFullNameByIds({
        projectId,
        departmentIds,
      })
      .then(res => {
        res.forEach(it => {
          fullDepartmentInfo[it.id] = it.name;
        });
        setState({ fullDepartmentInfo });
      });
  };

  useEffect(() => {
    getDepartmentFullName(
      _.get(props, 'appRole.userList')
        .filter(o => [1, 2].includes(o.memberType))
        .map(o => o.id),
    );
  }, [_.get(props, 'appRole.userList')]);
  const roleData = props.roleList.find(o => o.roleId === roleId) || {};

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
      render: (text, data) => {
        const isHead = data.isRoleCharger; // 角色负责人
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
              <div
                className={'iconBG flexRow alignItemsCenter TxtCenter'}
                style={{
                  background: getColor(data),
                }}
              >
                <Icon icon={getIcon(data)} className={cx('Font20 flex', getTxtColor(data))} />
              </div>
            )}
            <div className={'memberInfo flex pLeft8 flexRow alignItemsCenter'}>
              <Tooltip title={fullDepartmentInfo[data.id] ? fullDepartmentInfo[data.id] : data.name}>
                <span className={'memberName overflow_ellipsis Block TxtLeft breakAll'}>{data.name}</span>
              </Tooltip>
              {isHead && (
                <Tooltip title={_l('角色负责人')}>
                  <i className="icon-people_5 Font14 mLeft7" style={{ color: 'var(--color-warning-border)' }} />
                </Tooltip>
              )}
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
      id: 'memberType',
      name: _l('类型'),
      sorter: true, // roleId !== 'all',
      renderHeader: () => {
        return (
          <AntdDropdown
            trigger={['click']}
            placement="bottomLeft"
            getPopupContainer={() => document.body}
            menu={{
              selectable: false,
              style: { minWidth: 120 },
              items: userChooseList.map(({ value, label }) => ({
                key: value === 0 ? ALL_MEMBER_TYPE_KEY : String(value),
                label,
              })),
              onClick: ({ key }) => {
                const newValue = key === ALL_MEMBER_TYPE_KEY ? 0 : Number(key);

                setState({ memberType: newValue });
                SetAppRolePagingModel({
                  ...appRolePagingModel,
                  pageIndex: 1,
                  searchMemberType: newValue,
                });
                getUserList({ appId }, true);
              },
            }}
          >
            <span
              className={cx('memberTypeFilter Hand InlineFlex alignItemsCenter', {
                isCurmemberType: memberType > 0,
              })}
            >
              {_l('类型')}
              <Icon type="arrow-down" className="Font12 mLeft4" />
            </span>
          </AntdDropdown>
        );
      },

      render: (text, data) => {
        return (
          <div className="flex">
            <span className="memberType">{userStatusList.find(o => o.value === data.memberType).text}</span>
          </div>
        );
      },
    },
    {
      id: 'roleName',
      name: _l('角色'),
      className: 'nameWrapTr roleTr',
      minW: 240,
      render: (text, data) => {
        const roleNames = getTranslatedRoleNames(data.roleName, roleInfos, appId);
        const roleName = roleNames.join('；');

        return (
          <div className="flex flexRow">
            <span className="roleName overflow_ellipsis breakAll" title={roleName}>
              {roleName}
            </span>
          </div>
        );
      },
    },
    {
      id: 'operater',
      name: _l('操作人'),
      render: (text, data) => {
        return <div className="WordBreak ellipsis">{data.operater}</div>;
      },
    },
    {
      id: 'operateTime',
      name: _l('添加时间'),
      sorter: true,
      // sorterType: 'ascend',
      className: 'operateTime timeTr',
      minW: 130,
      render: (text, data) => {
        return createTimeSpan(dateConvertToUserZone(data.operateTime));
      },
    },
    {
      id: 'option',
      className: 'optionWrapTr',
      name: '',
      render: (text, data) => {
        const isHead = data.isRoleCharger; // 角色负责人
        let dataList = [
          {
            value: -1,
            text: !isHead ? _l('设为角色负责人') : _l('取消角色负责人'),
          },
          {
            value: 0,
            text:
              roleId !== 'all'
                ? _l('移到其他角色')
                : !isExternal
                  ? _l('修改角色')
                  : data.isManager
                    ? _l('取消管理员')
                    : _l('设为管理员'),
          },
          {
            value: 1,
            text: <span className="">{_l('移出')}</span>,
          },
        ];

        if (
          sysRoleType.includes(roleData.roleType) || //系统角色下
          roleId === 'all' || //tab ‘全部’
          data.memberType !== 5 //只有人员可被添加成角色负责人
        ) {
          //排除角色负责人操作
          dataList = dataList.filter(o => o.value !== -1);
        }

        if (data.isOwner) {
          dataList = isOwner
            ? [
                {
                  value: 2,
                  text: _l('移交应用'),
                },
              ]
            : [];
        }

        return (
          <DropOption
            dataList={dataList}
            onAction={o => {
              const itemId = [1, 2].includes(data.memberType) ? `${data.id}_${data.memberType}` : data.id;
              setState({
                selectedAll: false,
              });
              switch (o.value) {
                case 2:
                  transferApp();
                  break;
                case 1:
                  delUserRole([itemId]);
                  break;
                case -1:
                  let memberCategory = (userStatusList.find(o => data.memberType === o.value) || {}).key;

                  if (isHead) {
                    //取消负责人
                    changeIsRoleManager({ memberCategory, appId, roleId, memberId: data.id }, false, () => {
                      alert(_l('取消成功'));
                    });
                  } else {
                    // 设为负责人
                    return Modal.confirm({
                      className: '',
                      title: <span className="Font17">{_l('确认设置为角色负责人？')}</span>,
                      content: (
                        <div className="textSecondary Font15 mBottom6 WordBreak">
                          {_l('角色负责人可添加、移出当前角色下的成员')}
                        </div>
                      ),
                      onOk: () => {
                        changeIsRoleManager(
                          {
                            memberCategory,
                            appId,
                            roleId,
                            memberId: data.id,
                          },
                          true,
                        );
                      },
                    }).destroy;
                  }

                  break;
                default:
                  if (isExternal) {
                    //取消|设置成为管理员角色=>仅支持外部链接应用
                    const managerId = (roleInfos.filter(o => sysRoleType.includes(o.roleType))[0] || {}).roleId; //管理员角色id
                    const normalId = (roleInfos.filter(o => !sysRoleType.includes(o.roleType))[0] || {}).roleId; //成员角色id
                    changeExternalManager([!data.isManager ? managerId : normalId], [itemId], false, () => {
                      alert(data.isManager ? _l('取消成功') : _l('设置成功'));
                    });
                  } else {
                    changeUserRole([itemId]);
                  }

                  break;
              }
            }}
            placement="bottomRight"
          />
        );
      },
    },
  ];

  //取消或设置成为角色负责人
  const changeIsRoleManager = (param, isRoleCharger, cb) => {
    if (ajaxRef.current) {
      ajaxRef.current.abort();
    }

    const request = !isRoleCharger ? AppManagement.cancelRoleCharger(param) : AppManagement.setRoleCharger(param);

    ajaxRef.current = request;
    request.then(() => {
      //取消当前用户的负责人，刷新页面
      if (param.memberId === md.global.Account.accountId && !isRoleCharger) {
        location.reload();
        return;
      }

      getUserList({ appId }, true);
      cb && cb();
    });
  };

  const dropdownProps = {
    trigger: ['click'],
    placement: 'bottomLeft',
    open: popupVisible,
    onOpenChange: visible => {
      setState({
        popupVisible: visible,
      });
    },
    menu: {
      items: (roleLimitInfo.limitState ? [_l('人员')] : [_l('人员'), _l('部门'), _l('组织角色'), _l('职位')]).map(
        (label, index) => ({
          key: index,
          label,
          onClick: () => {
            switch (index) {
              case 0:
                props.addUserToRole(userList.filter(o => o.memberType === 5).map(user => user.id));
                break;
              case 1:
                props.addDepartmentToRole();
                break;
              case 2:
                props.addOrgRole();
                break;
              case 3:
                props.addJobToRole();
                break;
            }

            setState({
              popupVisible: false,
              selectedAll: false,
            });
          },
        }),
      ),
    },
    getPopupContainer: () => document.body,
  };

  const handleSearch = useCallback(
    (keyWords, pagingModel) => {
      SetAppRolePagingModel({
        ...pagingModel,
        pageIndex: 1,
        keywords: keyWords,
      });
      getUserList({ appId }, true);
    },
    [SetAppRolePagingModel, appId, getUserList],
  );
  const debouncedSearch = useMemo(() => _.debounce(handleSearch, 500), [handleSearch]);

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const onSearch = keywords => {
    setState({ keyWords: keywords });

    if (keywords) {
      debouncedSearch(keywords, appRolePagingModel);
    } else {
      debouncedSearch.cancel();
      handleSearch('', appRolePagingModel);
    }
  };

  const canExportAppRoleList = roleId === 'all' && !isExternal && isAdmin; //仅管理员/超管可以导出全部角色
  const titleCountTxt = countTxt || (!loading ? getTotalCountTxt(total, memberType) : '');

  const handleExportAppRoles = () => {
    if (!appId) {
      return;
    }

    const url = `${md.global.Config.AjaxApiUrl}download/ExportAppRoleMembers`;

    downloadFile({
      url,
      params: {
        appId,
        ..._.omit(appRolePagingModel || {}, ['pageIndex', 'pageSize']),
      },
      exportFileName: buildAppRoleExportFileName(appDetail),
    });
  };

  return (
    <Wrap className={cx('flex flexColumn overflowHidden', { isAllType: roleId !== 'all', conExternal: isExternal })}>
      <div className="bar flexRow alignItemsCenter barActionCon">
        <div className="title flex flexRow alignItemsCenter">
          <span className="Font17 Bold WordBreak overflow_ellipsis" title={props.title}>
            {props.title}
          </span>
          <span
            className="textTertiary mLeft15 TxtMiddle mRight8 overflow_ellipsis breakAll flex-shrink-0"
            title={titleCountTxt}
          >
            {titleCountTxt}
          </span>
        </div>
        {selectedIds.length > 0 && (
          <Space size={10}>
            {canEdit && !isExternal && (
              <Button
                color="primary"
                variant="filled"
                style={ACTION_BUTTON_STYLE}
                onClick={() => {
                  changeUserRole(selectedIds, selectedAll);
                }}
              >
                {roleId === 'all' ? _l('修改角色') : _l('移到其他角色')}
              </Button>
            )}
            <Button
              color="danger"
              variant="filled"
              style={ACTION_BUTTON_STYLE}
              onClick={() => {
                delUserRole(selectedIds, selectedAll);
              }}
            >
              {_l('移出')}
            </Button>
          </Space>
        )}
        {selectedIds.length <= 0 && (
          <WrapBar>
            {isExternal && (
              <Tooltip
                title={
                  <span>
                    {_l('开启时，当用户被添加、移除、变更角色时会收到系统通知，关闭时，以上操作不通知用户。')}
                  </span>
                }
              >
                <span className="InlineBlock mRight20 LineHeight36 TxtTop">
                  <Checkbox
                    className=""
                    checked={props.notify}
                    onChange={() => {
                      props.updateAppRoleNotify();
                    }}
                    size="small"
                  >
                    {_l('发送通知')}
                  </Checkbox>
                </span>
              </Tooltip>
            )}
            <div className="search InlineBlock">
              <SearchInputCon placeholder={props.placeholder || _l('搜索')} value={keyWords} onChange={onSearch} />
            </div>
            {canExportAppRoleList && (
              <Button className="mLeft12" onClick={handleExportAppRoles}>
                {_l('导出')}
              </Button>
            )}
            {roleId !== 'all' && canEditApp && !isExternal && (
              <Button
                className="mLeft20"
                onClick={() => {
                  setQuickTag({ roleId: roleId, tab: 'roleSet' });
                }}
              >
                {sysRoleType.includes(roleData.roleType) ? _l('查看角色') : _l('编辑角色')}
              </Button>
            )}
            {(roleId !== 'all' || isExternal) && canEdit && (
              <AntdDropdown {...dropdownProps}>
                <Button type="primary" className="mLeft20" icon={<Icon type="add" />}>
                  {_l('添加用户')}
                </Button>
              </AntdDropdown>
            )}
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
        ownerNoOption={true}
        pageSize={pageSize}
        columns={columns.filter(o => (canEdit ? true : o.id !== 'option'))}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck={canEdit}
        list={pageIndex <= 1 && loading ? [] : userList}
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
          getUserList({ appId }, true);
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
          getUserList({ appId }, true);
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

export default connect(mapStateToProps, mapDispatchToProps)(User);
