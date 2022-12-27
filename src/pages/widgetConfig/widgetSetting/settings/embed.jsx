import React, { Fragment, useEffect } from 'react';
import { SettingItem, EditInfo } from '../../styled';
import { Checkbox, Dropdown, LoadDiv } from 'ming-ui';
import { Input } from 'antd';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import worksheetAjax from 'src/api/worksheet';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../util/setting';
import reportApi from 'statistics/api/report.js';
import SelectStaticChartFromSheet from '../components/embed/SelectStaticChartFromSheet';
import FilterDialog from '../components/embed/filterDialog';
import { FilterItemTexts } from '../components/FilterData';
import { SYSTEM_CONTROL } from '../../config/widget';
import TextInput from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/inputTypes/TextInput';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import cx from 'classnames';
import _ from 'lodash';

const EMBED_TYPES = [
  {
    value: 1,
    text: _l('URL'),
  },
  {
    value: 2,
    text: _l('统计图表'),
  },
];

const EmbedSettingWrap = styled.div`
  .tagInputareaIuput {
    min-height: 90px !important;
  }
`;

export default function Embed(props) {
  const { data = {}, allControls, globalSheetInfo, onChange } = props;
  const { dataSource = '', enumDefault, controlId } = data;
  const { height, allowlink, filters = [] } = getAdvanceSetting(data);
  const [{ visible, filterVisible, isChartDelete, loading }, setCommonState] = useSetState({
    visible: false,
    filterVisible: false,
    isChartDelete: false,
    loading: false,
  });
  const [{ sheetId, reportId, pageName, reportName }, setChartInfo] = useSetState({
    sheetId: '',
    reportId: '',
    pageName: '',
    reportName: '',
  });
  const [{ worksheetId, worksheetName, controls }, setWorksheetInfo] = useSetState({
    worksheetId: '',
    worksheetName: '',
    controls: [],
  });

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
    setCommonState({ visible: false, filterVisible: false, isChartDelete: false, loading: false });
    setChartInfo({ sheetId: '', reportId: '', pageName: '', reportName: '' });
    setWorksheetInfo({
      worksheetId: '',
      worksheetName: '',
      controls: [],
    });
  };

  useEffect(() => {
    handleClear();
    if (dataSource && enumDefault === 2) {
      setCommonState({ loading: true });
      // type  自定义页面：1，工作表：0
      const { wsid, reportid, type } = JSON.parse(dataSource || '{}');

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
            setCommonState({ isChartDelete: true, loading: false });
          } else {
            setChartInfo({
              sheetId: wsid,
              reportId: reportid,
              pageName: currentReport.pageName || '',
              reportName: currentReport.name,
            });
            setWorksheetInfo({ worksheetId: type === 1 ? currentReport.appId : wsid });

            if (worksheetId) setCommonState({ loading: false });
          }
        })
        .fail(() => {
          setCommonState({ isChartDelete: true, loading: false });
        });
    }
  }, [controlId]);

  useEffect(() => {
    if (!worksheetId) return;
    if (!loading) setCommonState({ loading: true });

    worksheetAjax.getWorksheetInfo({
      worksheetId: worksheetId,
      getTemplate: true,
      getViews: false,
    })
      .then(({ template = {}, name }) => {
        if (!pageName) setChartInfo({ pageName: name });
        setWorksheetInfo({ controls: template.controls || [], worksheetName: name });
        setCommonState({ isChartDelete: !reportName || !name, loading: false });
      })
      .always(() => {
        setCommonState({ loading: false });
      });
  }, [worksheetId]);

  const renderCom = () => {
    return (
      <span className="flexCenter">
        {_l('筛选工作表')}
        {!loading && dataSource && (
          <span className={cx('Bold mLeft3', { Red: isChartDelete })}>
            {isChartDelete ? _l('图表已删除') : worksheetName}
          </span>
        )}
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
        <Dropdown
          border
          data={EMBED_TYPES}
          value={enumDefault}
          onChange={value => {
            if (value === 1) {
              handleClear();
            }
            onChange({ enumDefault: value, dataSource: enumDefault !== value ? '' : dataSource });
          }}
        />
      </SettingItem>
      <SettingItem>
        {enumDefault === 2 ? (
          <Fragment>
            {loading ? (
              <LoadDiv size="small" />
            ) : (
              <EditInfo
                onClick={() => setCommonState({ visible: true })}
                className={cx({ borderError: isChartDelete })}
              >
                <div className="overflow_ellipsis">
                  {isChartDelete ? (
                    <span className="Red">{_l('图表已删除')}</span>
                  ) : pageName ? (
                    <span className="Gray">{_l('%0 - %1', pageName, reportName)}</span>
                  ) : (
                    <span className="Gray_9e">{_l('选择统计图表')}</span>
                  )}
                </div>
                {!isChartDelete && sheetId && (
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
      <SettingItem>
        <div className="labelWrap flexCenter mBottom15">
          <span>{_l('高度')}</span>
          <Input
            value={height}
            style={{ width: 100, margin: '0 10px 0 10px' }}
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
          <span>{_l('px')}</span>
        </div>
        {enumDefault !== 2 && (
          <div className="labelWrap">
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
      </SettingItem>
      {enumDefault === 2 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('筛选数据源')}</div>
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
        </SettingItem>
      )}

      {filterVisible && (
        <FilterDialog
          data={data}
          controls={controls}
          titleCom={renderCom()}
          allControls={formatControls}
          globalSheetInfo={globalSheetInfo}
          onOk={conditions => {
            const newConditions = conditions.map(item => {
              return item.isDynamicsource ? { ...item, values: [], value: '' } : { ...item, dynamicSource: [] };
            });
            onChange(
              handleAdvancedSettingChange(data, {
                filters: JSON.stringify(newConditions),
              }),
            );
            setCommonState({ filterVisible: false });
          }}
          onClose={() => setCommonState({ filterVisible: false })}
        />
      )}
      {!_.isEmpty(filters) && (
        <FilterItemTexts
          {...props}
          loading={loading}
          controls={controls}
          allControls={formatControls.concat(SYSTEM_CONTROL)}
          editFn={() => setCommonState({ filterVisible: true })}
        />
      )}

      {visible && (
        <SelectStaticChartFromSheet
          sheetId={pageName ? sheetId : ''}
          reportId={reportName ? reportId : ''}
          globalSheetInfo={globalSheetInfo}
          onOk={(ids, worksheetId) => {
            setChartInfo(ids);
            setWorksheetInfo({ worksheetId });
            onChange({
              dataSource: JSON.stringify({ wsid: ids.sheetId, reportid: ids.reportId, type: ids.type }),
            });
            setCommonState({ visible: false });
          }}
          onCancel={() => setCommonState({ visible: false })}
        />
      )}
    </EmbedSettingWrap>
  );
}
