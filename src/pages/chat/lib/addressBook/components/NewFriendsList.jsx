import React from 'react';
import _ from 'lodash';
import Button from 'ming-ui/components/Button';
import LoadDiv from 'ming-ui/components/LoadDiv';
import API, { editAgreeFriend, editRefuseFriend } from '../api';

export default class NewFriendsList extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      pageIndex: 1,
      hasMore: true,
      listData: null,
    };

    this.fetch = this.fetch.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isLoaded !== this.props.isLoaded && nextProps.isLoaded === false) {
      this.setState(
        {
          isLoading: false,
          pageIndex: 1,
          hasMore: true,
          listData: null,
        },
        this.fetch,
      );
    }
  }

  componentDidMount() {
    this.fetch();
  }

  fetch() {
    const { isLoading, hasMore } = this.state;
    if (isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    API.fetchNewFriends({
      pageIndex: this.state.pageIndex,
      pageSize: 10,
    }).then(({ allCount, list }) => {
      const { listData, pageIndex } = this.state;
      if (allCount !== 0) {
        this.setState({
          hasMore: list && list.length >= 10,
          pageIndex: pageIndex + 1,
          listData: (listData || []).concat(list),
        });
      }
      this.setState({
        isLoading: false,
      });
      // 最后去update父组件状态，不然会直接触发render
      this.props.update(allCount !== 0);
    });
  }

  updateListData(accountId, isAdd) {
    const { listData } = this.state;
    this.setState({
      listData: _.map(listData, item => {
        if (item.createAccount.accountId === accountId) {
          return {
            ...item,
            added: isAdd,
          };
        } else {
          return item;
        }
      }),
    });
  }

  add(accountId) {
    return editAgreeFriend(accountId).then(data => {
      if (data) {
        this.updateListData(accountId, true);
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  refuse(accountId) {
    return editRefuseFriend(accountId).then(data => {
      if (data) {
        this.updateListData(accountId, false);
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  render() {
    const { listData, isLoading, pageIndex, hasMore } = this.state;
    if (!isLoading && (listData === null || !listData.length)) return null;
    if (isLoading && pageIndex === 1) return null;
    return (
      <React.Fragment>
        <div className="list-header mBottom10">{_l('待验证的好友申请')}</div>
        <table className="list-content Font12">
          <thead className="LineHeight30 Gray_6 TxtLeft">
            <tr>
              <th>{_l('联系人')}</th>
              <th>{_l('备注')}</th>
              <th>{_l('组织')}</th>
              <th width="30%" className="TxtCenter">
                {_l('操作')}
              </th>
            </tr>
          </thead>
          <tbody className="Gray_6">
            {listData.length &&
              listData.map(item => {
                return (
                  <tr key={item.createAccount.accountId}>
                    <td className="pRight24 userItem">
                      <a
                        href={'/user_' + item.createAccount.accountId}
                        className="Hand NoUnderline TxtMiddle"
                        target="_blank"
                      >
                        <img className="circle avatar" src={item.createAccount.avatar} />
                      </a>
                      <a
                        href={'/user_' + item.createAccount.accountId}
                        className="Bold Hand overflow_ellipsis Gray mLeft8"
                        title={item.createAccount.fullname}
                      >
                        {item.createAccount.fullname || ''}
                      </a>
                    </td>
                    <td className="pRight24">
                      <div className="overflow_ellipsis TxtMiddle">{item.message || _l('无备注信息')}</div>
                    </td>
                    <td>
                      <div className="overflow_ellipsis TxtMiddle wMax100">{item.createAccount.companyName || ''}</div>
                    </td>
                    {item.added === undefined ? (
                      <td className="TxtCenter">
                        <Button type="primary" size="small" action={() => this.add(item.createAccount.accountId)}>
                          {_l('同意')}
                        </Button>
                        <Button type="link" size="small" action={() => this.refuse(item.createAccount.accountId)}>
                          {_l('拒绝')}
                        </Button>
                      </td>
                    ) : (
                      <td className="TxtCenter">
                        <span className="Gray_6">{item.added ? _l('已添加') : _l('已拒绝')}</span>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
        {hasMore && (
          <a className="mTop10" href="javascript: void 0;" onClick={this.fetch}>
            {_l('查看更多')}
          </a>
        )}
        {isLoading ? <LoadDiv /> : null}
      </React.Fragment>
    );
  }
}
