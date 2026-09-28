import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Input, Segmented, Select, Tooltip } from 'ming-ui/antd-components';
import { reportTypes } from 'src/utils/domain/statistics/reportTypes';
import { normTypes } from '../../../enum';

export class Count extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      reportType,
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
              className="w100"
              value={summary.controlId}
              suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
              options={[
                ...(reportType !== reportTypes.WorldMap
                  ? [
                      {
                        value: '',
                        label: _l('全部'),
                      },
                    ]
                  : []),
                ...yaxisList.map(item => ({
                  value: item.controlId,
                  label: item.controlName,
                })),
              ]}
              onChange={value => {
                onChangeSummary({
                  controlId: value,
                });
              }}
            />
          </div>
        )}
        {(isCollectMode ? true : summary.controlId) && (
          <div className="mBottom16">
            <div className="flexRow valignWrapper mBottom8">
              <div>{_l('汇总方式')}</div>
              {isCollectMode && summary.type === 5 && (
                <Tooltip
                  placement="bottom"
                  title={_l('汇总按照计算方式显示，需要计算选择的字段和添加的计算字段都显示在透视表中')}
                >
                  <Icon className="Font15 textTertiary pointer mLeft5" icon="info" />
                </Tooltip>
              )}
            </div>
            <Select
              className="w100"
              value={summary.type}
              suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
              options={(isCalculateMode && yAxis.controlType === 10000001
                ? normTypes.filter(n => ![6].includes(n.value))
                : normTypes.filter(n => ![5, 6].includes(n.value))
              ).map(item => ({
                value: item.value,
                label: item.value === 5 ? _l('计算') : item.alias || item.text,
              }))}
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
            />
          </div>
        )}
        <div className="mBottom16">
          <div className="mBottom8">{_l('提示')}</div>
          <Input
            key={`${summary.controlId}-${summary.type}`}
            defaultValue={summary.name}
            maxLength={20}
            className="w100"
            onPressEnter={event => event.currentTarget.blur()}
            onBlur={event => {
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
  const locationTypes = getLocationTypes(locationType);

  return (
    <div className="mBottom16">
      <div className="mBottom8">{_l('位置')}</div>
      <Segmented
        block
        className="bgDisabled"
        value={locationTypes.find(item => summary.location == item.value)?.value ?? ''}
        options={locationTypes.map(item => ({
          value: item.value,
          label: (
            <span className="ellipsis" title={item.text}>
              {item.text}
            </span>
          ),
        }))}
        onChange={value => {
          onChangeSummary({
            location: value,
          });
        }}
      />
    </div>
  );
};
