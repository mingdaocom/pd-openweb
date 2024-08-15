import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import qs from 'query-string';
import { Tabs, Flex } from 'antd-mobile';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Back from '../components/Back';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import Card from './Card';
import './index.less';
import _ from 'lodash';

export const processInformTabs = [{
  name: _l('全部'),
  id: 'all',
}, {
  name: _l('未读'),
  id: 'unread',
}, {
  name: _l('已读'),
  id: 'already',
}];

export default class ProcessInform extends Component {
  constructor(props) {
    super(props);
    const { search } = props.location;
    const { tab } = qs.parse(search);
    this.state = {
      pageIndex: 1,
      pageSize: 30,
      list: [],
      loading: false,
      isMore: true,
      currentTab: _.find(processInformTabs, { id: tab }) ? tab : processInformTabs[0].id,
      searchValue: '',
      countData: {},
      previewRecord: {}
    }
  }
  componentDidMount() {
    this.getTodoList();
    this.getTodoCount();
    workflowPushSoket();
  }
  getTodoList() {
    const param = {};
    const { loading, isMore, currentTab, searchValue } = this.state;

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request) {
      this.request.abort();
    }
    if (currentTab !== 'all') {
      param.complete = currentTab === 'already';
    }
    if (searchValue) {
      param.keyword = searchValue;
    }

    const { pageIndex, pageSize, list, stateTab } = this.state;
    this.request = instanceVersion.getTodoList({
      pageSize,
      pageIndex,
      type: 5,
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
    getTodoCount().then(countData => {
      this.setState({
        countData,
      });
    });
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
  renderInput() {
    const { searchValue } = this.state;
    return (
      <div className="searchWrapper valignWrapper">
        <Icon icon="search" className="Gray_9e Font20 pointer"/>
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
                return item.title;
              }}
              onClick={() => {
                this.setState({
                  previewRecord: { instanceId: item.id, workId: item.workId }
                });
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
    const { currentTab, countData, previewRecord } = this.state;
    return (
      <div className="processContent flexColumn h100">
        <div className="flex flexColumn">
          <div className="processTabs mBottom10 z-depth-1">
            <Tabs
              tabBarInactiveTextColor="#9e9e9e"
              tabs={processInformTabs}
              page={currentTab ? _.findIndex(processInformTabs, { id: currentTab }) : -1}
              onTabClick={this.handleChangeCompleteTab}
              renderTab={tab => (
                <span>{tab.name} {tab.id === 'unread' && countData.waitingExamine ? `(${countData.waitingExamine})` : null}</span>
              )}>
            </Tabs>
          </div>
          <Back
            className="low"
            onClick={() => {
              history.back();
            }}
          />
          {currentTab === 'already' ? this.renderInput() : null}
          {this.renderContent()}
          <ProcessRecordInfo
            isModal
            className="full"
            visible={!_.isEmpty(previewRecord)}
            instanceId={previewRecord.instanceId}
            workId={previewRecord.workId}
            onClose={() => {
              this.setState({
                previewRecord: {}
              });
            }}
          />
        </div>
      </div>
    );
  }
}

