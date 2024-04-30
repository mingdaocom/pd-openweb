import React, { Component } from 'react';
import { LoadDiv, ScrollView, Icon } from 'ming-ui';
import _ from 'lodash';
import ProjectController from 'src/api/project';
import InvitationController from 'src/api/invitation';
import ClipboardButton from 'react-clipboard.js';
import { existAccountHint } from 'src/util';
import moment from 'moment';

const Tips = {
  1: _l('暂无使用中的邀请链接'),
  2: _l('暂无邀请记录'),
};

export default class DetailList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageIndex: 1,
      pageSize: 10,
      allCount: 0,
      isMore: true,
      loading: true,
      subLoading: false,
    };
  }

  componentDidMount() {
    this.searchDataList();
  }

  getInviteList = () => {
    const { pageIndex, pageSize, loading, isMore, list } = this.state;
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    if (this.postList) {
      this.postList.abort();
    }

    this.setState({ loading: true });

    this.postList = ProjectController.getInvitedUsersJoinProjectLog({
      projectId: this.props.projectId,
      pageIndex: pageIndex,
      pageSize: pageSize,
    });

    this.postList
      .then((data = {}) => {
        this.setState({
          list: list.concat(data.listDetail),
          isMore: (data.listDetail || []).length < data.allCount,
          allCount: data.allCount,
          pageIndex: pageIndex + 1,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  getLinkList = () => {
    if (!this.state.isMore) return;

    InvitationController.getAllValidTokenByAccountId({
      sourceId: this.props.projectId,
    }).then(data => {
      this.setState({ list: data, loading: false, isMore: false });
    });
  };

  searchDataList = () => {
    if (this.props.detailMode === 1) {
      this.getLinkList();
    } else {
      this.getInviteList();
    }
  };

  handleCopyTextSuccess = () => {
    alert(_l('复制成功'));
  };

  handleRemove = item => {
    if (!item.token || this.state.subLoading) return;

    this.setState({ subLoading: true });

    InvitationController.updateAuthToExpire({
      token: item.token,
    })
      .then(data => {
        if (data) {
          this.setState({ list: this.state.list.filter(i => i.token !== item.token) });
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .finally(() => {
        this.setState({ subLoading: false });
      });
  };

  renderLinkList = (item = {}) => {
    const date = moment(item.deadTime);
    return (
      <div className="linkListItem">
        <div className="ellipsis Font14 Bold">
          {_l(
            '%0创建了邀请链接%1',
            _.get(item.createAccount, 'fullname'),
            item.linkFromType === 4 ? _l('(二维码)') : '',
          )}
        </div>
        <div className="flexRow flexCenter mTop10 mBottom10">
          <div className="linkInput Font12">
            <ClipboardButton
              className="ellipsis"
              component="div"
              data-clipboard-text={item.inviteUrl}
              onSuccess={this.handleCopyTextSuccess}
            >
              {item.inviteUrl}
            </ClipboardButton>
          </div>
          <div className="trashBox">
            <Icon className="Font14" icon="trash" onClick={() => this.handleRemove(item)} />
          </div>
        </div>
        <div className="flexRow Font12">
          <span className="Gray_9e">{_l('链接截止时间：')}</span>
          <span>{date.format('YYYY') === '9999' ? _l('永久有效') : date.format('YYYY年MM月DD日 HH:mm')}</span>
        </div>
      </div>
    );
  };

  reInvite = accountId => {
    if (!accountId || this.state.subLoading) return;

    this.setState({ subLoading: true });

    InvitationController.inviteUser({
      accountIds: [accountId],
      sourceId: this.props.projectId,
      fromType: this.props.fromType,
    })
      .then(result => {
        existAccountHint(result);
      })
      .finally(() => {
        this.setState({ subLoading: false });
      });
  };

  renderInviteList = item => {
    return (
      <div className="inviteListItem">
        <span className="ellipsis flex Font14 Bold">{item.fullName}</span>
        {item.isMember ? (
          <span className="Hand Green">{_l('已加入')}</span>
        ) : (
          <span className="Hand ThemeColor3" onClick={() => this.reInvite(item.accountId)}>
            {_l('再次发送')}
          </span>
        )}
      </div>
    );
  };

  render() {
    const { list = [], loading } = this.state;
    const { detailMode } = this.props;

    if (!loading && _.isEmpty(list)) {
      return <div className="addFriendsContent flexRow alignItemsCenter justifyContentCenter">{Tips[this.props.detailMode]}</div>;
    }

    return (
      <div className="addFriendsContent pTop0">
        <ScrollView className="flex ViewDeatil" onScrollEnd={this.searchDataList}>
          {list.map(item => (detailMode === 1 ? this.renderLinkList(item) : this.renderInviteList(item)))}
          {loading && (
            <div className="flexRow alignItemsCenter justifyContentCenter">
              <LoadDiv />
            </div>
          )}
        </ScrollView>
      </div>
    );
  }
}
