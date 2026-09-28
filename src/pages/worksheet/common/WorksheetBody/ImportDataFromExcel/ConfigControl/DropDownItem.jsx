import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'ming-ui/antd-components';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };
const SELECT_STYLE = { width: '100%' };

export default class DropDownItem extends Component {
  static propTypes = {
    value: PropTypes.any,
    dropDownData: PropTypes.array,
    onChange: PropTypes.func,
    className: PropTypes.string,
    listWidth: PropTypes.number,
  };
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
    };
  }
  render() {
    const { className, listWidth, dropDownData, onChange } = this.props;
    const { value } = this.state;
    const selectedItem = dropDownData.find(item => item.value === value);

    return (
      <Select
        className={className}
        style={SELECT_STYLE}
        allowClear
        value={value || undefined}
        options={dropDownData}
        fieldNames={SELECT_FIELD_NAMES}
        listHeight={220}
        popupMatchSelectWidth={listWidth}
        labelRender={() => (
          <span>
            {selectedItem?.text}
            <span className="textTertiary mLeft12">{selectedItem?.previewContent}</span>
          </span>
        )}
        onChange={value => {
          const nextValue = value || '';
          this.setState({ value: nextValue });
          onChange(nextValue);
        }}
      />
    );
  }
}
