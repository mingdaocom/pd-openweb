import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import unauthorizedPic from 'src/components/UnusualContent/unauthorized.png';
import ByUser from '../ByUser';
import Overview from '../Overview';
import './index.less';

const NoAuthorWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  .imgWrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 130px;
    height: 130px;
    line-height: 130px;
    border-radius: 50%;
    text-align: center;
    background-color: #f5f5f5;
    img {
      width: 100%;
    }
  }
  .explainText {
    margin: 30px 0 50px 0;
    font-size: 17px;
    color: #757575;
  }
`;

const tabs = [
  { key: 1, label: _l('总览') },
  { key: 2, label: _l('按成员') },
];
export default class AppAnalytics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 1,
      isAuthority: true,
    };
  }
  componentDidMount() {
    this.getData();
  }
  componentDidUpdate() {
    if (this.state.currentTab === 1) {
      this.getData();
    }
  }

  getData = () => {
    if (this.analysisEle) {
      this.analysisEle.getAppAnalysisData().then(res => {
        const [data1, data2] = res;
        const { list } = data1;
        const { workflow = {}, record = {}, app = {}, attachment = {} } = data2;
        if (data1.resultCode === 7 || data2.resultCode === 7) {
          this.setState({ isAuthority: false });
        } else {
          this.analysisEle.updateChartData({ workflow, record, app, attachment });
          this.analysisEle.updateAppOverviewData({ list });
        }
      });
    }
  };
  render() {
    const { projectId, appId } = _.get(this.props, 'match.params') || {};
    let { currentTab, isAuthority } = this.state;
    if (!isAuthority) {
      return (
        <NoAuthorWrap>
          <div className="imgWrap">
            <img src={unauthorizedPic} alt={_l('错误图片')} />
          </div>
          <div className="explainText">{_l('无权限访问')}</div>
        </NoAuthorWrap>
      );
    }

    return (
      <div className="appAnalyticsWrapper">
        <div className="appAnalyticsContent">
          <div className="appAnalytics flexColumn">
            <div className="tabs">
              {tabs.map(item => (
                <div
                  key={item.key}
                  className={cx('tabItem Hand', { currentTab: currentTab === item.key })}
                  onClick={() => {
                    this.setState({ currentTab: item.key });
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            <div className="flex">
              {currentTab === 1 && (
                <Overview appId={appId} projectId={projectId} ref={ele => (this.analysisEle = ele)} />
              )}
              {currentTab === 2 && <ByUser appId={appId} projectId={projectId} />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
