import React, { Component } from 'react';
import { Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import Back from '../components/Back';
import Card from './Card';
import { processInformTabs } from './enum';
import Filter from './Filter';
import { formatQueryParam } from './utils';
import './index.less';

export default class ProcessInform extends Component {
  constructor(props) {
    super(props);
    const { tab } = props.match.params;
    this.state = {
      pageIndex: 1,
      pageSize: 30,
      list: [],
      loading: false,
      isMore: true,
      currentTab: _.find(processInformTabs, { id: tab }) ? tab : processInformTabs[0].id,
      searchValue: '',
      countData: {},
      previewRecord: {},
      filterVisible: false,
      queryParam: {},
    };
  }
  componentDidMount() {
    this.getTodoList();
    this.getTodoCount();
    workflowPushSoket();
    window.addEventListener('popstate', this.onQueryChange);
  }
  componentWillUnmount() {
    window.addEventListener('popstate', this.onQueryChange);
  }
  onQueryChange = () => {
    if (!this.state.previewRecord || _.isEmpty(this.state.previewRecord)) return;
    handleReplaceState('page', 'processRecord', () => this.setState({ previewRecord: {} }));
  };
  getTodoList() {
    const param = {};
    const { loading, isMore, currentTab, searchValue, queryParam } = this.state;

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

    const { pageIndex, pageSize, list } = this.state;
    this.request = instanceVersion.getTodoList({
      pageSize,
      pageIndex,
      type: 5,
      ...param,
      ...formatQueryParam(queryParam),
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
  handleClearQuery = () => {
    this.setState({ queryParam: {} });
  };
  handleChangeCompleteTab = id => {
    this.setState(
      {
        loading: false,
        pageIndex: 1,
        isMore: true,
        list: [],
        currentTab: id,
      },
      () => {
        this.getTodoList();
      },
    );
  };
  handleScrollEnd = () => {
    this.getTodoList();
  };

  handleRead = item => {
    const { list, visible, countData } = this.state;
    const { waitingExamine } = countData;
    const newList = list.filter(n => n.workId !== item.workId);
    this.setState({
      list: newList,
      visible: newList.length ? visible : false,
      countData: { ...countData, waitingExamine: waitingExamine - 1 },
    });
  };

  renderInput() {
    const { searchValue, filterVisible, currentTab, queryParam } = this.state;
    return (
      <div className="searchWrapper flexRow">
        <div className="inputWrap valignWrapper flex">
          <Icon icon="search" className="Gray_9e Font20 pointer" />
          <input
            value={searchValue}
            type="text"
            placeholder={_l('搜索记录名称')}
            onChange={e => {
              this.setState({
                searchValue: e.target.value,
              });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleChangeCompleteTab(currentTab);
            }}
          />
          {searchValue && (
            <Icon
              icon="close"
              className="Gray_75 Font20 pointer"
              onClick={() => {
                this.setState(
                  {
                    searchValue: '',
                  },
                  () => {
                    this.handleChangeCompleteTab(currentTab);
                  },
                );
              }}
            />
          )}
        </div>
        {['unread', 'already'].includes(currentTab) && (
          <div className="filterWrap" onClick={() => this.setState({ filterVisible: true })}>
            <Icon
              icon="filter"
              className={cx('Font20 Gray_9e', { active: !_.isEmpty(_.omitBy(queryParam, _.isNil)) })}
            />
          </div>
        )}
        <Filter
          tab={currentTab}
          todoListFilterParam={{
            type: 5,
            complete: currentTab === 'already',
          }}
          visible={filterVisible}
          onClose={() => this.setState({ filterVisible: false })}
          query={queryParam}
          onQuery={data => {
            this.setState(
              {
                loading: false,
                pageIndex: 1,
                isMore: true,
                list: [],
                queryParam: data,
              },
              () => {
                this.getTodoList();
              },
            );
          }}
        />
      </div>
    );
  }
  renderWithoutData() {
    return (
      <div className="withoutData">
        <div className="icnoWrapper">
          <Icon icon="ic-line" />
        </div>
        <span>{_l('暂无内容')}</span>
      </div>
    );
  }
  renderContent() {
    const { list, loading, pageIndex, filter, currentTab, countData } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {currentTab === 'unread' && countData.waitingExamine && !!list.length ? (
          <div className="valignWrapper w100 pTop15 pBottom15 pRight15 pLeft15 Height50">
            <div className="flex Font15 bold">{_l('%0个待查看', countData.waitingExamine)}</div>
            <div className="pointer" onClick={this.handleAllRead}>
              <Icon icon="done_all" className="Font18 Gray_75" />
              <span className="Font15 mLeft5 Gray_75 bold">{_l('全部已读')}</span>
            </div>
          </div>
        ) : (
          ''
        )}
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
                handlePushState('page', 'processRecord');
                this.setState({
                  previewRecord: { instanceId: item.id, workId: item.workId },
                });
                if (currentTab === 'unread') {
                  this.handleRead(item);
                }
              }}
            />
          </div>
        ))}
        {loading ? (
          <div className={cx({ withoutData: pageIndex == 1 })}>
            <LoadDiv size="middle" />
          </div>
        ) : null}
        {!loading && _.isEmpty(list) ? this.renderWithoutData() : null}
      </ScrollView>
    );
  }

  handleAllRead = () => {
    const { filter } = this.state;
    const param = { type: 5 };
    if (filter) {
      Object.assign(param, filter);
    }
    instanceVersion.batch(param).then(result => {
      if (result) {
        alert(_l('操作成功'));
        this.setState({
          list: [],
          isMore: false,
          isResetFilter: true,
          visible: false,
        });
        this.getTodoCount();
      }
    });
  };

  render() {
    const { currentTab, countData, previewRecord } = this.state;
    return (
      <div className="processContent flexColumn h100">
        <div className="flex flexColumn overflowHidden">
          <div className="processTabs mBottom10 z-depth-1">
            <Tabs
              className="md-adm-tabs"
              activeLineMode="fixed"
              activeKey={currentTab}
              onChange={id => {
                this.handleClearQuery();
                this.handleChangeCompleteTab(id);
              }}
            >
              {processInformTabs.map(tab => (
                <Tabs.Tab
                  title={
                    <span>
                      {tab.name}{' '}
                      {tab.id === 'unread' && countData.waitingExamine ? `(${countData.waitingExamine})` : null}
                    </span>
                  }
                  key={tab.id}
                />
              ))}
            </Tabs>
          </div>
          <Back
            className="low"
            onClick={() => {
              history.back();
            }}
          />
          {this.renderInput()}
          {this.renderContent()}
          <ProcessRecordInfo
            isModal
            className="full"
            visible={!_.isEmpty(previewRecord)}
            instanceId={previewRecord.instanceId}
            workId={previewRecord.workId}
            onClose={() => {
              history.back();
              this.setState({
                previewRecord: {},
              });
            }}
            onSave={() => {
              alert(_l('操作成功'));
            }}
          />
        </div>
      </div>
    );
  }
}
