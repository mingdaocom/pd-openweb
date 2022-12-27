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
};

export default class DataRestrictionDialog extends Component {
  constructor(props) {
    super(props);
    const {
      workflowBatchGetDataLimitCount,
      worktableBatchOperateDataLimitCount,
      fileUploadLimitSize,
      refreshReportInterval,
      workflowSubProcessDataLimitCount,
      worksheetExcelImportDataLimitCount,
      exportAppWorksheetLimitCount,
    } = md.global.SysSettings;
    this.state = {
      workflowBatchGetDataLimitCount,
      worktableBatchOperateDataLimitCount,
      fileUploadLimitSize,
      refreshReportInterval,
      workflowSubProcessDataLimitCount,
      worksheetExcelImportDataLimitCount,
      exportAppWorksheetLimitCount,
    };
  }
  handleSave = () => {
    const {
      workflowBatchGetDataLimitCount,
      worktableBatchOperateDataLimitCount,
      fileUploadLimitSize,
      refreshReportInterval,
      workflowSubProcessDataLimitCount,
      worksheetExcelImportDataLimitCount,
      exportAppWorksheetLimitCount,
    } = this.state;

    if (
      workflowBatchGetDataLimitCount &&
      worktableBatchOperateDataLimitCount &&
      fileUploadLimitSize &&
      refreshReportInterval &&
      exportAppWorksheetLimitCount
    ) {
      privateSysSetting
        .editSysSettings({
          settings: {
            workflowBatchGetDataLimitCount,
            worktableBatchOperateDataLimitCount,
            fileUploadLimitSize,
            refreshReportInterval,
            workflowSubProcessDataLimitCount,
            worksheetExcelImportDataLimitCount,
            exportAppWorksheetLimitCount,
          },
        })
        .then(result => {
          if (result) {
            md.global.SysSettings.workflowBatchGetDataLimitCount = workflowBatchGetDataLimitCount;
            md.global.SysSettings.worktableBatchOperateDataLimitCount = worktableBatchOperateDataLimitCount;
            md.global.SysSettings.fileUploadLimitSize = fileUploadLimitSize;
            md.global.SysSettings.refreshReportInterval = refreshReportInterval;
            md.global.SysSettings.workflowSubProcessDataLimitCount = workflowSubProcessDataLimitCount;
            md.global.SysSettings.worksheetExcelImportDataLimitCount = worksheetExcelImportDataLimitCount;
            md.global.SysSettings.exportAppWorksheetLimitCount = exportAppWorksheetLimitCount;
            this.props.onCancel();
            this.props.onChange(md.global.SysSettings);
            alert(_l('修改成功'), 1);
          }
        });
    } else {
      alert(_l('请输入数值'), 2);
    }
  };
  render() {
    const { visible } = this.props;
    const {
      workflowBatchGetDataLimitCount,
      worktableBatchOperateDataLimitCount,
      fileUploadLimitSize,
      refreshReportInterval,
      workflowSubProcessDataLimitCount,
      worksheetExcelImportDataLimitCount,
      exportAppWorksheetLimitCount,
    } = this.state;
    return (
      <Dialog
        visible={visible}
        anim={false}
        title={_l('数据操作设置')}
        width={560}
        onOk={this.handleSave}
        onCancel={this.props.onCancel}
      >
        <div className="mTop20 mBottom20">
          <div className="mBottom5 Font14">{_l('工作流获取批量数据上限（最大2000）')}</div>
          <Input
            className="Width120 mRight10"
            value={workflowBatchGetDataLimitCount}
            onChange={value => {
              this.setState({ workflowBatchGetDataLimitCount: formattingValue(value, 2000) });
            }}
          />
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('子流程可用数据源记录数上限（最大20000）')}</div>
          <Input
            className="Width120 mRight10"
            value={workflowSubProcessDataLimitCount}
            onChange={value => {
              this.setState({ workflowSubProcessDataLimitCount: formattingValue(value, 20000) });
            }}
          />
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('工作表Excel导入行数上限（最大40000）')}</div>
          <Input
            className="Width120 mRight10"
            value={worksheetExcelImportDataLimitCount}
            onChange={value => {
              this.setState({ worksheetExcelImportDataLimitCount: formattingValue(value, 40000) });
            }}
          />
          <span>{_l('行')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('工作表批量数据操作上限（最大10000）')}</div>
          <Input
            className="Width120 mRight10"
            value={worktableBatchOperateDataLimitCount}
            onChange={value => {
              this.setState({ worktableBatchOperateDataLimitCount: formattingValue(value, 10000) });
            }}
          />
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('附件上传上限（单个）')}</div>
          <Input
            className="Width120 mRight10"
            value={fileUploadLimitSize}
            onChange={value => {
              this.setState({ fileUploadLimitSize: formattingValue(value) });
            }}
          />
          <span>M</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('自定义页面统计图刷新时间间隔')}</div>
          <Input
            className="Width120 mRight10"
            value={refreshReportInterval}
            onChange={value => {
              this.setState({ refreshReportInterval: formattingValue(value) });
            }}
          />
          <span>{_l('秒')}</span>
        </div>
        <div className="mBottom20">
          <div className="mBottom5 Font14">{_l('应用批量导出工作表上限（最大500）')}</div>
          <Input
            className="Width120 mRight10"
            value={exportAppWorksheetLimitCount}
            onChange={value => {
              this.setState({ exportAppWorksheetLimitCount: formattingValue(value, 200) });
            }}
          />
          <span>{_l('个')}</span>
        </div>
      </Dialog>
    );
  }
}
