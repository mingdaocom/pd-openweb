import React, { Fragment } from 'react';
import Config from '../config';
import { Input } from 'antd';
import { Icon } from 'ming-ui';
import ResignList from './resignList';
import HandOver from './handOver';
import cx from 'classnames';
import '../groupDept/index.less';
const { Search } = Input;
const routeList = [
  {
    routeType: 'transfer',
    tabName: _l('工作交接'),
  },
  {
    routeType: 'resignlist',
    tabName: _l('已离职'),
  },
];

export default class extends React.Component {
  constructor() {
    super();
    Config.setPageTitle(_l('离职交接'));
    this.state = {
      level: 'index', // index | detail
      activeTab: 'transfer',
      keywords: '',
    };
  }

  handleChangeTab(item) {
    this.setState({ activeTab: item.routeType, keywords: '' });
  }

  handleInputChange = () => {
    if (this.handOver) {
      this.handOver.fetchList();
    }
  };

  setLevel(level) {
    this.setState({ level });
  }

  render() {
    const { keywords, activeTab, level } = this.state;
    const props = {
      projectId: Config.projectId,
      keywords,
    };
    return (
      <div id="groupDept" className="orgManagementWrap">
        <div className="orgManagementHeader">
          {level === 'index' ? (
            <div className="tabBox">
              {routeList.map(item => {
                return (
                  <div
                    className={cx('tabItem', { active: item.routeType === activeTab })}
                    onClick={this.handleChangeTab.bind(this, item)}
                  >
                    {item.tabName}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="backBox">
              <Icon
                icon="backspace"
                className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
                onClick={() => this.setLevel('index')}></Icon>
              <span className="Font17 Bold">{_l('查看详情')}</span>
            </div>
          )}
          {level === 'index' && (
            <div className="searchGroupBox">
              <Search
                allowClear
                placeholder={_l('搜索')}
                value={keywords}
                onSearch={this.handleInputChange}
                onChange={e => {
                  let val = e.target.value;
                  this.setState({ keywords: val });
                }}
                onPressEnter={e => {
                  if (e.keyCode === 13) {
                    this.handleInputChange();
                  }
                }}
              />
            </div>
          )}
        </div>
        <div className="groupContent">
          {level === 'index' && activeTab === 'resignlist' ? (
            <ResignList ref={node => (this.handOver = node)} activeTab={activeTab} {...props} />
          ) : (
            <HandOver
              ref={node => (this.handOver = node)}
              level={level}
              activeTab={activeTab}
              {...props}
              setLevel={this.setLevel.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}
