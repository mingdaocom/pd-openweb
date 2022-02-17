import React, { Fragment } from 'react';
import { reportTypes } from '../Charts/common';
import HeaderDisplaySetup from '../components/HeaderDisplaySetup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions.js';
import { chartNav, isTimeControl } from '../common';

const DisplaySetup = ({
  settingVisible,
  currentReport,
  reportData,
  changeCurrentReport,
  children
}) => {
  const isDualAxes = reportTypes.DualAxes === currentReport.reportType;
  const { xaxes, displaySetup, yreportType, sorts } = currentReport;
  const controlType = _.get(xaxes, ['controlType']);
  const xAxisisTime = isTimeControl(controlType);
  return (
    <div className="chartHeader mBottom10">
      <div className="flexRow valignWrapper Font13 Gray_75">
        {[reportTypes.LineChart, reportTypes.BarChart, reportTypes.FunnelChart, reportTypes.DualAxes].includes(
          currentReport.reportType,
        ) && settingVisible && (
          <Fragment>
            <HeaderDisplaySetup
              title={isDualAxes ? _l('左Y轴(%0)', _.find(chartNav, { type: yreportType || 1 }).name) : null}
              displaySetup={displaySetup}
              mapKeys={Object.keys(reportData.map || [])}
              reportType={isDualAxes ? yreportType : reportData.reportType}
              xAxisisTime={xAxisisTime}
              onUpdateDisplaySetup={(data, name) => {
                if (name === 'default') {
                  changeCurrentReport(
                    {
                      displaySetup: data,
                      sorts: [],
                    },
                    true,
                  );
                } else if (name === 'isPile' && !isDualAxes && _.find(sorts, xaxes.controlId)) {
                  changeCurrentReport({
                    displaySetup: data,
                    sorts: sorts.filter(item => _.findKey(item) !== xaxes.controlId),
                  });
                } else {
                  changeCurrentReport({
                    displaySetup: data
                  });
                }
              }}
              chartType={reportData.reportType}
            />
            {currentReport.rightY && currentReport.rightY.display && (
              <HeaderDisplaySetup
                title={_l('右Y轴(折线图)')}
                displaySetup={currentReport.rightY.display}
                mapKeys={Object.keys(reportData.contrastMap || [])}
                reportType={currentReport.rightY.reportType}
                xAxisisTime={xAxisisTime}
                onUpdateDisplaySetup={data => {
                  changeCurrentReport({
                    rightY: {
                      ...currentReport.rightY,
                      display: data
                    }
                  });
                }}
              />
            )}
          </Fragment>
        )}
      </div>
      {children}
    </div>
  );
}


export default connect(
  ({ statistics }) => ({
    ..._.pick(statistics, ['currentReport', 'reportData', 'base'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(DisplaySetup);
