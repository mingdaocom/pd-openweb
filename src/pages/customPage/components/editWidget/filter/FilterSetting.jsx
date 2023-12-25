import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox, Dropdown, Input, Divider, Tooltip, Radio } from 'antd';
import { enumWidgetType } from 'src/pages/customPage/util';
import {
  TEXT_FILTER_TYPE,
  RELA_FILTER_TYPE,
  GROUP_FILTER_TYPE,
  NUMBER_FILTER_TYPE,
  OPTIONS_ALLOWITEM,
  DIRECTION_TYPE,
  SHOW_RELATE_TYPE,
  DATE_RANGE,
} from 'worksheet/common/ViewConfig/components/fastFilter/util';

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
  height: 325px;
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
`;

export default function FilterSetting(props) {
  const { filter, setFilter } = props;
  const { advancedSetting = {} } = filter;
  const { dataType } = props;
  const [timeVisible, setTimeVisible] = useState(false);

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
    return (
      <Fragment>
        <div className="Gray Font13 mBottom8 Font13">{data.txt}</div>
        <RadioWrap className="valignWrapper mBottom12">
          {data.types.map((item, index) => (
            <div
              key={item.value}
              className={cx('valignWrapper flex', { active: item.value == (filterType || data.default) })}
              onClick={() => {
                setFilter({ filterType: item.value });
              }}
            >
              {item.text}
            </div>
          ))}
        </RadioWrap>
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
    let isAllRange = daterange.length >= DATE_RANGE.default.length;
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
          overlay={<TimeWrap className="WhiteBG card pTop10">{renderOverlay(DATE_RANGE.types)}</TimeWrap>}
        >
          <TimeInputWrap className={cx('w100 valignWrapper WhiteBG pointer mBottom10', { active: timeVisible })}>
            <div className={cx('flex', { Gray_bd: daterange.length <= 0 })}>
              {isAllRange ? _l('全选') : daterange.length <= 0 ? _l('请选择') : _l('选了 %0 个', daterange.length)}
            </div>
            <Icon icon="expand_more" className="Gray_9e Font20" />
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
      {[TEXT_FILTER_TYPE, RELA_FILTER_TYPE, GROUP_FILTER_TYPE, NUMBER_FILTER_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return renderDrop(o);
        }
      })}
      {[OPTIONS_ALLOWITEM, DIRECTION_TYPE, SHOW_RELATE_TYPE].map(o => {
        if (o.keys.includes(dataType)) {
          return renderShowType(o);
        }
      })}
      {DATE_RANGE.keys.includes(dataType) && renderTimeType()}
    </Fragment>
  );
}
