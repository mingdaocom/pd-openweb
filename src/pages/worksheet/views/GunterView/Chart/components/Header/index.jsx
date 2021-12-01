import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import Skeleton from 'src/router/Application/Skeleton';
import MajorAxisLabel from '../MajorAxisLabel';
import MinorAxisLabel from '../MinorAxisLabel';
import Today from '../Today';

@connect(
  state => ({
    ..._.pick(state.sheet, ['gunterView', 'base']),
  }),
)
export default class GunterChartHeader extends Component {
  constructor(props) {
    super(props);
  }
  renderContent() {
    const { periodType, periodList, periodParentList } = this.props.gunterView;
    return (
      <Fragment>
        <div className="majorTimeAxis flexRow">
          {
            periodParentList.map((item, index) => (
              <MajorAxisLabel
                key={index}
                item={item}
                periodType={periodType}
              />
            ))
          }
        </div>
        <div className="minorTimeAxis flexRow">
          {
            periodList.map((item, index) => (
              <MinorAxisLabel
                key={index}
                item={item}
                periodType={periodType}
              />
            ))
          }
        </div>
      </Fragment>
    );
  }
  renderLoading() {
    return (
      <Skeleton
        style={{ flex: 1 }}
        direction="column"
        widths={['100%', '100%']}
        active
        itemStyle={{ marginBottom: '5px' }}
      />
    );
  }
  render() {
    const { gunterView } = this.props;
    const { loading, periodList, chartScroll } = gunterView;
    const wrapperWidth = periodList.length ? periodList.map(item => item.width).reduce((a, b) => a + b) : 0;

    return (
      <div className="gunterChartHeader">
        <div className="headerWrapper">
          <div
            className="headerScroll"
            style={{ width: loading ? '100%' : wrapperWidth }}
          >
            {loading || _.isEmpty(chartScroll) ? this.renderLoading() : this.renderContent()}
          </div>
        </div>
        {!loading && <Today />}
      </div>
    );
  }
}