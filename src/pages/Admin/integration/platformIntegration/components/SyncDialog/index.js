import React, { Component, Fragment } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, Icon, LoadDiv, ScrollView } from 'ming-ui';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import { INTEGRATION_INFO } from '../../config';
import './index.less';

export default class SyncDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mingDaoUserInfos: [],
      bindQWUserIds: [], // 已绑定的列表
      filterMatchPhoneBindUserIds: [],
      pageIndex: 1,
      pageSize: 20,
      allCount: 0,
      loading: false,
      searchLoading: false,
      syncLoading: false,
    };
    this.ajaxPromise = null;
    this.ajaxWorkWXUsers = null;
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.isBindRelationship, nextProps.isBindRelationship) && nextProps.isBindRelationship) {
      this.setState({ loading: true }, () => {
        this.getBindList();
      });
    } else if (nextProps.isBindRelationship === false) {
      this.setState({
        mingDaoUserInfos: nextProps.mingDaoUserInfos,
        bindQWUserIds: nextProps.bindQWUserIds,
        filterMatchPhoneBindUserIds: nextProps.filterMatchPhoneBindUserIds,
        logDetailItems: nextProps.logDetailItems,
      });
    }
  }

  getBindList = params => {
    const { integrationType } = this.props;
    const { pageIndex = 1, pageSize = 20, platformKeyword, workwxKeyword } = params || {};
    if (this.ajaxPromise && this.ajaxPromise.abort) {
      this.ajaxPromise.abort();
    }
    let extraParams = integrationType === 3 ? { workwxKeyword } : { tpKeyword: workwxKeyword };
    this.ajaxPromise = INTEGRATION_INFO[integrationType].getRelationsAjax({
      projectId: this.props.projectId,
      pageIndex,
      pageSize,
      platformKeyword,
      ...extraParams,
    });

    this.ajaxPromise.then(res => {
      const { item3 = [], item4 } = res;
      this.setState({
        mingDaoUserInfos: item3.map(v => ({ ...v, userInfo: integrationType === 3 ? v.wxUserInfo : v.tpUserInfo })),
        allCount: item4,
        loading: false,
      });
    });
  };

  renderConfirmSync = () => {
    const { projectId, integrationType } = this.props;
    const { mingDaoUserInfos = [], bindQWUserIds = [], confirmVisible, syncLoading } = this.state;
    let userMaps = {};
    mingDaoUserInfos.forEach(item => {
      if (item.userInfo && !_.isEmpty(item.userInfo)) {
        userMaps[item.accountId] = item.userInfo.userId;
      }
    });
    return (
      <Dialog
        visible={confirmVisible}
        title={_l('确认同步？')}
        width="555px"
        okDisabled={syncLoading}
        onCancel={() => {
          this.setState({ confirmVisible: false });
        }}
        onOk={() => {
          this.setState({ syncLoading: true });
          INTEGRATION_INFO[integrationType]
            .syncAjax({
              projectId,
              userMaps: userMaps,
            })
            .then(res => {
              if (res.item1) {
                alert(_l('同步成功'));
                this.setState({ confirmVisible: false, syncLoading: false });
              } else {
                this.setState({ confirmVisible: false, syncLoading: false });
                Dialog.confirm({
                  title: _l('同步失败'),
                  description: res.item2 || _l('同步失败'),
                  showCancel: false,
                });
              }
            })
            .catch(() => {
              this.setState({ confirmVisible: false, syncLoading: false });
            });
        }}
      >
        <div>
          {this.getCount(4) - bindQWUserIds.length > 0
            ? _l(
                '检索到未绑定组织用户的%0用户 %1 个，平台会为这 %1 个用户创建新的组织账号绑定',
                INTEGRATION_INFO[integrationType].text,
                this.getCount(4) - bindQWUserIds.length,
              )
            : _l('平台会给未绑定组织用户的%0用户创建一个组织账号绑定', INTEGRATION_INFO[integrationType].text)}
        </div>
      </Dialog>
    );
  };

  onOk = () => {
    const { mingDaoUserInfos = [] } = this.state;
    let userMaps = {};
    mingDaoUserInfos.forEach(item => {
      if (item.userInfo && !_.isEmpty(item.userInfo)) {
        userMaps[item.accountId] = item.userInfo.userId;
      }
    });
    this.props.onCancel();
    this.setState({ confirmVisible: true, syncLoading: false });
  };
  // 选择绑定用户
  bindQWUser = (accountId, userInfo) => {
    let temp = [...this.state.mingDaoUserInfos].map(item => {
      if (item.accountId === accountId) {
        return {
          ...item,
          userInfo,
        };
      }
      return item;
    });
    this.setState({
      mingDaoUserInfos: temp,
      qwUserList: this.state.qwUserList.filter(v => v.userId == userInfo.userId),
      bindQWUserIds: this.state.bindQWUserIds.concat(userInfo.userId),
      filterMatchPhoneBindUserIds: temp
        .filter(item => item.userInfo && item.userInfo.userId && item.userInfo.matchType !== 1)
        .map(v => v.userInfo.userId),
    });
  };

  searchQWUserList = _.throttle(value => {
    this.setState({ keywords: value }, () => {
      this.getWorkWXUsers();
    });
  }, 200);

  renderSelectUsers = accountId => {
    const { qwUserList = [], searchLoading } = this.state;

    return (
      <div className="selectUserWrap flexColumn">
        <div className="searchBox">
          <Icon icon="search" className="Gray_bd Font20 mRight16" />
          <input
            ref={ele => (this.input = ele)}
            placeholder={_l('搜索姓名、部门、职位')}
            onChange={e => this.searchQWUserList(e.target.value)}
          />
        </div>
        <div className="userList flex overflowHidden">
          {searchLoading ? (
            <LoadDiv />
          ) : _.isEmpty(qwUserList) ? (
            <div className="mTop50 TxtCenter Gray_75 Font15">{_l('无数据')}</div>
          ) : (
            <ScrollView className="h100">
              {qwUserList.map(item => {
                let qvJobNames = (item.jobNames || []).join(';');
                let qwDepartmentNames = (item.departmentNames || []).join(';');
                return (
                  <div className="listItem" key={item.userId} onClick={() => this.bindQWUser(accountId, item)}>
                    <div className="Font14 bold Gray">{item.fullname}</div>
                    <div className="userInfo ellipsis Gray_75 Font13">
                      {qvJobNames && qwDepartmentNames
                        ? `${qvJobNames} | ${qwDepartmentNames}`
                        : qvJobNames || qwDepartmentNames}
                    </div>
                  </div>
                );
              })}
            </ScrollView>
          )}
        </div>
      </div>
    );
  };

  // 搜索组织用户
  searchProjecUsers = value => {
    this.setState({ platformKeyword: value });
    if (!value) {
      this.getBindList({
        pageIndex: 1,
        platformKeyword: value,
        workwxKeyword: this.state.workwxKeyword,
      });
    }
  };

  // 搜索用户
  searchWorkwxUsers = value => {
    this.setState({ workwxKeyword: value });
    if (!value) {
      this.getBindList({
        pageIndex: 1,
        platformKeyword: this.state.platformKeyword,
        workwxKeyword: value,
      });
    }
  };

  // 分页
  changPage = page => {
    this.setState({ pageIndex: page, loading: true }, () => {
      this.getBindList({
        pageIndex: page,
        platformKeyword: this.state.platformKeyword,
        workwxKeyword: this.state.workwxKeyword,
      });
    });
  };
  // 移除
  removeWXUser = accountId => {
    const { mingDaoUserInfos = [] } = this.state;
    let tempList = mingDaoUserInfos.map(item => {
      if (item.accountId === accountId) {
        return {
          ...item,
          userInfo: {},
        };
      }
      return item;
    });
    this.setState({
      mingDaoUserInfos: tempList,
      bindQWUserIds: tempList.filter(item => item.userInfo && item.userInfo.userId).map(v => v.userInfo.userId),
    });
  };
  // 获取微信用户列表
  getWorkWXUsers = () => {
    const { integrationType } = this.props;
    const { bindQWUserIds = [], keywords } = this.state;
    if (this.ajaxWorkWXUsers && this.ajaxWorkWXUsers.abort) {
      this.ajaxWorkWXUsers.abort();
    }
    this.setState({ searchLoading: true });
    this.ajaxWorkWXUsers = INTEGRATION_INFO[integrationType].getAddressAjax({
      projectId: this.props.projectId,
      keywords: _.trim(keywords),
    });
    this.ajaxWorkWXUsers.then(res => {
      const { item3 = [] } = res;
      this.setState({
        qwUserList: item3.filter(item => !_.includes(bindQWUserIds, item.userId)),
        searchLoading: false,
      });
    });
  };
  // 解绑
  cancelBind = (accountId, userId) => {
    const { projectId, integrationType } = this.props;
    Dialog.confirm({
      title: _l('确定解绑'),
      description: _l(
        '%0账号与平台账号解绑后，将不能通过平台官网登录；后续点击同步可以重新选择账号绑定。',
        INTEGRATION_INFO[integrationType].text,
      ),
      onOk: () => {
        const params =
          integrationType === 3
            ? { mingdaoAccountId: accountId, workwxUserId: userId }
            : { mdAccountId: accountId, tpUserId: userId };
        INTEGRATION_INFO[integrationType]
          .unbindRelationAjax({
            projectId,
            ...params,
          })
          .then(res => {
            if (res) {
              alert(_l('操作成功'));
              this.getBindList({
                pageIndex: 1,
                platformKeyword: this.state.platformKeyword,
                workwxKeyword: this.state.workwxKeyword,
              });
            } else {
              alert(_l('操作失败'), 2);
            }
          });
      },
    });
  };

  getUserList = type => {
    const { logDetailItems = [] } = this.state;

    return (
      _.get(
        logDetailItems.find(item => item.type === type),
        'items',
      ) || []
    );
  };

  getCount = type => {
    if (type === 6) return _.difference(this.getUserList(type), this.getUserList(5)).length;

    return this.getUserList(type).length;
  };
  renderSyncInfo = () => {
    const { visible, isBindRelationship, integrationType } = this.props;
    const {
      allCount,
      pageIndex = 1,
      pageSize,
      platformKeyword = '',
      workwxKeyword = '',
      mingDaoUserInfos = [],
      bindQWUserIds = [],
      loading,
    } = this.state;
    const extra = isBindRelationship ? { footer: null } : {};

    return (
      <Dialog
        className="syncDialog"
        width={1045}
        visible={visible}
        title={isBindRelationship ? _l('绑定关系') : _l('同步账号')}
        okText={_l('同步')}
        onCancel={() => {
          this.props.onCancel();
          this.setState({ mingDaoUserInfos: [], bindQWUserIds: [] });
        }}
        onOk={this.onOk}
        {...extra}
      >
        {isBindRelationship ? (
          <div className="searchConditionWrap mBottom24">
            <Input
              allowClear
              placeholder={_l('搜索组织用户')}
              prefix={<Icon icon="search" />}
              value={platformKeyword}
              className="mRight16 searchInput"
              onChange={e => this.searchProjecUsers(e.target.value)}
              onKeyUp={e => {
                let val = e.target.value.trim();
                if (e.keyCode === 13) {
                  this.setState({ loading: true });
                  this.getBindList({
                    pageIndex: 1,
                    platformKeyword: val,
                    workwxKeyword: this.state.workwxKeyword,
                  });
                }
              }}
            />
            <Input
              allowClear
              placeholder={_l('搜索%0用户', INTEGRATION_INFO[integrationType].text)}
              prefix={<Icon icon="search" />}
              value={workwxKeyword}
              className="searchInput"
              onChange={e => this.searchWorkwxUsers(e.target.value)}
              onKeyUp={e => {
                let val = e.target.value.trim();
                if (e.keyCode === 13) {
                  this.setState({ loading: true });
                  this.getBindList({
                    pageIndex: 1,
                    platformKeyword: this.state.platformKeyword,
                    workwxKeyword: val,
                  });
                }
              }}
            />
          </div>
        ) : (
          <Fragment>
            <div className="syncInfo">
              <div className="Font15 bold mBottom3">{_l('同步内容')}</div>
              <div className="Gray_75">
                {_l('新增组织用户')}
                <span className="bold Gray mLeft3 mRight3">
                  {this.getCount(4) - bindQWUserIds.length >= 0 ? this.getCount(4) - bindQWUserIds.length : 0}
                </span>
                {_l('个；匹配到已有组织用户')}
                <span className="bold Gray mLeft3 mRight3">{bindQWUserIds.length}</span>
                {_l('个')}
                {this.getCount(6) ? (
                  <span>
                    {_l('; 同步%0用户信息', INTEGRATION_INFO[integrationType].text)}
                    <span className="bold Gray mLeft3 mRight3">{this.getCount(6)}</span>
                    {_l('个')}
                  </span>
                ) : (
                  ''
                )}
                {this.getCount(5) ? (
                  <span>
                    {_l('；解除与组织用户绑定关系')}
                    <span className="bold Gray mLeft3 mRight3">{this.getCount(5)}</span>
                    {_l('个')}
                  </span>
                ) : (
                  ''
                )}
                {this.getCount(17) ? (
                  <span>
                    {_l('；已恢复离职用户')}
                    <span className="bold Gray mLeft3 mRight3">{this.getCount(17)}</span>
                    {_l('个')}
                  </span>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className="bindInfo mTop20 mBottom15">
              <div className="Font15 bold mBottom3">{_l('绑定关系')}</div>
              <div className="">
                {_l('将未绑定过')}
                <span className="bold mLeft3">{_l('%0的组织用户', INTEGRATION_INFO[integrationType].text)}</span>
                {_l('与')}
                <span className="bold mRight3">{_l('本次同步的%0用户', INTEGRATION_INFO[integrationType].text)}</span>
                {_l('建立绑定关系')}
              </div>
            </div>
          </Fragment>
        )}
        {loading ? (
          <div className="flexColumn w100 alignItemsCenter justifyContentCenter flex">
            <LoadDiv />
          </div>
        ) : _.isEmpty(mingDaoUserInfos) ? (
          <div className="emptyWrap flexColumn w100 alignItemsCenter justifyContentCenter flex">
            <div className="emptyIconWrap">
              <Icon icon="Empty_data" className="Font40" />
            </div>
            <div className="Gray_75 Font15">
              {isBindRelationship
                ? _l('无数据')
                : _l('没有查询到未绑定%0用户的组织用户', INTEGRATION_INFO[integrationType].text)}
            </div>
          </div>
        ) : (
          <div className="bindTable flex">
            <div className="tableHeader flexRow alignItemsCenter">
              <div className="flex pLeft12">
                {isBindRelationship
                  ? _l('组织用户')
                  : _l('组织用户（%0/%1）', bindQWUserIds.length, mingDaoUserInfos.length)}
              </div>
              <div className="flex pLeft16">{_l('%0用户', INTEGRATION_INFO[integrationType].text)}</div>
              {isBindRelationship ? <div className="cancelBind">{_l('操作')}</div> : ''}
            </div>
            <div className="tableBody">
              {mingDaoUserInfos.map(item => {
                let mdJobNames = (item.jobNames || []).join(';');
                let mdDepartmentNames = (item.departmentNames || []).join(';');
                if (item.userInfo && !_.isEmpty(item.userInfo)) {
                  let userInfo = item.userInfo;
                  let qvJobNames = (userInfo.jobNames || []).join(';');
                  let qwDepartmentNames = (userInfo.departmentNames || []).join(';');
                  return (
                    <div className="row flexRow" key={`${item.accountId}-${userInfo.userId}`}>
                      <div className="flex orgInfo flexRow alignItemsCenter pLeft12">
                        <img className={cx('avatar', { bg: !item.avatar })} src={item.avatar} />
                        <div className="flex userInfo">
                          <div className="name bold">{item.fullname}</div>
                          <div className="Gray_75 ellipsis">
                            {mdJobNames && mdDepartmentNames
                              ? `${mdJobNames} | ${mdDepartmentNames}`
                              : mdJobNames || mdDepartmentNames}
                          </div>
                        </div>
                      </div>
                      <div className="flex workwxInfo flexRow alignItemsCenter pLeft16">
                        <div className="flex userInfo">
                          <div className="name bold">{userInfo.fullname}</div>
                          <div className="Gray_75 ellipsis">
                            {qvJobNames && qwDepartmentNames
                              ? `${qvJobNames} | ${qwDepartmentNames}`
                              : qvJobNames || qwDepartmentNames}
                          </div>
                        </div>
                        {!isBindRelationship && _.includes([1, 2], userInfo.matchType) && (
                          <div className="matchInfo">
                            {userInfo.matchType === 1 ? _l('手机匹配') : userInfo.matchType === 2 ? _l('姓名匹配') : ''}
                          </div>
                        )}
                        {!isBindRelationship && (
                          <div className="remove">
                            <span className="Hand Hover_21" onClick={() => this.removeWXUser(item.accountId)}>
                              {_l('移除')}
                            </span>
                          </div>
                        )}
                      </div>
                      {isBindRelationship ? (
                        <div
                          className="Hand Hover_21 cancelBind flexRow alignItemsCenter"
                          onClick={() => {
                            this.cancelBind(item.accountId, userInfo.userId);
                          }}
                        >
                          {_l('解绑')}
                        </div>
                      ) : (
                        ''
                      )}
                    </div>
                  );
                }
                return (
                  <div className="row flexRow" key={item.accountId}>
                    <div className="flex orgInfo flexRow alignItemsCenter pLeft12">
                      <img className={cx('avatar', { bg: !item.avatar })} src={item.avatar} />
                      <div className="flex userInfo">
                        <div className="name bold">{item.fullname}</div>
                        <div className="Gray_75 ellipsis">
                          {mdJobNames && mdDepartmentNames
                            ? `${mdJobNames} | ${mdDepartmentNames}`
                            : mdJobNames || mdDepartmentNames}
                        </div>
                      </div>
                    </div>
                    <div className="flex workwxInfo flexRow alignItemsCenter pLeft16">
                      <Trigger
                        action={['click']}
                        popupAlign={{
                          points: ['tl', 'bl'],
                          overflow: {
                            adjustX: true,
                            adjustY: true,
                          },
                        }}
                        onPopupVisibleChange={() => {
                          if (this.input) {
                            this.input.value = '';
                          }
                          this.setState({ keywords: undefined });
                        }}
                        popup={() => this.renderSelectUsers(item.accountId)}
                      >
                        <span className="addUser Hand Hover_21" onClick={this.getWorkWXUsers}>
                          <Icon icon="plus" className="mRight6" />
                          {_l('绑定%0用户', INTEGRATION_INFO[integrationType].text)}
                        </span>
                      </Trigger>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {isBindRelationship && allCount > pageSize && (
          <PaginationWrap total={allCount} pageIndex={pageIndex} pageSize={pageSize} onChange={this.changPage} />
        )}
      </Dialog>
    );
  };
  render() {
    return (
      <Fragment>
        {this.renderSyncInfo()}
        {this.renderConfirmSync()}
      </Fragment>
    );
  }
}
