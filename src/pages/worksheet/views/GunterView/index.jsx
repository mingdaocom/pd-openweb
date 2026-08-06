import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import DragMask from 'worksheet/common/DragMask';
import * as actions from 'worksheet/redux/actions/gunterview';
import { PERIOD_TYPE } from 'src/pages/worksheet/views/GunterView/config';
import { browserIsMobile } from 'src/utils/common';
import GunterChart from './Chart';
import SelectionIndicator from './components/SelectionIndicator';
import GunterDirectory from './Directory';
import { getMaxTime } from './util';
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
    border-left: 1px solid var(--color-border-primary);
  }
`,
);
const isGunterExport = location.href.includes('gunterExport');
let Gunter = class Gunter extends Component {
  constructor(props) {
    super(props);
    const { view } = props;
    this.state = {
      directoryWidth: this.getDirectoryWidth(view.viewId),
      dragMaskVisible: false,
      maxWidth: 0,
    };
  }

  componentDidMount() {
    const { view, updateViewConfig, noLoadAtDidMount } = this.props;
    const { calendartype } = view.advancedSetting;
    updateViewConfig();
    this.handleInitGroupingVisible(view.viewId);

    if (isGunterExport) {
      this.props.fetchRows();
    } else {
      const gunterViewType = localStorage.getItem(`gunterViewType-${view.viewId}`);
      const periodType = gunterViewType
        ? Number(gunterViewType)
        : calendartype
          ? Number(calendartype)
          : PERIOD_TYPE.day;

      if (!noLoadAtDidMount) {
        this.props.fetchRows(grouping => {
          this.props.updataPeriodType(periodType, getMaxTime(grouping));
        });
      } else {
        this.props.updataPeriodType(periodType);
      }
    }

    const viewEl = document.querySelector(`.gunterView-${view.viewId}`);
    this.setState({
      maxWidth: viewEl ? (60 / 100) * viewEl.offsetWidth : 0,
    });
  }

  componentWillUnmount() {
    this.props.destroyGunterView();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      const { view } = this.props;

      if (view.viewId !== prevProps.view.viewId) {
        this.handleInitGroupingVisible(view.viewId);
        prevProps.updateViewConfig();
        prevProps.resetLoadGunterView();
        this.setState({
          directoryWidth: this.getDirectoryWidth(view.viewId),
        });
        return;
      }

      if (
        view.advancedSetting.navshow !== prevProps.view.advancedSetting.navshow ||
        view.advancedSetting.navfilters !== prevProps.view.advancedSetting.navfilters ||
        !_.isEqual(view.moreSort, prevProps.view.moreSort)
      ) {
        prevProps.resetLoadGunterView();
        this.setState({
          directoryWidth: this.getDirectoryWidth(view.viewId),
        });
      }

      if (view.advancedSetting.calendartype !== prevProps.view.advancedSetting.calendartype) {
        const type = view.advancedSetting.calendartype ? Number(view.advancedSetting.calendartype) : PERIOD_TYPE.day;
        prevProps.changeViewType(type);
      }

      if (view.advancedSetting.unweekday !== prevProps.view.advancedSetting.unweekday) {
        prevProps.updateViewConfig();
        prevProps.refreshGunterView();
      }

      if (view.advancedSetting.colorid !== prevProps.view.advancedSetting.colorid) {
        prevProps.updateViewConfig();
        prevProps.updateRecordTimeBlockColor();
      }

      if (view.advancedSetting.clicktype !== prevProps.view.advancedSetting.clicktype) {
        prevProps.updateViewConfig();
      }

      if (
        view.viewControl !== prevProps.view.viewControl ||
        view.advancedSetting.viewtitle !== prevProps.view.advancedSetting.viewtitle ||
        view.advancedSetting.milepost !== prevProps.view.advancedSetting.milepost ||
        view.advancedSetting.begindate !== prevProps.view.advancedSetting.begindate ||
        view.advancedSetting.enddate !== prevProps.view.advancedSetting.enddate ||
        view.advancedSetting.showgroupcolor !== prevProps.view.advancedSetting.showgroupcolor ||
        view.advancedSetting.navtitle !== prevProps.view.advancedSetting.navtitle ||
        view.advancedSetting.customitems !== prevProps.view.advancedSetting.customitems
      ) {
        prevProps.updateViewConfig();
        prevProps.fetchRows();
      }

      if (
        !_.isEqual(view.displayControls, prevProps.view.displayControls) ||
        !_.isEqual(view.showControls, prevProps.view.showControls) ||
        view.advancedSetting.abstract !== prevProps.view.advancedSetting.abstract ||
        view.coverCid !== prevProps.view.coverCid
      ) {
        // 等待 Worksheet/SaveWorksheetView 接口更新 displayControls 后再重新请求
        setTimeout(() => {
          prevProps.updateViewConfig();
          prevProps.fetchRows();
        }, 200);
      }
    }
  }

  handleInitGroupingVisible = viewId => {
    const gunterGroupingVisible = localStorage.getItem(`gunterGroupingVisible-${viewId}`) === 'false' ? false : true;
    this.props.updateGroupingVisible(isGunterExport ? true : gunterGroupingVisible);
  };

  getDirectoryWidth(viewId) {
    const gunterDirectoryWidth = localStorage.getItem(`gunterDirectoryWidth-${viewId}`);
    const worksheetContentBoxEl = document.querySelector('.worksheetSheet');
    const contentBoxWidth = worksheetContentBoxEl ? worksheetContentBoxEl.clientWidth / 3 : 210;
    return isGunterExport ? 570 : gunterDirectoryWidth ? Number(gunterDirectoryWidth) : contentBoxWidth;
  }

  render() {
    const { view, loading, groupingVisible, layoutType } = this.props;
    const { directoryWidth, dragMaskVisible, maxWidth } = this.state;
    const isMobile = browserIsMobile() || layoutType === 'mobile';
    return (
      <div
        className={cx('gunterView flexRow', `gunterView-${view.viewId}`, {
          gunterViewLoading: loading,
        })}
      >
        {groupingVisible && !isMobile && (
          <Fragment>
            {dragMaskVisible && (
              <DragMask
                value={directoryWidth}
                min={210}
                max={maxWidth}
                onChange={value => {
                  const { chartScroll, groupingScroll } = this.props;
                  this.setState({
                    dragMaskVisible: false,
                    directoryWidth: value,
                  });
                  safeLocalStorageSetItem(`gunterDirectoryWidth-${view.viewId}`, value);
                  chartScroll.refresh();

                  chartScroll._execEvent('scroll');

                  groupingScroll.refresh();

                  groupingScroll._execEvent('scroll');
                }}
              />
            )}
            <GunterDirectory width={directoryWidth} />
            <Drag
              left={directoryWidth}
              onMouseDown={() =>
                this.setState({
                  dragMaskVisible: true,
                })
              }
            />
          </Fragment>
        )}
        <GunterChart isMobile={isMobile} />
        {!loading && !isMobile && <SelectionIndicator />}
      </div>
    );
  }
};
Gunter = connect(
  state => ({ ..._.pick(state.sheet.gunterView, ['loading', 'groupingVisible', 'chartScroll', 'groupingScroll']) }),
  dispatch => bindActionCreators(actions, dispatch),
)(Gunter);
export default Gunter;
