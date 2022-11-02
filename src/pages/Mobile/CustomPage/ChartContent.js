import React, { useEffect, useState, Fragment, useRef } from 'react';
import { useDeepCompareEffect } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Modal } from 'antd-mobile';
import report from 'statistics/api/report';
import Chart from '../components/Chart';
import ChartFilter from '../components/Chart/Filter';
import ChartSort from '../components/Chart/Sort';
import { fillValueMap, version } from 'statistics/common';
import { reportTypes } from 'statistics/Charts/common';
import { connect } from 'react-redux';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';

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
    font-family: system-ui, BlinkMacSystemFont, segoe ui, Roboto, Helvetica, Arial, sans-serif,
      apple color emoji, segoe ui emoji, segoe ui symbol;
  }
  .allow {
    border-radius: 50%;
    background: #f8f8f9;
  }
`;

function ChartContent(props) {
  const { widget, reportId, name, accessToken, filters = [], pageComponents } = props;
  const objectId = _.get(widget, 'config.objectId');
  const [loading, setLoading] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [data, setData] = useState({ name });
  const [zoomData, setZoomData] = useState({ name });
  const [defaultData, setDefaultData] = useState();
  const shareAuthor = window.shareAuthor;
  const headersConfig = {
    shareAuthor,
    access_token: accessToken,
  };
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);
  const request = useRef(null);

  useDeepCompareEffect(() => {
    handleReportRequest();
  }, [filtersGroup]);

  useEffect(() => {
    handleReportRequest();
  }, [reportId]);

  const handleReportRequest = param => {
    let requestParam = {
      reportId,
      version,
      filters: [
        filters.length ? filters : undefined,
        filtersGroup.length ? filtersGroup : undefined
      ].filter(_ => _)
    };
    if (param) {
      Object.assign(
        requestParam,
        {
          rangeType: data.rangeType,
          filterRangeId: data.filterRangeId,
          particleSizeType: data.xaxes.particleSizeType || null,
          rangeValue: data.rangeValue,
          sorts: data.sorts,
        },
        param,
      );
    }
    setLoading(true);
    if (request.current && request.current.state() === 'pending' && request.current.abort) {
      request.current.abort();
    }
    if (request.current && request.current.state() === 'resolved') {
      setData({ ...data, map: [] });
    }
    request.current = report.getData(requestParam, (shareAuthor || accessToken) ? { headersConfig } : { fireImmediately: true });
    request.current.then(data => {
        data.reportId = reportId;
        const result = fillValueMap(data);
        setData(result);
        setZoomData(result);
        if (_.isEmpty(defaultData)) {
          setDefaultData(data);
        }
        setLoading(false);
      });
  }

  const handleNextReportRequest = (reportId, param) => {
    let requestParam = {
      reportId,
      version
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
      .getData(requestParam, accessToken ? { headersConfig } : {})
      .then(data => {
        data.reportId = reportId;
        const result = fillValueMap(data);
        setZoomData(result);
      })
      .always(() => setLoading(false));
  }

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
          <ChartFilter
            data={zoomVisible ? zoomData : data}
            defaultData={defaultData}
            onChange={(data) => {
              if (zoomVisible) {
                handleNextReportRequest(zoomData.reportId, data);
              } else {
                handleReportRequest(data);
              }
            }}
          />
          {![reportTypes.CountryLayer, reportTypes.NumberChart].includes(data.reportType) && (
            <Fragment>
              <ChartSort
                currentReport={zoomVisible ? zoomData : data}
                onChangeCurrentReport={(data) => {
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

  return (
    <Fragment>
      <Chart
        data={data}
        loading={loading}
        onOpenFilterModal={handleOpenFilterModal}
        onOpenZoomModal={handleOpenZoomModal}
      />
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
              isHorizontal={true}
              pageComponents={pageComponents}
              data={zoomData}
              loading={loading}
              onOpenFilterModal={handleOpenFilterModal}
              onOpenZoomModal={handleOpenZoomModal}
              onLoadBeforeData={(index) => {
                const data = pageComponents[index];
                handleNextReportRequest(data.value);
              }}
              onLoadNextData={(index) => {
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

ChartContent.defaultProps = {
  filtersGroup: []
}

export const StateChartContent = connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup
  })
)(ChartContent);

export default ChartContent;

