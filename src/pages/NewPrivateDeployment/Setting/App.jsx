import React, { Fragment, useState } from 'react';
import { Switch } from 'ming-ui';
import { Button } from 'antd';
import DataRestrictionDialog from './components/DataRestrictionDialog';
import RecycleBinDialog from './components/RecycleBinDialog';
import { updateSysSettings } from '../common';

const AppCreate = props => {
  const { SysSettings } = md.global;
  const [onlyAdminCreateApp, setOnlyAdminCreateApp] = useState(SysSettings.onlyAdminCreateApp);
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('应用创建')}</div>
      <div className="Gray_9e mBottom25">{_l('配置应用创建的权限')}</div>
      <div className="flexRow valignWrapper">
        <div className="flex flexColumn">
          <div className="Font14 bold mBottom8">{_l('允许非管理员创建应用')}</div>
        </div>
        <Switch
          checked={!onlyAdminCreateApp}
          onClick={value => {
            updateSysSettings({
              onlyAdminCreateApp: value
            }, () => {
              setOnlyAdminCreateApp(value);
              md.global.SysSettings.onlyAdminCreateApp = value;
            });
          }}
        />
      </div>
    </div>
  );
}

const DataRestriction = props => {
  const [dataRestrictionVisible, setDataRestrictionVisible] = useState(false);
  const [sysSettings, setSysSettings] = useState(md.global.SysSettings);
  const style = { width: 260 }
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('操作限制')}</div>
      <div className="Gray_9e mBottom18">{_l('配置应用下，批量数使用上限、附件上传大小上限、自定义页面统计图刷新时间间隔')}</div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('工作流获取批量数据上限')}</div><div>{_l('%0条', sysSettings.workflowBatchGetDataLimitCount)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('子流程可用数据源记录数上限')}</div><div>{_l('%0条', sysSettings.workflowSubProcessDataLimitCount)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('工作表Excel导入行数上限')}</div><div>{_l('%0行', sysSettings.worksheetExcelImportDataLimitCount)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('工作表批量数据操作上限')}</div><div>{_l('%0条', sysSettings.worktableBatchOperateDataLimitCount)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('单次附件上传上限')}</div><div>{`${sysSettings.fileUploadLimitSize}M`}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('自定义页面统计图刷新时间间隔')}</div><div>{_l('%0秒', sysSettings.refreshReportInterval)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('应用批量导出工作表上限')}</div><div>{_l('%0个', sysSettings.exportAppWorksheetLimitCount)}</div>
      </div>
      <div className="mTop5">
        <Button
          ghost
          type="primary"
          onClick={() => { setDataRestrictionVisible(true) }}
        >
          {_l('设置')}
        </Button>
      </div>
      {dataRestrictionVisible && (
        <DataRestrictionDialog
          visible={dataRestrictionVisible}
          onCancel={() => {
            setDataRestrictionVisible(false);
          }}
          onChange={(data) => {
            setSysSettings(data);
          }}
        />
      )}
    </div>
  );
}

const RecycleBin = props => {
  const { SysSettings } = md.global;
  const [recycleBinVisible, setRecycleBinVisible] = useState(false);
  const [sysSettings, setSysSettings] = useState(md.global.SysSettings);
  const style = { width: 120 }
  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('数据/文件回收站')}</div>
      <div className="Gray_9e mBottom18">{_l('配置应用、应用项、工作表数据删除后、在回收站中的保留时长，以及应用备份文件保留时长')}</div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('应用')}</div><div>{_l('%0天', sysSettings.appRecycleDays)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('应用项')}</div><div>{_l('%0天', sysSettings.appItemRecycleDays)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('工作表数据')}</div><div>{_l('%0天', sysSettings.worksheetRowRecycleDays)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="Gray_75">{_l('应用备份文件')}</div><div>{_l('%0天', sysSettings.appBackupRecycleDays)}</div>
      </div>
      <div className="mTop5">
        <Button
          ghost
          type="primary"
          onClick={() => { setRecycleBinVisible(true) }}
        >
          {_l('设置')}
        </Button>
      </div>
      {recycleBinVisible && (
        <RecycleBinDialog
          visible={recycleBinVisible}
          onCancel={() => {
            setRecycleBinVisible(false);
          }}
          onChange={(data) => {
            setSysSettings(data);
          }}
        />
      )}
    </div>
  );
}

export default props => {
  const { IsPlatformLocal } = md.global.Config;
  return (
    <Fragment>
      {!IsPlatformLocal && <AppCreate {...props} />}
      <DataRestriction {...props} />
      <RecycleBin {...props} />
    </Fragment>
  );
}
