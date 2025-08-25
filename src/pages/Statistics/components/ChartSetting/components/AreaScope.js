import React, { Component } from 'react';
import { Checkbox, Select } from 'antd';
import _ from 'lodash';
import { CityPicker, Icon, Input } from 'ming-ui';

const area = [
  {
    text: _l('全国'),
    value: '',
  },
  {
    text: _l('省'),
    value: 2,
  },
  {
    text: _l('市'),
    value: 3,
  },
];

const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];

export default class extends Component {
  constructor(props) {
    super(props);
  }
  filterArea = () => {
    const { xaxes, controls } = this.props;
    const { type } = _.find(controls, { controlId: xaxes.controlId }) || {};
    // 全国
    if (type === 19) {
      return area.filter(item => ![2, 3].includes(item.value));
    }
    // 全国-省
    if (type === 23) {
      return area.filter(item => ![3].includes(item.value));
    }
    // 全国-省-市
    if (type === 24) {
      return area;
    }
    return area;
  };
  handleChangeParticleSizeType = value => {
    this.props.onChangeCurrentReport(
      {
        country: {
          filterCode: '',
          particleSizeType: value ? value : 1,
          filterCodeName: '',
        },
      },
      value ? false : true,
    );
  };
  handleChangeFilterCode = data => {
    const { country } = this.props;
    const last = data[data.length - 1];

    if (country.particleSizeType - 1 !== data.length && !particularlyCity.includes(last.id)) {
      return;
    }

    this.props.onChangeCurrentReport(
      {
        country: {
          ...country,
          filterCode: last.id,
          filterCodeName: data.map(item => item.name).join('/'),
        },
      },
      true,
    );
  };
  render() {
    const { country, style, onChangeCurrentReport } = this.props;
    const level = country.particleSizeType - 1;
    const scopeLevel = country.particleSizeType == 1 ? '' : country.particleSizeType;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="title flexRow Font13 Bold valignWrapper mBottom12">{_l('范围')}</div>
        <div className="flexRow valignWrapper mBottom15">
          <Select
            className="chartSelect w100"
            value={scopeLevel}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={this.handleChangeParticleSizeType}
          >
            {this.filterArea().map(item => (
              <Select.Option className="selectOptionWrapper" key={item.value} value={item.value}>
                {item.text}
              </Select.Option>
            ))}
          </Select>
        </div>
        {country.particleSizeType > 1 && (
          <CityPicker
            defaultValue={country.filterCode || undefined}
            level={level}
            callback={this.handleChangeFilterCode}
          >
            <Input readOnly className="w100 pointer mBottom15" value={country.filterCodeName} />
          </CityPicker>
        )}
        <div className="flexRow valignWrapper">
          <Checkbox
            className="mLeft0 mBottom16 Font13"
            checked={style.isDrillDownLayer}
            onChange={() => {
              onChangeCurrentReport({
                style: {
                  ...style,
                  isDrillDownLayer: !style.isDrillDownLayer,
                },
              });
            }}
          >
            {_l('允许选取地图')}
          </Checkbox>
        </div>
      </div>
    );
  }
}
