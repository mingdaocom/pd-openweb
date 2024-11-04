import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import qs from 'query-string';
import { Tabs } from 'antd-mobile';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Back from '../components/Back';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import workflowPushSoket from 'mobile/components/socket/workflowPushSoket';
import { handlePushState, handleReplaceState } from 'src/util';
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
  handleChangeCompleteTab = id => {
    this.setState({
      loading: false,
      pageIndex: 1,
      isMore: true,
      list: [],
      currentTab: id,
    }, () => {
      this.getTodoList();
    });
  }
  handleScrollEnd = tab => {
    this.getTodoList();
  }

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
            event.which === 13 && this.handleChangeCompleteTab(this.state.currentTab);
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
                this.handleChangeCompleteTab(this.state.currentTab);
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
    const { stateTab, list, loading, pageIndex, filter, currentTab, countData } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {currentTab === 'unread' && countData.waitingExamine ? (
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
        {loading ? <div className={cx({withoutData: pageIndex == 1})}><LoadDiv size="middle"/></div> : null}
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
        <div className="flex flexColumn">
          <div className="processTabs mBottom10 z-depth-1">
            <Tabs
              className="md-adm-tabs"
              activeLineMode="fixed"
              activeKey={currentTab}
              onChange={this.handleChangeCompleteTab}
            >
              {processInformTabs.map(tab => (
                <Tabs.Tab
                  title={<span>{tab.name} {tab.id === 'unread' && countData.waitingExamine ? `(${countData.waitingExamine})` : null}</span>}
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
          {currentTab === 'already' ? this.renderInput() : null}
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
                previewRecord: {}
              });
            }}
          />
        </div>
      </div>
    );
  }
}

