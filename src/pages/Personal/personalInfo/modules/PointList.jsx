import React from 'react';
import account from 'src/api/account';
import './index.less';

export default class PointList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: []
    };
  }

  componentDidMount() {
    this.getList()
  }

  getList() {
    account.getAccountPoint({}).then(({ list = []}) => {
      this.setState({
        list
      });
    });
  }

  validValue(value) {
    return value < 0 ? '/' : value
  }

  render() {
    const { list } = this.state;
    return (
      <div className="coslogBox">
        <div className="coslogItem coslogTitle">
          <span className="itemDate">{_l('类型')}</span>
          <span className="itemDate">{_l('分值')}</span>
          <span className="itemCost">{_l('每日封顶')}</span>
          <span className="itemCost">{_l('封顶')}</span>
          <span className="itemTask">{_l('说明')}</span>
        </div>
        <div className="coslogList">
          {list.map((item, index) => {
            return (
              <div className="coslogItem LineHeight40" key={index}>
                <span className="itemDate overflow_ellipsis">{item.name}</span>
                <span className="itemDate overflow_ellipsis">{item.value}</span>
                <span className="itemCost overflow_ellipsis ThemeColor3">{this.validValue(item.dayMaxValue)}</span>
                <span className="itemCost overflow_ellipsis ThemeColor3">{this.validValue(item.maxValue)}</span>
                <span className="itemTask ThemeColor3">{item.description}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
