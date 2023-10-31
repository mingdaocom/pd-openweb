import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/AppRoleCon/redux/actions';
import { Textarea, Dialog } from 'ming-ui';
import Table from 'src/pages/Role/component/Table';
import cx from 'classnames';
import ApplyAction from 'src/pages/Role/AppRoleCon/component/ApplyAction';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';
import appManagementAjax from 'src/api/appManagement.js';
import UserHead from 'src/pages/feed/components/userHead';
import BatchDialog from 'src/pages/Role/AppRoleCon/component/BatchDialog';
import moment from 'moment';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum.js';
import { sysRoleType } from 'src/pages/Role/config.js';

const Wrap = styled.div`
  padding: 20px 10px 20px 10px;
  .wrapTr:not(.checkBoxTr) {
    width: 30%;
  }
  .wrapTr {
    height: auto !important;
  }
  .wrapTr.optionWrapTr {
    min-width: 150px !important;
    max-width: 150px !important;
  }
`;
const WrapBar = styled.div`
  .search .roleSearch {
    width: 244px;
    height: 37px;
    background: #ffffff;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
`;

function Apply(props) {
  const {
    appRole = {},
    appId,
    setSelectedIds,
    projectId,
    getApplyList,
    getAllInfoCount,
    SetAppRolePagingModel,
  } = props;
  const { selectedIds = [], roleInfos = [], appRolePagingModel = {} } = appRole;
  const [{ keyWords, userList, loading, show }, setState] = useSetState({
    userList: _.get(props, ['appRole', 'apply']) || [],
    loading: props.appRole.loading,
    keyWords: '',
    show: false,
  });
  useEffect(() => {
    getApplyList({ appId }, true);
  }, []);
  useEffect(() => {
    setState({
      userList: _.get(props, ['appRole', 'apply']) || [],
      loading: props.appRole.loading,
    });
  }, [props.appRole]);
  const columns = [
    {
      id: 'name',
      name: _l('申请人'),
      className: 'nameWrapTr',
      minW: 240,
      render: (text, data, index) => {
        const user = data.accountInfo;
        return (
          <div className={cx('name flexRow alignItemsCenter')}>
            <UserHead
              key={user.accountId}
              projectId={_.isEmpty(getCurrentProject(projectId)) ? '' : projectId}
              size={32}
              lazy="false"
              user={{
                ...user,
                accountId: user.accountId,
                userHead: user.avatar,
              }}
              className={'roleAvatar'}
            />
            <div className={'memberInfo flex pLeft8 overflowHidden'}>
              <span className={'memberName overflow_ellipsis Block TxtLeft breakAll'} title={user.fullName}>
                {user.fullName}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'remark',
      name: _l('申请说明'),
      render: (text, data, index) => {
        return (
          <div className="overflow_ellipsis breakAll" title={data.remark}>
            {data.remark}
          </div>
        );
      },
    },
    {
      id: 'createTime',
      name: _l('申请时间'),
      sorter: true,
      className: 'timeTr',
      minW: 130,
      render: (text, data, index) => {
        return moment(data.createTime).format('YYYY-MM-DD HH:mm');
      },
    },
    {
      id: 'option',
      name: '',
      className: 'optionWrapTr',
      render: (text, data, index) => {
        return (
          <div className="">
            {renderAction({
              appId: data.appId,
              id: data.id,
            })}
          </div>
        );
      },
    },
  ];
  const changeApplyStatus = ({ targetRoleIds, userIds }) => {
    if (targetRoleIds.length <= 0) {
      return alert(_l('请选择角色'), 3);
    }
    //2=通过，3=拒绝
    appManagementAjax.editAppApplyStatus({ appId, ids: userIds, status: 2, roleId: targetRoleIds[0] }).then(res => {
      if (res) {
        setSelectedIds([]);
        getApplyList({ appId }, true);
        setState({
          show: false,
        });
        getAllInfoCount();
      } else {
        alert(_l('操作失败，请刷新页面重试'), 3);
      }
    });
  };
  const renderAction = ({ id, appId }) => {
    const { appDetail = {} } = props;
    return (
      <div className={'applyAction'}>
        <ApplyAction
          roles={roleInfos.filter(o =>
            appDetail.permissionType === APP_ROLE_TYPE.RUNNER_ROLE ? !sysRoleType.includes(o.roleType) : true,
          )}
          getPopupContainer={() => {
            return document.body;
          }}
          onChange={role => {
            changeApplyStatus({
              appId,
              userIds: [id],
              targetRoleIds: [role.roleId],
            });
          }}
        />
        <span
          className={'rejectAction Hand mLeft30 Red'}
          onClick={() => {
            dialogRefuse({ appId, ids: [id] });
          }}
        >
          {_l('拒绝')}
        </span>
      </div>
    );
  };

  const dialogRefuse = ({ appId, ids }) => {
    Dialog.confirm({
      title: _l('拒绝'),
      closable: false,
      anim: false,
      description: <Textarea height={120} id="applyRoleRefuse" placeholder={_l('请填写拒绝原因')} />,
      onOk: () => {
        const remark = document.getElementById('applyRoleRefuse').value.trim();
        appManagementAjax
          .editAppApplyStatus({
            appId,
            ids: ids,
            status: 3,
            remark,
          })
          .then(res => {
            setSelectedIds([]);
            getApplyList({ appId }, true);
          });
      },
    });
  };

  return (
    <Wrap className={cx('flex flexColumn overflowHidden')}>
      <div className="bar flexRow alignItemsCenter barActionCon">
        <div className="title flex">
          <span className="Font17 Bold">{props.title}</span>{' '}
          {userList.length > 0 && <span className="Gray_9e mLeft10">{_l('%0个人员申请加入', userList.length)}</span>}
        </div>
        {selectedIds.length > 0 && (
          <div>
            <span
              className={cx('toOthers InlineBlock Hand mLeft10')}
              onClick={() => {
                setState({
                  show: true,
                });
              }}
            >
              {_l('通过')}
            </span>
            <span
              className={cx('del InlineBlock Hand mLeft10')}
              onClick={() => {
                dialogRefuse({ appId, ids: selectedIds });
              }}
            >
              {_l('拒绝')}
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
                onChange={keyWords => {
                  setState({
                    keyWords,
                    userList: !keyWords
                      ? props.appRole.apply
                      : props.appRole.apply.filter(
                          o => o.accountInfo.fullName.toLocaleLowerCase().indexOf(keyWords.toLocaleLowerCase()) >= 0,
                        ),
                  });
                }}
              />
            </div>
          </WrapBar>
        )}
      </div>
      <Table
        pageSize={100000}
        columns={columns}
        selectedIds={selectedIds}
        setSelectedIds={list => {
          setSelectedIds(list);
        }}
        showCheck={true}
        list={loading || !userList.length ? [] : userList}
        pageIndex={1}
        total={userList.length}
        onScrollEnd={null}
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
          getApplyList({ appId }, true);
        }}
        loading={loading}
      />
      {show && (
        <BatchDialog
          show={show}
          txt={_l('为选中的%0个申请人选择角色', selectedIds.length || 0)}
          title={_l('批量通过')}
          roleInfos={roleInfos.filter(o => o.canSetMembers)}
          okText={_l('保存并通过')}
          onCancel={() => {
            setState({
              show: false,
            });
          }}
          isMulti={true}
          onOk={roleIds => {
            setState({
              show: false,
            });
            changeApplyStatus({
              appId,
              userIds: selectedIds,
              targetRoleIds: roleIds,
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

export default connect(mapStateToProps, mapDispatchToProps)(Apply);
