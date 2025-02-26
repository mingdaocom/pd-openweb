import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Dialog, Icon, Button, LoadDiv, ScrollView, Signature, VerifyPasswordInput } from 'ming-ui';
import { Tooltip, Checkbox } from 'antd';
import Card from './Card';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import ExecDialog from 'src/pages/workflow/components/ExecDialog';
import { getTodoCount } from './Entry';
import { getDateScope } from './config';
import FilterConTent from './Filter';
import './index.less';
import _ from 'lodash';
import TodoEntrust from './TodoEntrust';
import { verifyPassword } from 'src/util';
import ArchivedList from 'src/components/ArchivedList';

const dateScope = getDateScope();

export const TABS = {
  WAITING_APPROVE: 0, // 待审批
  WAITING_FILL: 1, // 待填写
  WAITING_EXAMINE: 2, // 待查看
  MY_SPONSOR: 3, // 我发起
  COMPLETE: 4, // 已完成
};

export const getStateParam = tab => {
  let param = {};
  if (tab === TABS.WAITING_APPROVE) {
    param = { type: 4 };
  }
  if (tab === TABS.WAITING_FILL) {
    param = { type: 3 };
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
      complete: true
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
    onCancel: () => {},
  };
  constructor(props) {
    super(props);
    let stateTab = props.activeTab || TABS.WAITING_APPROVE;
    let filter = null;

    if (props.match) {
      let { type = '0', secondType = '1' } = props.match.params;
      stateTab = parseInt(type);
      secondType = parseInt(secondType);

      if (stateTab < 0 || stateTab > 4) {
        stateTab = 0;
      }

      if (stateTab === 4 && secondType >= 1 && secondType <= 3) {
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
      approveCards: [],
      param: {},
      visible: false,
      isLoading: true,
      isResetFilter: false,
      countData: {},
      approveType: null,
      encryptType: null,
      rejectVisible: false,
      passVisible: false,
      archivedItem: {}
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
    const { visible } = this.state;
    const { updateCountData } = this.props;

    this.setState({ countData });
    updateCountData(countData);
    if (visible && this.filterEl) {
      this.filterEl.getTodoListFilter();
    }

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

    if (this.request) {
      this.request.abort();
    }

    const { pageIndex, pageSize, list, stateTab, filter, archivedItem } = this.state;
    const param = {
      pageSize,
      pageIndex,
      ...getStateParam(stateTab),
      ...filter,
    };

    this.setState({ param });

    if (archivedItem && archivedItem.id) {
      param.archivedId = archivedItem.id;
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
    this.setState(
      {
        stateTab: tab,
        loading: false,
        isLoading: true,
        pageIndex: 1,
        isMore: true,
        list: [],
        filter: null,
        archivedItem: {},
        // visible: false,
      },
      this.getTodoList,
    );
    getTodoCount().then(countData => {
      this.updateCountData(countData);
    });
  };
  handleScroll = (e, values) => {
    const { position, maximum } = values;
    const value = maximum - position;
    if (value <= 20) {
      this.getTodoList();
    }
  };
  handleAlreadyRead = item => {
    instanceVersion
      .batch({
        id: item.id,
        workId: item.workId,
      })
      .then(result => {
        if (result) {
          alert(_l('操作成功'));
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
        alert(_l('操作成功'));
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
  hanndleApprove = (approveType, batchType) => {
    const { approveCards } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const cards = approveType === 5 ? rejectCards : approveCards;
    const signatureCard = cards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = cards.filter(card => _.get(card.flowNode, 'encrypt'));
    if (signatureCard.length || encryptCard.length) {
      if (signatureCard.length) {
        this.setState({ approveType: approveType });
      }
      if (encryptCard.length) {
        this.setState({ encryptType: approveType });
      }
    } else {
      this.handleBatchApprove(null, approveType);
    }
  };
  handleBatchApprove = (signature, approveType) => {
    const batchType = approveType === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const { approveCards } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const cards = approveType === 5 ? rejectCards : approveCards;
    const selects = cards.map(({ id, workId, flowNode }) => {
      const data = { id, workId, opinion: _l('批量处理') };
      if ((_.get(flowNode, batchType) || []).includes(1)) {
        return {
          ...data,
          signature,
        };
      } else {
        return data;
      }
    });
    instanceVersion
      .batch({
        type: 4,
        batchOperationType: approveType,
        selects,
      })
      .then(result => {
        if (result) {
          alert(_l('操作成功'));
          this.setState({ approveCards: [] });
          this.handleChangeTab(TABS.WAITING_APPROVE);
          getTodoCount().then(countData => {
            this.updateCountData(countData);
          });
        }
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
    const { waitingApproval, waitingWrite, waitingExamine, mySponsor } = countData;
    const { stateTab, filter } = this.state;

    return (
      <div className="header card">
        <div className="valignWrapper flex title">
          <Icon icon="task_alt" />
          <span className="bold">{_l('流程待办')}</span>
        </div>
        <div className="statesTab">
          <div
            className={cx('item ellipsis', { active: stateTab === TABS.WAITING_APPROVE })}
            onClick={() => {
              this.setState({ approveCards: [] });
              this.handleChangeTab(TABS.WAITING_APPROVE);
            }}
          >
            <span>{_l('审批')}</span>
            {waitingApproval > 0 ? <span className="processCount red">{waitingApproval}</span> : null}
          </div>
          <div
            className={cx('item ellipsis', { active: stateTab === TABS.WAITING_FILL })}
            onClick={() => {
              this.handleChangeTab(TABS.WAITING_FILL);
            }}
          >
            <span>{_l('填写')}</span>
            {waitingWrite > 0 ? <span className="processCount red">{waitingWrite}</span> : null}
          </div>
          <div
            className={cx('item ellipsis', { active: stateTab === TABS.WAITING_EXAMINE })}
            onClick={() => {
              this.handleChangeTab(TABS.WAITING_EXAMINE);
            }}
          >
            <span>{_l('抄送')}</span>
            {waitingExamine > 0 ? <span className="processCount red">{waitingExamine}</span> : null}
          </div>
          <div
            className={cx('item ellipsis', { active: stateTab === TABS.MY_SPONSOR })}
            onClick={() => {
              this.handleChangeTab(TABS.MY_SPONSOR);
            }}
          >
            <span>{_l('发起')}</span>
            {mySponsor > 0 ? <span className="processCount">{mySponsor}</span> : null}
          </div>
          <div className="cuttingLine" />
          <div
            className={cx('item ellipsis', { active: stateTab === TABS.COMPLETE })}
            onClick={() => {
              this.handleChangeTab(TABS.COMPLETE);
            }}
          >
            {_l('已完成')}
          </div>
        </div>
        <div className="flex close">
          <TodoEntrust />
          {location.href.indexOf('myprocess') === -1 ? (
            <Fragment>
              <span className="mRight15" data-tip={_l('新页面打开')}>
                <Icon
                  icon="launch"
                  className="pointer Font22 Gray_9d ThemeHoverColor3"
                  onClick={() => {
                    if (_.includes([TABS.COMPLETE], stateTab) && filter) {
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
        <span>
          {this.state.visible
            ? _l('暂无搜索结果')
            : this.state.stateTab === TABS.MY_SPONSOR
            ? _l('暂无流程')
            : _l('没有待办')}{' '}
        </span>
      </div>
    );
  }
  renderFilter() {
    const { stateTab, visible, filter, approveCards, list } = this.state;
    const countData = _.isEmpty(this.props.countData) ? this.state.countData : this.props.countData;
    const { waitingApproval, waitingWrite, waitingExamine, mySponsor } = countData;

    if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL].includes(stateTab)) {
      const isApprove = TABS.WAITING_APPROVE === stateTab;
      const count = isApprove ? waitingApproval : waitingWrite;
      const { passVisible, rejectVisible } = this.state;
      const allowApproveList = list.filter(c => _.get(c, 'flowNode.batchApprove'));
      const rejectList = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
      return (
        <div className={cx('filterWrapper', { hide: count <= 0 })}>
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
          {isApprove && (
            <div className="valignWrapper Font14">
              <div className="valignWrapper mTop2">
                <Checkbox
                  checked={allowApproveList.length && allowApproveList.length === approveCards.length}
                  disabled={!allowApproveList.length}
                  onChange={e => {
                    const { checked } = e.target;
                    if (checked) {
                      if (allowApproveList.length) {
                        alert(_l('全选%0条可批量审批的记录', allowApproveList.length));
                        this.setState({ approveCards: allowApproveList });
                      } else {
                        alert(_l('没有允许批量审批的记录，请打开记录逐条审批'), 3);
                      }
                    } else {
                      this.setState({ approveCards: [] });
                    }
                  }}
                />
                <div className="valignWrapper mLeft5 mRight5">
                  {_l('全选')}
                  {approveCards.length
                    ? _l('（已选择%0/%1条）', approveCards.length, list.length)
                    : list.length !== waitingApproval && _l('（已加载%0条）', list.length)}
                </div>
              </div>
              <Tooltip
                overlayClassName="myProcessApproveOverlay"
                overlayStyle={{ width: 320, maxWidth: 320 }}
                align={{ offset: [40, -5] }}
                placement="bottomRight"
                arrowPointAtCenter={true}
                trigger={['click']}
                color="#FFF"
                title={
                  <div className="pAll10 flexColumn">
                    <span className="Gray Font15">{_l('您将通过选择的%0个审批事项', approveCards.length)}</span>
                    <div className="flexRow mTop10" style={{ justifyContent: 'flex-end' }}>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => {
                          $('.passApprove').click();
                        }}
                      >
                        {_l('取消')}
                      </Button>
                      <Button
                        type="success"
                        size="small"
                        onClick={() => {
                          if (_.isEmpty(approveCards)) {
                            alert(_l('请先勾选需要处理的审批'), 3);
                            return;
                          }
                          this.hanndleApprove(4, 'auth.passTypeList');
                          $('.passApprove').click();
                        }}
                      >
                        {_l('通过')}
                      </Button>
                    </div>
                  </div>
                }
                visible={passVisible}
                onVisibleChange={passVisible => {
                  if (_.isEmpty(approveCards)) {
                    alert(_l('请先勾选需要处理的审批'), 2);
                  } else {
                    this.setState({ passVisible });
                  }
                }}
              >
                <div className={cx('passApprove bold pointer', { active: passVisible, all: approveCards.length })}>
                  {_l('通过')}
                </div>
              </Tooltip>
              <div
                className={cx('rejectApprove bold pointer', {
                  active: rejectVisible,
                  select: rejectList.length,
                  all: approveCards.length && rejectList.length === approveCards.length,
                })}
                onClick={() => {
                  if (_.isEmpty(approveCards)) {
                    alert(_l('请先勾选需要处理的审批'), 2);
                  } else if (_.isEmpty(rejectList)) {
                    alert(_l('没有可否决的审批事项'), 2);
                  } else {
                    this.setState({ rejectVisible: true });
                  }
                }}
              >
                {_l('否决')}
                {!(approveCards.length && rejectList.length === approveCards.length) &&
                  !!rejectList.length &&
                  rejectList.length}
              </div>
            </div>
          )}
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
      const { filter, archivedItem } = this.state;
      const renderArchivedList = () => {
        return (
          <ArchivedList
            type={1}
            archivedItem={archivedItem}
            onChange={archivedItem => {
              this.setState({
                archivedItem,
                isMore: true,
                pageIndex: 1,
                list: [],
                filter: {
                  ...filter,
                  startDate: archivedItem.start,
                  endDate: archivedItem.end,
                },
              }, this.getTodoList);
            }}
          />
        )
      }
      return (
        <Fragment>
          {!_.isEmpty(archivedItem) && (
            <div className="mTop20">
              {renderArchivedList()}
            </div>
          )}
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
            {_.isEmpty(archivedItem) && (
              <div className="flex TxtRight">
                {renderArchivedList()}
              </div>
            )}
          </div>
        </Fragment>
      );
    }
  }
  renderSignatureDialog() {
    const { approveType, encryptType } = this.state;
    const type = approveType || encryptType;
    const batchType = type === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const approveCards =
      type === 4 ? this.state.approveCards : this.state.approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const signatureApproveCards = approveCards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = approveCards.filter(card => _.get(card.flowNode, 'encrypt'));
    return (
      <Dialog
        visible
        width={650}
        title={type === 4 ? _l('通过审批') : _l('否决审批')}
        onOk={() => {
          if (signatureApproveCards.length && this.signature.checkContentIsEmpty()) {
            alert(_l('请填写签名'), 2);
            return;
          }
          const submitFun = () => {
            if (signatureApproveCards.length) {
              this.signature.saveSignature(signature => {
                this.handleBatchApprove(signature, this.state.approveType);
                this.setState({ approveType: null, encryptType: null });
              });
            } else {
              this.handleBatchApprove(null, this.state.encryptType);
              this.setState({ approveType: null, encryptType: null });
            }
          };
          if (encryptCard.length) {
            if (!this.password || !this.password.trim()) {
              alert(_l('请输入密码'), 3);
              return;
            }
            verifyPassword({
              password: this.password,
              closeImageValidation: true,
              success: submitFun,
            });
          } else {
            submitFun();
          }
        }}
        onCancel={() => {
          this.setState({ approveType: null, encryptType: null });
          this.password = undefined;
        }}
      >
        <div className="Gray_75 Font14 mBottom10">
          {_l('其中')}
          {!!signatureApproveCards.length && _l('%0个事项需要签名', signatureApproveCards.length)}
          {!!(signatureApproveCards.length && encryptCard.length) && '，'}
          {!!encryptCard.length && _l('%0个事项需要验证登录密码', encryptCard.length)}
        </div>
        {!!signatureApproveCards.length && (
          <Fragment>
            <div className="mBottom5">{_l('签名')}</div>
            <Signature
              ref={signature => {
                this.signature = signature;
              }}
            />
            <div className="mTop20 BorderBottom borderColor_ef" />
          </Fragment>
        )}
        {encryptType && (
          <div className="mTop20">
            <VerifyPasswordInput
              showSubTitle={false}
              isRequired={true}
              allowNoVerify={false}
              onChange={({ password }) => {
                if (password !== undefined) this.password = password;
              }}
            />
          </div>
        )}
      </Dialog>
    );
  }
  renderRejectDialog() {
    const { approveCards, filter, stateTab } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const noRejectCards = approveCards.filter(c => !('5' in _.get(c, 'flowNode.btnMap')));
    return (
      <Dialog
        visible
        width={860}
        title={_l('有%0个可否决的审批事项', rejectCards.length)}
        onOk={() => {
          this.hanndleApprove(5, 'auth.overruleTypeList');
          this.setState({ rejectVisible: false });
        }}
        okText={_l('否决')}
        buttonType="danger"
        onCancel={() => this.setState({ rejectVisible: false })}
      >
        <div className="mTop10" />
        {rejectCards.map(item => (
          <Card
            key={item.workId}
            item={item}
            type={filter ? filter.type : null}
            stateTab={stateTab}
            showApproveChecked={false}
            onClick={() => {
              this.setState({
                selectCard: item,
              });
            }}
          />
        ))}
        {!!noRejectCards.length && (
          <Fragment>
            <div className="mBottom10 Gray_75">
              {_l('不能否决事项')} {noRejectCards.length}
            </div>
            {noRejectCards.map(item => (
              <Card
                key={item.workId}
                item={item}
                type={filter ? filter.type : null}
                stateTab={stateTab}
                showApproveChecked={false}
                onClick={() => {
                  this.setState({
                    selectCard: item,
                  });
                }}
              />
            ))}
          </Fragment>
        )}
      </Dialog>
    );
  }
  renderContent() {
    const { list, stateTab, loading, filter, approveCards } = this.state;

    if (!loading && _.isEmpty(list)) {
      return <div className="content">{this.renderWithoutData()}</div>;
    }

    return (
      <ScrollView updateEvent={this.handleScroll} className="flex">
        <div className="content">
          {list.map(item => (
            <Card
              key={item.workId}
              item={item}
              type={filter ? filter.type : null}
              stateTab={stateTab}
              approveChecked={!_.isEmpty(_.find(approveCards, { workId: item.workId }))}
              onAlreadyRead={this.handleAlreadyRead}
              onClick={() => {
                this.setState({
                  selectCard: item,
                });
              }}
              onAddApproveRecord={item => {
                const { approveCards } = this.state;
                this.setState({
                  approveCards: approveCards.concat(item),
                });
              }}
              onRemoveApproveRecord={workId => {
                const { approveCards } = this.state;
                this.setState({
                  approveCards: approveCards.filter(item => item.workId !== workId),
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
    const {
      stateTab,
      selectCard,
      param,
      visible,
      filter,
      isLoading,
      isResetFilter,
      approveType,
      encryptType,
      rejectVisible,
      archivedItem
    } = this.state;

    return (
      <div className="myProcessWrapper">
        {this.renderHeader()}
        <div className={cx('filterContentWrapper', visible ? 'filterContentExtend' : 'filterContentClose')}>
          <FilterConTent
            isResetFilter={isResetFilter}
            param={param}
            stateTab={stateTab}
            visible={visible}
            archivedItem={archivedItem}
            onChangeArchivedItem={(data) => {
              this.setState({
                pageIndex: 1,
                isMore: true,
                list: [],
                archivedItem: {
                  ...archivedItem,
                  start: data.startDate,
                  end: data.endDate,
                },
                filter: {
                  ...filter,
                  ...data
                }
              }, this.getTodoList);
            }}
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
                  approveCards: [],
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
            ref={el => {
              this.filterEl = el;
            }}
          />
          {isLoading ? (
            <div className="flexColumn loadoingWrapper pTop100">
              <LoadDiv size="big" />
            </div>
          ) : (
            <div className="flexColumn">
              {this.renderFilter()}
              {this.renderContent()}
            </div>
          )}
        </div>
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
              if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL].includes(stateTab)) {
                this.handleSave(this.state.selectCard);
              }
            }}
            onError={() => {
              if ([TABS.WAITING_APPROVE, TABS.WAITING_FILL].includes(stateTab)) {
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
              this.setState({ selectCard: null });
            }}
          />
        ) : null}
        {(approveType || encryptType) && this.renderSignatureDialog()}
        {rejectVisible && this.renderRejectDialog()}
      </div>
    );
  }
}
