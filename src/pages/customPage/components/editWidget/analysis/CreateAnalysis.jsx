import React from 'react';
import _ from 'lodash';
import SheetModal from 'statistics/components/DataSource/components/SheetModal';

function CreateAnalysis(props) {
  const { ids = {}, projectId, dataSource, setDataSource, onClose = _.noop, onCreate = _.noop } = props;
  const { appId } = ids;

  return (
    <SheetModal
      sourceType={1}
      dialogVisible={true}
      appId={appId}
      projectId={projectId}
      viewId={''}
      worksheetInfo={dataSource}
      onChange={(worksheetId, viewId, appType) => {
        if (worksheetId) {
          setDataSource({ worksheetId, viewId, appType });
          onCreate();
        } else {
          alert(_l('请选择一个工作表来创建图表'), 3);
        }
      }}
      onChangeDialogVisible={onClose}
    />
  );
}

export default CreateAnalysis;
