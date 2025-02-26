import React, { useState, Fragment, useEffect } from 'react';
import { string } from 'prop-types';
import ChartDialog from 'statistics/ChartDialog';
import sheetAjax from 'src/api/worksheet';
import { useSetState } from 'react-use';
import CreateAnalysis from './CreateAnalysis';
import { v4 as uuidv4 } from 'uuid';
import { replaceColor } from 'src/pages/customPage/util';

export default function Analysis(props) {
  const { widget, onEdit, onUpdate, onClose, ids, projectId, appPkg, config, apk } = props;
  const { appId } = ids;
  const iconColor = _.get(apk, 'iconColor') || _.get(appPkg, 'iconColor');
  const pageConfig = replaceColor(config || {}, iconColor);
  const [visible, setVisible] = useState(Boolean(widget.value));

  // 图表名称
  const [report, setReport] = useSetState({ name: widget.name || _l('未命名'), id: widget.value || '' });

  // 图表数据源 工作表和相应视图
  const [dataSource, setDataSource] = useSetState({ worksheetId: '', worksheetName: '', viewId: '', views: [], appType: 1 });

  const { worksheetId, worksheetName, viewId, views, appType } = dataSource;

  const handleCreate = () => {
    setVisible(true);
  }

  return (
    <Fragment>
      {!visible && !report.id && (
        <CreateAnalysis
          onCreate={handleCreate}
          dataSource={dataSource}
          setDataSource={setDataSource}
          {...props}
        />
      )}
      {visible && (
        <ChartDialog
          sourceType={1}
          appType={appType}
          worksheetName={worksheetName}
          appId={appId}
          projectId={projectId}
          worksheetId={worksheetId}
          viewId={viewId}
          report={report}
          themeColor={iconColor}
          customPageConfig={pageConfig}
          updateDialogVisible={({ dialogVisible, isRequest = false, reportId, reportName, reportType, reportDesc, worksheetId }) => {
            const { config = {} } = widget;
            const newConfig = config.objectId ? config : { ...config, objectId: uuidv4() }
            if (reportId) {
              onEdit({ value: reportId, config: newConfig, worksheetId, name: reportName, reportType });
              onClose();
              return;
            }
            if (report.id && reportName !== widget.name) {
              onEdit({ name: reportName, config: newConfig });
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
