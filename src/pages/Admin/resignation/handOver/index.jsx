import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import transferController from 'src/api/transfer';

import LoadDiv from 'ming-ui/components/LoadDiv';
import UserHead from 'src/pages/feed/components/userHead';
import MdBusinessCard from 'src/components/mdBusinessCard/reactMdBusinessCard';

import Empty from '../../common/TableEmpty';
import PaginationWrap from '../../components/PaginationWrap';
import './style.less';

import { default as Detail, callDialogSelectUser } from './detail';
import _ from 'lodash';

export default class HandOver extends React.Component {
  static propTypes = {
    keywords: PropTypes.string,
    projectId: PropTypes.string.isRequired,
    setLevel: PropTypes.func.isRequired,
    level: PropTypes.string.isRequired
  };

  static defaultProps = {
    keywords: '',
  };

  constructor(props) {
    super();

    this.state = {
      pageIndex: 1,
      isLoading: false,
      list: null,
      allCount: null,

      selectAccount: null,
      ajaxMap: {},
    };
  }

  componentDidMount() {
    this.fetchList();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.keywords !== this.props.keywords || nextProps.level !== this.props.level) {
      this.setState(
        {
          pageIndex: 1,
        },
        this.fetchList.bind(this)
      );
    }
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.ajax && this.ajax.state() === 'pending' && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetchList() {
    const { projectId, keywords } = this.props;
    const { pageIndex } = this.state;

    this.abortRequest();

    this.setState({
      isLoading: true,
    });

    this.ajax = transferController.getTransferRecordByProject({
      pageIndex,
      projectId,
      keywords,
      pageSize: 20,
    });

    return this.ajax.then(
      ({ list, allCount }) => {
        this.setState({
          list,
          allCount,
          isLoading: false,
        });
      },
      () => {
        this.setState({
          isLoading: false,
        });
      }
    );
  }

  transferAll(accountId) {
    if (this.state.ajaxMap[accountId]) return false;
    const { projectId } = this.props;

    callDialogSelectUser(projectId)
      .then(([user]) => {
        var ajax = transferController.transferAllOneClick({
          oldAccountId: accountId,
          toAccountId: user.accountId,
          projectId,
        });

        this.setState(({ ajaxMap }) => ({
          ajaxMap: {
            ...ajaxMap,
            [accountId]: ajax,
          },
        }));

        return ajax;
      })
      .then(data => {
        if (data) {
          const _list = _.filter(this.state.list, item => item.originalChargeUser.accountId !== accountId);
          this.setState(
            {
              list: _list,
            },
            () => {
              let { pageIndex, list } = this.state;
              if (!list.length) {
                this.setState(
                  {
                    pageIndex: Math.max(--pageIndex, 1),
                  },
                  this.fetchList
                );
              }
            }
          );
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .always(() => {
        this.setState(({ ajaxMap }) => {
          const { [accountId]: noop, ...others } = ajaxMap;
          return {
            ajaxMap: others,
          };
        });
      });
  }

  renderUser(user) {
    return (
      <React.Fragment>
        <UserHead className="mLeft10 mRight10 InlineBlock TxtMiddle" user={{ ...user, userHead: user.avatar }} size={30} lazy={'false'} />

        {user.accountId ? (
          <span className="flexColumn TxtLeft personBox">
            <MdBusinessCard sourceId={user.accountId}>
              <a className="Bold overflow_ellipsis" href={`/user_${user.accountId}`} title={user.fullname}>
                {user.fullname}
                {/* {user.isRelationShip ? <span className="boderRadAll_3 TxtCenter otherRelationShip">协</span> : null} */}
              </a>
            </MdBusinessCard>
            <span className="overflow_ellipsis Gray_bd wMax100" title={user.department}>
              {user.department}
            </span>
            <span className="overflow_ellipsis Gray_bd wMax100" title={user.job}>
              {user.job}
            </span>
          </span>
        ) : null}
      </React.Fragment>
    );
  }

  renderList() {
    const { isLoading, list, ajaxMap } = this.state;
    if (isLoading) {
      return (
        <tr>
          <td colSpan="5">
            <LoadDiv className="mTop10" />
          </td>
        </tr>
      );
    }
    if (!list || !(list && list.length)) {
      const detail = {
        icon: 'icon-sp_assignment_turned_in_white',
        desc: _l('无数据')
      }
      return (
        <Empty detail={detail}/>
      );
    }
    return (
      <React.Fragment>
        {_.map(list, (item, index) => (
          <tr className={classNames({ deepBg: index % 2 === 0 })} key={item.originalChargeUser.accountId}>
            <td className="pAll10 pLeft5 TxtMiddle tablePerson overflow_ellipsis">{this.renderUser(item.currentChargeUser)}</td>
            <td className="pLeft5 tableOrigin">
              <div className="flexRow originalCharger">{this.renderUser(item.originalChargeUser)}</div>
            </td>
            <td className="tableWork">
              <span className="overflow_ellipsis TxtMiddle Gray Font14">{item.createTime}</span>
            </td>
            <td className="tableDays overflowHidden">
              <span className="ellipsis TxtMiddle color_b Font13 InlineBlock w100">
                {item.createUser && item.createUser.fullname}
              </span>
            </td>
            {ajaxMap[item.originalChargeUser.accountId] ? (
              <td className="tableOptions">
                {_l('交接中')}
                <span className="dot" />
              </td>
            ) : (
              <td className="tableOptions">
                <span
                  className="ThemeColor3 Hand adminHoverColor"
                  onClick={() => {
                    this.transferAll(item.originalChargeUser.accountId, index);
                  }}
                >
                  {_l('一键交接')}
                </span>
                <span
                  className="ThemeColor3 Hand mLeft15 adminHoverColor"
                  onClick={() => {
                    this.props.setLevel('detail')
                    this.setState({
                      selectAccount: item.originalChargeUser,
                    });
                  }}
                >
                  {_l('查看详情')}
                </span>
              </td>
            )}
          </tr>
        ))}
      </React.Fragment>
    );
  }

  renderContent() {
    const { allCount, isLoading, pageIndex } = this.state;

    return (
      <div className="transferList Relative">
        <table className="w100" cellSpacing="0">
          <thead>
            <tr>
              <th className="tablePerson">{_l('当前负责人')}</th>
              <th className="tableOrigin">{_l('原负责人')}</th>
              <th className="tableWork">{_l('离职处理时间')}</th>
              <th className="tableDays">{_l('操作者')}</th>
              <th className="tableOptions">{_l('操作')}</th>
            </tr>
          </thead>
        </table>
        <div className="resignlistTable Relative">
          <table className="w100">
            <tbody>{this.renderList()}</tbody>
          </table>
        </div>
        {!isLoading && allCount && allCount > 20 ? (
          <PaginationWrap
            total={allCount}
            pageIndex={pageIndex}
            pageSize={20}
            onChange={pageIndex => {
              this.setState({ pageIndex }, () => {
                this.fetchList();
              });
            }}
          />
        ) : null}
      </div>
    );
  }

  renderDetail() {
    const { projectId } = this.props;
    return (
      <Detail
        projectId={projectId}
        user={this.state.selectAccount}
        returnCallback={isReload => {
          this.setState({ selectAccount: null });
          if (isReload) this.fetchList();
        }}
      />
    );
  }

  render() {
    const { selectAccount } = this.state;
    return (
      <div className="pTop20 mLeft24 mRight24 resignList">{selectAccount && this.props.level === 'detail' ? this.renderDetail() : this.renderContent()}</div>
    );
  }
}
