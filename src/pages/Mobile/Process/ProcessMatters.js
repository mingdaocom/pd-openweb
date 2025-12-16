import React, { Component, Fragment } from 'react';
import { ActionSheet, Button, Checkbox, Popup, Tabs } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, Signature, VerifyPasswordInput } from 'ming-ui';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import 'mobile/ProcessRecord/OtherAction/index.less';
import verifyPassword from 'src/components/verifyPassword';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import 'src/pages/worksheet/common/newRecord/NewRecord.less';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import Back from '../components/Back';
import Card from './Card';
import Filter from './Filter';
import ProcessDelegation from './ProcessDelegation';
import { formatQueryParam } from './utils';
import './index.less';

const ModalWrap = styled(Popup)`
  .content {
    background-color: #f3f3f3;
  }
  .closeBtn,
  .rejectApprove {
    color: #999;
    text-align: center;
    padding: 4px 15px;
    border-radius: 24px;
    border: 1px solid #dddddd;
    background-color: #fff;
  }
  .rejectApprove {
    &.select {
      color: #f44336;
      border-color: #f44336;
      background-color: rgba(244, 67, 54, 0.12);
    }
    &.all {
      color: #fff;
      border-color: #f44336;
      background-color: #f44336;
    }
  }
`;

const tabs = [
  {
    name: _l('待办'),
    id: 'untreated',
    icon: 'access_time',
    className: 'Font18',
    tabs: [
      {
        name: _l('待审批'),
        id: 'waitingApproval',
        param: {
          type: 4,
        },
      },
      {
        name: _l('待填写'),
        id: 'waitingWrite',
        param: {
          type: 3,
        },
      },
    ],
  },
  {
    name: _l('我发起的'),
    id: 'mySponsor',
    icon: 'send',
    className: 'Font18',
    tabs: [],
    param: {
      type: 0,
    },
  },
  {
    name: _l('已完成'),
    id: 'processed',
    icon: 'succeed-one-o',
    className: 'Font15',
    tabs: [
      {
        name: _l('已处理'),
        id: 'completeDispose',
        param: {
          type: -1,
          complete: true,
        },
      },
      {
        name: _l('我发起的'),
        id: 'completeMySponsor',
        param: {
          type: 0,
          complete: true,
        },
      },
    ],
  },
];

export default class ProcessMatters extends Component {
  constructor(props) {
    super(props);
    const { tab } = props.match.params;
    const savedTabs = localStorage.getItem('currentProcessTab')
      ? JSON.parse(localStorage.getItem('currentProcessTab'))
      : {};
    const bottomTab = savedTabs.bottomTab || _.find(tabs, { id: tab }) || tabs[0] || {};
    this.state = {
      pageIndex: 1,
      pageSize: 30,
      list: [],
      loading: false,
      isMore: true,
      bottomTab: bottomTab,
      topTab: savedTabs.topTab
        ? savedTabs.topTab
        : tab
          ? _.find(bottomTab.tabs, { id: tab }) || bottomTab.tabs[0]
          : bottomTab.tabs[0],
      searchValue: '',
      countData: {},
      appCount: {},
      previewRecord: {},
      batchApproval: false,
      approveCards: [],
      approveType: null,
      encryptType: null,
      filterVisible: false,
      queryParam: {},
      batchLoadingType: '',
    };
  }
  componentDidMount() {
    this.getTodoList();
    this.getTodoCount();
    verifyPassword({
      checkNeedAuth: true,
      fail: () => {
        this.setState({ showPassword: true });
      },
    });
    window.addEventListener('popstate', this.onQueryChange);
    localStorage.removeItem('currentProcessTab');
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
    const { loading, isMore, topTab, bottomTab, searchValue, queryParam } = this.state;
    const { appId } = getRequest();

    if (loading || !isMore) {
      return;
    }

    this.setState({
      loading: true,
    });

    if (this.request) {
      this.request.abort();
    }
    if (searchValue) {
      param.keyword = searchValue;
    }
    if (appId) {
      param.apkId = appId;
    }

    const { pageIndex, pageSize, list } = this.state;
    this.request = instanceVersion.getTodoList({
      pageSize,
      pageIndex,
      ...(topTab ? topTab.param : bottomTab.param),
      ...formatQueryParam(queryParam),
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
        instanceVersion.getTodoListFilter({ type: 4 }).then(),
        instanceVersion.getTodoListFilter({ type: 3 }).then(),
      ]).then(result => {
        const [approveList, writeList] = result;
        const approve = _.find(approveList, { app: { id: appId } });
        const write = _.find(writeList, { app: { id: appId } });
        const appCount = {
          approveCount: approve ? approve.count : 0,
          writeCount: write ? write.count : 0,
        };
        this.setState({
          appCount,
        });
        if (!appCount.approveCount && !appCount.writeCount) {
          history.replaceState(null, '', location.origin + location.pathname);
          getTodoCount().then(countData => {
            this.setState(
              {
                countData,
                loading: false,
                pageIndex: 1,
                isMore: true,
              },
              () => {
                this.getTodoList();
              },
            );
          });
        }
      });
    } else {
      getTodoCount().then(countData => {
        this.setState({
          countData,
        });
      });
    }
  }
  saveCurrentTab = (topTab, bottomTab) => {
    localStorage.setItem('currentProcessTab', JSON.stringify({ topTab, bottomTab }));
  };
  handleClearQuery = () => {
    this.setState({ queryParam: {} });
  };
  handleChangeCompleteTab = tab => {
    this.saveCurrentTab(tab.tabs[0], tab);
    this.setState(
      {
        loading: false,
        pageIndex: 1,
        isMore: true,
        list: [],
        bottomTab: tab,
        topTab: tab.tabs[0],
      },
      () => {
        this.getTodoList();
      },
    );
  };
  handleChangeTopTab = tab => {
    this.saveCurrentTab(tab, this.state.bottomTab);
    this.setState(
      {
        loading: false,
        pageIndex: 1,
        isMore: true,
        list: [],
        topTab: tab,
      },
      () => {
        this.getTodoList();
      },
    );
  };
  handleScrollEnd = () => {
    this.getTodoList();
  };
  handleApproveDone = ({ workId }) => {
    const { list, countData, appCount, topTab = {} } = this.state;
    const { appId } = getRequest();
    if (appId) {
      const countDataState = {
        ...appCount,
      };
      if (topTab.id === 'waitingApproval') {
        countDataState.approveCount = appCount.approveCount - 1;
      }
      if (topTab.id === 'waitingWrite') {
        countDataState.writeCount = appCount.writeCount - 1;
      }
      this.setState({
        list: list.filter(item => item.workId !== workId),
        appCount: countDataState,
      });
    } else {
      const countDataState = {
        ...countData,
      };
      if (topTab.id === 'waitingApproval') {
        countDataState.waitingApproval = countData.waitingApproval - 1;
      }
      if (topTab.id === 'waitingWrite') {
        countDataState.waitingWrite = countData.waitingWrite - 1;
      }
      this.setState({
        list: list.filter(item => item.workId !== workId),
        countData: countDataState,
      });
    }
  };
  hanndleApprove = (type, batchType) => {
    const { approveCards } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const cards = type === 5 ? rejectCards : approveCards;
    const signatureCard = cards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = cards.filter(card => _.get(card.flowNode, 'encrypt'));
    if (_.isEmpty(cards)) {
      alert(_l('请先勾选需要处理的审批'), 2);
      return;
    }
    if (signatureCard.length || encryptCard.length) {
      if (signatureCard.length) {
        this.setState({ approveType: type });
      }
      if (encryptCard.length) {
        this.setState({ encryptType: type });
      }
    } else {
      this.handleBatchApprove(null, type);
    }
  };
  handleBatchApprove = (signature, approveType) => {
    const batchType = approveType === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const { approveCards, batchLoadingType } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const cards = approveType === 5 ? rejectCards : approveCards;
    const selects = cards.map(({ id, workId, flowNode }) => {
      const data = { id, workId, opinion: '', opinionType: 3 };
      if ((_.get(flowNode, batchType) || []).includes(1)) {
        return {
          ...data,
          signature,
        };
      } else {
        return data;
      }
    });
    if (batchLoadingType) return;
    this.setState({ batchLoadingType: approveType });
    instanceVersion
      .batch2({
        type: 4,
        batchOperationType: approveType,
        selects,
      })
      .then(result => {
        const { success = [], fail = [] } = result;
        const callBack = () => {
          handler.close();
          this.setState(
            {
              batchLoadingType: false,
              batchApproval: false,
              rejectVisible: false,
              approveCards: [],
              list: [],
              pageIndex: 1,
              isMore: true,
            },
            () => {
              this.getTodoCount();
              this.getTodoList();
            },
          );
        };
        const handler = ActionSheet.show({
          extra: (
            <div className="w100">
              {!!success.length && (
                <div className="flexRow alignItemsCenter mTop12">
                  <Icon icon="check_circle1" className="Font36 mRight10" style={{ color: '#4CB050' }} />
                  <div className="Gray Font20">{_l('%0 条执行完成', success.length)}</div>
                </div>
              )}
              {!!fail.length && (
                <div className="flexRow mTop12">
                  <Icon icon="report" className="Font36 mRight10" style={{ color: '#F54337' }} />
                  <div className="w100">
                    <div className="Font20 mBottom5" style={{ color: '#F54337' }}>
                      {_l('%0 条异常', fail.length)}
                    </div>
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                      {fail.map(key => {
                        const [id, workId] = key.split(',');
                        const card = _.find(cards, { id, workId });
                        return card ? (
                          <div className="Gray Font15 mBottom3">{`${card.entityName}: ${card.title || _l('未命名')}`}</div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}
              <Button block color="primary" size="small" className="mTop24" onClick={callBack}>
                {_l('关闭')}
              </Button>
            </div>
          ),
          onClose: callBack,
        });
      });
  };
  renderSignatureDialog() {
    const { approveType, encryptType } = this.state;
    const type = approveType || encryptType;
    const batchType = type === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const approveCards =
      type === 4 ? this.state.approveCards : this.state.approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const signatureApproveCards = approveCards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = approveCards.filter(card => _.get(card.flowNode, 'encrypt'));
    return (
      <Popup
        visible={true}
        className="mobileModal topRadius"
        onClose={() => {
          this.setState({ approveType: null, encryptType: null });
        }}
      >
        <div className="otherActionWrapper flexColumn">
          <div className="flex pAll10">
            <div className="Gray_75 Font14 TxtLeft mBottom10">
              {_l('其中')}
              {!!signatureApproveCards.length && _l('%0个事项需要签名', signatureApproveCards.length)}
              {!!(signatureApproveCards.length && encryptCard.length) && '，'}
              {!!encryptCard.length && _l('%0个事项需要验证登录密码', encryptCard.length)}
            </div>
            {!!signatureApproveCards.length && (
              <Signature
                ref={signature => {
                  this.signature = signature;
                }}
              />
            )}
            {encryptType && (
              <div className="mTop20 TxtLeft">
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
          </div>
          <div className="flexRow actionBtnWrapper">
            <div
              className="flex actionBtn"
              onClick={() => {
                this.setState({ approveType: null, encryptType: null });
              }}
            >
              {_l('取消')}
            </div>
            <div
              className="flex actionBtn ok"
              onClick={() => {
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
            >
              {_l('确定')}
            </div>
          </div>
        </div>
      </Popup>
    );
  }
  renderRejectDialog() {
    const { approveCards, batchApproval, filter, topTab, bottomTab } = this.state;
    const rejectCards = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const noRejectCards = approveCards.filter(c => !('5' in _.get(c, 'flowNode.btnMap')));
    return (
      <ModalWrap
        visible={true}
        className="mobileModal minFull topRadius"
        onClose={() => {
          this.setState({ rejectVisible: false });
        }}
      >
        <div className="flexColumn h100 content">
          <div className="flex flexColumn" style={{ overflowY: 'auto' }}>
            <div className="pLeft10 mTop16 mBottom10 TxtLeft Gray bold">
              {_l('有%0个可否决的审批事项', rejectCards.length)}
            </div>
            {rejectCards.map(item => (
              <div className="pLeft10 pRight10" key={item.workId}>
                <Card
                  item={item}
                  type={filter ? filter.type : null}
                  time={createTimeSpan(item.workItem.receiveTime)}
                  currentTab={topTab ? topTab.id : bottomTab.id}
                  showApproveChecked={false}
                  batchApproval={batchApproval}
                  renderBodyTitle={() => {
                    return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
                  }}
                  onClick={() => {
                    handlePushState('page', 'processRecord');
                    this.setState({
                      previewRecord: { instanceId: item.id, workId: item.workId },
                    });
                  }}
                />
              </div>
            ))}
            {!!noRejectCards.length && (
              <Fragment>
                <div className="pLeft10 mTop6 mBottom10 Gray_75 TxtLeft bold">
                  {_l('不能否决事项')} {noRejectCards.length}
                </div>
                {noRejectCards.map(item => (
                  <div className="pLeft10 pRight10" key={item.workId}>
                    <Card
                      item={item}
                      type={filter ? filter.type : null}
                      time={createTimeSpan(item.workItem.receiveTime)}
                      currentTab={topTab ? topTab.id : bottomTab.id}
                      showApproveChecked={false}
                      batchApproval={batchApproval}
                      renderBodyTitle={() => {
                        return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
                      }}
                      onClick={() => {
                        handlePushState('page', 'processRecord');
                        this.setState({
                          previewRecord: { instanceId: item.id, workId: item.workId },
                        });
                      }}
                    />
                  </div>
                ))}
              </Fragment>
            )}
          </div>
          <div className="flexRow valignWrapper pAll10 WhiteBG">
            <div
              className="closeBtn flex bold mRight10"
              onClick={() => {
                this.setState({ rejectVisible: false });
              }}
            >
              {_l('取消')}
            </div>
            <div
              className={cx('rejectApprove flex bold all')}
              onClick={() => {
                this.hanndleApprove(5, 'auth.overruleTypeList');
                this.setState({ rejectVisible: false });
              }}
            >
              <span className="mRight5">{_l('拒绝')}</span>
            </div>
          </div>
        </div>
      </ModalWrap>
    );
  }
  renderCount(tab) {
    const { countData, appCount } = this.state;
    const { appId } = getRequest();

    if (tab.id === 'waitingWrite') {
      if (appId) {
        return appCount.writeCount > 0 ? `(${appCount.writeCount})` : null;
      } else {
        return countData.waitingWrite > 0 ? `(${countData.waitingWrite})` : null;
      }
    }

    if (tab.id === 'waitingApproval') {
      if (appId) {
        return appCount.approveCount > 0 ? `(${appCount.approveCount})` : null;
      } else {
        return countData.waitingApproval > 0 ? `(${countData.waitingApproval})` : null;
      }
    }
  }
  renderInput() {
    const { searchValue, filterVisible, bottomTab, topTab, queryParam } = this.state;
    const currentTab = topTab ? topTab.id : bottomTab.id;
    return (
      <div className="searchWrapper flexRow">
        <div className="inputWrap valignWrapper flex">
          <Icon icon="search" className="Gray_75 Font20 pointer" />
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
              const { bottomTab, topTab } = this.state;
              if (topTab) {
                event.which === 13 && this.handleChangeTopTab(topTab);
              } else {
                event.which === 13 && this.handleChangeCompleteTab(bottomTab);
              }
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
                    const { bottomTab, topTab } = this.state;
                    if (topTab) {
                      this.handleChangeTopTab(topTab);
                    } else {
                      this.handleChangeCompleteTab(bottomTab);
                    }
                  },
                );
              }}
            />
          )}
        </div>
        <div className="filterWrap" onClick={() => this.setState({ filterVisible: true })}>
          <Icon icon="filter" className={cx('Font20 Gray_9e', { active: !_.isEmpty(_.omitBy(queryParam, _.isNil)) })} />
        </div>
        <Filter
          tab={currentTab}
          todoListFilterParam={topTab ? topTab.param : bottomTab.param}
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
    const { batchApproval, list, loading, pageIndex, filter, bottomTab, topTab, approveCards } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {list.map(item => (
          <div className="pLeft10 pRight10" key={item.workId}>
            <Card
              item={item}
              type={filter ? filter.type : null}
              time={createTimeSpan(item.workItem.receiveTime)}
              currentTab={topTab ? topTab.id : bottomTab.id}
              approveChecked={!_.isEmpty(_.find(approveCards, { workId: item.workId }))}
              batchApproval={batchApproval}
              renderBodyTitle={() => {
                return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
              }}
              onClick={() => {
                handlePushState('page', 'processRecord');
                this.setState({
                  previewRecord: { instanceId: item.id, workId: item.workId },
                });
              }}
              onApproveDone={this.handleApproveDone}
              onChangeApproveCards={checked => {
                if (checked) {
                  this.setState({
                    approveCards: approveCards.concat(item),
                  });
                } else {
                  this.setState({
                    approveCards: approveCards.filter(n => n.workId !== item.workId),
                  });
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
  render() {
    const {
      batchApproval,
      list,
      countData,
      bottomTab,
      topTab,
      previewRecord,
      approveCards,
      approveType,
      encryptType,
      rejectVisible,
      batchLoadingType,
    } = this.state;
    const currentTabs = bottomTab.tabs;
    const allowApproveList = list.filter(c => _.get(c, 'flowNode.batchApprove'));
    const rejectList = approveCards.filter(c => '5' in _.get(c, 'flowNode.btnMap'));
    const { appId } = getRequest();
    return (
      <div className="processContent flexColumn h100">
        <div className="flexColumn h100">
          <div className="processTabs mBottom10 z-depth-1">
            <Tabs
              className="md-adm-tabs"
              activeLineMode="fixed"
              activeKey={_.get(topTab, 'id')}
              onChange={id => {
                this.handleClearQuery();
                this.handleChangeTopTab(_.find(currentTabs, { id }));
              }}
            >
              {currentTabs.map(tab => (
                <Tabs.Tab
                  title={
                    <span>
                      {tab.name} {this.renderCount(tab)}
                    </span>
                  }
                  key={tab.id}
                />
              ))}
            </Tabs>
            {batchApproval && (
              <div className="batchApprovalHeader valignWrapper Font16">
                <div className="bold Gray">
                  {_l('待审批')}
                  {countData.waitingApproval && `(${countData.waitingApproval})`}
                </div>
                <a
                  onClick={() => {
                    this.setState({ batchApproval: false, approveCards: [] });
                  }}
                >
                  {_l('完成')}
                </a>
              </div>
            )}
          </div>
          {batchApproval && (
            <div className="batchApprovalFooter flexColumn">
              <div className="valignWrapper">
                <Checkbox
                  checked={!!allowApproveList.length && allowApproveList.length === approveCards.length}
                  disabled={!allowApproveList.length}
                  onChange={checked => {
                    if (checked) {
                      if (allowApproveList.length) {
                        alert(_l('全选%0条可批量审批的记录', allowApproveList.length), 1);
                        this.setState({ approveCards: allowApproveList });
                      } else {
                        alert(_l('没有可批量操作的审批事项'), 2);
                      }
                    } else {
                      this.setState({ approveCards: [] });
                    }
                  }}
                />
                <div className="mLeft5 Font17">
                  {_l('全选')}
                  {approveCards.length
                    ? _l('（已选择%0/%1条）', approveCards.length, list.length)
                    : list.length !== countData.waitingApproval && _l('（已加载%0条）', list.length)}
                </div>
              </div>
              <div className="valignWrapper mTop20">
                <div
                  className={cx('passApprove flex mRight10', { all: approveCards.length })}
                  onClick={() => {
                    this.hanndleApprove(4, 'auth.passTypeList');
                  }}
                >
                  {batchLoadingType === 4 ? <LoadDiv size="small" /> : _l('同意')}
                </div>
                <div
                  className={cx('rejectApprove flex', {
                    select: rejectList.length,
                    all: approveCards.length && rejectList.length === approveCards.length,
                  })}
                  onClick={() => {
                    if (_.isEmpty(approveCards)) {
                      alert(_l('请先勾选需要处理的审批'), 2);
                    } else if (_.isEmpty(rejectList)) {
                      alert(_l('没有可拒绝的审批事项'), 2);
                    } else {
                      this.setState({ rejectVisible: true });
                    }
                  }}
                >
                  {batchLoadingType === 5 ? <LoadDiv size="small" /> : <span className="mRight5">{_l('拒绝')}</span>}
                  {!(approveCards.length && rejectList.length === approveCards.length) &&
                    !!rejectList.length &&
                    rejectList.length}
                </div>
              </div>
            </div>
          )}
          {this.renderInput()}
          {this.renderContent()}
          <div className="processTabs bottomProcessTabs">
            <Tabs
              className="md-adm-tabs"
              activeLineMode="fixed"
              activeKey={_.get(bottomTab, 'id')}
              onChange={id => {
                this.handleClearQuery();
                this.handleChangeCompleteTab(_.find(tabs, { id }));
              }}
            >
              {tabs.map(tab => (
                <Tabs.Tab
                  title={
                    <div className="flexColumn valignWrapper">
                      <Icon className={tab.className} icon={tab.icon} />
                      <span className="Font12 mTop2">{tab.name}</span>
                    </div>
                  }
                  key={tab.id}
                />
              ))}
            </Tabs>
          </div>
        </div>
        {!batchApproval && (
          <Back
            style={{ bottom: 60 }}
            onClick={() => {
              localStorage.removeItem('currentProcessTab');
              if (appId) {
                navigateTo(`/mobile/app/${appId}`);
                return;
              }
              navigateTo(`/mobile/dashboard`);
            }}
          />
        )}
        {!batchApproval && topTab && (topTab.id === 'waitingApproval' || topTab.id === 'waitingWrite') && (
          <ProcessDelegation topTab={topTab} className={cx({ bottom120: !list.length })} />
        )}
        {topTab && topTab.id === 'waitingApproval' && !batchApproval && !!list.length && (
          <div
            className="card processBatchOperation flexRow alignItemsCenter justifyContentCenter"
            onClick={() => {
              this.setState({ batchApproval: true });
            }}
          >
            <Icon className="Font20 Gray_9e" icon="done_all" />
          </div>
        )}
        <ProcessRecordInfo
          isModal
          className="full"
          visible={!_.isEmpty(previewRecord)}
          instanceId={previewRecord.instanceId}
          workId={previewRecord.workId}
          onClose={data => {
            if (data.id) {
              this.handleApproveDone(data);
            }
            history.back();
            this.setState({
              previewRecord: {},
            });
          }}
          onSave={() => {
            alert(_l('操作成功'));
          }}
        />
        {(approveType || encryptType) && this.renderSignatureDialog()}
        {rejectVisible && this.renderRejectDialog()}
      </div>
    );
  }
}
