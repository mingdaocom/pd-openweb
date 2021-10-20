import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Tabs, Flex } from 'antd-mobile';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Back from '../components/Back';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import Card from './Card';
import { getRequest } from 'src/util';
import './index.less';

const tabs = [{
  name: _l('未处理'),
  id: 'untreated',
}, {
  name: _l('已处理'),
  id: 'processed',
}, {
  name: _l('我发起的'),
  id: 'mySponsor',
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
      currentTab: tabs[0].id,
      searchValue: '',
      countData: {},
      appCount: {}
    }
  }
  componentDidMount() {
    this.getTodoList();
    this.getTodoCount();
  }
  getTodoList() {
    const param = {};
    const { loading, isMore, currentTab, searchValue } = this.state;
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
    if (currentTab === 'processed') {
      param.complete = true;
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
      type: currentTab === 'mySponsor' ? 0 : -1,
      ...param,
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
        instanceVersion.getTodoListFilter({ type: -1 }).then(),
        instanceVersion.getTodoListFilter({ type: 0 }).then()
      ]).then(result => {
        const [untreatedList, mySponsorList] = result;
        const untreated = _.find(untreatedList, { app: { id: appId } });
        const mySponsor = _.find(mySponsorList, { app: { id: appId } });
        this.setState({
          appCount: {
            untreatedCount: untreated ? untreated.count : 0,
            mySponsorCount: mySponsor ? mySponsor.count : 0
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
  handleChangeCompleteTab = tab => {
    this.setState({
      loading: false,
      pageIndex: 1,
      isMore: true,
      list: [],
      currentTab: tab.id,
    }, () => {
      this.getTodoList();
    });
  }
  handleScrollEnd = tab => {
    this.getTodoList();
  }
  renderCount(tab) {
    const { countData, appCount } = this.state;
    const { appId } = getRequest();

    if (tab.id === 'untreated') {
      if (appId) {
        return appCount.untreatedCount ? `(${appCount.untreatedCount})` : null;
      } else {
        return countData.waitingDispose ? `(${countData.waitingDispose})` : null;
      }
    }

    if (tab.id === 'mySponsor') {
      if (appId) {
        return appCount.mySponsorCount ? `(${appCount.mySponsorCount})` : null;
      } else {
        return countData.mySponsor ? `(${countData.mySponsor})` : null;
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
            event.which === 13 && this.handleChangeCompleteTab({ id: this.state.currentTab });
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
                this.handleChangeCompleteTab({ id: this.state.currentTab });
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
    const { stateTab, list, loading, pageIndex, filter, currentTab } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {list.map(item => (
          <div className="pLeft10 pRight10" key={item.workId}>
            <Card
              item={item}
              type={filter ? filter.type : null}
              time={createTimeSpan(item.workItem.receiveTime)}
              currentTab={currentTab}
              renderBodyTitle={() => {
                return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
              }}
              onClick={() => {
                this.props.history.push(`/mobile/processRecord/${item.id}/${item.workId}`);
              }}
            />
          </div>
        ))}
        {loading ? <div className={cx({withoutData: pageIndex == 1})}><LoadDiv size="middle"/></div> : null}
        {!loading && _.isEmpty(list) ? this.renderWithoutData() : null}
      </ScrollView>
    );
  }
  render() {
    const { currentTab } = this.state;
    return (
      <div className="processContent flexColumn h100">
        <div className="flex flexColumn">
          <div className="processTabs z-depth-1">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={tabs}
              onTabClick={this.handleChangeCompleteTab}
              renderTab={tab => (
                <span>{tab.name} {this.renderCount(tab)}</span>
              )}>
            </Tabs>
          </div>
          <Back
            className="low"
            onClick={() => {
              history.back();
            }}
          />
          {['processed', 'mySponsor'].includes(currentTab) ? this.renderInput() : null}
          {this.renderContent()}
        </div>
      </div>
    );
  }
}

