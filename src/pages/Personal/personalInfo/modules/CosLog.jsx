import React from 'react';
import account from 'src/api/account';
import './index.less';

export default class CosLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      pageSize: 20,
      pageIndex: 1
    };
  }

  componentDidMount() {
    this.getList()
  }

  getList() {
    let isScroll = true
    if (!isScroll) {
      return;
    }
    account.getAccountCostLogList({
      pageIndex: this.state.pageIndex,
      pageSize: this.state.pageSize
    }).then(({ list = []}) => {
      isScroll = list.length < this.state.pageSize ? false : true
      this.setState({
        list: this.state.list.concat(list),
      });
    });
  }

  handleMoveFormBody(e) {
    const scrollDom = document.getElementsByClassName('coslogList')[0]
    if(scrollDom.clientHeight + parseInt(scrollDom.scrollTop) >= scrollDom.scrollHeight) {
      this.setState({
        pageIndex: this.state.pageIndex + 1
      }, () => {
        this.getList()
      })
    }
  }

  render() {
    const { list } = this.state;
    return (
      <div className="coslogBox">
        <div className="coslogItem coslogTitle">
          <span className="itemDate">{_l('日期')}</span>
          <span className="itemDesc">{_l('积分描述')}</span>
          <span className="itemCost">{_l('积分变化')}</span>
          <span className="itemLeft">{_l('可用积分')}</span>
        </div>
        <div className="coslogList" onScroll={(e) => this.handleMoveFormBody(e)}>
          {list.map((item, index) => {
            const temp = item.createTime && item.createTime.split(' ');
            return (
              <div className="coslogItem LineHeight40" key={index}>
                <span className="itemDate overflow_ellipsis">{temp[0]}</span>
                <span className="itemDesc overflow_ellipsis">{item.title}</span>
                <span className="itemCost overflow_ellipsis ThemeColor3">{+item.costMark}</span>
                <span className="itemLeft overflow_ellipsis ThemeColor3">{item.leftMark}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
