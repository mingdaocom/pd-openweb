import React, { Component } from 'react';
import cx from 'classnames';
import PropTypes, { string } from 'prop-types';
import '@mdfe/selectize';
import filterXSS from 'xss';

export default class Text extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    values: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func,
  };
  static defaultProps = {
    values: [],
  };
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    const { onChange } = this.props;
    const comp = this;
    if (this.input) {
      this.selectize = $(this.input).selectize({
        dropdownClass: 'selectize-dropdown zIndex99 pAll10 dropdownTrigger',
        plugins: ['remove_button'],
        dropdownParent: 'body',
        placeholder: _l('请输入'),
        delimiter: ',',
        persist: false,
        openOnFocus: false,
        maxOptions: 0,
        create: input => {
          return {
            value: input,
            text: input,
          };
        },
        render: {
          option_create(data, escape) {
            return `<div class="create ThemeColor3">${_l('使用“%0”', filterXSS(data.input))}</div>`;
          },
        },
        onInitialize: function () {
          const $selectize = this;
          if (this.$control_input[0]) {
            this.$control_input[0].addEventListener('paste', e => {
              const pasteValue = (e.clipboardData || window.clipboardData).getData('text');
              if (pasteValue && /\n/.test(pasteValue)) {
                const items = pasteValue.split('\n');
                onChange({ values: comp.props.values.concat(items) });
                items.forEach(item => {
                  $selectize.createItem(item);
                });
                e.preventDefault();
              }
            });
          }
        },
        onChange: selectizevalue => {
          onChange({ values: selectizevalue ? selectizevalue.split(',') : [] });
        },
      })[0].selectize;
    }
  }
  render() {
    let { values, disabled } = this.props;
    values = !values ? [] : values;
    return (
      <div className={cx('worksheetFilterTextCondition', { disabled })}>
        <input type="text" ref={input => (this.input = input)} value={values.join(',')} readOnly />
      </div>
    );
  }
}
