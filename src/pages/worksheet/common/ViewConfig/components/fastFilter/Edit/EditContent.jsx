import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { formatObjWithNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import SearchConfig from '../SearchConfig';
import { ADVANCEDSETTING_KEYS, Filter_KEYS, formatFastFilterData, getControlFormatType, getSetDefault } from '../util';
import DefCom from './DefCom';
import FastFilterFieldSelector from './FastFilterFieldSelector';
import FilterControlSettings from './FilterControlSettings';
import NavShowSetting from './NavShowSetting';

export default function EditContent(params) {
  const {
    worksheetControls = [],
    view = {},
    updateCurrentView,
    activeFastFilterId,
    setActiveFastFilterId,
    currentSheetInfo,
    saveViewSetLoading,
  } = params;
  const [{ fastFilters, control, advancedSetting, dataType, dataControls }, setState] = useSetState({
    fastFilters: [],
    control: {},
    advancedSetting: {},
    dataType: null,
    dataControls: {},
  });

  useEffect(() => {
    if (saveViewSetLoading) return;
    const d = view.fastFilters || [];
    let controlsFilter = d.map(o => {
      const c = worksheetControls.find(item => item.controlId === o.controlId) || {};
      return {
        ...o,
        isErr: !o,
        controlName: c.controlName,
        type: getControlFormatType(c),
        sourceControl: c.sourceControl,
      };
    });
    let dd = worksheetControls.find(item => item.controlId === activeFastFilterId) || {};
    let controlNew = controlsFilter.find(o => o.controlId === activeFastFilterId) || {};

    if ([10].includes(controlNew.type) && controlNew.filterType === 0) {
      // 单选字段改成多选后，老的“是”条件需要兼容成“包含其中一个”。
      controlNew.filterType = 2;
    }

    if (!controlNew.controlId) {
      controlNew = {
        ...getSetDefault(dd),
        isErr: !dd.controlName,
        controlName: dd.controlName,
        sourceControl: dd.sourceControl,
      };
    }

    controlNew.type = getControlFormatType(dd);
    let advancedSetting = controlNew.advancedSetting || {};
    setState({
      fastFilters: d,
      dataControls: dd,
      control: controlNew,
      advancedSetting,
      dataType: controlNew.type,
    });
  }, [activeFastFilterId, view.fastFilters, saveViewSetLoading]);

  if (!control) {
    return '';
  }

  const updateViewSet = data => {
    updateCurrentView(
      Object.assign(view, {
        fastFilters: formatFastFilterData(
          fastFilters.map(o => {
            if (o.controlId === activeFastFilterId) {
              let filters = o;

              // data 里混有字段根属性和 advancedSetting，需要按后端保存结构分别写回。
              Object.keys(data).forEach(ii => {
                if (![...ADVANCEDSETTING_KEYS, ...Filter_KEYS].includes(ii)) {
                  filters[ii] = data[ii];
                } else {
                  if (ADVANCEDSETTING_KEYS.includes(ii)) {
                    filters.advancedSetting[ii] = data[ii];
                  } else {
                    filters[ii] = data[ii];
                  }
                }
              });
              return formatObjWithNavfilters(filters);
            } else {
              return formatObjWithNavfilters(o);
            }
          }),
        ),
        editAttrs: ['fastFilters'],
      }),
    );
  };

  const updateView = (fastFilters, advanced) => {
    let param = {
      fastFilters,
    };

    if (advanced) {
      param.advancedSetting = advanced;
    }

    if (fastFilters.length <= 0) {
      // 删除最后一个快速筛选时，同步关闭“点击查询”和按钮入口。
      param.advancedSetting = { ...param.advancedSetting, clicksearch: '0', enablebtn: '0' };
    }

    param.editAttrs = Object.keys(param);

    if (Object.keys(param.advancedSetting || {}).length > 0) {
      param.editAdKeys = Object.keys(param.advancedSetting || {});
    }

    updateCurrentView(Object.assign(view, param));
  };

  return (
    <React.Fragment>
      <div className="con flex">
        <FastFilterFieldSelector
          worksheetControls={worksheetControls}
          currentSheetInfo={currentSheetInfo}
          fastFilters={fastFilters}
          activeFastFilterId={activeFastFilterId}
          control={control}
          view={view}
          setActiveFastFilterId={setActiveFastFilterId}
          updateView={updateView}
        />
        <FilterControlSettings
          worksheetControls={worksheetControls}
          control={control}
          advancedSetting={advancedSetting}
          dataType={dataType}
          dataControls={dataControls}
          updateViewSet={updateViewSet}
          setAdvancedSetting={value => setState({ advancedSetting: value })}
        >
          <NavShowSetting
            dataType={dataType}
            control={control}
            worksheetControls={worksheetControls}
            currentSheetInfo={currentSheetInfo}
            view={view}
            activeFastFilterId={activeFastFilterId}
            updateViewSet={updateViewSet}
          />
        </FilterControlSettings>
        {/* 支持默认值的快速筛选类型：文本、数值、日期、选项、人员、部门、关联、级联等。 */}
        {[1, 2, 32, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 46, 9, 10, 11, 36, 27, 26, 48, 29, 35].includes(dataType) && (
          <div className="mTop24">
            <DefCom
              view={view}
              currentSheetInfo={currentSheetInfo}
              control={control}
              dataControls={dataControls}
              dataType={dataType}
              advancedSetting={advancedSetting}
              worksheetControls={worksheetControls}
              updateViewSet={updateViewSet}
            />
          </div>
        )}
        {[29].includes(dataType) && _.get(advancedSetting, 'navshow') !== '2' && (
          // 关联字段没有限定为指定项时，可继续配置搜索范围。
          <SearchConfig
            controls={dataControls.relationControls}
            data={advancedSetting}
            onChange={newValue => {
              updateViewSet({ ...newValue });
            }}
          />
        )}
      </div>
    </React.Fragment>
  );
}
