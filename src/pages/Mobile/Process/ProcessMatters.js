import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Tabs, Flex } from 'antd-mobile';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Back from '../components/Back';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import Card from './Card';
import { getRequest } from 'src/util';
import './index.less';
import 'src/pages/worksheet/common/newRecord/NewRecord.less';

const tabs = [{
  name: _l('待办'),
  id: 'untreated',
  icon: 'access_time',
  className: 'Font18',
  tabs: [{
    name: _l('待审批'),
    id: 'waitingApproval',
    param: {
      type: 4
    }
  }, {
    name: _l('待填写'),
    id: 'waitingWrite',
    param: {
      type: 3
    }
  }]
}, {
  name: _l('我发起的'),
  id: 'mySponsor',
  icon: 'send',
  className: 'Font18',
  tabs: [],
  param: {
    type: 0
  }
}, {
  name: _l('已完成'),
  id: 'processed',
  icon: 'succeed-one-o',
  className: 'Font15',
  tabs: [{
    name: _l('已处理'),
    id: 'completeDispose',
    param: {
      type: -1,
      complete: true
    }
  }, {
    name: _l('我发起的'),
    id: 'completeMySponsor',
    param: {
      type: 0,
      complete: true
    }
  }]
}];

export default class ProcessMatters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 30,
      list: [],
      loading: false,
      isMore: true,
      bottomTab: tabs[0],
      topTab: tabs[0].tabs[0],
      searchValue: '',
      countData: {},
      appCount: {},
      previewRecord: {}
    }
  }
  componentDidMount() {
    this.getTodoList();
    this.getTodoCount();
  }
  getTodoList() {
    const param = {};
    const { loading, isMore, topTab, bottomTab, searchValue } = this.state;
    const { appId } = getRequest();

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }
    if (searchValue) {
      param.keyword = searchValue;
    }
    if (appId) {
      param.apkId = appId;
    }

    const { pageIndex, pageSize, list, stateTab } = this.state;
    this.request = instanceVersion.getTodoList({
      pageSize,
      pageIndex,
      ...param,
      ...topTab ? topTab.param : bottomTab.param
    });

    this.request.then(result => {
      this.setState({
        list: list.concat(result),
        loading: false,
        pageIndex: pageIndex + 1,
        isMore: result.length === pageSize,
      });
    });
  }
  getTodoCount() {
    const { appId } = getRequest();
    if (appId) {
      Promise.all([
        instanceVersion.getTodoListFilter({ type: 4 }).then(),
        instanceVersion.getTodoListFilter({ type: 3 }).then()
      ]).then(result => {
        const [approveList, writeList] = result;
        const approve = _.find(approveList, { app: { id: appId } });
        const write = _.find(writeList, { app: { id: appId } });
        this.setState({
          appCount: {
            approveCount: approve ? approve.count : 0,
            writeCount: write ? write.count : 0
          }
        });
      });
    } else {
      getTodoCount().then(countData => {
        this.setState({
          countData,
        });
      });
    }
  }
  handleChangeCompleteTab = (tab) => {
    this.setState({
      loading: false,
      pageIndex: 1,
      isMore: true,
      list: [],
      bottomTab: tab,
      topTab: tab.tabs[0]
    }, () => {
      this.getTodoList();
    });
  }
  handleChangeTopTab = tab => {
    this.setState({
      loading: false,
      pageIndex: 1,
      isMore: true,
      list: [],
      topTab: tab,
    }, () => {
      this.getTodoList();
    });
  }
  handleScrollEnd = tab => {
    this.getTodoList();
  }
  handleApproveDone = ({ id }) => {
    const { list, countData, topTab } = this.state;
    const countDataState = {
      ...countData
    }
    if (topTab.id === 'waitingApproval') {
      countDataState.waitingApproval = countData.waitingApproval - 1;
    }
    if (topTab.id === 'waitingWrite') {
      countDataState.waitingWrite = countData.waitingWrite - 1;
    }
    this.setState({
      list: list.filter(item => item.id !== id),
      countData: countDataState
    });
  }
  renderCount(tab) {
    const { countData, appCount } = this.state;
    const { appId } = getRequest();

    if (tab.id === 'waitingWrite') {
      if (appId) {
        return appCount.writeCount ? `(${appCount.writeCount})` : null;
      } else {
        return countData.waitingWrite ? `(${countData.waitingWrite})` : null;
      }
    }

    if (tab.id === 'waitingApproval') {
      if (appId) {
        return appCount.approveCount ? `(${appCount.approveCount})` : null;
      } else {
        return countData.waitingApproval ? `(${countData.waitingApproval})` : null;
      }
    }
  }
  renderInput() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrapper valignWrapper">
        <Icon icon="search" className="Gray_75 Font20 pointer"/>
        <input
          value={searchValue}
          type="text"
          placeholder={_l('搜索记录名称')}
          onChange={(e) => {
            this.setState({
              searchValue: e.target.value,
            });
          }}
          onKeyDown={event => {
            const { bottomTab, topTab } = this.state;
            if (topTab) {
              event.which === 13 && this.handleChangeTopTab(topTab);
            } else {
              event.which === 13 && this.handleChangeCompleteTab(bottomTab);
            }
          }}
        />
        {searchValue ? (
          <Icon
            icon="close"
            className="Gray_75 Font20 pointer"
            onClick={() => {
              this.setState({
                searchValue: '',
              }, () => {
                const { bottomTab, topTab } = this.state;
                if (topTab) {
                  this.handleChangeTopTab(topTab);
                } else {
                  this.handleChangeCompleteTab(bottomTab);
                }
              });
            }}
          />
        ) : null}
      </div>
    );
  }
  renderWithoutData() {
    return (
      <div className="withoutData">
        <div className="icnoWrapper"><Icon icon="ic-line"/></div>
        <span>{_l('暂无内容')}</span>
      </div>
    );
  }
  renderContent() {
    const { stateTab, list, loading, pageIndex, filter, bottomTab, topTab } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {list.map(item => (
          <div className="pLeft10 pRight10" key={item.id}>
            <Card
              item={item}
              type={filter ? filter.type : null}
              time={createTimeSpan(item.workItem.receiveTime)}
              currentTab={topTab ? topTab.id : bottomTab.id}
              renderBodyTitle={() => {
                return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
              }}
              onClick={() => {
                this.setState({
                  previewRecord: { instanceId: item.id, workId: item.workId }
                });
                // console.log(`/mobile/processRecord/${item.id}/${item.workId}`);
              }}
              onApproveDone={this.handleApproveDone}
            />
          </div>
        ))}
        {loading ? <div className={cx({withoutData: pageIndex == 1})}><LoadDiv size="middle"/></div> : null}
        {!loading && _.isEmpty(list) ? this.renderWithoutData() : null}
      </ScrollView>
    );
  }
  render() {
    const { bottomTab, topTab, previewRecord } = this.state;
    const currentTabs = bottomTab.tabs;
    return (
      <div className="processContent flexColumn h100">
        <div className="flex flexColumn">
          <div className="processTabs mBottom10 z-depth-1">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={currentTabs}
              page={topTab ? _.findIndex(currentTabs, { id: topTab.id }) : -1}
              onTabClick={this.handleChangeTopTab}
              renderTab={tab => (
                <span>{tab.name} {this.renderCount(tab)}</span>
              )}>
            </Tabs>
          </div>
          {['processed', 'mySponsor'].includes(bottomTab.id) ? this.renderInput() : null}
          {this.renderContent()}
          <div className="processTabs bottomProcessTabs">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={tabs}
              onTabClick={this.handleChangeCompleteTab}
              renderTab={tab => (
                <div className="flexColumn valignWrapper">
                  <Icon className={tab.className} icon={tab.icon} />
                  <span className="Font12 mTop2">{tab.name}</span>
                </div>
              )}>
            </Tabs>
          </div>
        </div>
        <Back
          onClick={() => {
            history.back();
          }}
        />
        <ProcessRecordInfo
          isModal
          className="full"
          visible={!_.isEmpty(previewRecord)}
          instanceId={previewRecord.instanceId}
          workId={previewRecord.workId}
          onClose={(data) => {
            if (data.id) {
              this.handleApproveDone(data);
            }
            this.setState({
              previewRecord: {}
            });
          }}
        />
      </div>
    );
  }
}

