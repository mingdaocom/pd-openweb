import React, { Fragment, useState } from 'react';
import { Switch, Icon } from 'ming-ui';
import { Button, Tooltip } from 'antd';
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
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="flexRow valignWrapper Gray_75">
          {_l('非子流程节点数据处理上限')}
          <Tooltip title={_l('工作流“获取多条数据”节点获取的数据，被后续数据处理节点(非子流程)使用时，可处理的数据量上限')} placement="bottom">
            <Icon className="Font16 Gray_bd pointer mLeft3" icon="info_outline" />
          </Tooltip>
        </div>
        <div>{_l('%0条', sysSettings.workflowBatchGetDataLimitCount)}</div>
      </div>
      <div className="flexRow valignWrapper mBottom15">
        <div style={style} className="flexRow valignWrapper Gray_75">
          {_l('子流程节点可处理的数据上限')}
          <Tooltip title={_l('工作流“获取多条数据”节点获取的数据，被子流程节点使用时，可处理的数据量上限')} placement="bottom">
            <Icon className="Font16 Gray_bd pointer mLeft3" icon="info_outline" />
          </Tooltip>
        </div>
        <div>{_l('%0条', sysSettings.workflowSubProcessDataLimitCount)}</div>
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
      <div className="Font17 bold mBottom8">{_l('数据回收站/备份文件保留时长')}</div>
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
