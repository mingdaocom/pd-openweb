import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import DefaultValue from '../DefaultValue';
import moment from 'moment';
import { DATE_TYPE_M, DATE_TYPE_Y, DATE_SHOW_TYPE } from '../config';
import { DATE_RANGE_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum.js';
import { DATE_FORMAT_BY_DATERANGETYPE } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/config.js';
import { getDaterange } from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/util.js';

export default function DefCom(props) {
  const { dataType, control, dataControls, worksheetControls, advancedSetting, view, currentSheetInfo, updateViewSet } =
    props;
  const getDefsource = () => {
    const { dynamicSource = [], values = [], maxValue, minValue, value, dateRange } = control;

    if (
      (([6, 8].includes(dataType) && control.filterType === 11) ||
        dataType === 46 ||
        ([15, 16, 17, 18].includes(dataType) && control.filterType === 31)) &&
      (maxValue || minValue)
    ) {
      const keyStr = [6, 8].includes(dataType) && control.filterType === 11 ? '~' : '-';
      return [{ cid: '', rcid: '', staticValue: `${minValue}${keyStr}${maxValue}` }];
    }
    if (dynamicSource.length > 0) return dynamicSource;
    if ([15, 16, 17, 18].includes(dataType) && dateRange !== 18 && !!dateRange && control.filterType !== 31) {
      return [{ cid: dateRange, rcid: 'dateRange', staticValue: '' }];
    }
    if ([15, 16, 17, 18].includes(dataType) && control.filterType === 31 && !maxValue && !minValue) {
      return [{ cid: '', rcid: '', staticValue: '' }];
    }
    if (([6, 8].includes(dataType) && control.filterType === 2) || [15, 16, 17, 18].includes(dataType)) {
      if (!value) {
        return '';
      }
      return [{ cid: '', rcid: '', staticValue: value }];
    }
    if (36 === dataType) {
      return [{ cid: '', rcid: '', staticValue: control.filterType === 2 ? '1' : '0' }];
    }
    return values.map(o => {
      let staticValue = o;
      if ([29, 35].includes(dataType)) {
        const data = safeParse(staticValue);
        staticValue = JSON.stringify([data.id]);
        return { cid: '', rcid: '', staticValue, relateSheetName: data.name };
      }
      if ([26, 27, 48].includes(dataType)) {
        const key = dataType === 26 ? 'accountId' : dataType === 27 ? 'departmentId' : 'organizeId';
        const nameKey = dataType === 26 ? 'fullname' : dataType === 27 ? 'departmentName' : 'organizeName';
        const data = safeParse(staticValue);
        staticValue = JSON.stringify({ ...data, [key]: data.id, [nameKey]: data.name });
        if (26 === dataType && data.id === 'isEmpty') {
          staticValue = JSON.stringify({
            avatar:
              md.global.FileStoreConfig.pictureHost.replace(/\/$/, '') +
              '/UserAvatar/undefined.gif?imageView2/1/w/100/h/100/q/90',
            fullname: _.get(control, 'advancedSetting.nullitemname') || _l('为空'),
            accountId: 'isEmpty',
          });
        }
      }
      return { cid: '', rcid: '', staticValue };
    });
  };

  return (
    <div className={'inputDef Relative'}>
      <DefaultValue
        data={{
          ...dataControls,
          type: [9, 10, 11].includes(dataType) && _.get(control, 'advancedSetting.allowitem') === '2' ? 10 : dataType,
          enumDefault:
            29 === dataType
              ? _.get(control, 'advancedSetting.allowitem') === '2'
                ? 2
                : 1
              : [26, 27, 48].includes(dataType)
                ? _.get(control, 'advancedSetting.allowitem') === '2'
                  ? 1
                  : 0
                : dataControls.enumDefault,
          advancedSetting: {
            ..._.omit(dataControls.advancedSetting, ['dynamicsrc', 'defaulttype']),
            ...advancedSetting,
            defsource: JSON.stringify(getDefsource()),
            nullitemname: _.get(control, 'advancedSetting.nullitemname'),
            shownullitem: _.get(control, 'advancedSetting.shownullitem'),
            showtype:
              [...DATE_TYPE_M, ...DATE_TYPE_Y].includes(dataType) && _.get(control, 'dateRangeType')
                ? DATE_SHOW_TYPE[
                    _.findKey(DATE_RANGE_TYPE, function (value) {
                      return value === _.get(control, 'dateRangeType');
                    })
                  ]
                : dataControls.type === 38
                  ? _.get(dataControls, 'unit')
                  : _.get(dataControls, 'advancedSetting.showtype'),
          },
        }}
        allControls={worksheetControls}
        onChange={d => {
          const { advancedSetting = {} } = d;
          let { defsource } = advancedSetting;
          const data = safeParse(defsource, 'array');
          if (data.length <= 0) {
            updateViewSet({
              dynamicSource: [],
              values: [],
              value: '',
              maxValue: undefined,
              minValue: undefined,
              dateRange: 0,
            });
          } else if (!!data[0].staticValue) {
            if (
              ([6, 8].includes(dataType) && control.filterType === 11) ||
              dataType === 46 ||
              ([15, 16, 17, 18].includes(dataType) && control.filterType === 31)
            ) {
              const { staticValue = '' } = data[0];
              const keyStr = [6, 8].includes(dataType) && control.filterType === 11 ? '~' : '-';
              return updateViewSet({
                values: [],
                value: '',
                dynamicSource: [],
                maxValue: staticValue.substring(staticValue.indexOf(keyStr) + 1),
                minValue: staticValue.substring(0, staticValue.indexOf(keyStr)),
                ...(dataType === 46
                  ? {
                      dateRange: 18,
                      filterType: 31,
                    }
                  : {}),
                ...([15, 16].includes(dataType)
                  ? {
                      dateRange: 18,
                    }
                  : {}),
              });
            }
            if (([6, 8].includes(dataType) && control.filterType === 2) || [17, 18].includes(dataType)) {
              return updateViewSet({
                values: [],
                value: data[0].staticValue,
                dynamicSource: [],
                dateRange: 18,
                maxValue: '',
                minValue: '',
              });
            }
            if ([15, 16].includes(dataType)) {
              return updateViewSet({
                values: [],
                value: _.includes([4, 5, 3, 2, 1], control.dateRangeType)
                  ? moment(data[0].staticValue).format(DATE_FORMAT_BY_DATERANGETYPE[control.dateRangeType])
                  : data[0].staticValue,
                dynamicSource: [],
                dateRange: 18,
                maxValue: '',
                minValue: '',
              });
            }
            //检查项
            if (36 === dataType) {
              const { staticValue = '' } = data[0];
              return updateViewSet({
                values: [],
                value: '',
                dynamicSource: [],
                filterType: staticValue === '1' ? 2 : 6,
              });
            }
            if ([29, 35].includes(dataType)) {
              return updateViewSet({
                values: _.uniq(
                  data.map(o => {
                    const d = safeParse(o.staticValue, 'array')[0];
                    return d.id || d.rowid || d;
                  }),
                ),
                dynamicSource: [],
                maxValue: undefined,
                minValue: undefined,
              });
            }
            if ([26, 27, 48].includes(dataType)) {
              const key = dataType === 26 ? 'accountId' : dataType === 27 ? 'departmentId' : 'organizeId';
              return updateViewSet({
                values: data.map(o => (safeParse(o.staticValue) || {})[key]),
                dynamicSource: [],
                maxValue: undefined,
                minValue: undefined,
              });
            }
            updateViewSet({
              values: data.map(o => o.staticValue),
              dynamicSource: [],
              maxValue: undefined,
              minValue: undefined,
            });
          } else if (data[0].cid) {
            if (data[0].rcid === 'dateRange') {
              updateViewSet({
                dateRange: data[0].cid,
                values: [],
                dynamicSource: [],
                maxValue: undefined,
                minValue: undefined,
              });
              return;
            }
            let param = {};
            if ([15, 16].includes(dataType)) {
              param = { dateRange: 18 };
            }
            updateViewSet({
              dynamicSource: JSON.parse(defsource),
              values: [],
              maxValue: undefined,
              minValue: undefined,
              value: '',
              ...param,
            });
          }
        }}
        withMaxOrMin={
          ([6, 8].includes(dataType) && control.filterType === 11) ||
          [46].includes(dataType) ||
          ([15, 16, 17, 18].includes(dataType) && control.filterType === 31)
        }
        withLinkParams={[1, 2, 32, 3, 4, 5, 6, 7, 8, 15, 16, 17, 18, 46, 9, 10, 11, 36].includes(dataType)}
        withDY={
          [15, 16, 17, 18].includes(dataType) &&
          getDaterange(_.get(control, 'advancedSetting') || {}).length > 0 &&
          control.filterType !== 31
        }
        hideDynamic={[27, 48, 29, 35].includes(dataType)}
        linkParams={JSON.parse((view.advancedSetting || {}).urlparams || '[]')}
        titleControl={(_.get(dataControls, 'relationControls') || []).find(o => o.attribute === 1)} //关联表的标题字段
        globalSheetInfo={_.pick(currentSheetInfo, ['appId', 'groupId', 'name', 'projectId', 'worksheetId'])}
      />
      {[6, 8, 15, 16, 17, 18, 9, 10, 11, 36, 46].includes(dataType) && (
        <div className="Gray_75 Font13 mTop8">
          {[6, 8].includes(dataType) && control.filterType === 11
            ? _l('选择链接参数时的参数格式：最小值-最大值')
            : [15, 16, 17, 18].includes(dataType)
              ? _l('选择链接参数时的参数格式：yyyy-mm-dd hh:mm:ss')
              : 46 === dataType
                ? _l('选择链接参数时的参数格式：开始时间-结束时间。时间格式为hh:mm:ss')
                : [9, 10, 11].includes(dataType)
                  ? _l('选择链接参数时，多个选项之间用英文逗号隔开')
                  : 36 === dataType
                    ? _l('选择链接参数时的参数格式：0/1，true/false')
                    : ''}
        </div>
      )}
    </div>
  );
}
