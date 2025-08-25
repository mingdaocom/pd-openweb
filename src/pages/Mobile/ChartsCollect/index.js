import React, { Component } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import favoriteAjax from 'src/api/favorite';
import MobileChart from 'mobile/CustomPage/ChartContent';
import Back from '../components/Back';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 10px;
  background-color: #f5f5f5;
  height: 100%;
  overflow-y: auto;
  .loadingWrap {
    width: 100%;
    height: 100vh;
  }
  .chartItemWrap {
    height: 300px;
    background: #ffffff;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    margin-bottom: 10px;
    padding: 16px 15px 15px;
    box-sizing: content-box;
    .reportName {
      font-size: 17px;
      font-weight: 400;
    }
  }
`;

//  图表收藏
export default class ChartCollect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      collectCharts: [],
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    const { projectId } = _.get(this.props, 'match.params') || {};
    if (!projectId) return;

    this.setState({ loading: true });

    favoriteAjax
      .getAllFavorites({ projectId, type: 2, isRefresh: 1 })
      .then(collectCharts => {
        this.setState({ collectCharts, loading: false });
      })
      .catch(() => {
        this.setState({ collectCharts: [], loading: false });
      });
  };

  render() {
    const { collectCharts, loading } = this.state;

    return (
      <Wrap>
        {loading ? (
          <div className="loadingWrap flexRow alignItemsCenter justifyContentCenter">
            <LoadDiv />
          </div>
        ) : (
          collectCharts.map(item => {
            return (
              <div key={item.favoriteId} className="chartItemWrap flexColumn">
                <MobileChart
                  isHorizontal={false}
                  reportId={item.reportId}
                  pageId={item.pageId}
                  viewId={item.viewId}
                  filters={[]}
                />
              </div>
            );
          })
        )}

        <Back
          icon="home"
          onClick={() => {
            window.mobileNavigateTo('/mobile/dashboard');
          }}
        />
      </Wrap>
    );
  }
}
