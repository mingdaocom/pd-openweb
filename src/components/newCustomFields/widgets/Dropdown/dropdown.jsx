import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { MobileRadio, Icon } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { Select } from 'antd';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { getCheckAndOther } from '../../tools/utils';
import OtherInput from '../Checkbox/OtherInput';

export default class Widgets extends Component {
  static propTypes = {
    dropdownClassName: PropTypes.string,
    disabled: PropTypes.bool,
    disableCustom: PropTypes.any,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    selectProps: PropTypes.shape({}),
    onChange: PropTypes.func,
    advancedSetting: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      keywords: '',
    };
  }

  /**
   * 渲染头部
   */
  renderTitle(item, hasSplit) {
    const { enumDefault2 } = this.props;

    return (
      <span
        key={item.key}
        className={cx(
          'ellipsis mTop5 mBottom5 mRight5 Font13',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          enumDefault2 === 1 ? 'customAntDropdownTitleWithBG' : 'customAntDropdownTitle',
        )}
        style={{ background: enumDefault2 === 1 ? item.color : '' }}
        title={item.value}
      >
        {item.value}
        {enumDefault2 !== 1 && hasSplit && ','}
      </span>
    );
  }

  /**
   * 渲染列表
   */
  renderList = item => {
    const { enumDefault2, value, disabled } = this.props;
    const { otherValue } = getCheckAndOther(value);
    const isMobile = browserIsMobile();

    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : '' }}
      >
        {isMobile && item.key === 'other' ? (otherValue && disabled ? otherValue : _l('其他')) : item.value}
      </span>
    );
  };

  onChange = value => {
    this.props.onChange(JSON.stringify(value ? [value] : []));
  };

  render() {
    const {
      disabled,
      value,
      options,
      selectProps = {},
      dropdownClassName,
      advancedSetting,
      disableCustom,
      hint,
    } = this.props;
    let noDelOptions = options.filter(item => !item.isDeleted);
    const delOptions = options.filter(item => item.isDeleted);
    const { keywords } = this.state;
    const { checkIds } = getCheckAndOther(value);

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1 && !selectProps.noPushAdd_) {
        noDelOptions.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });

    if (browserIsMobile()) {
      return (
        <Fragment>
          <MobileRadio
            disabled={disabled}
            allowAdd={advancedSetting.allowadd === '1'}
            data={noDelOptions}
            value={checkIds}
            callback={this.onChange}
            renderText={this.renderList}
            {...this.props}
          >
            <div className={cx('w100 customFormControlBox', { controlDisabled: disabled })}>
              <div className="flexRow h100" style={{ alignItems: 'center', minHeight: 34 }}>
                <div className="flex minWidth0">
                  {checkIds.length ? (
                    noDelOptions
                      .filter(item => _.includes(checkIds, item.key))
                      .map(item => {
                        return (
                          <div key={item.key} className="mTop5 mBottom5">
                            {this.renderList(item)}
                          </div>
                        );
                      })
                  ) : (
                    <span className="Gray_bd">{_l('请选择')}</span>
                  )}
                </div>
                {!disabled && <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />}
              </div>
            </div>
          </MobileRadio>
          {!disabled && <OtherInput {...this.props} isSelect={true} className="mTop5" />}
        </Fragment>
      );
    }

    // 搜索
    if (keywords.length) {
      noDelOptions = noDelOptions.filter(item => item.value.indexOf(keywords) > -1);
    }
    const checkItems = noDelOptions
      .concat(delOptions)
      .filter(i => _.includes(checkIds, i.key))
      .map(c => ({ value: c.key, label: this.renderTitle(c) }));

    return (
      <Fragment>
        <Select
          ref={select => {
            this.select = select;
          }}
          dropdownClassName={dropdownClassName}
          className="w100 customAntSelect"
          disabled={disabled}
          showSearch
          allowClear={checkIds.length > 0}
          listHeight={320}
          value={checkItems}
          placeholder={hint || _l('请选择')}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          labelInValue={true}
          filterOption={() => true}
          notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
          onSearch={keywords => this.setState({ keywords })}
          onDropdownVisibleChange={open => {
            this.setState({ keywords: '' });
            !open && this.select.blur();
          }}
          onChange={da => {
            let value = da;
            if (typeof da === 'object') {
              value = da.value;
            }
            // keywords判断是为了直接点击删除
            if (value || !keywords.length) {
              this.onChange(value);
            }
          }}
          {...selectProps}
        >
          {!keywords.length && advancedSetting.allowadd === '1' && (
            <Select.Option disabled className="cursorDefault">
              <span className="ellipsis customRadioItem Gray_9e">{_l('或直接输入添加新选项')}</span>
            </Select.Option>
          )}

          {noDelOptions.map((item, i) => {
            return (
              <Select.Option
                value={item.key}
                key={i}
                className={cx({ 'ant-select-item-option-selected': _.includes(checkIds, item.key) })}
              >
                {this.renderList(item)}
              </Select.Option>
            );
          })}

          {!disableCustom &&
            !!keywords.length &&
            !noDelOptions.find(item => item.value === keywords) &&
            advancedSetting.allowadd === '1' && (
              <Select.Option value={`add_${keywords}`}>
                <span className="ellipsis customRadioItem ThemeColor3">{_l('添加新的选项：') + keywords}</span>
              </Select.Option>
            )}
        </Select>
        <OtherInput {...this.props} isSelect={true} />
      </Fragment>
    );
  }
}
