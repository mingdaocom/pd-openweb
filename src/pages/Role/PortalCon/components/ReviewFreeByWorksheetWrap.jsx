import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoadDiv } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { SearchWorksheetWrap } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/styled';
import SelectWorksheet from 'src/pages/widgetConfig/widgetSetting/components/SearchWorksheet/SelectWorksheet';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import { getTranslateInfo } from 'src/utils/services/app';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';

const renderSearchCom = () => {
  return (
    <React.Fragment>
      <i className="icon icon-add"></i>
      {_l('筛选条件')}
    </React.Fragment>
  );
};

const SELECT_OTHER_WORKSHEET = '__select_other_worksheet__';
const DELETED_WORKSHEET = '__deleted_worksheet__';

export default function ReviewFreeByWorksheetWrap(props) {
  const { appId, projectId, onChange, query, canChooseOtherApp } = props;
  const [visible, setVisible] = useState(false);
  const [sheetList, setSheetList] = useState([]);
  const [pendingSheet, setPendingSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);
  const loadedWorksheetKeyRef = useRef('');
  const {
    sourceId = '',
    sourceName = '',
    templates = {},
    items: queryItems = [],
    appName: sourceAppName = '',
  } = query || {};
  const { controls = [] } = templates;
  const sheetId = pendingSheet?.sheetId || sourceId;
  const sheetName = pendingSheet?.sheetName ?? sourceName;
  const appName = pendingSheet?.appName ?? sourceAppName;
  const items = pendingSheet ? [] : queryItems;

  useEffect(() => {
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      setSheetList(
        res.map(sheet => ({
          ...sheet,
          workSheetName: getTranslateInfo(appId, null, sheet.workSheetId).name || sheet.workSheetName,
        })),
      );
      setLoading(false);
    });
  }, [appId]);

  const loadWorksheet = useCallback(
    ({ workSheetId, workSheetName, appName: nextAppName = '', clearConditions = false, showPending = true }) => {
      if (!workSheetId) return;

      const requestId = ++requestIdRef.current;
      loadedWorksheetKeyRef.current = `${appId}:${workSheetId}`;
      if (showPending) {
        setPendingSheet({ sheetId: workSheetId, sheetName: workSheetName, appName: nextAppName });
      }

      return worksheetAjax
        .getWorksheetInfo({ worksheetId: workSheetId, getTemplate: true, appId })
        .then(res => {
          if (requestId !== requestIdRef.current) return;

          const nextTemplate = {
            ...res.template,
            controls: replaceControlsTranslateInfo(appId, workSheetId, res.template.controls),
          };
          const worksheetData = {
            sourceId: workSheetId,
            sourceName: res.name,
            templates: nextTemplate,
            appName: nextAppName,
          };

          onChange({
            ...query,
            ...(clearConditions ? { ...worksheetData, configs: [], items: [] } : worksheetData),
          });
        })
        .catch(_requestError => {
          if (requestId === requestIdRef.current) {
            alertIfNotUnauthorized(_requestError, _l('获取工作表信息失败'), 2);
          }
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setPendingSheet(null);
          }
        });
    },
    [appId, onChange, query],
  );

  useEffect(() => {
    const worksheetKey = `${appId}:${sourceId}`;
    if (!sourceId || loadedWorksheetKeyRef.current === worksheetKey) return;

    loadWorksheet({
      workSheetId: sourceId,
      workSheetName: sourceName,
      appName: sourceAppName,
      showPending: false,
    });
  }, [appId, loadWorksheet, sourceAppName, sourceId, sourceName]);

  if (loading) {
    return <LoadDiv className="mTop10" />;
  }

  const isSheetDelete = !sheetId && !!sheetName;
  const worksheetOptions = sheetList
    .map(item => ({
      value: item.workSheetId,
      label: item.workSheetName,
    }))
    .concat(
      canChooseOtherApp
        ? [{ value: SELECT_OTHER_WORKSHEET, label: _l('其他应用下的工作表'), className: 'colorPrimary' }]
        : [],
    );

  return (
    <React.Fragment>
      <SearchWorksheetWrap>
        <SettingItem className="mTop8">
          <div className="settingItemTitle">{_l('工作表')}</div>
          <Select
            className="w100"
            value={sheetId || (sheetName ? DELETED_WORKSHEET : undefined)}
            placeholder={_l('选择工作表')}
            showSearch
            optionFilterProp="label"
            listHeight={300}
            options={worksheetOptions}
            notFoundContent={<span className="textTertiary">{_l('暂无搜索结果')}</span>}
            labelRender={({ label }) =>
              isSheetDelete ? (
                <span className="Red">{_l('工作表已删除')}</span>
              ) : (
                <span className="textPrimary">
                  {sheetName || label}
                  {appName && <span>（{appName}）</span>}
                </span>
              )
            }
            onChange={(value, option) => {
              if (value === SELECT_OTHER_WORKSHEET) {
                setVisible(true);
                return;
              }

              loadWorksheet({
                workSheetId: value,
                workSheetName: option.label,
                clearConditions: true,
              });
            }}
          />
        </SettingItem>
        <SettingItem>
          <div className="settingItemTitle">{_l('查询满足以下条件的记录')}</div>
          {sheetId ? (
            <SingleFilter
              canEdit
              feOnly
              id={sheetId}
              projectId={projectId}
              appId={appId}
              showSystemControls
              columns={controls}
              conditions={items}
              from="portal"
              conditionItemForDynamicStyle
              globalSheetControls={controls}
              onConditionsChange={conditions => {
                const newConditions = conditions.map(item => {
                  return item.isDynamicsource ? { ...item, values: [], value: '' } : item;
                });
                onChange({
                  ...query,
                  items: newConditions,
                });
              }}
              comp={renderSearchCom}
            />
          ) : (
            <div className="addFilterCondition pointer">
              <span
                onClick={() => {
                  if (!sheetId) {
                    alert(_l('请选择工作表'), 3);
                    return;
                  }
                }}
              >
                {renderSearchCom()}
              </span>
            </div>
          )}
        </SettingItem>
      </SearchWorksheetWrap>
      {visible && (
        <SelectWorksheet
          visible={visible}
          appId={appId}
          sheetId={sheetId}
          globalSheetInfo={{ projectId, appId }}
          onClose={() => {
            setVisible(false);
          }}
          onOk={data => {
            loadWorksheet({
              workSheetId: data.sheetId,
              workSheetName: _l('加载中...'),
              appName: data.appName,
            });
          }}
        />
      )}
    </React.Fragment>
  );
}
