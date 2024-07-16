import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useDeepCompareEffect } from 'react-use';
import { bindActionCreators } from 'redux';
import * as actions from './redux/actions';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Modal, Flex, ActivityIndicator } from 'antd-mobile';
import report from 'statistics/api/report';
import Chart from '../components/Chart';
import ChartFilter from '../components/Chart/Filter';
import ChartSort from '../components/Chart/Sort';
import { fillValueMap, version } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import { updateLinkageFiltersGroup } from 'src/pages/customPage/redux/action.js';
import { formatLinkageFiltersGroup } from 'src/pages/customPage/util';
import _ from 'lodash';

const ModalContent = styled.div`
  background-color: #fff;
  .itemWrapper {
    flex-wrap: wrap;
    justify-content: flex-start;
    .item {
      width: 30%;
      margin-right: 3%;
      margin-bottom: 10px;
      padding: 6px 0;
      text-align: center;
      border-radius: 14px;
      background-color: #f5f5f5;
    }
    .active {
      color: rgba(33, 150, 243, 1) !important;
      background-color: rgba(33, 150, 243, 0.1);
    }
  }
  .scrollView {
    overflow: auto;
    max-height: 400px;
  }
`;

const HorizontalModal = styled(Modal)`
  .am-modal-body {
    overflow: hidden;
  }
`;

const HorizontalChartContent = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  transform: rotate(90deg);
  transform-origin: top left;
  height: ${props => `${props.height}px`};
  width: ${props => `${props.width}px`};
  left: ${props => `${props.height}px`};
  .count {
    color: #333;
    font-weight: 500;
    font-size: 20px;
    font-family: system-ui, BlinkMacSystemFont, segoe ui, Roboto, Helvetica, Arial, sans-serif, apple color emoji,
      segoe ui emoji, segoe ui symbol;
  }
  .allow {
    border-radius: 50%;
    background: #f8f8f9;
  }
`;

function ChartComponent(props) {
  const { linkageFiltersGroup = [], linkageMatch = {}, onUpdateLinkageFiltersGroup = _.noop } = props;
  const {
    widget,
    reportId,
    name,
    accessToken,
    filters = [],
    pageComponents,
    appId,
    projectId,
    themeColor,
    filtersGroup = [],
    onLoad,
    isHorizontal,
  } = props;
  const mobileCount = _.get(widget, 'config.mobileCount');
  const mobileFontSize = _.get(widget, 'config.mobileFontSize');
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [data, setData] = useState({ name });
  const [zoomData, setZoomData] = useState({ name });
  const [defaultData, setDefaultData] = useState();
  const pageConfig = {
    ...props.pageConfig,
    filters: filters.length ? filters : undefined,
    filtersGroup: filtersGroup.length ? filtersGroup : undefined,
  };

  if (accessToken) {
    window.access_token = accessToken;
  }

  const request = useRef(null);

  useDeepCompareEffect(() => {
    handleReportRequest();
  }, [reportId, filtersGroup, linkageFiltersGroup]);

  const handleReportRequest = param => {
    let requestParam = {
      reportId,
      version,
      filters: [
        filters.length ? filters : undefined,
        filtersGroup.length ? filtersGroup : undefined,
        linkageFiltersGroup.length ? linkageFiltersGroup : undefined,
      ].filter(_ => _),
    };
    if (param) {
      Object.assign(
        requestParam,
        {
          rangeType: data.rangeType,
          filterRangeId: data.filterRangeId,
          particleSizeType: data.particleSizeType || null,
          rangeValue: data.rangeValue,
          sorts: data.sorts,
        },
        param,
      );
    }
    setLoading(true);
    request.current = report.getData(requestParam);
    request.current.then(data => {
      data.reportId = reportId;
      const result = fillValueMap(data);
      setData(result);
      setZoomData(result);
      if (_.isEmpty(defaultData)) {
        setDefaultData(data);
      }
      setLoading(false);
      onLoad && onLoad(data);
    });
  };

  const handleNextReportRequest = (reportId, param) => {
    let requestParam = {
      reportId,
      version,
    };
    if (param) {
      Object.assign(
        requestParam,
        {
          rangeType: zoomData.rangeType,
          filterRangeId: zoomData.filterRangeId,
          particleSizeType: zoomData.xaxes.particleSizeType || null,
          rangeValue: zoomData.rangeValue,
          sorts: zoomData.sorts,
        },
        param,
      );
    }
    setLoading(true);
    report
      .getData(requestParam)
      .then(data => {
        data.reportId = reportId;
        const result = fillValueMap(data);
        setZoomData(result);
      })
      .finally(() => setLoading(false));
  };

  const handleOpenFilterModal = () => {
    const newFilterVisible = !filterVisible;
    setFilterVisible(newFilterVisible);
  };

  const handleOpenZoomModal = () => {
    setZoomVisible(!zoomVisible);
  };

  const DialogContent = () => {
    return (
      <Fragment>
        <div className="titleWrapper flexRow valignWrapper pAll15">
          <div className="Font13 Gray_9e flex Bold">{_l('筛选与排序')}</div>
          <Icon className="Font20" icon="closeelement-bg-circle" onClick={handleOpenFilterModal} />
        </div>
        <div className="flex scrollView">
          {data.appType === 1 && (
            <ChartFilter
              data={zoomVisible ? zoomData : data}
              defaultData={defaultData}
              onChange={data => {
                if (zoomVisible) {
                  handleNextReportRequest(zoomData.reportId, data);
                } else {
                  handleReportRequest(data);
                }
              }}
            />
          )}
          {![reportTypes.CountryLayer, reportTypes.NumberChart].includes(data.reportType) && (
            <Fragment>
              <ChartSort
                currentReport={zoomVisible ? zoomData : data}
                onChangeCurrentReport={data => {
                  if (zoomVisible) {
                    handleNextReportRequest(zoomData.reportId, data);
                  } else {
                    handleReportRequest(data);
                  }
                }}
              />
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  const isMobileChartPage = location.href.includes('mobileChart');
  const chartProps = {
    appId,
    projectId,
    linkageMatch,
    onUpdateLinkageFiltersGroup,
    loading,
    pageConfig,
    themeColor,
    mobileFontSize,
    onOpenFilterModal: handleOpenFilterModal,
    onOpenZoomModal: handleOpenZoomModal,
  };

  return (
    <Fragment>
      <Chart data={data} mobileCount={mobileCount} onOpenFilterModal={handleOpenFilterModal} {...chartProps} />
      <Modal
        popup
        style={{ height: isMobileChartPage ? '80%' : null }}
        visible={filterVisible}
        onClose={handleOpenFilterModal}
        className={cx('mobileNewRecordDialog', { horizontalChartDialog: zoomVisible })}
        animationType="slide-up"
      >
        {zoomVisible ? (
          <HorizontalChartContent
            height={document.documentElement.clientWidth}
            width={document.documentElement.clientHeight / 2}
          >
            <ModalContent className="leftAlign flexColumn h100">{DialogContent()}</ModalContent>
          </HorizontalChartContent>
        ) : (
          <ModalContent className="leftAlign flexColumn h100">{DialogContent()}</ModalContent>
        )}
      </Modal>
      <HorizontalModal
        popup
        visible={zoomVisible}
        onClose={handleOpenZoomModal}
        className="h100"
        transitionName="null"
        maskTransitionName="null"
      >
        <HorizontalChartContent
          className="leftAlign pAll20"
          height={document.documentElement.clientWidth}
          width={document.documentElement.clientHeight}
        >
          {zoomVisible && (
            <Chart
              isHorizontal={!_.isUndefined(isHorizontal) ? isHorizontal : true}
              pageComponents={pageComponents}
              data={zoomData}
              {...chartProps}
              onLoadBeforeData={index => {
                const data = pageComponents[index];
                handleNextReportRequest(data.value);
              }}
              onLoadNextData={index => {
                const data = pageComponents[index];
                handleNextReportRequest(data.value);
              }}
            />
          )}
        </HorizontalChartContent>
      </HorizontalModal>
    </Fragment>
  );
}

const emptyArray = [];

function ChartContent(props) {
  const { widget, filterComponents, loadFilterComponentCount } = props;
  const columnWidthConfig = _.get(widget, 'config.columnWidthConfig');
  const objectId = _.get(widget, 'config.objectId');
  const [visible, setVisible] = useState(false);
  const [sheetId, setSheetId] = useState(null);
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  const { linkageFiltersGroup = [], initiateChartIds = [] } = sheetId
    ? formatLinkageFiltersGroup({ sheetId, reportId: widget.value, objectId }, props.linkageFiltersGroup)
    : {};

  useEffect(() => {
    const customPageContent = document.querySelector('#componentsWrap');
    if (!customPageContent) {
      setVisible(true);
      return;
    }
    const chat = customPageContent.querySelector(`.widgetContent .analysis-${widget.id}`);
    const checkVisible = () => {
      if (!visible) {
        const pageRect = customPageContent.getBoundingClientRect();
        const rect = chat.getBoundingClientRect();
        const value = rect.top <= pageRect.bottom;
        value && setVisible(value);
      }
    };
    customPageContent.addEventListener('scroll', checkVisible, false);
    checkVisible();
    if (columnWidthConfig) {
      sessionStorage.setItem(`pivotTableColumnWidthConfig-${widget.value}`, columnWidthConfig);
    }
    return () => {
      customPageContent.removeEventListener('scroll', checkVisible, false);
    };
  }, []);

  if (
    !_.get(window, 'shareState.shareId') &&
    filterComponents.length &&
    loadFilterComponentCount < filterComponents.length
  ) {
    return (
      <Flex justify="center" align="center" className="h100 w100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }

  const isClickSearch = !!filterComponents
    .map(data => {
      const { filters, advancedSetting } = data;
      const result = _.find(filters, { objectId });
      return result && advancedSetting.clicksearch === '1';
    })
    .filter(n => n).length;

  if (isClickSearch && !filtersGroup.length) {
    return (
      <Flex justify="center" align="center" className="h100 w100">
        <span className="Font15 bold Gray_9e">{_l('执行查询后显示结果')}</span>
      </Flex>
    );
  }

  if (!visible) {
    return (
      <Flex justify="center" align="center" className="h100 w100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }

  return (
    <ChartComponent
      {...props}
      linkageMatch={props.linkageFiltersGroup[widget.id]}
      filtersGroup={filtersGroup.length ? filtersGroup : emptyArray}
      linkageFiltersGroup={linkageFiltersGroup.length ? linkageFiltersGroup : undefined}
      initiateChartInfo={initiateChartIds.map(id => props.linkageFiltersGroup[id])}
      onUpdateLinkageFiltersGroup={data => {
        data.objectId = objectId;
        data.widgetId = widget.id;
        props.updateLinkageFiltersGroup(widget.id, data);
      }}
      onLoad={result => setSheetId(result.appId)}
    />
  );
}

export const StateChartContent = connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup,
    linkageFiltersGroup: state.mobile.linkageFiltersGroup,
    filterComponents: state.mobile.filterComponents,
    loadFilterComponentCount: state.mobile.loadFilterComponentCount,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateLinkageFiltersGroup']), dispatch),
)(ChartContent);

export default ChartComponent;
