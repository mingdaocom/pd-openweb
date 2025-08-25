import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Checkbox, Icon, MobileCheckbox } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';
import { browserIsMobile } from 'src/utils/common';
import { isLightColor } from 'src/utils/control';
import { FROM } from '../../tools/config';
import { getCheckAndOther } from '../../tools/utils';
import OtherInput from './OtherInput';

class Widgets extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    isFocus: PropTypes.bool,
    options: PropTypes.any,
    value: PropTypes.string,
    enumDefault2: PropTypes.number,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      isFocus: props.isFocus || false,
      keywords: '',
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      !_.isEqual(
        _.pick(nextProps, ['value', 'width', 'disabled', 'options']),
        _.pick(this.props, ['value', 'width', 'disabled', 'options']),
      ) ||
      !_.isEqual(_.pick(nextState, ['isFocus', 'keywords']), _.pick(this.state, ['isFocus', 'keywords']))
    ) {
      return true;
    }
    return false;
  }

  /**
   * 渲染列表
   */
  renderList = (item, noMaxWidth) => {
    const { enumDefault2, from, advancedSetting, value, disabled } = this.props;
    const { otherValue } = getCheckAndOther(value);
    const { checktype, direction } = advancedSetting || {};

    return (
      <span
        className={cx(
          'customRadioItem WordBreak',
          { White: enumDefault2 === 1 && !isLightColor(item.color), ellipsis: !browserIsMobile() },
          {
            'pLeft12 pRight12': enumDefault2 === 1,
            horizonArrangementItem: checktype == '2' && (direction === '0' || direction === '2') && browserIsMobile(),
            showRadioTxtAll: browserIsMobile(),
          },
        )}
        style={{
          background: enumDefault2 === 1 ? item.color : '',
          maxWidth: noMaxWidth
            ? 'auto'
            : _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) || browserIsMobile()
              ? 'unset'
              : 140,
        }}
      >
        {item.key === 'other' && otherValue && disabled && browserIsMobile() ? otherValue : item.value}
      </span>
    );
  };

  onChange = (checked, key) => {
    const { value, advancedSetting } = this.props;
    const { chooseothertype } = advancedSetting || {};
    const checkIds = JSON.parse(value || '[]');

    if (checked) {
      _.remove(checkIds, item => (key === 'other' ? item.startsWith(key) : item === key));
    } else {
      checkIds.push(key);
      if (chooseothertype === '1') {
        _.remove(checkIds, item => (key === 'other' ? !item.startsWith('other') : item.startsWith('other')));
      }
    }

    this.onSave(checkIds);
  };

  onSave = values => {
    this.props.onChange(JSON.stringify(values));
  };

  handleSelectAll = (options = [], isChecked) => {
    const { onChange, advancedSetting = {}, type } = this.props;
    const { checktype } = advancedSetting;

    // 多选平铺, 多选选中则清空
    if (type === 10 && checktype !== '1' && isChecked) {
      onChange('');
      return;
    }
    const otherIds = options.map(i => i.key);
    onChange(JSON.stringify(otherIds));
  };

  getItemWidth(displayOptions) {
    const { width = '200', direction = '2' } = this.props.advancedSetting;

    let itemWidth = 100;
    const boxWidth = this.props.width;
    if (boxWidth && direction === '0') {
      const num = Math.floor(boxWidth / Number(width)) || 1;
      itemWidth = 100 / (num > displayOptions.length ? displayOptions.length : num);
    }
    return `${itemWidth}%`;
  }

  renderSelectAll = (checkIds = [], displayOptions = []) => {
    const { advancedSetting = {}, disabled } = this.props;
    const { showselectall, checktype, chooseothertype } = advancedSetting;

    if (disabled || showselectall !== '1') return null;

    if (chooseothertype === '1') {
      displayOptions = displayOptions.filter(i => i.key !== 'other');
    }

    if (checktype !== '1') {
      const isChecked = _.every(displayOptions, d => _.find(checkIds, c => c.includes(d.key)));
      const clearselected = !isChecked && _.some(displayOptions, d => _.find(checkIds, c => c.includes(d.key)));
      return (
        <div className="flexColumn w100">
          <Checkbox
            key="select-all"
            title={_l('全选')}
            text={<span style={{ paddingTop: '3px', display: 'inline-block' }}>{_l('全选')}</span>}
            value="select-all"
            clearselected={clearselected}
            checked={isChecked}
            onClick={() => {
              this.handleSelectAll(displayOptions, isChecked);
            }}
          />
        </div>
      );
    }

    return (
      <Select.Option value="select-all" key="select-all">
        <span className="ellipsis customRadioItem ThemeColor3">{_l('全选')}</span>
      </Select.Option>
    );
  };

  pcContent(checkIds) {
    const { disabled, options, advancedSetting } = this.props;
    const { direction = '2', width = '200', readonlyshowall } = advancedSetting || {};
    const readOnlyShow = !browserIsMobile() && readonlyshowall === '1' && disabled ? true : !disabled;
    const displayOptions = options.filter(
      item => !item.isDeleted && (_.includes(checkIds, item.key) || (!item.hide && readOnlyShow)),
    );
    const noMaxWidth = direction === '0' && !browserIsMobile() && width;

    return (
      <Fragment>
        {this.renderSelectAll(checkIds, displayOptions)}
        {displayOptions.map(item => {
          if (item.key === 'other' && disabled && browserIsMobile()) {
            return (
              <div
                className="flexColumn"
                style={direction === '0' && !browserIsMobile() ? { width: `${width}px` } : {}}
              >
                <Checkbox
                  key={item.key}
                  disabled={disabled}
                  title={item.value}
                  text={this.renderList(item, noMaxWidth)}
                  value={item.key}
                  checked={_.includes(checkIds, item.key)}
                  onClick={this.onChange}
                />
              </div>
            );
          }

          return (
            <Fragment>
              <div
                className="flexColumn"
                style={direction === '0' && !browserIsMobile() ? { width: this.getItemWidth(displayOptions) } : {}}
              >
                <div
                  className="flexColumn"
                  style={direction === '0' && !browserIsMobile() ? { width: `${width}px` } : {}}
                >
                  <Checkbox
                    className={cx('w100', {
                      flexWidth: noMaxWidth,
                      'customRadioItem showRadioTxtAll borderRadiusNone ': browserIsMobile() && disabled,
                    })}
                    key={item.key}
                    disabled={disabled}
                    title={item.value}
                    text={this.renderList(item, noMaxWidth)}
                    value={item.key}
                    checked={_.includes(checkIds, item.key)}
                    onClick={this.onChange}
                  />
                  {/* {item.key === 'other' && <OtherInput {...this.props} isSelect={browserIsMobile() ? true : false} />} */}
                </div>
              </div>
              {item.key === 'other' && (
                <OtherInput className="w100 pLeft0" {...this.props} isSelect={browserIsMobile() ? true : false} />
              )}
            </Fragment>
          );
        })}
      </Fragment>
    );
  }

  wxContent(checkIds) {
    const { options, disabled } = this.props;
    let sources = [];

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        sources.push({ key: item, color: '#1677ff', value: item.split('add_')[1] });
      } else {
        sources.push(options.find(o => o.key === item && !o.isDeleted));
      }
    });
    return (
      <Fragment>
        <div className="flexRow h100" style={{ alignItems: 'center', minHeight: 34 }}>
          <div className="flex minWidth0">
            {sources
              .filter(item => item)
              .map(item => {
                return (
                  <div key={item.key} className="mTop5 mBottom5">
                    {this.renderList(item)}
                  </div>
                );
              })}
          </div>
          {!disabled && <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />}
        </div>
      </Fragment>
    );
  }

  dropdownContent(checkIds) {
    const {
      isSheet,
      disabled,
      hint,
      options,
      dropdownClassName,
      advancedSetting = {},
      selectProps,
      onChange,
    } = this.props;
    let noDelOptions = options.filter(item => !item.isDeleted && !item.hide);
    const canAddOption = noDelOptions.length < MAX_OPTIONS_COUNT;
    const { keywords } = this.state;

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        noDelOptions.push({ key: item, color: '#1677ff', value: item.split('add_')[1] });
      }
    });

    // 搜索
    if (keywords.length) {
      noDelOptions = noDelOptions.filter(
        item =>
          `${item.value || ''}|${item.pinYin || ''}`.search(
            new RegExp(keywords.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i'),
          ) !== -1,
      );
    }

    return (
      <Fragment>
        <Select
          ref={select => {
            this.select = select;
          }}
          // getPopupContainer={triggerNode =>
          //   from === FROM.NEWRECORD || (from === FROM.RECORDINFO && flag) ? triggerNode.parentNode : document.body
          // }
          mode="multiple"
          dropdownClassName={dropdownClassName}
          className={cx('w100 customAntSelect', { optionDisabled: disabled })}
          disabled={disabled}
          showSearch
          allowClear={checkIds.length > 0}
          listHeight={320}
          placeholder={hint}
          value={checkIds}
          tagRender={this.tagRender}
          showArrow
          suffixIcon={<Icon icon="arrow-down-border Font14" />}
          filterOption={() => true}
          notFoundContent={<span className="Gray_9e">{_l('无搜索结果')}</span>}
          onSearch={keywords => this.setState({ keywords: keywords.trim() })}
          onDropdownVisibleChange={open => {
            this.setState({ keywords: '', isFocus: open });
            !open && this.select.blur();
            if (open && checkIds.indexOf('isEmpty') > -1) {
              onChange(JSON.stringify([]));
            }
          }}
          onChange={value => {
            if (value.indexOf('isEmpty') > -1) {
              onChange(JSON.stringify(['isEmpty']));
              this.select.blur();
              return;
            }
            // 全选
            if (value.indexOf('select-all') > -1) {
              const canSelectOptions =
                advancedSetting.chooseothertype === '1' ? noDelOptions.filter(c => c.key !== 'other') : noDelOptions;
              this.handleSelectAll(canSelectOptions);
              this.select.blur();
              return;
            }
            if (advancedSetting.chooseothertype === '1') {
              const newKey = _.last(value);
              _.remove(value, item => (newKey === 'other' ? !item.startsWith('other') : item.startsWith('other')));
            }
            onChange(JSON.stringify(value));
            this.setState({ keywords: '' });
          }}
          {...selectProps}
        >
          {!keywords.length && advancedSetting.allowadd === '1' && canAddOption && (
            <Select.Option disabled className="cursorDefault">
              <span className="ellipsis customRadioItem Gray_9e">{_l('或直接输入添加新选项')}</span>
            </Select.Option>
          )}

          {this.renderSelectAll()}

          {noDelOptions.map((item, i) => {
            return (
              <Select.Option value={item.key} key={i} className={cx({ isEmpty: item.key === 'isEmpty' })}>
                {this.renderList(item, true)}
              </Select.Option>
            );
          })}

          {!!keywords.length &&
            !noDelOptions.find(item => item.value === keywords) &&
            advancedSetting.allowadd === '1' &&
            canAddOption && (
              <Select.Option value={`add_${keywords}`}>
                <span className="ellipsis customRadioItem ThemeColor3">{_l('添加新的选项：') + keywords}</span>
              </Select.Option>
            )}
        </Select>
        {!isSheet && <OtherInput {...this.props} isSelect={true} />}
      </Fragment>
    );
  }

  /**
   * 渲染头部
   */
  tagRender = ({ value, onClose }) => {
    const { enumDefault2, options } = this.props;
    const { isFocus } = this.state;
    const { checkIds } = getCheckAndOther(this.props.value);
    const currentItem = options.find(o => o.key === value) || { color: '#1677ff' };
    const label = (value || '').toString().indexOf('add_') > -1 ? value.split('add_')[1] : currentItem.value;

    return (
      <span
        key={value}
        className={cx(
          'mTop5 mBottom5 mRight5',
          { White: enumDefault2 === 1 && !isLightColor(currentItem.color), isEmpty: value === 'isEmpty' },
          enumDefault2 === 1 || isFocus ? 'customAntDropdownTitleWithBG' : 'customAntDropdownTitle',
        )}
        style={{ background: enumDefault2 === 1 ? currentItem.color : isFocus ? '#eaeaea' : '' }}
        title={label}
      >
        <div className="ellipsis Font13">
          {label}
          {enumDefault2 !== 1 && !isFocus && value !== checkIds[checkIds.length - 1] && ','}
        </div>
        {isFocus && (
          <Icon
            icon={cx('close Font14 mLeft5 pointer', { White: enumDefault2 === 1 && !isLightColor(currentItem.color) })}
            onMouseDown={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={onClose}
            hint={_l('删除')}
            style={{ marginRight: -3, lineHeight: '24px' }}
          />
        )}
      </span>
    );
  };

  render() {
    const { className, isSheet, disabled, options, advancedSetting, value, controlName, onConClick } = this.props;
    const { checkIds, otherValue } = getCheckAndOther(value);
    const { checktype, direction, allowadd, readonlyshowall, showselectall } = advancedSetting || {};
    const isMobile = checktype === '1' && browserIsMobile();
    const Comp = isMobile ? MobileCheckbox : Fragment;

    // 多选下拉
    if (checktype === '1' && !browserIsMobile()) {
      return this.dropdownContent(checkIds);
    }

    return (
      <Fragment>
        <Comp
          disabled={disabled}
          allowAdd={checktype === '1' && allowadd === '1'}
          data={options.filter(item => !item.isDeleted && !item.hide)}
          delOptions={options.filter(item => item.isDeleted || item.hide)}
          checked={checkIds}
          callback={this.onSave}
          renderText={this.renderList}
          otherValue={otherValue}
          controlName={controlName}
          showselectall={showselectall}
        >
          <div
            className={cx(
              'customFormControlBox',
              { formBoxNoBorder: !isMobile, customFormControlDropDown: isMobile },
              { controlDisabled: disabled },
              { readOnlyDisabled: !isMobile && readonlyshowall === '1' && disabled },
              className,
            )}
            style={{ height: 'auto' }}
            onClick={onConClick}
          >
            <div
              className={cx('ming CheckboxGroup', {
                groupColumn: direction === '1' || (checktype === '1' && isMobile),
                groupRow: direction === '2' && !isMobile,
              })}
            >
              {isMobile ? this.wxContent(checkIds) : this.pcContent(checkIds)}
            </div>
          </div>
        </Comp>
        {isMobile && JSON.parse(value || '[]').some(it => _.includes(it, 'other')) && !disabled && !isSheet && (
          <OtherInput {...this.props} className="mTop5" isSelect={true} />
        )}
      </Fragment>
    );
  }
}

export default autoSize(Widgets, { onlyWidth: true });
