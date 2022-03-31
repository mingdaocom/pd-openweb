import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { MobileRadio, Icon } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { Select } from 'antd';
import { browserIsMobile } from 'src/util';

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
    const { enumDefault2 } = this.props;

    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 },
        )}
        title={item.value}
        style={{ background: enumDefault2 === 1 ? item.color : '' }}
      >
        {item.value}
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
    } = this.props;
    let noDelOptions = options.filter(item => !item.isDeleted);
    const { keywords } = this.state;
    const checkIds = JSON.parse(value || '[]');

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        noDelOptions.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });

    if (browserIsMobile()) {
      return (
        <MobileRadio
          disabled={disabled}
          allowAdd={advancedSetting.allowadd === '1'}
          data={noDelOptions}
          value={checkIds}
          callback={this.onChange}
          renderText={this.renderList}
        >
          <div className={cx('w100 customFormControlBox', { controlDisabled: disabled })}>
            <div className="flexRow h100" style={{ alignItems: 'center', minHeight: 34 }}>
              <div className="flex minWidth0">
                {checkIds.length ? (
                  noDelOptions
                    .filter(item => _.includes(checkIds, item.key))
                    .map(item => (
                      <div key={item.key} className="mTop5 mBottom5">
                        {this.renderList(item)}
                      </div>
                    ))
                ) : (
                  <span className="Gray_bd">{_l('请选择')}</span>
                )}
              </div>
              {!disabled && <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />}
            </div>
          </div>
        </MobileRadio>
      );
    }

    // 搜索
    if (keywords.length) {
      noDelOptions = noDelOptions.filter(item => item.value.indexOf(keywords) > -1);
    }

    const checkedItems = noDelOptions.filter(item => _.includes(checkIds, item.key));

    return (
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
        value={
          checkIds.length ? (
            <Fragment>
              {checkedItems.map((item, index) => this.renderTitle(item, index !== checkedItems.length - 1))}
            </Fragment>
          ) : (
            <span className="Gray_bd customAntSelectPlaceHolder">{_l('请选择')}</span>
          )
        }
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        filterOption={() => true}
        notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
        onSearch={keywords => this.setState({ keywords })}
        onDropdownVisibleChange={open => {
          this.setState({ keywords: '' });
          !open && this.select.blur();
        }}
        onChange={value => {
          // keywords判断是为了直接点击删除
          if (value || !keywords.length) {
            this.onChange(value);
          }
        }}
        {...selectProps}
      >
        {!keywords.length && advancedSetting.allowadd === '1' && (
          <Select.Option disabled>
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
    );
  }
}
