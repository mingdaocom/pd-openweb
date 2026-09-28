import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Modal, Select } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import sheetAjax from 'src/api/worksheet';
import 'src/pages/widgetConfig/styled/style.less';
import { canEditApp } from 'src/utils/domain/permission/app';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { getShowViews } from 'src/utils/services/worksheet/view';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };

const initialConfig = [
  {
    text: _l('应用'),
    key: 'appId',
    listKey: 'apps',
    placeholder: _l('选择应用'),
  },
  {
    text: _l('工作表'),
    key: 'sheetId',
    listKey: 'sheets',
    placeholder: _l('选择工作表'),
  },
  {
    text: _l('视图'),
    key: 'viewId',
    listKey: 'views',
    placeholder: _l('选择视图'),
  },
];

export default function SelectViewFromSheet({ projectId, currentAppId, appId, sheetId, viewId, onOk, onCancel }) {
  const [data, setData] = useSetState({ apps: [], sheets: [], views: [] });
  const [ids, setIds] = useSetState({ appId, sheetId, viewId });

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

  // 加载工作表
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
            const curList = cur.workSheetInfo.filter(item => item.type === 0).filter(item => !item.urlTemplate);
            const curChildList = _.flatten(
              cur.childSections.map(item =>
                item.workSheetInfo.filter(item => item.type === 0).filter(item => !item.urlTemplate),
              ),
            );
            return total.concat(curList).concat(curChildList);
          }, [])
          .map(sheet => ({ text: sheet.workSheetName, value: sheet.workSheetId }));

        setData({ sheets, views: [] });
      });
  }, [ids.appId]);

  // 加载视图
  useEffect(() => {
    const currentSheet = _.find(data.sheets, item => item.value === ids.sheetId);

    if (!currentSheet) return;

    sheetAjax.getWorksheetInfo({ worksheetId: ids.sheetId, getViews: true }).then(({ views = [] }) => {
      const filterDetailViews = getShowViews(views).filter(v => String(v.viewType) !== VIEW_DISPLAY_TYPE.detail);
      setData({ views: filterDetailViews.map(view => ({ text: view.name, value: view.viewId, type: view.viewType })) });
    });
  }, [data.sheets, ids.sheetId]);

  const handleOk = () => {
    if (!ids.appId) {
      alert(_l('请选择应用'), 3);
      return;
    }

    if (!ids.sheetId) {
      alert(_l('请选择工作表'), 3);
      return;
    }

    if (!ids.viewId) {
      alert(_l('请选择视图'), 3);
      return;
    }

    const currentApp = _.find(data.apps, item => item.value === ids.appId);
    const currentSheet = _.find(data.sheets, item => item.value === ids.sheetId);
    const currentView = _.find(data.views, item => item.value === ids.viewId);

    onOk({
      appId: ids.appId,
      appName: currentApp.text,
      sheetId: ids.sheetId,
      sheetName: currentSheet.text,
      viewId: ids.viewId,
      viewName: currentView.text,
      type: currentView.type,
    });
  };

  return (
    <Modal
      width={560}
      open
      title={_l('选择视图')}
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
                setIds({ appId: value, sheetId: '', viewId: '' });
              } else if (key === 'sheetId') {
                setIds({ sheetId: value, viewId: '' });
              } else {
                setIds({ viewId: value });
              }
            }}
          />
        </div>
      ))}
    </Modal>
  );
}
