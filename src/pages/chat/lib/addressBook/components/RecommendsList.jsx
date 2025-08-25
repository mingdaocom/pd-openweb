import React from 'react';
import _ from 'lodash';
import Button from 'ming-ui/components/Button';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { addFriendConfirm } from 'ming-ui/functions';
import API, { editIgnoreRecommends } from '../api';

export default class RecommendsList extends React.Component {
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

  componentDidMount() {
    this.fetch();
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

  updateListData(accountId, isAdd) {
    const { listData } = this.state;
    this.setState({
      listData: _.map(listData, item => {
        if (item.accountId === accountId) {
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
    addFriendConfirm({
      accountId,
    });
  }

  ignore(accountId) {
    return editIgnoreRecommends(accountId).then(data => {
      if (data) {
        this.updateListData(accountId, false);
      } else {
        alert(_l('操作失败，请重新尝试'), 2);
      }
    });
  }

  fetch() {
    const { isLoading, hasMore } = this.state;
    if (isLoading || !hasMore) return;
    this.setState({
      isLoading: true,
    });
    API.fetchRecommends({
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

  render() {
    const { listData, isLoading, pageIndex, hasMore } = this.state;
    if (!isLoading && (listData === null || !listData.length)) return null;
    if (isLoading && pageIndex === 1) return null;
    return (
      <React.Fragment>
        <div className="list-header mBottom10 Font15">{_l('推荐好友')}</div>
        <table className="list-content Font12">
          <thead className="LineHeight30 Gray_6 TxtLeft">
            <tr>
              <th>{_l('联系人')}</th>
              <th>{_l('手机联系人')}</th>
              <th width="186px">{_l('组织')}</th>
              <th width="30%" className="TxtCenter">
                {_l('操作')}
              </th>
            </tr>
          </thead>
          <tbody className="Gray_6">
            {listData.length &&
              listData.map(item => {
                return (
                  <tr key={item.accountId}>
                    <td className="userItem pRight24">
                      <a href={'/user_' + item.accountId} className="Hand NoUnderline" target="_blank">
                        <img className="circle avatar" src={item.avatar} />
                      </a>
                      <a
                        href={'/user_' + item.accountId}
                        className="Bold Hand overflow_ellipsis Gray mLeft8"
                        title={item.fullname}
                      >
                        {item.fullname || ''}
                      </a>
                    </td>
                    <td className="pRight24">
                      <div className="overflow_ellipsis TxtMiddle">{item.mobileName}</div>
                    </td>
                    <td>
                      <div className="overflow_ellipsis TxtMiddle wMax100">{item.companyName || ''}</div>
                    </td>
                    {item.added === undefined ? (
                      <td className="TxtCenter">
                        <Button type="primary" size="small" onClick={() => this.add(item.accountId)}>
                          {_l('添加')}
                        </Button>
                        <Button type="link" size="small" action={() => this.ignore(item.accountId)}>
                          {_l('忽略')}
                        </Button>
                      </td>
                    ) : (
                      <td className="TxtCenter">
                        <span className="Gray_6">{item.added ? _l('已添加') : _l('忽略')}</span>
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
