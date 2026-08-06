import React from 'react';
import _ from 'lodash';
import { Checkbox, Input } from 'ming-ui';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import DateTimeDataRange from '../DateTimeDataRange';
import {
  APP_ALLOWSCAN,
  DATE_FILTER_TYPE,
  DATE_GRANULARITY_TYPE,
  DATE_RANGE,
  DIRECTION_TYPE,
  GROUP_FILTER_TYPE,
  LIMIT,
  MULTI_SELECT_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  OPTIONS_ALLOWITEM,
  RELA_FILTER_TYPE,
  SHOW_RELATE_TYPE,
  TEXT_FILTER_TYPE,
} from '../util';
import DropCom from './DropCom';
import ShowTypeCom from './ShowTypeCom';

// 快速筛选字段类型相关配置：筛选方式、显示方式、日期范围、位数和扫码。
export default function FilterControlSettings(props) {
  const {
    worksheetControls,
    control,
    advancedSetting,
    dataType,
    dataControls,
    updateViewSet,
    setAdvancedSetting,
    children,
  } = props;

  const getDaterange = () => safeParse(advancedSetting.daterange, 'array');

  const getShowTypeForDataRange = () => {
    const controlData = worksheetControls.find(item => item.controlId === control.controlId) || {};

    if (controlData.type === 38) {
      return _.get(controlData, 'unit');
    }

    return _.get(controlData, 'advancedSetting.showtype');
  };

  return (
    <React.Fragment>
      {/* 基础筛选方式：文本、关联、组织角色、数字、日期等类型各自对应一组条件。 */}
      {[TEXT_FILTER_TYPE, RELA_FILTER_TYPE, GROUP_FILTER_TYPE, NUMBER_FILTER_TYPE, DATE_FILTER_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return (
            <DropCom
              key={o.key}
              data={o}
              worksheetControls={worksheetControls}
              control={control}
              advancedSetting={advancedSetting}
              updateViewSet={updateViewSet}
            />
          );
        }
      })}
      {/* 日期“等于”条件下额外提供日期粒度。 */}
      {DATE_GRANULARITY_TYPE.keys.includes(dataType) &&
        [FILTER_CONDITION_TYPE.DATEENUM].includes(control.filterType) && (
          <DropCom
            data={DATE_GRANULARITY_TYPE}
            worksheetControls={worksheetControls}
            control={control}
            advancedSetting={advancedSetting}
            updateViewSet={updateViewSet}
          />
        )}
      {TEXT_FILTER_TYPE.keys.includes(dataType) &&
      FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN === control[TEXT_FILTER_TYPE.key] ? (
        <div className="mTop10 textSecondary">
          {_l('- 使用同时包含时，搜索内容中的空格将用于分词')}
          <br />
          {_l('- 在大数据量时使用包含、同时包含条件可能非常缓慢，建议使用等于，并创建索引来优化性能。')}
        </div>
      ) : FILTER_CONDITION_TYPE.LIKE === control[TEXT_FILTER_TYPE.key] ? (
        <div className="mTop10 textSecondary">
          {_l('默认方式下，用户可自行切换使用模糊匹配或精确匹配搜索，适合大多数筛选场景')}
        </div>
      ) : (
        ''
      )}
      {children}
      {/* 选项类字段控制显示形态，如平铺、下拉等。 */}
      {[OPTIONS_ALLOWITEM].map(o => {
        if (o.keys.includes(dataType)) {
          return (
            <ShowTypeCom
              key={o.key}
              data={o}
              updateViewSet={updateViewSet}
              advancedSetting={advancedSetting}
              dataType={dataType}
            />
          );
        }
      })}
      {[MULTI_SELECT_FILTER_TYPE].map(o => {
        // 多选类型字段且允许选择数量为多选时，支持设置筛选方式。
        if (
          o.keys.includes(dataType) &&
          (([26, 27, 48].includes(dataType) && dataControls.enumDefault === 1) ||
            (dataType === 29 && dataControls.enumDefault === 2) ||
            dataType === 10) &&
          Number(advancedSetting.allowitem) === 2
        ) {
          return (
            <DropCom
              key={o.key}
              data={o}
              worksheetControls={worksheetControls}
              control={control}
              advancedSetting={advancedSetting}
              updateViewSet={updateViewSet}
            />
          );
        }
      })}
      {/* 方向和关联记录显示内容属于展示配置，统一交给 ShowTypeCom 保存到 advancedSetting。 */}
      {[DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return (
            <ShowTypeCom
              key={o.key}
              data={o}
              updateViewSet={updateViewSet}
              advancedSetting={advancedSetting}
              dataType={dataType}
            />
          );
        }
      })}
      {/* 日期范围组件负责维护 daterange，与 dateRangeType 一起决定默认勾选范围。 */}
      {DATE_RANGE.keys.includes(dataType) && (
        <DateTimeDataRange
          daterange={getDaterange()}
          dateRangeType={_.get(control, 'dateRangeType')}
          showType={getShowTypeForDataRange()}
          key={`${advancedSetting.daterange}_${_.get(control, 'dateRangeType')}`}
          onChange={data => {
            updateViewSet({
              advancedSetting: { ...advancedSetting, ...data },
            });
          }}
        />
      )}
      {LIMIT.keys.includes(dataType) &&
        [FILTER_CONDITION_TYPE.START, FILTER_CONDITION_TYPE.END].includes(control.filterType) && (
          <React.Fragment>
            <div className="title">{_l('位数')}</div>
            <Input
              type="number"
              min={0}
              className="w100 mTop8 placeholderColor"
              value={_.get(advancedSetting, 'limit')}
              placeholder={_l('请输入数值')}
              onChange={limit => {
                setAdvancedSetting({ ...advancedSetting, limit });
              }}
              onBlur={e => {
                updateViewSet({
                  limit: e.target.value.trim(),
                });
              }}
            />
          </React.Fragment>
        )}
      {APP_ALLOWSCAN.keys.includes(dataType) && (
        <Checkbox
          className="checkBox InlineBlock mTop18"
          text={_l('移动端支持扫码查询')}
          checked={advancedSetting.allowscan === '1'}
          onClick={() => {
            updateViewSet({
              allowscan: advancedSetting.allowscan === '1' ? '' : '1',
            });
          }}
        />
      )}
    </React.Fragment>
  );
}
