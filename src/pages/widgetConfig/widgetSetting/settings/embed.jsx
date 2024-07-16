import React, { Fragment, useEffect } from 'react';
import { SettingItem, EditInfo, DisplayMode } from '../../styled';
import { Checkbox, Icon, LoadDiv } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import AttachmentConfig from '../components/AttachmentConfig';
import { useSetState } from 'react-use';
import worksheetAjax from 'src/api/worksheet';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import reportApi from 'statistics/api/report.js';
import SelectStaticChartFromSheet from '../components/embed/SelectStaticChartFromSheet';
import SelectViewFromSheet from '../components/embed/SelectViewFromSheet';
import FilterDialog from '../components/embed/filterDialog';
import { FilterItemTexts } from '../components/FilterData';
import { SYSTEM_CONTROL } from '../../config/widget';
import TextInput from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/TextInput';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import cx from 'classnames';
import _ from 'lodash';

const EMBED_TYPES = [
  {
    value: 2,
    text: _l('统计'),
    img: 'worksheet_column_chart',
    headerText: _l('图表'),
  },
  {
    value: 3,
    text: _l('视图'),
    img: 'view_eye',
    headerText: _l('视图'),
  },
  {
    value: 1,
    text: _l('链接'),
    img: 'link1',
    headerText: _l('链接'),
  },
];

const EmbedSettingWrap = styled.div`
  .tagInputareaIuput {
    min-height: 90px !important;
  }
`;

export default function Embed(props) {
  const { data = {}, allControls, globalSheetInfo, onChange } = props;
  const { dataSource, enumDefault, controlId, size } = data;
  const { height, allowlink, rownum = '10', filters = [] } = getAdvanceSetting(data);
  const { appid, wsid, reportid, type } = safeParse(dataSource || '{}');
  const [{ visible, filterVisible, isDelete, loading }, setCommonState] = useSetState({
    visible: false,
    filterVisible: false,
    isDelete: false,
    loading: false,
  });
  const [{ appId, sheetId, reportId, sheetName, reportName }, setChartInfo] = useSetState({
    appId: '',
    sheetId: '',
    reportId: '',
    sheetName: '',
    reportName: '',
  });
  const [{ worksheetId, viewType, controls }, setWorksheetInfo] = useSetState({
    worksheetId: '',
    viewType: '',
    controls: [],
  });

  const modeInfo = _.find(EMBED_TYPES, e => e.value === enumDefault) || {};

  const handleDynamicValueChange = (value = []) => {
    let formatValue = '';
    value.forEach(item => {
      const { cid, rcid, staticValue } = item;
      if (cid) {
        formatValue += rcid ? `$${cid}~${rcid}$` : `$${cid}$`;
      } else {
        formatValue += staticValue;
      }
    });
    onChange({ ...data, dataSource: formatValue });
  };

  const handleClear = () => {
    setCommonState({ visible: false, filterVisible: false, isDelete: false, loading: false });
    setChartInfo({ appId: '', sheetId: '', reportId: '', sheetName: '', reportName: '' });
    setWorksheetInfo({
      worksheetId: '',
      viewType: '',
      controls: [],
    });
  };

  const getSheetInfo = (id, currentReport) => {
    if (!id) return;

    worksheetAjax
      .getWorksheetInfo({
        worksheetId: id,
        getTemplate: true,
        getViews: true,
      })
      .then(({ template = {}, name, appId, views = [] }) => {
        if (enumDefault === 3) {
          const currentView = _.find(views, v => v.viewId === reportid);
          setChartInfo({
            appId,
            sheetId: id,
            reportId: _.get(currentView, 'viewId'),
            sheetName: name,
            reportName: _.get(currentView, 'name'),
          });
          setWorksheetInfo({
            worksheetId: id,
            controls: template.controls || [],
            viewType: _.get(currentView, 'viewType') || type,
          });
          setCommonState({ isDelete: !currentView, loading: false });
          return;
        }

        setChartInfo({
          appId: appid,
          sheetId: wsid,
          reportId: reportid,
          sheetName: name,
          reportName: currentReport.name,
        });
        setWorksheetInfo({ worksheetId: id, controls: template.controls || [] });
        setCommonState({ loading: false });
      })
      .catch(() => {
        setCommonState({ isDelete: true, loading: false });
      });
  };

  useEffect(() => {
    handleClear();
    if (wsid) {
      setCommonState({ loading: true });
      if (enumDefault === 3) {
        getSheetInfo(wsid);
      } else if (enumDefault === 2) {
        let requestApi;

        if (type === 1) {
          requestApi = reportApi.listByPageId({ appId: wsid });
        } else {
          requestApi = reportApi.list({
            appId: wsid,
            isOwner: false,
            pageIndex: 1,
            pageSize: 10000,
          });
        }

        requestApi
          .then(data => {
            const list = type === 1 ? data : data.reports;
            const currentReport = _.find(list || [], item => item.id === reportid);

            if (!currentReport) {
              setCommonState({ isDelete: true, loading: false });
            } else {
              const newSheetId = type === 1 ? currentReport.appId : wsid;
              getSheetInfo(newSheetId, currentReport);
            }
          })
          .catch(() => {
            setCommonState({ isDelete: true, loading: false });
          });
      }
    }
  }, [controlId, wsid, reportid, enumDefault]);

  const renderCom = (isDialog = false) => {
    const isViewDialogRender = isDialog && enumDefault === 3;
    return (
      <span className="flexCenter">
        {isViewDialogRender ? _l('在视图过滤的基础上叠加筛选条件') : _l('筛选%0', modeInfo.headerText)}
      </span>
    );
  };

  // 拼接当前记录
  const formatControls = allControls.concat([
    {
      controlId: 'current-rowid',
      controlName: _l('当前记录'),
      type: 29,
      dataSource: globalSheetInfo.worksheetId,
    },
  ]);

  return (
    <EmbedSettingWrap>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <DisplayMode>
          {EMBED_TYPES.map(({ value, text, img }) => {
            return (
              <div
                className={cx('displayItem', { active: enumDefault === value })}
                onClick={() => {
                  handleClear();
                  onChange({
                    enumDefault: value,
                    dataSource: enumDefault !== value ? '' : dataSource,
                    size: value === 3 ? 12 : size,
                  });
                }}
              >
                <div className="mBottom4">
                  <Icon icon={img} />
                </div>
                <span className="Gray_9e">{text}</span>
              </div>
            );
          })}
        </DisplayMode>
      </SettingItem>
      <SettingItem className="mTop10">
        <div className="settingItemTitle">{modeInfo.headerText}</div>
        {enumDefault !== 1 ? (
          <Fragment>
            {loading ? (
              <LoadDiv size="small" />
            ) : (
              <EditInfo onClick={() => setCommonState({ visible: true })} className={cx({ borderError: isDelete })}>
                <div className="overflow_ellipsis">
                  {isDelete ? (
                    <span className="Red">{_l('%0已删除', modeInfo.headerText)}</span>
                  ) : sheetName ? (
                    <span className="Gray">{_l('%0 - %1', sheetName, reportName)}</span>
                  ) : (
                    <span className="Gray_9e">{_l('选择%0', modeInfo.headerText)}</span>
                  )}
                </div>
                {!isDelete && sheetId && (
                  <div className="edit">
                    <i className="icon-edit"></i>
                  </div>
                )}
              </EditInfo>
            )}
          </Fragment>
        ) : (
          <TextInput
            {...props}
            controls={allControls.filter(i => !_.includes([29, 35], i.type))}
            dynamicValue={transferValue(dataSource)}
            hideSearchAndFun
            propFiledVisible
            onDynamicValueChange={handleDynamicValueChange}
          />
        )}
      </SettingItem>

      {viewType !== 0 ? (
        <SettingItem>
          <div className="settingItemTitle">{_l('最大高度')}</div>
          <div className="labelWrap flexCenter">
            <Input
              value={height}
              className="Width90 mRight12"
              onChange={e => {
                const value = e.target.value.trim();
                onChange(handleAdvancedSettingChange(data, { height: value.replace(/[^\d]/g, '') }));
              }}
              onBlur={e => {
                let value = e.target.value.trim();
                if (value > 1000) {
                  value = 1000;
                }
                if (value < 100) {
                  value = 100;
                }
                onChange(handleAdvancedSettingChange(data, { height: value }));
              }}
            />
            <span>px</span>
          </div>
        </SettingItem>
      ) : (
        <SettingItem>
          <div className="settingItemTitle">{_l('每页行数')}</div>
          <div className="flexCenter">
            <AttachmentConfig
              data={handleAdvancedSettingChange(data, { rownum })}
              attr="rownum"
              maxNum={50}
              onChange={value => {
                let tempRowNum = getAdvanceSetting(value, 'rownum');
                if (tempRowNum > 50) {
                  tempRowNum = 50;
                }
                onChange(handleAdvancedSettingChange(data, { rownum: tempRowNum.toString() }));
              }}
            />
            <span className="mLeft12">{_l('行')}</span>
          </div>
        </SettingItem>
      )}
      {enumDefault !== 1 ? (
        <SettingItem>
          <div className="settingItemTitle">{_l('过滤')}</div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              checked={filters.length > 0}
              onClick={checked => {
                if (checked) {
                  onChange(
                    handleAdvancedSettingChange(data, {
                      filters: '',
                    }),
                  );
                } else {
                  setCommonState({ filterVisible: true });
                }
              }}
            >
              {renderCom()}
            </Checkbox>
          </div>
          {!_.isEmpty(filters) && (
            <FilterItemTexts
              {...props}
              loading={loading}
              controls={controls}
              allControls={formatControls.concat(SYSTEM_CONTROL)}
              editFn={() => setCommonState({ filterVisible: true })}
            />
          )}
        </SettingItem>
      ) : (
        <div className="labelWrap mTop15">
          <Checkbox
            size="small"
            checked={allowlink === '1'}
            text={_l('允许新页面打开链接')}
            onClick={checked => {
              onChange(
                handleAdvancedSettingChange(data, {
                  allowlink: checked ? '0' : '1',
                }),
              );
            }}
          />
        </div>
      )}

      {filterVisible && (
        <FilterDialog
          data={data}
          controls={controls}
          titleCom={renderCom(true)}
          allControls={formatControls}
          globalSheetInfo={globalSheetInfo}
          onOk={conditions => {
            onChange(
              handleAdvancedSettingChange(data, {
                filters: JSON.stringify(conditions),
              }),
            );
            setCommonState({ filterVisible: false });
          }}
          onClose={() => setCommonState({ filterVisible: false })}
        />
      )}

      {/**统计图 */}
      {visible && enumDefault === 2 && (
        <SelectStaticChartFromSheet
          currentAppId={globalSheetInfo.appId}
          projectId={globalSheetInfo.projectId}
          appId={appId || globalSheetInfo.appId}
          sheetId={sheetId}
          reportId={reportId}
          onOk={ids => {
            setChartInfo(ids);
            onChange({
              ...(ids.sheetId !== wsid ? handleAdvancedSettingChange(data, { filters: '' }) : {}),
              dataSource: JSON.stringify({
                appid: ids.appId,
                wsid: ids.sheetId,
                reportid: ids.reportId,
                type: ids.type,
              }),
            });
            setCommonState({ visible: false });
          }}
          onCancel={() => setCommonState({ visible: false })}
        />
      )}

      {/**视图 */}
      {visible && enumDefault === 3 && (
        <SelectViewFromSheet
          currentAppId={globalSheetInfo.appId}
          projectId={globalSheetInfo.projectId}
          appId={appId || globalSheetInfo.appId}
          sheetId={sheetId}
          viewId={reportId}
          onOk={ids => {
            setChartInfo({ ..._.omit(ids, ['viewId', 'viewName']), reportId: ids.viewId, reportName: ids.viewName });
            setWorksheetInfo({ viewType: ids.type });
            onChange({
              ...(ids.sheetId !== wsid ? handleAdvancedSettingChange(data, { filters: '' }) : {}),
              dataSource: JSON.stringify({
                appid: ids.appId,
                wsid: ids.sheetId,
                reportid: ids.viewId,
                type: ids.type,
              }),
            });
            setCommonState({ visible: false });
          }}
          onCancel={() => setCommonState({ visible: false })}
        />
      )}
    </EmbedSettingWrap>
  );
}
