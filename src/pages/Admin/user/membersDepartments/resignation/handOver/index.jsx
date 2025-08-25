import React, { Fragment } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Dialog, LoadDiv, UserCard, UserHead } from 'ming-ui';
import transferController from 'src/api/transfer';
import Empty from '../../../../common/TableEmpty';
import PaginationWrap from '../../../../components/PaginationWrap';
import SearchInput from '../SearchInput';
import Detail from './detail';
import './style.less';

export default class HandOver extends React.Component {
  static propTypes = {
    keywords: PropTypes.string,
    projectId: PropTypes.string.isRequired,
    setLevel: PropTypes.func.isRequired,
    level: PropTypes.string.isRequired,
  };

  static defaultProps = {
    keywords: '',
  };

  constructor(props) {
    super(props);

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
    if (nextProps.activeTab !== this.props.activeTab || nextProps.level !== this.props.level) {
      this.setState(
        {
          pageIndex: 1,
        },
        this.fetchList.bind(this),
      );
    }
  }

  componentWillUnmount() {
    this.abortRequest();
  }

  abortRequest() {
    if (this.ajax && this.ajax.abort) {
      this.ajax.abort();
    }
  }

  fetchList() {
    const { projectId } = this.props;
    const { pageIndex, keywords } = this.state;

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
      },
    );
  }

  renderUser(user) {
    return (
      <React.Fragment>
        <UserHead
          className="mRight10 InlineBlock TxtMiddle"
          user={{ ...user, userHead: user.avatar }}
          size={30}
          projectId={this.props.projectId}
        />

        {user.accountId ? (
          <span className="flexColumn TxtLeft personBox ellipsis pRight10">
            <UserCard sourceId={user.accountId}>
              <a className="Bold overflow_ellipsis" href={`/user_${user.accountId}`} title={user.fullname}>
                {user.fullname}
              </a>
            </UserCard>
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
        <div>
          <div colSpan="5">
            <LoadDiv className="mTop10" />
          </div>
        </div>
      );
    }
    if (!list || !(list && list.length)) {
      const detail = {
        icon: 'icon-verify',
        desc: _l('无数据'),
      };
      return <Empty detail={detail} />;
    }
    return (
      <React.Fragment>
        {_.map(list, (item, index) => (
          <div
            className={classNames('flexRow listItem', { deepBg: index % 2 === 0 })}
            key={item.originalChargeUser.accountId}
          >
            <div className="pLeft16 TxtMiddle tablePerson overflow_ellipsis">
              {this.renderUser(item.currentChargeUser)}
            </div>
            <div className="tableOrigin">
              <div className="flexRow originalCharger alignItemsCenter">{this.renderUser(item.originalChargeUser)}</div>
            </div>
            <div className="tableWork">
              <span className="overflow_ellipsis TxtMiddle Gray Font14">{item.createTime}</span>
            </div>
            <div className="tableDays overflowHidden">
              <span className="ellipsis TxtMiddle color_b Font13 InlineBlock w100">
                {item.createUser && item.createUser.fullname}
              </span>
            </div>
            {ajaxMap[item.originalChargeUser.accountId] ? (
              <div className="tableOptions">
                {_l('交接中')}
                <span className="dot" />
              </div>
            ) : (
              <div className="tableOptions">
                <span
                  className="ThemeColor3 Hand adminHoverColor"
                  onClick={() => {
                    this.setState({
                      selectAccount: item.originalChargeUser,
                    });
                  }}
                >
                  {_l('交接')}
                </span>
              </div>
            )}
          </div>
        ))}
      </React.Fragment>
    );
  }

  renderContent() {
    const { allCount, isLoading, pageIndex } = this.state;

    return (
      <div className="transferList flex">
        <div className="listHeader flexRow bold">
          <div className="tablePerson pLeft16">{_l('当前负责人')}</div>
          <div className="tableOrigin">{_l('原负责人')}</div>
          <div className="tableWork">{_l('离职处理时间')}</div>
          <div className="tableDays">{_l('操作者')}</div>
          <div className="tableOptions">{_l('操作')}</div>
        </div>

        <div className="resignlistTable flex">{this.renderList()}</div>
        {!isLoading && allCount && allCount > 20 ? (
          <PaginationWrap
            className="pagination"
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
    const { visible, onCancel = () => {} } = this.props;

    return (
      <Dialog title="" width={1000} className="handoverDialog" visible={visible} showFooter={false} onCancel={onCancel}>
        {selectAccount ? (
          <Fragment>
            <div className="flexRow">
              <div className="flex bold Font17">
                <i
                  className="icon icon-backspace mRight10 Hand"
                  onClick={() => this.setState({ selectAccount: null })}
                />
                {_l('交接协作相关数据:%0', (selectAccount || {}).fullname)}
              </div>
            </div>
            {this.renderDetail()}
          </Fragment>
        ) : (
          <Fragment>
            <div className="flexRow">
              <div className="flex bold Font17">{_l('交接协作相关数据')}</div>
              <SearchInput onSearch={val => this.setState({ keywords: val }, this.fetchList)} />
            </div>
            {this.renderContent()}
          </Fragment>
        )}
      </Dialog>
    );
  }
}
