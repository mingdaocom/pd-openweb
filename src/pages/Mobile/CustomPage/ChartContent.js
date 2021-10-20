import React, { useEffect, useState, Fragment } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Modal } from 'antd-mobile';
import report from 'src/pages/worksheet/common/Statistics/api/report';
import reportConfig from 'src/pages/worksheet/common/Statistics/api/reportConfig';
import Chart from '../components/Chart';
import ChartFilter from '../components/Chart/Filter';
import ChartSort from '../components/Chart/Sort';
import { fillValueMap } from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

const ModalContent = styled.div`
  background-color: #fff;
  .itemWrapper {
    flex-wrap: wrap;
    justify-content: space-between;
    .item {
      width: 30%;
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
`;

function ChartContent(props) {
  const { reportId, name, dimensions, accessToken } = props;
  const [loading, setLoading] = useState(true);
  const [controlsLoading, setControlsLoading] = useState(true);
  const [controls, setControls] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [data, setData] = useState({ name });
  const headersConfig = {
    access_token: accessToken,
  };

  const handleReportRequest = param => {
    let requestParam = { reportId };
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
    report
      .getData(requestParam, accessToken ? { headersConfig } : {})
      .then(data => {
        data.reportId = reportId;
        setData(fillValueMap(data));
      })
      .always(() => setLoading(false));
  };

  const handleGetControls = () => {
    setControlsLoading(true);
    reportConfig
      .getReportConfigDetail({
        reportId,
      })
      .then(result => {
        setControls(result.controls);
      })
      .always(() => setControlsLoading(false));
  };

  const handleOpenFilterModal = () => {
    const newFilterVisible = !filterVisible;
    if (newFilterVisible) {
      handleGetControls();
    }
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
          {controlsLoading ? (
            <div className="flexRow valignWrapper mTop20">
              <LoadDiv />
            </div>
          ) : (
            <Fragment>
              <ChartFilter
                data={data}
                controls={controls}
                onChange={handleReportRequest}
              />
              {![reportTypes.CountryLayer, reportTypes.NumberChart].includes(data.reportType) && (
                <Fragment>
                  <ChartSort currentReport={data} controls={controls} onChangeCurrentReport={handleReportRequest} />
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  };

  const isMobileChartPage = location.href.includes('mobileChart');

  useEffect(() => {
    handleReportRequest();
  }, [reportId]);

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
      <Modal
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
              data={data}
              loading={loading}
              onOpenFilterModal={handleOpenFilterModal}
              onOpenZoomModal={handleOpenZoomModal}
            />
          )}
        </HorizontalChartContent>
      </Modal>
    </Fragment>
  );
}

export default ChartContent;
