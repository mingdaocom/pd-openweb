import PropTypes from 'prop-types';
import React, { Component } from 'react';
import RadioGroup from 'ming-ui/components/RadioGroup2';
import { MobileRadio, Icon } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { FROM } from '../../tools/config';
import { browserIsMobile } from 'src/util';

export default class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  getData() {
    const { disabled, options, value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    return options
      .filter(item => !item.isDeleted && ((disabled && _.includes(checkIds, item.key)) || !disabled))
      .map(item => {
        return {
          text: this.renderList(item),
          value: item.key,
          checked: _.includes(checkIds, item.key),
          title: item.value,
        };
      });
  }

  /**
   * 渲染列表
   */
  renderList = item => {
    const { enumDefault2, value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 || checkIds.length > 1 },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : checkIds.length > 1 ? '#eaeaea' : '' }}
      >
        {item.value}
      </span>
    );
  };

  onChange = key => {
    const { value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    if (_.includes(checkIds, key)) {
      key = '';
    }

    this.props.onChange(JSON.stringify(key ? [key] : []));
  };

  render() {
    const { from, disabled, advancedSetting, options, value } = this.props;
    const { direction } = advancedSetting || {};
    const isMobile = _.includes([FROM.H5_ADD, FROM.H5_EDIT], from);
    const Comp = isMobile ? MobileRadio : props => props.children;
    const checkIds = JSON.parse(value || '[]');

    return (
      <Comp
        disabled={disabled}
        data={options.filter(item => !item.isDeleted)}
        value={checkIds}
        callback={this.onChange}
        renderText={this.renderList}
      >
        <div
          className={cx(
            'customFormControlBox',
            { formBoxNoBorder: !isMobile },
            { controlDisabled: disabled },
            { groupColumn: direction === '1' || browserIsMobile() },
          )}
          style={{ height: 'auto' }}
        >
          {isMobile ? (
            <div className="flexRow h100" style={{ alignItems: 'center', minHeight: 34 }}>
              <div className="flex">
                {checkIds.length ? (
                  checkIds.map(value => (
                    <div key={value} className="mTop5 mBottom5">
                      {this.renderList(options.find(item => item.key === value))}
                    </div>
                  ))
                ) : (
                  <span className="Gray_bd">{_l('请选择')}</span>
                )}
              </div>
              {!disabled && <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />}
            </div>
          ) : (
            <RadioGroup disabled={disabled} data={this.getData()} onChange={this.onChange} />
          )}
        </div>
      </Comp>
    );
  }
}
