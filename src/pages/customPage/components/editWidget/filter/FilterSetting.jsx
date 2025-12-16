import React, { Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import {
  DATE_FILTER_TYPE,
  DATE_GRANULARITY_TYPE,
  DATE_RANGE,
  DIRECTION_TYPE,
  getDateRangeTypeListByShowtype,
  getDefaultDateRangeType,
  GROUP_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  OPTIONS_ALLOWITEM,
  RELA_FILTER_TYPE,
  SHOW_RELATE_TYPE,
  TEXT_FILTER_TYPE,
} from 'worksheet/common/ViewConfig/components/fastFilter/util';
import DateTimeDataRange from 'src/pages/worksheet/common/ViewConfig/components/fastFilter/DateTimeDataRange';
import { FILTER_CONDITION_TYPE } from 'src/pages/worksheet/common/WorkSheetFilter/enum';

const RadioWrap = styled.div`
  border-radius: 3px;
  padding: 3px;
  background-color: #eff0f0;
  > div {
    justify-content: center;
    box-sizing: border-box;
    padding: 4px 10px;
    color: #757575;
    font-size: 13px;
    cursor: pointer;
    &.active {
      color: #1677ff;
      font-weight: bold;
      border-radius: 3px;
      background-color: #fff;
    }
  }
`;

export default function FilterSetting(props) {
  const { filter, setFilter, firstControlData } = props;
  const { advancedSetting = {} } = filter;
  const { dataType } = props;

  const getDaterange = () => {
    let daterange = advancedSetting.daterange;
    try {
      daterange = JSON.parse(daterange);
    } catch (error) {
      console.log(error);
      daterange = [];
    }
    return daterange;
  };

  const changeAdvancedSetting = (data, otherData = {}) => {
    setFilter({
      ...otherData,
      advancedSetting: {
        ...advancedSetting,
        ...data,
      },
    });
  };

  const renderDrop = data => {
    const value = filter[data.key];
    let types = data.types;
    if (['dateRangeType'].includes(data.key)) {
      types = getDateRangeTypeListByShowtype(
        (firstControlData.originType || firstControlData.type) === 38
          ? _.get(firstControlData, 'unit')
          : _.get(firstControlData, 'advancedSetting.showtype'),
      );
    }
    const handleChange = value => {
      const param = { [data.key]: value };
      if (data.key === 'filterType') {
        param.dateRangeType =
          value !== FILTER_CONDITION_TYPE.DATEENUM ? undefined : getDefaultDateRangeType(firstControlData);
        param.advancedSetting = {
          ...advancedSetting,
          daterange: '[]',
        };
      }
      if (data.key === 'dateRangeType') {
        param.advancedSetting = {
          ...advancedSetting,
          daterange: '[]',
        };
      }
      setFilter(param);
    };
    return (
      <Fragment>
        <div className="Gray Font13 mBottom8 Font13">{data.txt}</div>
        {data.key === 'filterType' ? (
          <Select
            className="customPageSelect mBottom12 w100"
            value={value || data.default}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              handleChange(value);
            }}
          >
            {types.map(item => (
              <Select.Option
                className="selectOptionWrapper"
                disabled={firstControlData.encryId ? item.value !== FILTER_CONDITION_TYPE.EQ : false}
                key={item.value}
                value={item.value}
              >
                <div className="valignWrapper h100 w100">
                  <span className="mLeft5 Font13 ellipsis">{item.text}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        ) : (
          <RadioWrap className="valignWrapper mBottom12">
            {types.map(item => (
              <div
                key={item.value}
                className={cx('valignWrapper flex', { active: item.value == (value || data.default) })}
                onClick={() => {
                  handleChange(item.value);
                }}
              >
                {item.text}
              </div>
            ))}
          </RadioWrap>
        )}
        {data.key === 'filterType' && firstControlData.encryId && (
          <div className="Gray_75 mBottom12">
            {_l('当前字段已加密，只支持按照')}
            {(types.find(o => o.value === FILTER_CONDITION_TYPE.EQ) || {}).text}
          </div>
        )}
      </Fragment>
    );
  };

  const renderShowType = data => {
    return (
      <Fragment>
        <div className="Gray Font13 mBottom8 Font13">{data.txt}</div>
        <RadioWrap className="valignWrapper mBottom12">
          {data.types.map(item => (
            <div
              key={item.value}
              className={cx('valignWrapper flex', {
                active: item.value == (advancedSetting[data.key] || data.default),
              })}
              onClick={() => {
                const result = {
                  [data.key]: _.toString(item.value),
                };
                if (data.key === 'allowitem' && item.value === 1) {
                  changeAdvancedSetting(result, {
                    values: [],
                    showDefsource: undefined,
                  });
                } else {
                  changeAdvancedSetting(result);
                }
              }}
            >
              {item.text}
              {item.txt && (
                <Tooltip title={item.txt}>
                  <Icon className="mLeft5" icon="info" />
                </Tooltip>
              )}
            </div>
          ))}
        </RadioWrap>
      </Fragment>
    );
  };

  const renderTimeType = () => {
    const dateRangeType = _.get(filter, 'dateRangeType') || '';
    const getShowTypeForDataRange = () => {
      const type = firstControlData.originType || firstControlData.type;
      if (type === 38) {
        return _.get(firstControlData, 'unit');
      }
      return _.get(firstControlData, 'advancedSetting.showtype') || '';
    };
    return (
      <DateTimeDataRange
        daterange={getDaterange()}
        dateRangeType={dateRangeType}
        showType={getShowTypeForDataRange()}
        key={`${_.get(firstControlData, 'advancedSetting.daterange')}_${dateRangeType}`}
        onChange={data => {
          changeAdvancedSetting(data);
        }}
      />
    );
  };

  return (
    <Fragment>
      <div className="valignWrapper mBottom10">
        <div className="flex Font13 bold">{_l('筛选设置')}</div>
      </div>
      {[TEXT_FILTER_TYPE, RELA_FILTER_TYPE, GROUP_FILTER_TYPE, NUMBER_FILTER_TYPE, DATE_FILTER_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return renderDrop(o);
        }
      })}
      {DATE_GRANULARITY_TYPE.keys.includes(dataType) &&
        [FILTER_CONDITION_TYPE.DATEENUM].includes(filter.filterType) &&
        renderDrop(DATE_GRANULARITY_TYPE)}
      {[OPTIONS_ALLOWITEM, DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return renderShowType(o);
        }
      })}
      {DATE_RANGE.keys.includes(dataType) && renderTimeType()}
    </Fragment>
  );
}
