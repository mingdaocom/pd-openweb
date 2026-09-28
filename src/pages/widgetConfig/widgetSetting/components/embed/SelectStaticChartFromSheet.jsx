import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Modal, Select } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import reportApi from 'statistics/api/report.js';
import 'src/pages/widgetConfig/styled/style.less';
import { canEditApp } from 'src/utils/domain/permission/app';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const initialConfig = [
  {
    text: _l('应用'),
    key: 'appId',
    listKey: 'apps',
    placeholder: _l('选择应用'),
  },
  {
    text: _l('应用项'),
    key: 'sheetId',
    listKey: 'sheets',
    placeholder: _l('选择工作表/自定义页面'),
  },
  {
    text: _l('统计图表'),
    key: 'reportId',
    listKey: 'reports',
    placeholder: _l('选择统计图表'),
  },
];

export default function SelectStaticChartFromSheet({
  projectId,
  currentAppId,
  appId,
  sheetId,
  reportId,
  onOk,
  onCancel,
}) {
  const [data, setData] = useSetState({ apps: [], sheets: [], reports: [] });
  const [ids, setIds] = useSetState({ appId, sheetId, reportId });

  // 加载应用列表
  useEffect(() => {
    homeAppAjax.getAllHomeApp().then(data => {
      const apps = _.flatten(
        data.validProject.filter(project => project.projectId === projectId).map(project => project.projectApps),
      )
        .concat(data.externalApps.filter(app => app.projectId === projectId))
        .filter(app => canEditApp(app.permissionType) && !app.isLock)
        .map(app => ({ text: app.id === currentAppId ? _l('%0  (本应用)', app.name) : app.name, value: app.id }));

      setData({ apps });
    });
  }, []);

  // 加载应用表列表
  useEffect(() => {
    if (!ids.appId) return;

    homeAppAjax
      .getApp({
        appId: ids.appId,
        getSection: true,
      })
      .then(({ sections = [] }) => {
        const sheets = sections
          .reduce((total, cur) => {
            const curList = cur.workSheetInfo.filter(item => item.type !== 2).filter(item => !item.urlTemplate);
            const curChildList = _.flatten(
              cur.childSections.map(item => item.workSheetInfo.filter(item => !item.urlTemplate)),
            );
            return total.concat(curList).concat(curChildList);
          }, [])
          .map(sheet => ({ text: sheet.workSheetName, value: sheet.workSheetId, type: sheet.type }));

        setData({ sheets, reports: [] });
      });
  }, [ids.appId]);

  // 加载应用统计图
  useEffect(() => {
    const currentSheet = _.find(data.sheets, item => item.value === ids.sheetId);

    if (!currentSheet) return;

    // 自定义页面
    if (currentSheet.type === 1) {
      reportApi.listByPageId({ appId: ids.sheetId }).then(data => {
        setData({ reports: data.map(report => ({ text: report.name, value: report.id })) });
      });
    } else {
      reportApi
        .list({
          appId: ids.sheetId,
          isOwner: false,
          pageIndex: 1,
          pageSize: 10000,
        })
        .then(({ reports = [] }) => {
          setData({ reports: reports.map(report => ({ text: report.name, value: report.id })) });
        });
    }
  }, [data.sheets, ids.sheetId]);

  const handleOk = () => {
    if (!ids.appId) {
      alert(_l('请选择应用'), 3);
      return;
    }

    if (!ids.sheetId) {
      alert(_l('请选择应用项'), 3);
      return;
    }

    if (!ids.reportId) {
      alert(_l('请选择统计图表'), 3);
      return;
    }

    const currentApp = _.find(data.apps, item => item.value === ids.appId);
    const currentSheet = _.find(data.sheets, item => item.value === ids.sheetId);
    const currentReport = _.find(data.reports, item => item.value === ids.reportId);

    onOk({
      appId: ids.appId,
      appName: currentApp.text,
      sheetId: ids.sheetId,
      sheetName: currentSheet.text,
      reportId: ids.reportId,
      reportName: currentReport.text,
      type: currentSheet.type,
    });
  };

  return (
    <Modal
      width={560}
      open
      title={_l('选择统计图表')}
      mask={{ closable: true }}
      keyboard
      onOk={handleOk}
      onCancel={onCancel}
    >
      {initialConfig.map(({ text, key, listKey, placeholder }, index) => (
        <div key={key}>
          <div className={cx('title Bold', { mTop20: index !== 0 })}>{text}</div>
          <Select
            className="mTop5 w100"
            value={data[listKey].length && _.find(data[listKey], o => o.value === ids[key]) ? ids[key] : undefined}
            showPopupSearch
            optionFilterProp="text"
            listHeight={160}
            placeholder={placeholder}
            options={data[listKey]}
            fieldNames={SELECT_FIELD_NAMES}
            onChange={value => {
              if (key === 'appId') {
                setIds({ appId: value, sheetId: '', reportId: '' });
              } else if (key === 'sheetId') {
                setIds({ sheetId: value, reportId: '' });
              } else {
                setIds({ reportId: value });
              }
            }}
          />
        </div>
      ))}
    </Modal>
  );
}
