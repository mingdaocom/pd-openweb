import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import TransferController from 'src/api/transfer';
import { LoadDiv, Checkbox, Button } from 'ming-ui';
import UserHead from 'src/components/userHead';
import Empty from '../../../../common/TableEmpty';
import { htmlEncodeReg } from 'src/util';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import PaginationWrap from '../../../../components/PaginationWrap';
import _ from 'lodash';
import UserCard from 'src/components/UserCard';
import Trigger from 'rc-trigger';

const TYPES = {
  OA: 'OA',
  WORKSHEET_ALL: 'WORKSHEET_ALL',

  TASK_PROJECT: 1,
  TASK: 2,
  GROUP: 3,
  KC: 4,
};

const WORKSHEET_TYPES = {
  WORKSHEET: 5,
  WORKSHEET_ROW: 6,
};

const typeNames = {
  [TYPES.TASK_PROJECT]: _l('项目'),
  [TYPES.TASK]: _l('任务'),
  [TYPES.GROUP]: _l('群组'),
  [TYPES.KC]: _l('共享文件夹'),
  [TYPES.OA]: _l('协作套件') + '-' + _l('审批'),
  [TYPES.WORKSHEET_ALL]: _l('工作表'),
};

const oaTypeNames = {
  1: _l('申请记录'),
  2: _l('审批流程'),
  3: _l('审批角色'),
};

const worksheetTypeNames = {
  [WORKSHEET_TYPES.WORKSHEET]: _l('工作表'),
  [WORKSHEET_TYPES.WORKSHEET_ROW]: _l('工作表记录'),
};

const OA_COMPLETE_TYPES = {
  ALL: -1,
  UNDONE: 0,
  DONE: 1,
};

const defaultOaState = {
  currentOACompleteType: OA_COMPLETE_TYPES.ALL,
  currentOAType: 1,
};

const defaultWorksheetState = {
  currentWorksheetType: 5,
};

export const callDialogSelectUser = function (projectId) {
  var dfd = $.Deferred();
  dialogSelectUser({
    fromAdmin: true,
    SelectUserSettings: {
      projectId: projectId,
      filterAll: true,
      filterFriend: true,
      filterOtherProject: true,
      filterOthers: true,
      unique: true,
      callback: function (users) {
        dfd.resolve(users);
      },
    },
  });
  return dfd.promise();
};

export default class Detail extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      avatar: PropTypes.string,
      accountId: PropTypes.string,
    }).isRequired,
    returnCallback: PropTypes.func.isRequired,
  };

  constructor() {
    super();

    this.state = {
      list: null,
      isLoading: false,
      allCount: null,
      pageIndex: 1,
      pageSize: 20,

      selectItems: {},

      currentType: TYPES.GROUP,

      ...defaultOaState,
      ...defaultWorksheetState,
      showMenuList: false,
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  _getTypeName() {
    const { currentType, currentOAType, currentWorksheetType } = this.state;
    if (currentType === TYPES.WORKSHEET_ALL) {
      return worksheetTypeNames[currentWorksheetType];
    } else if (currentType === TYPES.OA) {
      return oaTypeNames[currentOAType];
    }
    return typeNames[currentType];
  }

  _getReqParamType(isByType = false) {
    const { currentType, currentWorksheetType } = this.state;
    if (currentType === TYPES.WORKSHEET_ALL) {
      return isByType ? WORKSHEET_TYPES.WORKSHEET : currentWorksheetType;
    }
    return currentType;
  }
  /**
   * 按 类型 一键交接，群组，项目，任务，审批
   */
  transferByType() {
    const { allCount, currentType } = this.state;
    const {
      projectId,
      user: { accountId },
    } = this.props;
    if (!allCount) {
      alert(_l('没有要交接的%0', this._getTypeName()), 3);
      return;
    }

    return callDialogSelectUser(projectId)
      .then(users => {
        if (currentType !== TYPES.OA) {
          return TransferController.transferByType({
            transferRecordType: this._getReqParamType(true),
            oldAccountId: accountId,
            toAccountId: users[0].accountId,
            projectId,
          });
        } else {
          return TransferController.oATransferAllToAccountId({
            accountId: accountId,
            transferAccountId: users[0].accountId,
            sourceType: 0, // 全部
            completeType: -1, // 全部
            projectId,
          });
        }
      })
      .then(data => {
        if (data) {
          this.setState({
            list: [],
            allCount: 0,
          });
          alert(_l('交接成功'));
        } else {
          alert(_l('交接失败'), 2);
        }
      });
  }
  /**
   * 单条交接
   * @param {object} item
   */
  transfer(item) {
    const { projectId } = this.props;
    const { currentType, pageIndex } = this.state;
    callDialogSelectUser(projectId)
      .then(users => {
        // oa 交接
        if (currentType === TYPES.OA) {
          return TransferController.oATransferToAccountId({
            projectId,
            accountId: item.originalChargeUser ? item.originalChargeUser.accountId : item.accountId,
            transferAccountId: users[0].accountId,
            listTranser: JSON.stringify([_.pick(item, ['sourceType', 'sourceId', 'completeType'])]),
          });
        } else {
          return TransferController.transferOne({
            oldAccountId: item.originalChargeUser.accountId,
            toAccountId: users[0].accountId,
            projectId,
            transferRecordType: this._getReqParamType(),
            sourceId: item.sourceId,
          });
        }
      })
      .then(data => {
        if (data) {
          const _list = _.filter(this.state.list, ({ sourceId }) => item.sourceId !== sourceId);
          this.setState({
            list: _list,
            selectItems: {},
          });
          if (!_list.length) {
            this.setState({
              pageIndex: Math.max(1, pageIndex - 1),
            });
          }

          alert(_l('交接成功'));
        } else {
          alert(_l('交接失败'), 2);
        }
      });
  }

  /**
   * 批量选择交接
   */
  transferMultiple() {
    const { selectItems, currentType, pageIndex } = this.state;
    const {
      projectId,
      user: { accountId },
    } = this.props;
    if (!_.keys(selectItems).length) {
      // 交接多个
      return alert(_l('请选择要交接的条目'), 2);
    }
    callDialogSelectUser(projectId)
      .then(users => {
        if (currentType === TYPES.OA) {
          return TransferController.oATransferToAccountId({
            projectId,
            accountId,
            transferAccountId: users[0].accountId,
            listTranser: JSON.stringify(
              _.values(selectItems).map(item => _.pick(item, ['sourceType', 'sourceId', 'completeType'])),
            ),
          });
        } else {
          return TransferController.transferMany({
            projectId,
            sourceIds: _.keys(selectItems),
            transferRecordType: this._getReqParamType(),
            oldAccountId: accountId,
            toAccountId: users[0].accountId,
          });
        }
      })
      .then(data => {
        if (data) {
          alert(_l('交接成功'));
          this.setState(
            {
              pageIndex: 1,
              selectItems: {},
            },
            () => {
              // 第一页不会触发 reload
              if (pageIndex === 1) {
                this.fetchList();
              }
            },
          );
        } else {
          alert(_l('交接失败'), 2);
        }
      });
  }

  fetchList() {
    const { pageIndex, pageSize, currentType, currentOACompleteType, currentOAType } = this.state;
    const {
      user: { accountId },
      projectId,
    } = this.props;

    this.setState({
      isLoading: true,
    });

    if (this.ajax && this.ajax.state() === 'pending' && this.ajax.abort) {
      this.ajax.abort();
    }

    if (currentType === TYPES.OA) {
      this.ajax = TransferController.getOATransferRecordByType({
        projectId,
        oaTransferType: currentOAType,
        completedType: currentOACompleteType,
        originAccountId: accountId,
        pageIndex,
        pageSize,
      });
    } else {
      this.ajax = TransferController.getTransferRecordByType({
        projectId,
        transferRecordType: this._getReqParamType(),
        originAccountId: accountId,
        pageIndex,
        pageSize,
      });
    }

    this.ajax
      .then(({ allCount, list }) => {
        this.setState({
          allCount,
          list,
        });
      })
      .always(() => {
        this.setState({
          isLoading: false,
        });
      });
  }

  renderUser() {
    const { user, projectId } = this.props;
    return (
      <React.Fragment>
        <UserHead
          className="mLeft10 mRight10 InlineBlock TxtMiddle"
          user={{ ...user, userHead: user.avatar }}
          size={30}
          projectId={projectId}
        />

        <span className="flexColumn TxtLeft pLeft5">
          <UserCard sourceId={user.accountId}>
            <a
              className="Bold overflow_ellipsis"
              href={`/user_${user.accountId}`}
              title={user.fullname}
              target="_blank"
            >
              {user.fullname}
              {user.isRelationShip ? <span className="boderRadAll_3 TxtCenter otherRelationShip">协</span> : null}
            </a>
          </UserCard>
          <span className="overflow_ellipsis Gray_bd wMax100" title={user.department}>
            {user.department}
          </span>
          <span className="overflow_ellipsis Gray_bd wMax100" title={user.job}>
            {user.job}
          </span>
        </span>
      </React.Fragment>
    );
  }

  renderTabs() {
    const { currentType, showMenuList } = this.state;
    const tabs = [TYPES.GROUP, TYPES.TASK_PROJECT, TYPES.TASK, TYPES.KC];

    return (
      <div className="transferTabList mBottom10 clearfix">
        <ul className="clearfix tabList Left">
          {_.map(tabs, tab => {
            return (
              <li
                key={tab}
                className={classNames('listItem', { active: currentType === tab })}
                onClick={() => {
                  if (tab === currentType) return;
                  this.setState(
                    {
                      pageIndex: 1,
                      selectItems: {},
                      ...defaultOaState,
                      ...defaultWorksheetState,
                      currentType: tab,
                      allCount: 0,
                      list: [],
                    },
                    this.fetchList,
                  );
                }}
              >
                {typeNames[tab]}
              </li>
            );
          })}
          <Trigger
            action={['click']}
            popupVisible={showMenuList}
            onPopupVisibleChange={visible => this.setState({ showMenuList: visible })}
            popupAlign={{ points: ['tl', 'bl'], offset: [0, -30] }}
            popup={this.renderOATabs}
          >
            <li
              className={classNames('listItem Relative', { active: currentType === TYPES.OA })}
              onClick={() => {
                if (currentType === TYPES.OA) return;
                this.setState(
                  {
                    pageIndex: 1,
                    selectItems: {},
                    ...defaultWorksheetState,
                    currentType: TYPES.OA,
                    showMenuList: !this.state.showMenuList,
                    allCount: 0,
                    list: [],
                  },
                  this.fetchList,
                );
              }}
            >
              <span>
                {typeNames[TYPES.OA]}
                <i className="icon-arrow-down-border Font10"></i>
              </span>
            </li>
          </Trigger>
        </ul>
        <span
          className="Right  ThemeColor3 Font13 Hand adminHoverColor"
          onClick={() => {
            this.transferByType();
          }}
        >
          {_l('交接所有“%0”', typeNames[currentType])}
        </span>
      </div>
    );
  }

  renderOATabs = () => {
    const { currentType, currentOAType } = this.state;
    if (currentType !== TYPES.OA) return null;
    return (
      <div className="clearfix oaFilterList Font13">
        <div className="typeList">
          <span
            onClick={() => {
              this.setState({
                pageIndex: 1,
                currentOAType: 1,
                currentOACompleteType: OA_COMPLETE_TYPES.ALL,
                showMenuList: !this.state.showMenuList,
              });
            }}
          >
            {_l('表单')}
          </span>
          <span
            className={classNames('ThemeColor3', { active: currentOAType === 2 })}
            onClick={() => {
              this.setState({
                pageIndex: 1,
                currentOAType: 2,
                currentOACompleteType: OA_COMPLETE_TYPES.UNDONE,
                showMenuList: !this.state.showMenuList,
              });
            }}
          >
            {_l('流程')}
          </span>
          <span
            className={classNames('ThemeColor3', { active: currentOAType === 3 })}
            onClick={() => {
              this.setState({
                pageIndex: 1,
                currentOAType: 3,
                currentOACompleteType: OA_COMPLETE_TYPES.UNDONE,
                showMenuList: !this.state.showMenuList,
              });
            }}
          >
            {_l('角色')}
          </span>
        </div>
      </div>
    );
  };

  renderWorkSheetTabs() {
    const { currentType, currentWorksheetType } = this.state;
    if (currentType !== TYPES.WORKSHEET_ALL) return null;
    return (
      <div className="clearfix oaFilterList mBottom5 Font13">
        <div className="Left typeList">
          <span
            className={classNames('ThemeColor3', { active: currentWorksheetType === WORKSHEET_TYPES.WORKSHEET })}
            onClick={() => {
              this.setState({
                pageIndex: 1,
                selectItems: {},
                currentWorksheetType: WORKSHEET_TYPES.WORKSHEET,
              });
            }}
          >
            {_l('工作表')}
          </span>
          <span
            className={classNames('ThemeColor3', { active: currentWorksheetType === WORKSHEET_TYPES.WORKSHEET_ROW })}
            onClick={() => {
              this.setState({
                pageIndex: 1,
                selectItems: {},
                currentWorksheetType: WORKSHEET_TYPES.WORKSHEET_ROW,
              });
            }}
          >
            {_l('表记录')}
          </span>
        </div>
      </div>
    );
  }

  renderTable() {
    const { isLoading, list, currentType, selectItems } = this.state;
    if (isLoading || list === null) {
      return (
        <tr className="TxtCenter">
          <td colSpan="5" className="pTop100 Gray_bd">
            <LoadDiv />
          </td>
        </tr>
      );
    }
    if (!isLoading && !list.length) {
      const detail = {
        icon: 'icon-sp_assignment_turned_in_white',
        desc: _l('无数据'),
      };
      return (
        <tr>
          <Empty detail={detail} />
        </tr>
      );
    }

    return (
      <React.Fragment>
        {_.map(list, item => {
          return (
            <tr key={item.sourceId}>
              <td width="10%">
                <Checkbox
                  checked={!!(selectItems && selectItems[item.sourceId])}
                  onClick={checked => {
                    this.setState(prevState => {
                      if (checked) {
                        const { [item.sourceId]: noop, ...others } = prevState.selectItems;
                        return {
                          selectItems: others,
                        };
                      } else {
                        return { selectItems: { ...prevState.selectItems, [item.sourceId]: item } };
                      }
                    });
                  }}
                />
              </td>
              <td width="25%" className="sourceName overflow_ellipsis">
                {(() => {
                  const name = htmlEncodeReg(item.sourceName);
                  if (currentType === TYPES.OA) {
                    return <span className="pLeft16">{name}</span>;
                  } else {
                    let linkUrl;
                    if (currentType === TYPES.TASK_PROJECT) {
                      linkUrl = '/apps/task/folder_' + item.sourceId + '#detail';
                    } else if (currentType === TYPES.TASK) {
                      linkUrl = '/apps/task/task_' + item.sourceId;
                    } else if (currentType === TYPES.GROUP) {
                      linkUrl = '/group/groupValidate?gID=' + item.sourceId;
                    } else if (currentType === TYPES.KC) {
                      linkUrl = '/apps/kc/' + item.sourceId;
                    } else if (currentType === TYPES.WORKSHEET_ALL) {
                      linkUrl = '/worksheet/' + item.sourceId;
                    }
                    if (linkUrl) {
                      return (
                        <a className="TxtMiddle" href={linkUrl} target="_blank">
                          {name}
                        </a>
                      );
                    } else {
                      return <span className="TxtMiddle">{name}</span>;
                    }
                  }
                })()}
              </td>
              <td width="20%">
                <span>{_l('未交接')}</span>
              </td>
              <td width="20%">
                <span
                  className="Hand ThemeColor3 TxtMiddle adminHoverColor"
                  onClick={() => {
                    this.transfer(item);
                  }}
                >
                  {_l('更改负责人')}
                </span>
              </td>
              <td width="25%"></td>
            </tr>
          );
        })}
      </React.Fragment>
    );
  }

  renderList() {
    const { currentType, currentWorksheetType, currentOAType, selectItems, list } = this.state;
    const { isLoading, allCount, pageIndex, pageSize } = this.state;

    const name = (() => {
      if (currentType === TYPES.OA) {
        if (currentOAType === 1) return _l('表单名称');
        if (currentOAType === 2) return _l('流程名称');
        if (currentOAType === 3) return _l('角色名称');
      } else if (currentType === TYPES.WORKSHEET_ALL) {
        if (currentWorksheetType === WORKSHEET_TYPES.WORKSHEET) return _l('工作表名称');
        if (currentWorksheetType === WORKSHEET_TYPES.WORKSHEET_ROW) return _l('工作表记录名称');
      } else {
        if (currentType === TYPES.TASK_PROJECT) return _l('项目名称');
        if (currentType === TYPES.TASK) return _l('任务名称');
        if (currentType === TYPES.GROUP) return _l('群组名称');
        if (currentType === TYPES.KC) return _l('共享文件夹名称');
      }
    })();

    const isAllChecked = !!(_.isArray(list) && list.length && _.every(list, item => !!selectItems[item.sourceId]));

    return (
      <React.Fragment>
        <table className="w100 Relative" cellSpacing="0">
          <thead>
            <tr>
              <th width="10%">
                <Checkbox
                  checked={isAllChecked}
                  onClick={checked => {
                    _.isArray(list) &&
                      _.each(list, item => {
                        this.setState(prevState => {
                          if (checked) {
                            const { [item.sourceId]: noop, ...others } = prevState.selectItems;
                            return {
                              selectItems: others,
                            };
                          } else {
                            return { selectItems: { ...prevState.selectItems, [item.sourceId]: item } };
                          }
                        });
                      });
                  }}
                />
              </th>
              <th width="25%" className="TxtLeft">
                {_.keys(selectItems).length
                  ? _l('已选择%0个%1', _.keys(selectItems).length, this._getTypeName())
                  : name}
              </th>
              <th width="20%">{_l('状态')}</th>
              <th width="20%">
                {_.keys(selectItems).length ? (
                  <span
                    className="TxtMiddle Hand ThemeHoverColor2 ThemeColor3 adminHoverColor"
                    onClick={() => {
                      this.transferMultiple();
                    }}
                  >
                    {_l('批量更改负责人')}
                  </span>
                ) : (
                  _l('操作')
                )}
              </th>
              <th width="25%">{/* placeholder */}</th>
            </tr>
          </thead>
        </table>
        <div className="resignlistTable Relative">
          <table className="w100">
            <tbody>{this.renderTable()}</tbody>
          </table>
        </div>
        {!isLoading && allCount && allCount > 10 ? (
          <PaginationWrap
            total={allCount}
            pageSize={pageSize}
            pageIndex={pageIndex}
            onChange={pageIndex => this.setState({ pageIndex }, this.fetchList)}
          />
        ) : null}
      </React.Fragment>
    );
  }

  render() {
    const { returnCallback, projectId } = this.props;
    return (
      <div className="transferDetail">
        <div className="flexRow pBottom25 detailHeader">
          <span className="mRight5 color_b Font13">{_l('原负责人')}</span>
          <div className="flexRow originalCharger">{this.renderUser()}</div>
          <div>
            <Button
              className="postBtn"
              size="medium"
              onClick={() => {
                callDialogSelectUser(projectId).then(([user]) => {
                  return TransferController.transferAllOneClick({
                    oldAccountId: this.props.user.accountId,
                    toAccountId: user.accountId,
                    projectId,
                  })
                    .then(data => {
                      if (data) {
                        alert(_l('操作成功'));
                        // 返回列表并重新加载
                        returnCallback(true);
                      } else {
                        return $.Deferred().reject().promise();
                      }
                    })
                    .fail(() => {
                      alert(_l('操作失败'), 2);
                    });
                });
              }}
            >
              {_l('一键交接协作')}
            </Button>
          </div>
        </div>
        {this.renderTabs()}
        {/* {this.renderOATabs()} */}
        {this.renderWorkSheetTabs()}

        {this.renderList()}
      </div>
    );
  }
}
