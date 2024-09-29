import React, { Component, Fragment } from 'react';
import { Dialog, Input, Icon } from 'ming-ui';
import { Tooltip } from 'antd';
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
      workflowSubProcessDataLimitCount &&
      worksheetExcelImportDataLimitCount &&
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
      alert(_l('请输入0以上的整数'), 2);
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
          <div className="flexRow valignWrapper mBottom5 Font14">
            {_l('非子流程节点数据处理上限（最大200）')}
            <Tooltip title={_l('工作流“获取多条数据”节点获取的数据，被后续数据处理节点(非子流程)使用时，可处理的数据量上限')} placement="bottom">
              <Icon className="Font16 Gray_bd pointer" icon="info_outline" />
            </Tooltip>
          </div>
          <Input
            className="Width120 mRight10"
            value={workflowBatchGetDataLimitCount}
            onChange={value => {
              this.setState({ workflowBatchGetDataLimitCount: formattingValue(value, 200) });
            }}
          />
          <span>{_l('条')}</span>
        </div>
        <div className="mBottom20">
          <div className="flexRow valignWrapper mBottom5 Font14">
            {_l('子流程节点可处理的数据上限（最大20000）')}
            <Tooltip title={_l('工作流“获取多条数据”节点获取的数据，被子流程节点使用时，可处理的数据量上限')} placement="bottom">
              <Icon className="Font16 Gray_bd pointer" icon="info_outline" />
            </Tooltip>
          </div>
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
          <div className="mBottom5 Font14">{_l('单附件上传大小上限（最大4096）')}</div>
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
              this.setState({ exportAppWorksheetLimitCount: formattingValue(value, 500) });
            }}
          />
          <span>{_l('个')}</span>
        </div>
      </Dialog>
    );
  }
}
