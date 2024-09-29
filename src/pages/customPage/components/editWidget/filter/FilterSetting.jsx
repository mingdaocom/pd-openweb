import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Dropdown, Input, Divider, Tooltip, Radio, Select } from 'antd';
import { enumWidgetType } from 'src/pages/customPage/util';
import {
  TEXT_FILTER_TYPE,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  DATE_FILTER_TYPE,
  OPTIONS_ALLOWITEM,
  DIRECTION_TYPE,
  SHOW_RELATE_TYPE,
  DATE_RANGE,
  DATE_GRANULARITY_TYPE,
  DATE_TYPE_M,
  DATE_TYPE_Y,
  getDefaultDateRangeType
} from 'worksheet/common/ViewConfig/components/fastFilter/util';
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
      color: #2196f3;
      font-weight: bold;
      border-radius: 3px;
      background-color: #fff;
    }
  }
`;

const TimeWrap = styled.div`
  height: auto;
  overflow-y: auto;
  .ant-checkbox-input {
    position: absolute;
  }
  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin-left: 0;
  }
`;

const TimeInputWrap = styled.div`
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  padding: 5px 11px;
  transition: all 0.3s;
  &:hover,
  &.active {
    border-color: #40a9ff;
  }
  &:hover {
    .moreTime {
      display: none;
    }
    .clearTimeRange {
      display: block;
    }
  }
  .clearTimeRange {
    display: none;
  }
`;

export default function FilterSetting(props) {
  const { filter, setFilter, firstControlData } = props;
  const { advancedSetting = {} } = filter;
  const { dataType } = props;
  const [timeVisible, setTimeVisible] = useState(false);

  const getDaterange = () => {
    let daterange = advancedSetting.daterange || '[1,2,3,4,5,6,7,8,9,12,13,14,15,16,17,21,22,23,31,32,33]';
    try {
      daterange = JSON.parse(daterange);
    } catch (error) {
      daterange = [];
    }
    return daterange;
  };

  let daterange = getDaterange();

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
    const { filterType } = filter;
    const value = filter[data.key];
    let types = data.types;
    if (['dateRangeType'].includes(data.key)) {
      types = _.get(firstControlData, 'advancedSetting.showtype') === '5' ? types.filter(o => o.value === 5) : _.get(firstControlData, 'advancedSetting.showtype') === '4' ? types.filter(o => o.value !== 3) : types;
    }
    const handleChange = value => {
      const param = { [data.key]: value };
      if (data.key === 'filterType') {
        param.dateRangeType = value !== FILTER_CONDITION_TYPE.DATEENUM ? undefined : getDefaultDateRangeType(firstControlData);
      }
      if (data.key === 'dateRangeType') {
        changeAdvancedSetting({
          [DATE_RANGE.key]: JSON.stringify(
            daterange.filter(o =>
              value == 5 ? DATE_TYPE_Y.includes(o) : value == 4 ? DATE_TYPE_M.includes(o) : true,
            ),
          )
        });
      }
      setFilter(param);
    }
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
          {data.types.map((item, index) => (
            <div
              key={item.value}
              className={cx('valignWrapper flex', {
                active: item.value == (advancedSetting[data.key] || data.default),
              })}
              onClick={() => {
                const result = {
                  [data.key]: item.value
                }
                if (data.key === 'allowitem' && item.value === 1) {
                  const { values = [] } = filter;
                  changeAdvancedSetting(result, {
                    values: values.length ? [values[0]] : values
                  });
                } else {
                  changeAdvancedSetting(result);
                }
              }}
            >
              {item.text}
              {item.txt && (
                <Tooltip title={item.txt}>
                  <Icon className="mLeft5" icon="knowledge-message" />
                </Tooltip>
              )}
            </div>
          ))}
        </RadioWrap>
      </Fragment>
    );
  };

  const renderOverlay = data => {
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
    return (
      <div className="flexColumn">
        {data.map((item, index) => {
          if (_.isArray(item)) {
            return (
              <Fragment key={index}>
                {renderOverlay(item)}
                {!!item.length && <Divider className="mTop5 mBottom5" />}
              </Fragment>
            );
          } else {
            return (
              <Fragment key={index}>
                <Checkbox
                  className="mLeft10 mTop5 mBottom5"
                  checked={isAllRange || daterange.includes(item.value)}
                  onClick={() => {
                    let newValue = daterange;
                    if (item.value === 'all') {
                      newValue = !isAllRange ? DATE_RANGE.default : [];
                    } else {
                      if (newValue.includes(item.value)) {
                        newValue = newValue.filter(o => o !== item.value);
                      } else {
                        newValue = newValue.concat(item.value);
                      }
                    }
                    changeAdvancedSetting({ [DATE_RANGE.key]: JSON.stringify(newValue) });
                  }}
                >
                  {item.text}
                </Checkbox>
              </Fragment>
            );
          }
        })}
      </div>
    );
  };

  const renderTimeType = () => {
    const dateRangeType = (_.get(filter, 'dateRangeType') || '').toString();
    const showType = (_.get(firstControlData, 'advancedSetting.showtype') || '').toString();
    let dateRanges = DATE_RANGE.types;
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
    if (_.includes(['4', '5'], showType) || _.includes(['4', '5'], dateRangeType)) {
      dateRanges = dateRanges
        .map(options =>
          options.filter(o => _.includes([dateRangeType, showType].includes('5') ? DATE_TYPE_Y : DATE_TYPE_M, o.value)),
        )
        .filter(options => options.length);
      isAllRange = [dateRangeType, showType].includes('5')
        ? daterange.length >= DATE_TYPE_Y.length
        : daterange.length >= DATE_TYPE_M.length;
    }
    return (
      <Fragment>
        <div className="Gray Font13 mBottom8 Font13">{DATE_RANGE.txt}</div>
        <Dropdown
          trigger={['click']}
          visible={timeVisible}
          onVisibleChange={visible => {
            setTimeVisible(visible);
          }}
          getPopupContainer={() => document.querySelector('.customPageFilterWrap .setting')}
          overlay={<TimeWrap className="WhiteBG card pTop10">{renderOverlay(dateRanges)}</TimeWrap>}
        >
          <TimeInputWrap className={cx('w100 valignWrapper WhiteBG pointer mBottom10', { active: timeVisible })}>
            <div className={cx('flex', { Gray_bd: daterange.length <= 0 })}>
              {isAllRange ? _l('全选') : daterange.length <= 0 ? _l('请选择') : _l('选了 %0 个', daterange.length)}
            </div>
            <Icon icon="expand_more moreTime" className="Gray_9e Font20" />
            <Icon
              icon="cancel1"
              className="Font14 Gray_9e clearTimeRange"
              onClick={e => {
                e.stopPropagation();
                changeAdvancedSetting({ daterange: '[]' });
              }}
            />
          </TimeInputWrap>
        </Dropdown>
      </Fragment>
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
      {DATE_GRANULARITY_TYPE.keys.includes(dataType) && [FILTER_CONDITION_TYPE.DATEENUM].includes(filter.filterType) && renderDrop(DATE_GRANULARITY_TYPE)}
      {[OPTIONS_ALLOWITEM, DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return renderShowType(o);
        }
      })}
      {DATE_RANGE.keys.includes(dataType) && renderTimeType()}
    </Fragment>
  );
}
