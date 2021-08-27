import React, { useState, Fragment, useEffect } from 'react';
import { string } from 'prop-types';
import ChartDialog from 'src/pages/worksheet/common/Statistics/ChartDialog';
import sheetAjax from 'src/api/worksheet';
import { useSetState } from 'react-use';
import CreateAnalysis from './CreateAnalysis';

export default function Analysis(props) {
  const { widget, onEdit, onUpdate, onClose, ids, projectId, sheetList } = props;
  const { appId } = ids;
  // 创建的图表类型
  const [chartType, setType] = useState('');

  const [visible, setVisible] = useState(Boolean(widget.value));

  // 图表名称
  const [report, setReport] = useSetState({ name: widget.name || _l('未命名'), id: widget.value || '' });

  // 图表数据源 工作表和相应视图
  const [dataSource, setDataSource] = useSetState({ worksheetId: '', worksheetName: '', viewId: '', views: [] });

  const { worksheetId, worksheetName, viewId, views } = dataSource;

  // 工作表的控件作为统计图表的x轴
  const [columns, setColumns] = useState([]);

  // 格式化控件作为统计图表的X轴
  const formatControlsToColumns = (controls = []) => controls.map(item => ({ data: item }));

  useEffect(() => {
    if (!worksheetId) return;
    sheetAjax
      .getWorksheetInfo({
        worksheetId,
        getTemplate: true,
        getViews: true,
        appId,
      })
      .then(res => {
        const { views = [], template = {} } = res;
        setDataSource({ views });
        setColumns(formatControlsToColumns(template.controls));
      });
  }, [worksheetId]);

  const handleClick = e => {
    const className = e.target.className;
    if (className === 'mask') {
      onClose();
    }
  };
  const handleCreate = reportType => {
    if (!worksheetId) {
      alert(_l('创建统计图前，必须选择工作表'));
      return;
    }
    setType(reportType);
    setVisible(true);
  };

  return (
    <Fragment>
      {!chartType && !report.id && (
        <CreateAnalysis
          onClick={handleClick}
          onCreate={handleCreate}
          dataSource={dataSource}
          setDataSource={setDataSource}
          {...props}
        />
      )}
      {visible && (
        <ChartDialog
          chartType={chartType}
          sourceType={1}
          scopeVisible={false}
          worksheetName={worksheetName}
          appId={appId}
          projectId={projectId}
          activeSheetId={worksheetId}
          activeViewId={viewId}
          columns={columns}
          views={views}
          report={report}
          onWorksheetDeleted={() => {
            setVisible(false);
            setReport({ id: '' });
          }}
          onBlur={event => {
            setReport({ name: event.target.value });
          }}
          updateDialogVisible={({ dialogVisible, isRequest = false, reportId, reportName: name }) => {
            if (reportId || name) {
              onEdit({ value: reportId, name });
              onClose();
              return;
            }
            // 需要重新更新数据 如统计名称变更
            if (isRequest) {
              onUpdate({ needUpdate: !widget.needUpdate });
            }
            if (!dialogVisible) {
              onClose();
            }
          }}
        />
      )}
    </Fragment>
  );
}
