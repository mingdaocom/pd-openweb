import React, { Component, Fragment } from 'react';
import account from 'src/api/account';
import cx from 'classnames';
import Empty from 'src/pages/Admin/common/TableEmpty';
import { LoadDiv, Tooltip } from 'ming-ui'
import './index.less';

const toolBar = [
  { label: _l('全部徽章'), value: -1 },
  { label: _l('技能类徽章'), value: 0 },
  { label: _l('管理类徽章'), value: 1 },
  { label: _l('系统类徽章'), value: 2 },
];

export default class ViewEmblem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      showList: [],
      showIds: [],
      activeBar: -1,
      loading: false,
      count: 0,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    $.when(this.getList(), this.getShowList()).then((data, showList) => {
      this.setState({
        list: data.list,
        count: data.allCount,
        showList: showList.list,
        showIds: showList.list.map(item => item.medalId),
        loading: false,
      });
    });
  }

  getList() {
    return account.getMedalByType({
      pageIndex: 1,
      pageSize: 100,
      type: this.state.activeBar,
    });
  }

  getShowList() {
    return account.getDisplayMedalList({ displayType: 0 });
  }

  handleChange(item) {
    this.setState(
      {
        activeBar: item.value,
        loading: true,
      },
      () => {
        this.getList().then(data => {
          this.setState({
            list: data.list,
            count: data.allCount,
            loading: false,
          });
        });
      },
    );
  }

  renderEmblems() {
    const { count, list, showIds } = this.state;
    const detail = {
      icon: 'icon-military_tech',
      desc: _l('您暂时没有该类徽章'),
    };
    if (!count) {
      return <Empty detail={detail} />;
    }
    return (
      <Fragment>
        {list.map(item => {
          return (
            <div className="emeblemItemBox Relative" onClick={() => this.handleEdit(item)}>
              <Tooltip popupPlacement="top" text={<span>{showIds.indexOf(item.medalId) > -1 ? _l('取消展示') : _l('设为展示')}</span>}>
                <span className={cx('iconBox icon-bookmark1 Font16', showIds.indexOf(item.medalId) > -1 ? 'ThemeColor3 active' : 'Gray_bd')}></span>
              </Tooltip>
              <div className="badgeItem">
                <img src={item.middlePath} />
                <div className="myBadgeCount">
                  <span>{item.count}</span>
                </div>
              </div>
              <div className="Font15 Gray_9e">{item.medalName}</div>
            </div>
          );
        })}
      </Fragment>
    );
  }

  handleEdit(item) {
    //判断展示状态（展示---取消）（不展示---添加）
    const actionShow = this.state.showIds.indexOf(item.medalId) > -1
    account.editAccountMedalIsShow({
      isShow:  actionShow ? 0 : 1,
      mediaId: item.medalId,
    }).then(data => {
      if(data) {
        this.setState({
          showList: actionShow ? this.state.showList.filter(x => x.medalId !== item.medalId) : this.state.showList.concat(item),
          showIds: actionShow ? this.state.showIds.filter(x => x !== item.medalId) : this.state.showIds.concat(item.medalId),
        })
      }
    })
  }

  render() {
    const { loading, showList, activeBar, showIds } = this.state;
    return (
      <div className="viewEmblemContainer">
        <div className="Gray">{_l('展示的徽章')}</div>
        <div className="viewItemBox">
          {showList.length ? (
            <Fragment>
              {showList.map(item => {
                return (
                  <div className={cx("viewItem clearfix", { active: showIds.indexOf(item.medalId) > -1})} onClick={() => this.handleEdit(item)}>
                    <div className="badgeItem">
                      <img src={item.smallPath} />
                      <div className="myBadgeCount">
                        <span>{item.count}</span>
                      </div>
                    </div>
                    <div className="mLeft5 Gray_9e">{item.medalName}</div>
                    <Tooltip popupPlacement="top" text={<span>{_l('取消展示')}</span>}>
                      <span className='iconBox Font16 mLeft10 icon-bookmark1 ThemeColor3'></span>
                    </Tooltip>
                  </div>
                );
              })}
            </Fragment>
          ) : (
            <div className="Gray_9e mTop10">{_l('未设置')}</div>
          )}
        </div>
        <div className="toolChangeBox">
          {toolBar.map(item => {
            return (
              <div
                className={cx('toolBarItem', { active: activeBar === item.value })}
                onClick={() => this.handleChange(item)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        <div className="emblemsContent">{loading ? <LoadDiv /> : this.renderEmblems()}</div>
      </div>
    );
  }
}
