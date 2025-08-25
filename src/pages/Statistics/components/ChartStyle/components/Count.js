import React, { Component, Fragment } from 'react';
import { Input, Select, Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { normTypes } from '../../../enum';

export class Count extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      smallTitle,
      isCollectMode,
      isCalculateMode = true,
      summary,
      yaxisList,
      yAxis = {},
      extra,
      onChangeSummary,
    } = this.props;
    return (
      <Fragment>
        {isCollectMode && extra}
        {smallTitle && smallTitle}
        {!isCollectMode && (
          <div className="mBottom16">
            <div className="mBottom8">{_l('显示字段')}</div>
            <Select
              className="chartSelect w100"
              value={summary.controlId}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                onChangeSummary({
                  controlId: value,
                });
              }}
            >
              <Select.Option className="selectOptionWrapper" value="">
                {_l('全部')}
              </Select.Option>
              {yaxisList.map(item => (
                <Select.Option className="selectOptionWrapper" key={item.controlId} value={item.controlId}>
                  {item.controlName}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        {(isCollectMode ? true : summary.controlId) && (
          <div className="mBottom16">
            <div className="flexRow valignWrapper mBottom8">
              <div>{_l('汇总方式')}</div>
              {isCollectMode && summary.type === 5 && (
                <Tooltip
                  autoCloseDelay={0}
                  placement="bottom"
                  title={_l('汇总按照计算方式显示，需要计算选择的字段和添加的计算字段都显示在透视表中')}
                >
                  <Icon className="Font15 Gray_9e pointer mLeft5" icon="info" />
                </Tooltip>
              )}
            </div>
            <Select
              className="chartSelect w100"
              value={summary.type}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                const item = _.find(normTypes, { value });
                if (isCollectMode) {
                  onChangeSummary({
                    type: item.value,
                    name: item.value === 1 ? '' : item.value === 5 ? _l('计算') : item.text,
                  });
                } else {
                  const isDefault = normTypes.map(item => item.text).includes(summary.name);
                  onChangeSummary({
                    type: item.value,
                    name: isDefault ? (item.value === 5 ? _l('计算') : item.text) : summary.name,
                  });
                }
              }}
            >
              {(isCalculateMode && yAxis.controlType === 10000001
                ? normTypes.filter(n => ![6].includes(n.value))
                : normTypes.filter(n => ![5, 6].includes(n.value))
              ).map(item => (
                <Select.Option className="selectOptionWrapper" value={item.value}>
                  {item.value === 5 ? _l('计算') : item.alias || item.text}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        <div className="mBottom16">
          <div className="mBottom8">{_l('提示')}</div>
          <Input
            value={summary.name}
            className="chartInput w100"
            onChange={event => {
              onChangeSummary(
                {
                  name: event.target.value,
                },
                false,
              );
            }}
          />
        </div>
      </Fragment>
    );
  }
}

const getLocationTypes = locationType => {
  if (locationType === 'line') {
    const lineLocationTypes = [
      {
        value: 1,
        text: _l('上方'),
      },
      {
        value: 2,
        text: _l('下方'),
      },
    ];
    return lineLocationTypes;
  }
  if (locationType === 'column') {
    const columnLocationTypes = [
      {
        value: 3,
        text: _l('左侧'),
      },
      {
        value: 4,
        text: _l('右侧'),
      },
    ];
    return columnLocationTypes;
  }
};

export const Location = ({ summary, locationType, onChangeSummary }) => {
  return (
    <div className="mBottom16">
      <div className="mBottom8">{_l('位置')}</div>
      <div className="chartTypeSelect flexRow valignWrapper">
        {getLocationTypes(locationType).map(item => (
          <div
            key={item.value}
            className={cx('flex centerAlign pointer Gray_75', { active: summary.location == item.value })}
            onClick={() => {
              onChangeSummary({
                location: item.value,
              });
            }}
          >
            {item.text}
          </div>
        ))}
      </div>
    </div>
  );
};
