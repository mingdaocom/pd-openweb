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
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';

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

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(_.pick(nextProps, ['value', 'disabled']), _.pick(this.props, ['value', 'disabled'])) ||
      !_.isEqual(_.pick(nextState, ['keywords']), _.pick(this.state, ['keywords'])) ||
      !_.isEqual(_.get(nextProps, 'controlId'), _.get(this.props, 'controlId')) ||
      !_.isEqual(_.get(nextProps, 'options'), _.get(this.props, 'options'))
    ) {
      return true;
    }
    return false;
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
          { White: enumDefault2 === 1 && !isLightColor(item.color), isEmpty: item.key === 'isEmpty' },
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
    const { enumDefault2, value, disabled, advancedSetting } = this.props;
    const { otherValue } = getCheckAndOther(value);
    const isMobile = browserIsMobile();
    const { direction, checktype } = advancedSetting || {};

    return (
      <span
        className={cx(
          'customRadioItem',
          {
            White: enumDefault2 === 1 && !isLightColor(item.color),
            ellipsis: !browserIsMobile(),
            isEmpty: item.key === 'isEmpty',
          },
          {
            'pLeft12 pRight12': enumDefault2 === 1,
            horizonArrangementItem: checktype === '2' && (direction === '0' || direction === '2') && browserIsMobile(),
            showRadioTxtAll: browserIsMobile(),
          },
        )}
        style={{ background: enumDefault2 === 1 ? item.color : '' }}
      >
        {isMobile && item.key === 'other' ? (otherValue && disabled ? otherValue : item.value) : item.value}
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
    let noDelOptions = options.filter(item => !item.isDeleted && !item.hide);
    const delOptions = options.filter(item => item.isDeleted || item.hide);
    const { keywords } = this.state;
    const { checkIds } = getCheckAndOther(value);
    const canAddOption = noDelOptions.length < MAX_OPTIONS_COUNT;

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1 && !selectProps.noPushAdd_) {
        noDelOptions.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });
    const mobileCheckItems = noDelOptions.concat(delOptions).filter(i => _.includes(checkIds, i.key));

    if (browserIsMobile()) {
      return (
        <Fragment>
          <MobileRadio
            disabled={disabled}
            allowAdd={advancedSetting.allowadd === '1'}
            data={noDelOptions}
            delOptions={delOptions}
            callback={this.onChange}
            renderText={this.renderList}
            {...this.props}
            value={mobileCheckItems}
          >
            <div
              className={cx('w100 customFormControlBox customFormControlDropDown', {
                controlDisabled: disabled,
              })}
              style={{ height: 'auto' }}
            >
              <div className="flexRow h100" style={{ alignItems: 'center', minHeight: 34 }}>
                <div className="flex minWidth0">
                  {checkIds.length ? (
                    noDelOptions
                      .concat(delOptions)
                      .filter(item => _.includes(checkIds, item.key))
                      .map(item => {
                        return (
                          <div key={item.key} className="mTop5 mBottom5">
                            {this.renderList(item)}
                          </div>
                        );
                      })
                  ) : (
                    <span className="Gray_bd">{hint || _l('请选择')}</span>
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
      noDelOptions = noDelOptions.filter(
        item =>
          `${item.value || ''}|${item.pinYin || ''}`.search(
            new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i'),
          ) !== -1,
      );
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
          className={cx('w100 customAntSelect', { optionDisabled: disabled })}
          disabled={disabled}
          showSearch
          allowClear={checkIds.length > 0}
          listHeight={320}
          value={checkItems}
          placeholder={hint}
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          labelInValue={true}
          optionFilterProp="children"
          filterOption={() => true}
          notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
          onSearch={keywords => this.setState({ keywords: keywords.trim() })}
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
          {!keywords.length && advancedSetting.allowadd === '1' && canAddOption && (
            <Select.Option disabled className="cursorDefault">
              <span className="ellipsis customRadioItem Gray_9e">{_l('或直接输入添加新选项')}</span>
            </Select.Option>
          )}

          {noDelOptions.map((item, i) => {
            return (
              <Select.Option
                value={item.key}
                key={i}
                text={item.text}
                className={cx({
                  'ant-select-item-option-selected': _.includes(checkIds, item.key),
                  isEmpty: item.key === 'isEmpty',
                })}
              >
                {this.renderList(item)}
              </Select.Option>
            );
          })}

          {!disableCustom &&
            !!keywords.length &&
            !options.find(item => item.value === keywords) &&
            advancedSetting.allowadd === '1' &&
            canAddOption && (
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
