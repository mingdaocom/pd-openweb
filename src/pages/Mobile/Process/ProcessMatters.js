import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Tabs, Flex, Checkbox, Toast, Modal } from 'antd-mobile';
import { Icon, LoadDiv, ScrollView, Signature } from 'ming-ui';
import Back from '../components/Back';
import ProcessRecordInfo from 'mobile/ProcessRecord';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import { getTodoCount } from 'src/pages/workflow/MyProcess/Entry';
import Card from './Card';
import ProcessDelegation from './ProcessDelegation';
import { getRequest } from 'src/util';
import { verifyPassword } from 'src/util';
import VerifyPassword from 'src/pages/workflow/components/ExecDialog/components/VerifyPassword';
import './index.less';
import 'src/pages/worksheet/common/newRecord/NewRecord.less';
import 'mobile/ProcessRecord/OtherAction/index.less';
import _ from 'lodash';

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
      previewRecord: {},
      batchApproval: false,
      approveCards: [],
      approveType: null,
      encryptType: null,
      showPassword: false
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
      ...(topTab ? topTab.param : bottomTab.param),
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
        this.setState({
          appCount: {
            approveCount: approve ? approve.count : 0,
            writeCount: write ? write.count : 0,
          },
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
  handleScrollEnd = tab => {
    this.getTodoList();
  };
  handleApproveDone = ({ id }) => {
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
        list: list.filter(item => item.id !== id),
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
        list: list.filter(item => item.id !== id),
        countData: countDataState,
      });
    }
  };
  hanndleApprove = (type, batchType) => {
    const { approveCards, showPassword } = this.state;
    const signatureCard = approveCards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = approveCards.filter(card => _.get(card.flowNode, 'encrypt'));
    if (_.isEmpty(approveCards)) {
      Toast.info(_l('请先勾选需要处理的审批'), 2);
    }
    if (signatureCard.length || (encryptCard.length && showPassword)) {
      if (signatureCard.length) {
        this.setState({ approveType: type });
      }
      if (encryptCard.length && showPassword) {
        this.setState({ encryptType: type });
      }
    } else {
      this.handleBatchApprove(null, type);
    }
  };
  handleBatchApprove = (signature, approveType) => {
    const batchType = approveType === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const { approveCards } = this.state;
    const selects = approveCards.map(({ id, workId, flowNode }) => {
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
          Toast.info(_l('操作成功'), 2);
          this.setState({ batchApproval: false, approveCards: [] });
          this.getTodoList();
          this.getTodoCount();
        }
      });
  };
  renderSignatureDialog() {
    const { approveCards, approveType, encryptType, showPassword } = this.state;
    const batchType = approveType === 4 ? 'auth.passTypeList' : 'auth.overruleTypeList';
    const signatureApproveCards = approveCards.filter(card => (_.get(card.flowNode, batchType) || []).includes(1));
    const encryptCard = approveCards.filter(card => _.get(card.flowNode, 'encrypt'));
    return (
      <Modal
        popup
        visible={true}
        onClose={() => {
          this.setState({ approveType: null, encryptType: null });
        }}
        animationType="slide-up"
      >
        <div className={cx('otherActionWrapper flexColumn')}>
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
                <VerifyPassword
                  onChange={({ password, isNoneVerification }) => {
                    if (password !== undefined) this.password = password;
                    if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
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
                  if (this.isNoneVerification) {
                    this.setState({ showPassword: false });
                  }
                };
                if (encryptCard.length) {
                  verifyPassword({
                    password: this.password,
                    closeImageValidation: true,
                    isNoneVerification: this.isNoneVerification,
                    checkNeedAuth: !showPassword,
                    success: submitFun,
                    fail: () => {
                      this.setState({ showPassword: true });
                    }
                  });
                } else {
                  submitFun();
                }
              }}
            >
              {_l('通过')}
            </div>
          </div>
        </div>
      </Modal>
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
    const { searchValue } = this.state;
    return (
      <div className="searchWrapper valignWrapper">
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
        {searchValue ? (
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
        ) : null}
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
    const { stateTab, batchApproval, list, loading, pageIndex, filter, bottomTab, topTab, approveCards } = this.state;
    return (
      <ScrollView className="flex" onScrollEnd={this.handleScrollEnd}>
        {list.map(item => (
          <div className="pLeft10 pRight10" key={item.id}>
            <Card
              item={item}
              type={filter ? filter.type : null}
              time={createTimeSpan(item.workItem.receiveTime)}
              currentTab={topTab ? topTab.id : bottomTab.id}
              approveChecked={!_.isEmpty(_.find(approveCards, { id: item.id }))}
              batchApproval={batchApproval}
              renderBodyTitle={() => {
                return item.entityName ? `${item.entityName}: ${item.title}` : item.title;
              }}
              onClick={() => {
                this.setState({
                  previewRecord: { instanceId: item.id, workId: item.workId },
                });
                // console.log(`/mobile/processRecord/${item.id}/${item.workId}`);
              }}
              onApproveDone={this.handleApproveDone}
              onChangeApproveCards={e => {
                const { checked } = e.target;
                if (checked) {
                  this.setState({
                    approveCards: approveCards.concat(item),
                  });
                } else {
                  this.setState({
                    approveCards: approveCards.filter(n => n.id !== item.id),
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
    } = this.state;
    const currentTabs = bottomTab.tabs;
    const allowApproveList = list.filter(c => _.get(c, 'flowNode.batch'));
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
                <span>
                  {tab.name} {this.renderCount(tab)}
                </span>
              )}
            />
            {batchApproval && (
              <div className="batchApprovalHeader valignWrapper Font16">
                <div className="bold">
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
            <div className="batchApprovalFooter">
              <div className="valignWrapper">
                <Checkbox
                  checked={allowApproveList.length && allowApproveList.length === approveCards.length}
                  onChange={e => {
                    const { checked } = e.target;
                    if (checked) {
                      if (allowApproveList.length) {
                        Toast.info(_l('全选%0条可批量审批的记录', allowApproveList.length), 2);
                        this.setState({ approveCards: allowApproveList });
                      } else {
                        Toast.info(_l('没有允许批量审批的记录，请打开记录逐条审批'), 2);
                      }
                    } else {
                      this.setState({ approveCards: [] });
                    }
                  }}
                />
                <div className="mLeft5">
                  {_l('全选')}
                  {approveCards.length
                    ? _l('（已选择%0/%1条）', approveCards.length, list.length)
                    : list.length !== countData.waitingApproval && _l('（已加载%0条）', list.length)}
                </div>
              </div>
              <div className="valignWrapper">
                <div
                  className="pass mRight30"
                  onClick={() => {
                    this.hanndleApprove(4, 'auth.passTypeList');
                  }}
                >
                  {_l('通过')}
                </div>
                <div
                  className="overrule"
                  onClick={() => {
                    this.hanndleApprove(5, 'auth.overruleTypeList');
                  }}
                >
                  {_l('否决')}
                </div>
              </div>
            </div>
          )}
          {this.renderInput()}
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
              )}
            />
          </div>
        </div>
        {!batchApproval && (
          <Back
            onClick={() => {
              history.back();
            }}
          />
        )}
        {topTab && (topTab.id === 'waitingApproval' || topTab.id === 'waitingWrite') && (
          <ProcessDelegation topTab={topTab} className={cx({ bottom60: !list.length })} />
        )}
        {topTab && topTab.id === 'waitingApproval' && !batchApproval && !!list.length && (
          <Flex
            justify="center"
            align="center"
            className="card processBatchOperation"
            onClick={() => {
              this.setState({ batchApproval: true });
            }}
          >
            <Icon className="Font20 Gray_9e" icon="task-complete" />
          </Flex>
        )}
        <ProcessRecordInfo
          isModal
          className="full"
          visible={!_.isEmpty(previewRecord)}
          instanceId={previewRecord.instanceId}
          workId={previewRecord.workId}
          onClose={data => {
            if (data.id && !data.isStash) {
              this.handleApproveDone(data);
            }
            this.setState({
              previewRecord: {},
            });
          }}
        />
        {(approveType || encryptType) && this.renderSignatureDialog()}
      </div>
    );
  }
}
