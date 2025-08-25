import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Checkbox, Dialog, LoadDiv, SvgIcon, Tooltip } from 'ming-ui';
import { dialogSelectUser } from 'ming-ui/functions';
import appManagementAjax from 'src/api/appManagement';
import transferAjax from 'src/pages/workflow/api/transfer';
import './index.less';

const TAB_LIST = [
  { tab: 1, tabName: _l('流程待办') },
  { tab: 2, tabName: _l('工作流') },
  { tab: 3, tabName: _l('应用成员') },
];

const setAll = data => {
  const obj = {};
  data.forEach(item => {
    if (!obj[item.id]) {
      obj[item.id] = {};
    }
    const ids = (item.items || []).map(v => v.id);
    obj[item.id].ids = ids;
    obj[item.id].checkedAll = true;
  });

  return obj;
};

const updateDataList = (list = [], checkedInfo = {}) => {
  return list
    .map(item => {
      const ids = _.get(checkedInfo, `[${item.id}].ids`) || [];
      return {
        ...item,
        items: item.items.filter(v => !_.includes(ids, v.id)),
      };
    })
    .filter(v => !_.isEmpty(v.items));
};

const getCount = data => {
  let count = _.reduce(
    data,
    (count, item) => {
      return count + item.count;
    },
    0,
  );
  return count || '';
};

const AppItem = props => {
  const {
    key,
    className,
    checked,
    clearSelected,
    iconUrl,
    iconColor,
    appName,
    nameTips = false,
    roles = [],
    onClick = () => {},
    handleChecked = () => {},
  } = props;
  const sysNames = roles
    .filter(l => l.isSystemRole)
    .map(l => l.name)
    .join('、');
  const cusNames = roles
    .filter(l => !l.isSystemRole)
    .map(l => l.name)
    .join('、');
  const namesText = `${sysNames ? _l('系统角色：') : ''}${sysNames}${sysNames && cusNames ? '；' : ''}${
    cusNames ? _l('普通角色：') : ''
  }${cusNames}`;

  return (
    <div
      key={key}
      onClick={onClick}
      className={cx('checkItem flexRow alignItemsCenter Hand', { [className]: className })}
    >
      <Checkbox clearselected={clearSelected} checked={checked} onClick={handleChecked} />
      <div className="appIconWrap" style={{ backgroundColor: iconColor }}>
        <SvgIcon url={iconUrl} fill="#fff" size={16} addClassName="mTop2" />
      </div>
      <Tooltip text={appName} popupPlacement="topLeft" disable={!nameTips} mouseEnterDelay={0.5}>
        <span className="flex ellipsis mLeft8"> {appName}</span>
      </Tooltip>
      {!!roles.length && (
        <Tooltip text={namesText} popupPlacement="topLeft" mouseEnterDelay={0.5}>
          <span className="flex2 ellipsis">{namesText}</span>
        </Tooltip>
      )}
    </div>
  );
};

export default class WorkHandoverDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 1,
      loading: false,
      currentAppId: '',
      countInfo: {},
      todoList: [],
      workflowList: [],
      todoCheckedInfo: {},
      workflowCheckedInfo: {},
      selectAppMemberData: [],
      appsMemberData: [],
    };
  }

  componentDidMount() {
    this.getCount();
    this.getList();
    this.getApps();
  }

  getApps = () => {
    const { transferor = {}, projectId } = this.props;
    const { countInfo } = this.state;

    appManagementAjax
      .getUserIdApps({
        projectId,
        userId: transferor.accountId,
      })
      .then(res => {
        this.setState({
          countInfo: { ...countInfo, 3: res.length },
          appsMemberData: res,
        });
      })
      .catch(() => {
        this.setState({ countInfo: { ...countInfo, 3: 0 } });
      });
  };

  getCount = () => {
    const { transferor = {}, projectId } = this.props;
    transferAjax
      .count({
        accountId: transferor.accountId,
        companyId: projectId,
        init: true,
        types: [1, 2],
      })
      .then(res => {
        this.setState({ countInfo: res });
      })
      .catch(() => {
        this.setState({ countInfo: {} });
      });
  };

  // 获取交接列表
  getList = init => {
    const { transferor = {}, projectId } = this.props;
    const { activeTab } = this.state;

    this.setState({ loading: true });

    transferAjax
      .getList({
        accountId: transferor.accountId,
        companyId: projectId,
        types: [1, 2],
        init,
      })
      .then(res => {
        const getData = type => {
          return res
            .map(item => ({
              ...item,
              items: item.items.filter(v => v.type === type),
              count: (item.items || []).filter(v => v.type === type).length,
            }))
            .filter(item => !_.isEmpty(item.items));
        };

        this.setState({
          loading: false,
          currentAppId:
            activeTab === 2 ? !_.isEmpty(getData(2)) && getData(2)[0].id : !_.isEmpty(getData(1)) && getData(1)[0].id,
          todoList: getData(1),
          workflowList: getData(2),
        });
      })
      .catch(() => {
        this.setState({
          loading: false,
          currentAppId: '',
          todoList: [],
          workflowList: [],
        });
      });
  };

  // 全选
  checkedAllApps = checked => {
    const { activeTab, todoList, workflowList } = this.state;

    if (activeTab === 1) {
      this.setState({ todoCheckedInfo: checked ? {} : setAll(todoList) });
    } else {
      this.setState({ workflowCheckedInfo: checked ? {} : setAll(workflowList) });
    }
  };

  // 选中某个应用
  checkedAppItem = ({ checked, appId, itemId, checkType }) => {
    const { activeTab, todoList, workflowList, todoCheckedInfo, workflowCheckedInfo } = this.state;
    const dataList = activeTab === 1 ? todoList : workflowList;
    const checkedInfo = activeTab === 1 ? _.clone(todoCheckedInfo) : _.clone(workflowCheckedInfo);
    let copyCheckedInfo = _.clone(checkedInfo);
    const allItemIds = ((_.find(dataList, item => item.id === appId) || {}).items || []).map(v => v.id);

    if (!copyCheckedInfo[appId]) {
      copyCheckedInfo[appId] = {
        ids: [],
        checkedAll: false,
      };
    }

    if (checkType == 'app') {
      if (checked) {
        delete copyCheckedInfo[appId];
      } else {
        copyCheckedInfo[appId].ids = allItemIds;
        copyCheckedInfo[appId].checkedAll = true;
      }
    } else {
      const ids = copyCheckedInfo[appId].ids || [];
      if (checked) {
        const checkedIds = ids.filter(v => v !== itemId);
        if (_.isEmpty(checkedIds)) {
          delete copyCheckedInfo[appId];
        } else {
          copyCheckedInfo[appId].ids = checkedIds;
          copyCheckedInfo[appId].checkedAll = checkedIds.length === allItemIds.length;
        }
      } else {
        ids.push(itemId);
        copyCheckedInfo[appId].checkedAll = ids.length === allItemIds.length;
      }
    }

    if (activeTab === 1) {
      this.setState({ todoCheckedInfo: copyCheckedInfo });
    } else {
      this.setState({ workflowCheckedInfo: copyCheckedInfo });
    }
  };

  // 交接给
  transfer = () => {
    const { projectId, transferor = {} } = this.props;
    const { todoCheckedInfo, workflowCheckedInfo, selectAppMemberData } = this.state;

    if (_.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo) && _.isEmpty(selectAppMemberData)) {
      alert(_l('请选择交接内容'), 3);
      return;
    }

    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        projectId: projectId,
        filterAll: true,
        filterFriend: true,
        filterOtherProject: true,
        filterOthers: true,
        filterResigned: false,
        unique: true,
        filterAccountIds: [transferor.accountId],
        callback: users => {
          this.replaceAppMember(users[0].accountId);
          this.handleHandover(users);
        },
      },
    });
  };

  handleHandover = users => {
    const { transferor = {}, projectId } = this.props;
    const { todoCheckedInfo, workflowCheckedInfo, todoList = [], workflowList, activeTab } = this.state;

    if (_.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo)) return;

    const getIds = (info = {}) => {
      let arr = [];
      Object.values(info).forEach(item => {
        arr = arr.concat(item.ids);
      });
      return arr;
    };

    const params = {
      accountId: transferor.accountId,
      companyId: projectId,
      ids: [...getIds(todoCheckedInfo), ...getIds(workflowCheckedInfo)],
      transferAccountId: users[0].accountId,
    };

    transferAjax.update(params).then(res => {
      if (res) {
        alert(_l('交接成功'));
        this.setState({
          todoList: updateDataList(todoList, todoCheckedInfo),
          workflowList: updateDataList(workflowList, workflowCheckedInfo),
          todoCheckedInfo: {},
          workflowCheckedInfo: {},
          currentAppId: activeTab
            ? !_.isEmpty(updateDataList(todoList, todoCheckedInfo)) && updateDataList(todoList, todoCheckedInfo)[0].id
            : !_.isEmpty(updateDataList(workflowList, workflowCheckedInfo)) &&
              updateDataList(workflowList, workflowCheckedInfo)[0].id,
        });
      } else {
        alert(_l('交接失败'), 2);
      }
    });
  };

  renderEmpty = () => {
    return <div className="h100 Gray_75 flexRow alignItemsCenter justifyContentCenter">{_l('没有内容需要交接')}</div>;
  };

  replaceAppMember = (addUserId = '') => {
    const { transferor = {}, projectId } = this.props;
    const { selectAppMemberData, appsMemberData, countInfo } = this.state;

    if (!selectAppMemberData.length) return;

    appManagementAjax
      .replaceRoleMemberForApps({
        projectId,
        removeUserId: transferor.accountId,
        addUserId,
        roles: selectAppMemberData,
      })
      .then(res => {
        if (res) {
          alert(addUserId ? _l('交接成功') : _l('移除成功'));
          const newList = _.differenceBy(appsMemberData, selectAppMemberData, 'appId');
          this.setState({
            selectAppMemberData: [],
            appsMemberData: newList,
            countInfo: { ...countInfo, 3: newList.length },
          });
        } else {
          alert(addUserId ? _l('交接失败') : _l('移除失败'), 2);
        }
      });
  };

  openRemoveAppMember = () => {
    const { selectAppMemberData } = this.state;

    Dialog.confirm({
      title: _l('确认移除'),
      children: _l('已选 %0 项，成员将会从所选应用中移除', selectAppMemberData.length),
      onOk: this.replaceAppMember,
    });
  };

  renderAppMember = () => {
    const { appsMemberData, currentAppId, selectAppMemberData } = this.state;

    return appsMemberData.map(item => {
      const checked = !!_.find(selectAppMemberData, l => l.appId === item.appId);

      return (
        <div className="appWrap">
          <AppItem
            key={`work-handle-over-${item.appId}`}
            className="pLeft16"
            appName={item.appName}
            iconUrl={item.iconUrl}
            iconColor={item.iconColor}
            currentAppId={currentAppId}
            checked={checked}
            nameTips={true}
            roles={item.roles}
            onClick={() => {
              this.setState({
                selectAppMemberData: checked
                  ? selectAppMemberData.filter(l => l.appId !== item.appId)
                  : selectAppMemberData.concat(item),
              });
            }}
          />
        </div>
      );
    });
  };

  render() {
    const { visible, transferor = {}, onCancel = () => {} } = this.props;
    const { fullname } = transferor;
    const {
      activeTab,
      loading,
      todoList = [],
      workflowList = [],
      currentAppId,
      todoCheckedInfo,
      workflowCheckedInfo,
      countInfo,
      selectAppMemberData,
      appsMemberData,
    } = this.state;
    const dataList = activeTab === 1 ? todoList : activeTab === 2 ? workflowList : appsMemberData;
    const checkedInfo = activeTab === 1 ? todoCheckedInfo : workflowCheckedInfo;

    const items = (_.find(dataList, item => item.id === currentAppId) || {}).items || [];

    const checkedAll = dataList.every(item => _.get(checkedInfo, `[${item.id}].checkedAll`));
    const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

    return (
      <Dialog
        className="workHandoverDialog"
        width={1000}
        maxHeight={windowHeight - 64}
        title={_l('交接工作：%0', fullname)}
        visible={visible}
        onCancel={onCancel}
        showCancel={false}
        okText={_l('交接给')}
        showFooter={false}
        footer={null}
      >
        <div className="flexColumn overflowHidden" style={{ height: `${windowHeight - 180}px` }}>
          <div className="tabBox flexRow">
            {TAB_LIST.map(item => (
              <div
                className={cx('tabItem', { active: item.tab === activeTab })}
                onClick={() =>
                  this.setState({
                    activeTab: item.tab,
                    currentAppId:
                      item.tab === 1
                        ? !_.isEmpty(todoList) && todoList[0].id
                        : !_.isEmpty(workflowList) && workflowList[0].id,
                  })
                }
              >
                {item.tabName}
                {!loading && (
                  <span className="Gray_75 mLeft4">
                    {countInfo[item.tab] ||
                      (item.tab === 1 ? getCount(todoList) : item.tab === 2 ? getCount(workflowList) : '')}
                  </span>
                )}
              </div>
            ))}
            <div className="flex TxtRight pRight24">
              <i className="icon icon-refresh1 Gray_9e Hand Font18" onClick={() => this.getList(true)} />
            </div>
          </div>
          <div className="description">
            {activeTab === 1
              ? _l('交接当前用户未处理的流程待办')
              : activeTab === 2
                ? _l('交接当前用户作为流程拥有者、通知人和节点负责人的工作流')
                : _l('移除或交接当前用户作为成员直接加入的应用（不包含通过部门、组织角色、职位加入的应用）')}
          </div>
          {loading ? (
            <div className="mTop40 TxtCenter flex">
              <LoadDiv className="mBottom25" />
              <span className="Gray_9e"> {_l('数据加载中，请耐心等待')}</span>
            </div>
          ) : _.isEmpty(dataList) ? (
            this.renderEmpty()
          ) : _.includes([1, 2], activeTab) ? (
            <div className="overflowHidden flex flexRow">
              <div className="apps">
                <div className="Gray_9e pLeft12 mBottom10">{_l('选择应用')}</div>
                <div className="checkItem checkAll flexRow alignItemsCenter">
                  <Checkbox checked={checkedAll} onClick={this.checkedAllApps} />
                  <span className="flex ellipsis">{_l('全选')}</span>
                </div>
                {dataList.map(item => {
                  const { id, apk = {} } = item;
                  const { name, iconUrl, iconColor } = apk;

                  return (
                    <AppItem
                      key={id}
                      className={cx({ activeApp: currentAppId === id })}
                      appName={name}
                      iconUrl={iconUrl}
                      iconColor={iconColor}
                      currentAppId={currentAppId}
                      checked={_.has(checkedInfo, id)}
                      clearSelected={_.has(checkedInfo, id) && !_.get(checkedInfo, `[${id}].checkedAll`)}
                      onClick={() => this.setState({ currentAppId: id })}
                      handleChecked={checked => this.checkedAppItem({ checked, appId: id, checkType: 'app' })}
                    />
                  );
                })}
              </div>
              <div className="handoverList flex">
                <div className="Gray_9e pLeft12 mBottom10">
                  {activeTab === 1 ? _l('选择流程待办') : activeTab === 2 ? _l('选择工作流') : ''}
                </div>
                {_.isEmpty(items)
                  ? this.renderEmpty()
                  : items.map(item => {
                      const { id, type, apkId, detail = {} } = item;

                      return (
                        <div className="checkItem flexRow alignItemsCenter" key={id}>
                          <Checkbox
                            checked={
                              checkedInfo[currentAppId] && _.includes(checkedInfo[currentAppId].ids || {}, id)
                                ? true
                                : false
                            }
                            onClick={checked =>
                              this.checkedAppItem({ checked, appId: apkId, itemId: id, checkType: 'item' })
                            }
                          />
                          <span className="flex ellipsis mLeft8"> {type == 1 ? detail.title : detail.name}</span>
                        </div>
                      );
                    })}
              </div>
            </div>
          ) : (
            <div className="flex flexColumn pLeft20 pRight20" style={{ overflow: 'auto' }}>
              {this.renderAppMember()}
            </div>
          )}
          {!loading && (!_.isEmpty(todoList) || !_.isEmpty(workflowList) || !_.isEmpty(appsMemberData)) && (
            <div className="footer">
              {activeTab === 3 && (
                <Button
                  className="mRight20 removeAppMember"
                  type="link"
                  disabled={_.isEmpty(selectAppMemberData)}
                  onClick={this.openRemoveAppMember}
                >
                  {_l('移除')}
                </Button>
              )}
              <Button
                disabled={
                  _.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo) && _.isEmpty(selectAppMemberData)
                }
                onClick={this.transfer}
              >
                {_l('交接给')}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}
