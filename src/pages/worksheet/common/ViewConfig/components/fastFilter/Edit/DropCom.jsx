import React from 'react';
import { Dropdown } from 'ming-ui';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';
import { getControlFormatType, getDefaultDateRangeType, getDateRangeTypeListByShowtype } from '../util';
import _ from 'lodash';
import { DATE_FORMAT_BY_DATERANGETYPE } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/config.js';
import moment from 'moment';

export default function DropCom(props) {
  const { data, worksheetControls, control, advancedSetting, updateViewSet } = props;
  let conData = worksheetControls.find(item => item.controlId === control.controlId) || {};
  let dataInfo = data.types.map(o => {
    return { ...o, disabled: !!conData.encryId && o.value !== FILTER_CONDITION_TYPE.EQ };
  });
  if (['dateRangeType'].includes(data.key)) {
    dataInfo = getDateRangeTypeListByShowtype(
      conData.type === 38 ? _.get(conData, 'unit') : _.get(conData, 'advancedSetting.showtype'),
    );
  }
  let type = getControlFormatType(control);
  let value = ['filterType', 'dateRangeType'].includes(data.key)
    ? ['filterType'].includes(data.key) && data.keys.includes(type) && control[data.key] === 0
      ? FILTER_CONDITION_TYPE.DATE_BETWEEN //兼容老数据的默认值
      : control[data.key]
    : JSON.parse(advancedSetting[data.key]) || data.default;
  // const getDaterange = () => {
  //   let { daterange } = advancedSetting;
  //   try {
  //     daterange = JSON.parse(daterange);
  //   } catch (error) {
  //     daterange = [];
  //   }
  //   return daterange;
  // };
  return (
    <React.Fragment>
      <div className="title">{data.txt}</div>
      <Dropdown
        data={dataInfo}
        value={!dataInfo.find(o => o.value === value) ? undefined : value}
        className="flex"
        onChange={newValue => {
          let dataNew = { [data.key]: newValue };
          if (data.keys.includes(type) && [15, 16].includes(type)) {
            // let daterange = getDaterange();
            if (['dateRangeType'].includes(data.key)) {
              dataNew.daterange = '[]'; //新增默认不勾选
              if ([15, 16].includes(type) && _.includes([4, 5, 3, 2, 1], newValue) && control.value) {
                dataNew.value = moment(control.value).format(DATE_FORMAT_BY_DATERANGETYPE[newValue]);
              }
              if ([15, 16, 17, 18].includes(type)) {
                dataNew.dateRange = 18;
              }
            }
            if (['filterType'].includes(data.key)) {
              //日期字段筛选方式切换，颗粒度清空
              dataNew = {
                ...dataNew,
                daterange: '[]',
                dateRangeType:
                  newValue !== FILTER_CONDITION_TYPE.DATEENUM ? undefined : getDefaultDateRangeType(conData),
              };
            }
          }
          if (['filterType'].includes(data.key) && [6, 8, 15, 16, 17, 18, 46].includes(type)) {
            //清空默认值
            dataNew = {
              ...dataNew,
              values: [],
              maxValue: '',
              minValue: '',
              value: '',
            };
            if ([15, 16, 17, 18].includes(type)) {
              dataNew.dateRange = 18;
            }
          }
          updateViewSet({
            ...dataNew,
          });
        }}
        isAppendToBody
      />
      {!!conData.encryId && (
        <span className="Gray_75 mTop8 Block">
          {_l('当前字段已加密，只支持按照')}
          {(data.types.find(o => o.value === FILTER_CONDITION_TYPE.EQ) || {}).text}
        </span>
      )}
    </React.Fragment>
  );
}
