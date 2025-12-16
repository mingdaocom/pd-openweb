import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { reportTypes } from '../Charts/common';
import Sort from '../components/Sort';
import * as actions from '../redux/actions.js';

const Operation = ({
  settingVisible,
  scopeVisible,
  sheetVisible,
  direction,
  currentReport,
  reportData,
  sourceType,
  base,
  onChangeScopeVisible,
  onChangeSheetVisible,
  onChangeDirection,
  changeCurrentReport,
  getReportData,
  getTableData,
}) => {
  const { reportType, xaxes = {} } = reportData;
  const { report = {}, pageId } = base;
  const isPublicShare = _.get(window, 'shareState.shareId') || window.shareAuthor;
  const isSheetView = ![reportTypes.PivotTable].includes(reportType) && xaxes?.controlType !== 40;
  const { style } = currentReport;
  const { pivotTableColumnWidthConfig } = style || {};
  return (
    <div className="flexRow valignWrapper">
      {sheetVisible && !settingVisible ? (
        <Tooltip title={direction === 'vertical' ? _l('切换为竖版模式') : _l('切换为横版模式')} placement="bottom">
          <Icon
            icon="call_to_action_on"
            className={cx('Font20 Gray_9e pointer mLeft16', direction)}
            onClick={() => {
              onChangeDirection();
            }}
          />
        </Tooltip>
      ) : (
        isSheetView && (
          <Tooltip title={_l('以表格显示')} placement="bottom">
            <Icon
              icon="worksheet"
              className="Font20 Gray_9e pointer mLeft16"
              onClick={() => {
                onChangeSheetVisible();
              }}
            />
          </Tooltip>
        )
      )}
      {!settingVisible && (
        <Tooltip title={_l('刷新')} placement="bottom">
          <Icon
            icon="task-later"
            className="Font20 Gray_9e pointer mLeft16"
            onClick={() => {
              getReportData({ reload: true });
              if (sheetVisible) {
                getTableData();
              }
            }}
          />
        </Tooltip>
      )}
      {!settingVisible && !isPublicShare && (
        <Tooltip title={_l('统计范围')} placement="bottom">
          <Icon
            icon="filter"
            className={cx('Font20 Gray_9e pointer mLeft16', { active: scopeVisible })}
            onClick={() => {
              onChangeScopeVisible(!scopeVisible);
            }}
          />
        </Tooltip>
      )}
      {settingVisible &&
        [reportTypes.PivotTable].includes(reportData.reportType) &&
        !_.isEmpty(pivotTableColumnWidthConfig) && (
          <Tooltip title={_l('等分')} placement="bottom">
            <Icon
              icon="equal_division"
              className="Font20 Gray_9e pointer mLeft16"
              onClick={() => {
                changeCurrentReport({
                  style: {
                    ...style,
                    pivotTableColumnWidthConfig: undefined,
                  },
                });
                sessionStorage.removeItem(`pivotTableColumnWidthConfig-${report.id}`);
              }}
            />
          </Tooltip>
        )}
      {reportData.status > 0 && (
        <Sort
          reportId={report.id}
          pageId={pageId}
          sourceType={sourceType}
          currentReport={currentReport}
          reportType={reportData.reportType}
          map={reportData.map}
          valueMap={reportData.valueMap}
          reportData={reportData}
          onChangeCurrentReport={data => {
            changeCurrentReport(data, true);
            if (sheetVisible) {
              getTableData();
            }
          }}
        >
          <span>
            <Tooltip title={_l('排序')} placement="bottom">
              <Icon icon="import_export" className="Font20 pointer Bold mLeft16 Gray_9e hoverHighlight" />
            </Tooltip>
          </span>
        </Sort>
      )}
    </div>
  );
};

export default connect(
  ({ statistics }) => ({
    ..._.pick(statistics, ['currentReport', 'reportData', 'worksheetInfo', 'base']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(Operation);
