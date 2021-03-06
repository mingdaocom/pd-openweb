import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';

const formattingValue = (value = 1, maxValue) => {
  value = parseInt(value);
  if (isNaN(value)) {
    return '';
  }
  if (maxValue && value > maxValue) {
    return maxValue;
  }
  return value;
}

export default class DataRestrictionDialog extends Component {
  constructor(props) {
    super(props);
    const { workflowBatchGetDataLimitCount, worktableBatchOperateDataLimitCount, fileUploadLimitSize, refreshReportInterval, workflowSubProcessDataLimitCount, worksheetExcelImportDataLimitCount } = md.global.SysSettings;
    this.state = {
      workflowBatchGetDataLimitCount,
      worktableBatchOperateDataLimitCount,
      fileUploadLimitSize,
      refreshReportInterval,
      workflowSubProcessDataLimitCount,
      worksheetExcelImportDataLimitCount
    }
  }
  handleSave = () => {
    const { workflowBatchGetDataLimitCount, worktableBatchOperateDataLimitCount, fileUploadLimitSize, refreshReportInterval, workflowSubProcessDataLimitCount, worksheetExcelImportDataLimitCount } = this.state;

    if (workflowBatchGetDataLimitCount && worktableBatchOperateDataLimitCount && fileUploadLimitSize && refreshReportInterval) {
      privateSysSetting.editSysSettings({
        settings: {
          workflowBatchGetDataLimitCount,
          worktableBatchOperateDataLimitCount,
          fileUploadLimitSize,
          refreshReportInterval,
          workflowSubProcessDataLimitCount,
          worksheetExcelImportDataLimitCount
        }
      }).then(result => {
        if (result) {
          this.props.onCancel();
          md.global.SysSettings.workflowBatchGetDataLimitCount = workflowBatchGetDataLimitCount;
          md.global.SysSettings.worktableBatchOperateDataLimitCount = worktableBatchOperateDataLimitCount;
          md.global.SysSettings.fileUploadLimitSize = fileUploadLimitSize;
          md.global.SysSettings.refreshReportInterval = refreshReportInterval;
          md.global.SysSettings.workflowSubProcessDataLimitCount = workflowSubProcessDataLimitCount;
          md.global.SysSettings.worksheetExcelImportDataLimitCount = worksheetExcelImportDataLimitCount;
          alert(_l('????????????'), 1);
        }
      });
    } else {
      alert(_l('???????????????'), 2);
    }
  }
  render() {
    const { workflowBatchGetDataLimitCount, worktableBatchOperateDataLimitCount, fileUploadLimitSize, refreshReportInterval, workflowSubProcessDataLimitCount, worksheetExcelImportDataLimitCount } = this.state;
    return (
      <Dialog
        visible={true}
        anim={false}
        title={_l('??????????????????')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mTop20 mBottom20">
          <div className="mBottom5 Font14">{_l('??????????????????????????????????????????2000???')}</div>
          <Input className="Width120 mRight10" value={workflowBatchGetDataLimitCount} onChange={value => { this.setState({ workflowBatchGetDataLimitCount: formattingValue(value, 2000) }) }}/>
          <span>{_l('???')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('????????????????????????????????????????????????20000???')}</div>
          <Input className="Width120 mRight10" value={workflowSubProcessDataLimitCount} onChange={value => { this.setState({ workflowSubProcessDataLimitCount: formattingValue(value, 20000) }) }}/>
          <span>{_l('???')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('?????????Excel???????????????????????????40000???')}</div>
          <Input className="Width120 mRight10" value={worksheetExcelImportDataLimitCount} onChange={value => { this.setState({ worksheetExcelImportDataLimitCount: formattingValue(value, 40000) }) }}/>
          <span>{_l('???')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('??????????????????????????????????????????10000???')}</div>
          <Input className="Width120 mRight10" value={worktableBatchOperateDataLimitCount} onChange={value => { this.setState({ worktableBatchOperateDataLimitCount: formattingValue(value, 10000) }) }}/>
          <span>{_l('???')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('??????????????????????????????')}</div>
          <Input className="Width120 mRight10" value={fileUploadLimitSize} onChange={value => { this.setState({ fileUploadLimitSize: formattingValue(value) }) }}/>
          <span>M</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('??????????????????????????????????????????')}</div>
          <Input className="Width120 mRight10" value={refreshReportInterval} onChange={value => { this.setState({ refreshReportInterval: formattingValue(value) }) }}/>
          <span>{_l('???')}</span>
        </div>
      </Dialog>
    );
  }
}
