import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import Icon from 'ming-ui/components/Icon';
import ScrollView from 'ming-ui/components/ScrollView';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Card from './Card';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import { getTodoCount } from './Entry';
import { getDateScope } from './config';
import FilterConTent from './Filter';
import './index.less';

const dateScope = getDateScope();

export const TABS = {
  WAITING_DISPOSE: 1, // 待处理
  WAITING_EXAMINE: 2, // 待查看
  MY_SPONSOR: 3, // 我发起
  COMPLETE: 4, // 已完成
};

export const getStateParam = tab => {
  let param = {};
  if (tab === TABS.WAITING_DISPOSE) {
    param = { type: -1 };
  }
  if (tab === TABS.WAITING_EXAMINE) {
    param = {
      type: 5,
      complete: false,
    };
  }
  if (tab === TABS.MY_SPONSOR) {
    param = { type: 0 };
  }
  if (tab === TABS.COMPLETE) {
    param = {
      type: -1,
      complete: true,
      ...dateScope[1].value,
    };
  }
  return param;
};

class Filter extends Component {
  getFilterLength = () => {
    const filter = _.cloneDeep(this.props.filter);

    if (_.isObject(filter)) {
      // 不是筛选项
      delete filter.type;
      delete filter.resultType;
      // 时间范围
      if (_.isNumber(filter.dateScopeIndex)) {
        if (filter.dateScopeIndex === 0) {
          // 数值0不能被判断到，转成字符
          filter.dateScopeIndex = filter.dateScopeIndex.toString();
        }
        if (filter.dateScopeIndex === 1) {
          // 默认三个月不是筛选项
          delete filter.dateScopeIndex;
        }
      }
    } else {
      return 0;
    }
    return _.toArray(filter).filter(item => item).length;
  };
  handleClear = e => {
    e.stopPropagation();
    this.props.handleClear();
  };
  render() {
    const { visible } = this.props;
    const length = this.getFilterLength();
    return (
      <div
        className={cx('processFilterTarget flexRow valignWrapper Gray_75 pointer', { active: visible || length })}
        onClick={this.props.handleOpen}
      >
        <Icon icon="worksheet_filter" className="mBottom2" />
        <span className="Font13 mLeft5">{length ? _l('已筛选') : _l('筛选')}</span>
        {length ? <Icon icon="close" className="Font16 mBottom2 mLeft5" onClick={this.handleClear} /> : null}
      </div>
    );
  }
}

class FilterNav extends Component {
  constructor(props) {
    super(props);
    let currentIndex = 0;

    props.data.forEach((item, index) => {
      if (item.value.type === (props.checked || {}).type) {
        currentIndex = index;
      }
    });

    this.state = {
      currentIndex,
    };
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.data, this.props.data)) {
      this.state = {
        currentIndex: 0,
      };
    }
  }
  render() {
    const { data } = this.props;
    const { currentIndex } = this.state;
    return (
      <div className="filterNav flexRow valignWrapper">
        {data.map((item, index) => (
          <div
            key={index}
            className={cx('item', { active: currentIndex === index })}
            onClick={() => {
              this.setState({ currentIndex: index });
              this.props.onChange(item.value);
            }}
          >
            {item.name}
          </div>
        ))}
      </div>
    );
  }
}

const SECOND_TABS = {
  [TABS.WAITING_DISPOSE]: [
    {
      name: _l('全部'),
      value: { type: -1 },
    },
    {
      name: _l('待填写'),
      value: { type: 3 },
    },
    {
      name: _l('待审批'),
      value: { type: 4 },
    },
  ],
  [TABS.COMPLETE]: [
    {
      name: _l('已处理'),
      value: { type: -1, status: '', resultType: '' },
    },
    {
      name: _l('已查看'),
      value: { type: 5, status: '', operationType: '', resultType: '' },
    },
    {
      name: _l('我发起的'),
      value: { type: 0, operationType: '', createAccountId: '', resultType: '' },
    },
  ],
};

export default class MyProcess extends Component {
  static defaultProps = {
    countData: {},
    updateCountData: () => {},
  };
  constructor(props) {
    super(props);
    let stateTab = TABS.WAITING_DISPOSE;
    let filter = null;

    if (props.match) {
      let { type = '1', secondType = '1' } = props.match.params;
      stateTab = parseInt(type);
      secondType = parseInt(secondType);

      if (stateTab < 1 || stateTab > 4) {
        stateTab = 1;
      }

      if ((stateTab === 1 || stateTab === 4) && secondType >= 1 && secondType <= 3) {
        filter = SECOND_TABS[stateTab][secondType - 1].value;
      }
    }

    this.state = {
      list: [],
      loading: false,
      pageIndex: 1,
      stateTab,
      isMore: true,
      pageSize: 30,
      filter,
      selectCard: null,
      param: {},
      visible: false,
      isLoading: true,
      isResetFilter: false,
      countData: {},
    };
  }
  componentDidMount() {
    this.getTodoList();
    getTodoCount().then(countData => {
      this.updateCountData(countData);
    });
    this.removeEscEvent = this.bindEscEvent();
  }
  componentWillUnmount() {
    this.removeEscEvent();
  }
  updateCountData(countData) {
    const { updateCountData } = this.props;

    this.setState({ countData });
    updateCountData(countData);
  }
  bindEscEvent = () => {
    document.body.addEventListener('keydown', this.closeGlobalSearch);
    return () => document.body.removeEventListener('keydown', this.closeGlobalSearch);
  };
  closeGlobalSearch = e => {
    if (e.key === 'Escape' || e.keyCode === 26) {
      const { selectCard } = this.state;
      _.isEmpty(selectCard) && this.props.onCancel();
    }
  };
  getTodoList = () => {
    const { loading, isMore } = this.state;

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request && this.request.state() === 'pending') {
      this.request.abort();
    }

    const { pageIndex, pageSize, list, stateTab, filter } = this.state;
    const param = {
      pageSize,
      pageIndex,
      ...getStateParam(stateTab),
      ...filter,
    };

    this.setState({ param });

    if (filter && _.isNumber(filter.dateScopeIndex)) {
      Object.assign(param, dateScope[filter.dateScopeIndex].value);
      delete param.dateScopeIndex;
    }
    if (filter && filter.resultType) {
      const resultType = param.resultType;
      delete param.resultType;
      this.request = instanceVersion.getTodoList({
        ...param,
        type: resultType,
      });
    } else {
      delete param.resultType;
      this.request = instanceVersion.getTodoList(param);
    }

    this.request.then(result => {
      this.setState({
        list: list.concat(result),
        isLoading: false,
        loading: false,
        pageIndex: pageIndex + 1,
        isMore: result.length === pageSize,
      });
    });
  };
  handleChangeTab = tab => {
    const { filter } = this.state;
    this.setState(
      {
        stateTab: tab,
        loading: false,
        isLoading: true,
        pageIndex: 1,
        isMore: true,
        list: [],
        filter: null,
        visible: false,
      },
      this.getTodoList,
    );
    getTodoCount().then(countData => {
      this.updateCountData(countData);
    });
  };
  handleScrollEnd = () => {
    this.getTodoList();
  };
  handleAlreadyRead = item => {
    instanceVersion
      .batch({
        id: item.id,
        workId: item.workId,
      })
      .then(result => {
        if (result) {
          alert('操作成功');
          this.handleRead(item);
        }
      });
  };
  handleAllRead = () => {
    const { filter } = this.state;
    const param = { type: 5 };
    if (filter) {
      Object.assign(param, filter);
    }
    instanceVersion.batch(param).then(result => {
      if (result) {
        alert('操作成功');
        this.setState({
          list: [],
          isMore: false,
          isResetFilter: true,
          visible: false,
        });
        getTodoCount().then(countData => {
          this.updateCountData(countData);
        });
      }
    });
  };
  handleRead = item => {
    const { list, visible } = this.state;
    const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
    const { waitingExamine, myProcessCount } = countData;
    const newList = list.filter(n => n.workId !== item.workId);
    this.setState({
      list: newList,
      visible: newList.length ? visible : false,
    });
    this.updateCountData({
      ...countData,
      waitingExamine: waitingExamine - 1,
      myProcessCount: myProcessCount - 1,
    });
  };
  handleSave = item => {
    const { list } = this.state;
    const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
    const { waitingWrite, waitingApproval, waitingDispose, myProcessCount } = countData;
    const newList = list.filter(n => n.workId !== item.workId);

    this.setState({
      list: newList,
    });

    let param = null;

    if (item.flowNodeType === 3) {
      param = {
        waitingWrite: waitingWrite - 1,
      };
    }
    if (item.flowNodeType === 4) {
      param = {
        waitingApproval: waitingApproval - 1,
      };
    }

    this.updateCountData({
      ...countData,
      ...param,
      waitingDispose: waitingDispose - 1,
      myProcessCount: myProcessCount - 1,
    });
  };
  renderHeader = () => {
    const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
    const { waitingDispose, waitingExamine, mySponsor } = countData;
    const { stateTab, filter } = this.state;
    return (
      <div className="header card">
        <div className="valignWrapper flex title">
          <Icon icon="knowledge_file" />
          <span className="bold">{_l('我的流程')}</span>
        </div>
        <div className="statesTab">
          <div
            className={cx('item', { active: stateTab === TABS.WAITING_DISPOSE })}
            onClick={() => {
              this.handleChangeTab(TABS.WAITING_DISPOSE);
            }}
          >
            <span>{_l('待处理')}</span>
            {waitingDispose > 0 ? <span className="count red">{waitingDispose}</span> : null}
          </div>
          <div
            className={cx('item', { active: stateTab === TABS.WAITING_EXAMINE })}
            onClick={() => {
              this.handleChangeTab(TABS.WAITING_EXAMINE);
            }}
          >
            <span>{_l('待查看')}</span>
            {waitingExamine > 0 ? <span className="count red">{waitingExamine}</span> : null}
          </div>
          <div
            className={cx('item', { active: stateTab === TABS.MY_SPONSOR })}
            onClick={() => {
              this.handleChangeTab(TABS.MY_SPONSOR);
            }}
          >
            <span>{_l('我发起的')}</span>
            {mySponsor > 0 ? <span className="count">{mySponsor}</span> : null}
          </div>
          <div
            className={cx('item', { active: stateTab === TABS.COMPLETE })}
            onClick={() => {
              this.handleChangeTab(TABS.COMPLETE);
            }}
          >
            {_l('已完成')}
          </div>
        </div>
        <div className="flex close">
          {location.href.indexOf('myprocess') === -1 ? (
            <Fragment>
              <span className="mRight15" data-tip={_l('新页面打开')}>
                <Icon
                  icon="launch"
                  className="pointer Font22 Gray_9d ThemeHoverColor3"
                  onClick={() => {
                    if (_.includes([TABS.WAITING_DISPOSE, TABS.COMPLETE], stateTab) && filter) {
                      let secondType;

                      SECOND_TABS[stateTab].forEach((item, index) => {
                        if (item.value.type === filter.type) {
                          secondType = index + 1;
                        }
                      });
                      window.open(`/myprocess/${stateTab}/${secondType}`);
                    } else {
                      window.open(`/myprocess/${stateTab}`);
                    }
                  }}
                />
              </span>
              <span data-tip={_l('关闭')}>
                <Icon icon="close" className="pointer Font28 Gray_9d ThemeHoverColor3" onClick={this.props.onCancel} />
              </span>
            </Fragment>
          ) : null}
        </div>
      </div>
    );
  };
  renderWithoutData() {
    return (
      <div className="withoutData">
        <div className="icnoWrapper">
          <Icon icon="ic-line" />
        </div>
        <span>{this.state.visible ? _l('暂无搜索结果') : _l('暂无流程')}</span>
      </div>
    );
  }
  renderFilter() {
    const { stateTab, visible, filter } = this.state;
    const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
    const { waitingDispose, waitingExamine, mySponsor } = countData;

    if (stateTab === TABS.WAITING_DISPOSE) {
      return (
        <div className={cx('filterWrapper', { hide: waitingDispose <= 0 })}>
          <Filter
            visible={visible}
            filter={filter}
            handleOpen={() => this.setState({ visible: true })}
            handleClear={() => {
              this.setState({ isResetFilter: true });
            }}
          />
          <FilterNav
            data={SECOND_TABS[TABS.WAITING_DISPOSE]}
            checked={filter}
            onChange={value => {
              const { filter } = this.state;
              this.setState(
                {
                  pageIndex: 1,
                  isMore: true,
                  loading: false,
                  list: [],
                  filter: {
                    ...filter,
                    ...value,
                  },
                },
                this.getTodoList,
              );
            }}
          />
        </div>
      );
    }
    if (stateTab === TABS.WAITING_EXAMINE) {
      return (
        <div className={cx('filterWrapper', { hide: waitingExamine <= 0 })}>
          <div className="valignWrapper w100">
            <div className="valignWrapper flex">
              <Filter
                visible={visible}
                filter={filter}
                handleOpen={() => this.setState({ visible: true })}
                handleClear={() => {
                  this.setState({ isResetFilter: true });
                }}
              />
            </div>
            <div className="pointer allRead" onClick={this.handleAllRead}>
              <Icon icon="done_all" />
              <span className="Font13 mLeft5">{_l('全部已读')}</span>
            </div>
          </div>
        </div>
      );
    }
    if (stateTab === TABS.MY_SPONSOR) {
      return (
        <div className={cx('filterWrapper', { hide: mySponsor <= 0 })}>
          <Filter
            visible={visible}
            filter={filter}
            handleOpen={() => this.setState({ visible: true })}
            handleClear={() => {
              this.setState({ isResetFilter: true });
            }}
          />
        </div>
      );
    }
    if (stateTab === TABS.COMPLETE) {
      const { filter } = this.state;
      const dateScopeIndex = filter ? (_.isNumber(filter.dateScopeIndex) ? filter.dateScopeIndex : 1) : 1;
      return (
        <div className="filterWrapper">
          <Filter
            visible={visible}
            filter={filter}
            handleOpen={() => this.setState({ visible: true })}
            handleClear={() => {
              this.setState({ isResetFilter: true });
            }}
          />
          <FilterNav
            data={SECOND_TABS[TABS.COMPLETE]}
            checked={filter}
            onChange={value => {
              const { filter } = this.state;
              this.setState(
                {
                  pageIndex: 1,
                  isMore: true,
                  loading: false,
                  list: [],
                  filter: {
                    ...filter,
                    ...value,
                  },
                },
                this.getTodoList,
              );
            }}
          />
          <div className="flex Font13 Gray_75 TxtRight">{_l('显示%0的记录', dateScope[dateScopeIndex].text)}</div>
        </div>
      );
    }
  }
  renderContent() {
    const { list, stateTab, loading, filter } = this.state;
    if (!loading && _.isEmpty(list)) {
      return this.renderWithoutData();
    }
    return (
      <ScrollView onScrollEnd={this.handleScrollEnd} className="flex">
        <div className="content">
          {list.map(item => (
            <Card
              key={item.workId}
              item={item}
              type={filter ? filter.type : null}
              stateTab={stateTab}
              onAlreadyRead={this.handleAlreadyRead}
              onClick={() => {
                this.setState({
                  selectCard: item,
                });
              }}
            />
          ))}
          {loading ? (
            <div className="pTop5 pBottom10">
              <LoadDiv size="middle" />
            </div>
          ) : null}
        </div>
      </ScrollView>
    );
  }
  render() {
    const { stateTab, selectCard, param, visible, filter, isLoading, isResetFilter } = this.state;

    return (
      <div className="myProcessWrapper">
        {this.renderHeader()}
        {isLoading ? (
          <div className="content valignWrapper">
            <LoadDiv size="big" />
          </div>
        ) : (
          <div className={cx('filterContentWrapper', visible ? 'filterContentExtend' : 'filterContentClose')}>
            <FilterConTent
              isResetFilter={isResetFilter}
              param={param}
              stateTab={stateTab}
              visible={visible}
              handleChangeVisible={() => this.setState({ visible: false })}
              onChange={data => {
                const isSampleFilter = [TABS.MY_SPONSOR, TABS.WAITING_EXAMINE].includes(stateTab);
                this.setState(
                  {
                    pageIndex: 1,
                    isMore: true,
                    loading: false,
                    isResetFilter: false,
                    list: [],
                    filter: isSampleFilter
                      ? data
                      : {
                          ...filter,
                          ...data,
                        },
                  },
                  this.getTodoList,
                );
              }}
            />
            <div className="flexColumn">
              {this.renderFilter()}
              {this.renderContent()}
            </div>
          </div>
        )}
        {selectCard ? (
          <ExecDialog
            id={selectCard.id}
            workId={selectCard.workId}
            onClose={() => {
              this.setState({ selectCard: null });
            }}
            onRead={() => {
              if (stateTab === TABS.WAITING_EXAMINE) {
                this.handleRead(this.state.selectCard);
              }
            }}
            onSave={() => {
              if (stateTab === TABS.WAITING_DISPOSE) {
                this.handleSave(this.state.selectCard);
              }
            }}
            onError={() => {
              if (stateTab === TABS.WAITING_EXAMINE) {
                this.handleRead(this.state.selectCard);
              }
              if (stateTab === TABS.WAITING_DISPOSE) {
                this.handleSave(this.state.selectCard);
              }
              if (stateTab === TABS.MY_SPONSOR || stateTab === TABS.COMPLETE) {
                const { list } = this.state;
                const newList = list.filter(n => n.workId !== selectCard.workId);
                this.setState({
                  list: newList,
                });
                if (stateTab === TABS.MY_SPONSOR) {
                  const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
                  const { mySponsor } = countData;
                  this.updateCountData({
                    ...countData,
                    mySponsor: mySponsor - 1,
                  });
                }
              }
            }}
          />
        ) : null}
      </div>
    );
  }
}