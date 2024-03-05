import React, { Component } from 'react';
import { Dialog, LoadDiv, Checkbox, Button } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import transferAjax from 'src/pages/workflow/api/transfer';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const TAB_LIST = [
  { tab: 1, tabName: _l('流程待办') },
  { tab: 2, tabName: _l('工作流') },
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
    };
  }

  componentDidMount() {
    this.getCount();
    this.getList();
  }

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
      .fail(err => {
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
      .fail(err => {
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
    const { todoCheckedInfo, workflowCheckedInfo } = this.state;
    const _this = this;

    if (_.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo)) {
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
        unique: true,
        filterAccountIds: [transferor.accountId],
        callback: _this.handleHandover,
      },
    });
  };

  handleHandover = users => {
    const { transferor = {}, projectId } = this.props;
    const { todoCheckedInfo, workflowCheckedInfo, todoList = [], workflowList, activeTab } = this.state;

    if (_.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo)) {
      alert(_l('请选择交接内容'));
      return;
    }

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
    } = this.state;
    const dataList = activeTab === 1 ? todoList : workflowList;
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
                    {countInfo[item.tab] || (item.tab === 1 ? getCount(todoList) : getCount(workflowList))}
                  </span>
                )}
              </div>
            ))}
            <div className="flex TxtRight pRight24">
              <i className="icon icon-refresh1 Gray_9e Hand Font18" onClick={() => this.getList(true)} />
            </div>
          </div>
          {loading ? (
            <div className="mTop40 TxtCenter flex">
              <LoadDiv className="mBottom25" />
              <span className="Gray_9e"> {_l('数据加载中，请耐心等待')}</span>
            </div>
          ) : _.isEmpty(dataList) ? (
            this.renderEmpty()
          ) : (
            <div className="overflowHidden flex flexRow">
              <div className="apps">
                <div className="checkItem checkAll flexRow alignItemsCenter">
                  <Checkbox checked={checkedAll} onClick={this.checkedAllApps} />
                  <span className="flex ellipsis">{_l('全选')}</span>
                </div>
                {dataList.map(item => {
                  const { id, apk = {} } = item;
                  const { name, iconUrl, iconColor } = apk;

                  return (
                    <div
                      key={id}
                      className={cx('checkItem flexRow alignItemsCenter Hand', { activeApp: currentAppId === id })}
                      onClick={() => this.setState({ currentAppId: id })}
                    >
                      <Checkbox
                        clearselected={_.has(checkedInfo, id) && !_.get(checkedInfo, `[${id}].checkedAll`)}
                        checked={_.has(checkedInfo, id)}
                        onClick={checked => this.checkedAppItem({ checked, appId: id, checkType: 'app' })}
                      />
                      <div className="appIconWrap" style={{ backgroundColor: iconColor }}>
                        <SvgIcon url={iconUrl} fill="#fff" size={16} addClassName="mTop2" />
                      </div>
                      <span className="flex ellipsis mLeft8"> {name}</span>
                    </div>
                  );
                })}
              </div>
              <div className="handoverList flex">
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
          )}
          {!loading && (!_.isEmpty(todoList) || !_.isEmpty(workflowList)) && (
            <div className="footer">
              <Button disabled={_.isEmpty(todoCheckedInfo) && _.isEmpty(workflowCheckedInfo)} onClick={this.transfer}>
                {_l('交接给')}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    );
  }
}
