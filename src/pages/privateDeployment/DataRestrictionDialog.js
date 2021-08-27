import React, { Component, Fragment } from 'react';
import { Dialog, Input } from 'ming-ui';
import privateSysSetting from 'src/api/privateSysSetting';

const formattingValue = (value = 1) => {
  value = parseInt(value);
  return isNaN(value) ? '' : value;
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
          alert(_l('修改成功'), 1);
        }
      });
    } else {
      alert(_l('请输入数值'), 2);
    }
  }
  render() {
    const { workflowBatchGetDataLimitCount, worktableBatchOperateDataLimitCount, fileUploadLimitSize, refreshReportInterval, workflowSubProcessDataLimitCount, worksheetExcelImportDataLimitCount } = this.state;
    return (
      <Dialog
        visible={true}
        anim={false}
        title={_l('数据操作设置')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mTop20 mBottom20">
          <div className="mBottom5 Font14">{_l('工作流获取批量数据上限')}</div>
          <Input className="Width120 mRight10" value={workflowBatchGetDataLimitCount} onChange={value => { this.setState({ workflowBatchGetDataLimitCount: formattingValue(value) }) }}/>
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('子流程可用数据源记录数上限')}</div>
          <Input className="Width120 mRight10" value={workflowSubProcessDataLimitCount} onChange={value => { this.setState({ workflowSubProcessDataLimitCount: formattingValue(value) }) }}/>
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('工作表Excel导入行数上限')}</div>
          <Input className="Width120 mRight10" value={worksheetExcelImportDataLimitCount} onChange={value => { this.setState({ worksheetExcelImportDataLimitCount: formattingValue(value) }) }}/>
          <span>{_l('行')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('工作表批量数据操作上限')}</div>
          <Input className="Width120 mRight10" value={worktableBatchOperateDataLimitCount} onChange={value => { this.setState({ worktableBatchOperateDataLimitCount: formattingValue(value) }) }}/>
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('附件上传上限（单个）')}</div>
          <Input className="Width120 mRight10" value={fileUploadLimitSize} onChange={value => { this.setState({ fileUploadLimitSize: formattingValue(value) }) }}/>
          <span>M</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('自定义页面统计图刷新时间间隔')}</div>
          <Input className="Width120 mRight10" value={refreshReportInterval} onChange={value => { this.setState({ refreshReportInterval: formattingValue(value) }) }}/>
          <span>{_l('秒')}</span>
        </div>
      </Dialog>
    );
  }
}
