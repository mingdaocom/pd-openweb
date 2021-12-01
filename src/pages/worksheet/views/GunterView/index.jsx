import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/redux/actions/gunterview';
import cx from 'classnames';
import styled from 'styled-components';
import DragMask from 'worksheet/common/DragMask';
import GunterDirectory from './Directory';
import GunterChart from './Chart';
import { browserIsMobile } from 'src/util';
import SelectionIndicator from './components/SelectionIndicator';
import { PERIOD_TYPE } from 'src/pages/worksheet/views/GunterView/config';
import './index.less';

const Drag = styled.div(
  ({ left }) => `
  position: absolute;
  z-index: 2;
  left: ${left}px;
  width: 2px;
  height: 100%;
  cursor: ew-resize;
  &:hover {
    border-left: 1px solid #ddd;
  }
`,
);

const isGunterExport = location.href.includes('gunterExport');

@connect(
  state => ({ ..._.pick(state.sheet.gunterView, ['loading', 'groupingVisible', 'chartScroll', 'groupingScroll']) }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class Gunter extends Component {
  constructor(props) {
    super(props);
    const gunterDirectoryWidth = localStorage.getItem('gunterDirectoryWidth');
    const worksheetSheetEl = document.querySelector('.worksheetSheet');
    this.state = {
      directoryWidth: isGunterExport ? 570 : (gunterDirectoryWidth ? Number(gunterDirectoryWidth) : 210),
      dragMaskVisible: false,
      maxWidth: worksheetSheetEl ? (60 / 100) * worksheetSheetEl.offsetWidth : 0,
    };
  }
  componentDidMount() {
    const { calendartype } = this.props.view.advancedSetting;
    this.props.updateViewConfig();
    if (isGunterExport) {
      this.props.fetchRows();
    } else {
      const gunterViewType = localStorage.getItem('gunterViewType');
      this.props.updataPeriodType(
        gunterViewType ? Number(gunterViewType) : calendartype ? Number(calendartype) : PERIOD_TYPE.day,
      );
      this.props.fetchRows();
    }
  }
  componentWillUnmount() {
    this.props.destroyGunterView();
  }
  componentWillReceiveProps({ view }) {
    if (view.viewId !== this.props.view.viewId) {
      this.props.resetLoadGunterView();
    }
    if (view.advancedSetting.calendartype !== this.props.view.advancedSetting.calendartype) {
      const type = view.advancedSetting.calendartype ? Number(view.advancedSetting.calendartype) : PERIOD_TYPE.day;
      this.props.changeViewType(type);
    }
    if (view.advancedSetting.unweekday !== this.props.view.advancedSetting.unweekday) {
      this.props.updateViewConfig();
      this.props.refreshGunterView();
    }
    if (view.advancedSetting.colorid !== this.props.view.advancedSetting.colorid) {
      this.props.updateViewConfig();
      this.props.updateRecordTimeBlockColor();
    }
    if (
      view.viewControl !== this.props.view.viewControl ||
      view.advancedSetting.milepost !== this.props.view.advancedSetting.milepost ||
      view.advancedSetting.begindate !== this.props.view.advancedSetting.begindate ||
      view.advancedSetting.enddate !== this.props.view.advancedSetting.enddate
    ) {
      this.props.updateViewConfig();
      this.props.fetchRows();
    }
  }
  render() {
    const { loading, groupingVisible } = this.props;
    const { directoryWidth, dragMaskVisible, maxWidth } = this.state;
    const isMobile = browserIsMobile();

    return (
      <div className={cx('gunterView flexRow', { gunterViewLoading: loading })}>
        {groupingVisible && !isMobile && (
          <Fragment>
            {dragMaskVisible && (
              <DragMask
                value={directoryWidth}
                min={210}
                max={maxWidth}
                onChange={value => {
                  const { chartScroll, groupingScroll } = this.props;
                  this.setState({ dragMaskVisible: false, directoryWidth: value });
                  localStorage.setItem('gunterDirectoryWidth', value);
                  chartScroll.refresh();
                  chartScroll._execEvent('scroll');
                  groupingScroll.refresh();
                  groupingScroll._execEvent('scroll');
                }}
              />
            )}
            <GunterDirectory width={directoryWidth} />
            <Drag left={directoryWidth} onMouseDown={() => this.setState({ dragMaskVisible: true })} />
          </Fragment>
        )}
        <GunterChart />
        {!loading && !isMobile && <SelectionIndicator />}
      </div>
    );
  }
}
