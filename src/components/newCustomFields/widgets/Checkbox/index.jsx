import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Checkbox, MobileCheckbox, Icon } from 'ming-ui';
import cx from 'classnames';
import { isLightColor } from 'src/util';
import { FROM } from '../../tools/config';
import { Select } from 'antd';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import OtherInput from './OtherInput';
import { getCheckAndOther } from '../../tools/utils';

export default class Widgets extends Component {
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

  /**
   * 渲染列表
   */
  renderList = (item, noMaxWidth) => {
    const { enumDefault2, from, advancedSetting, value, disabled } = this.props;
    const { otherValue } = getCheckAndOther(value);
    const { checktype } = advancedSetting || {};

    return (
      <span
        className={cx(
          'ellipsis customRadioItem',
          { White: enumDefault2 === 1 && !isLightColor(item.color) },
          { 'pLeft12 pRight12': enumDefault2 === 1 },
        )}
        style={{
          background: enumDefault2 === 1 ? item.color : '',
          maxWidth: noMaxWidth
            ? 'auto'
            : _.includes([FROM.H5_ADD, FROM.H5_EDIT], from) || (checktype === '1' && browserIsMobile())
            ? 280
            : 140,
        }}
      >
        {item.key === 'other' && otherValue && disabled && browserIsMobile() ? otherValue : item.value}
      </span>
    );
  };

  onChange = (checked, key) => {
    const { value } = this.props;
    const checkIds = JSON.parse(value || '[]');

    if (checked) {
      _.remove(checkIds, item => (key === 'other' ? item.startsWith(key) : item === key));
    } else {
      checkIds.push(key);
    }

    this.onSave(checkIds);
  };

  onSave = values => {
    this.props.onChange(JSON.stringify(values));
  };

  pcContent(checkIds) {
    const { disabled, options, value } = this.props;
    return options
      .filter(item => !item.isDeleted && ((disabled && _.includes(checkIds, item.key)) || !disabled))
      .map(item => {
        if (item.key === 'other' && disabled && browserIsMobile()) {
          return (
            <div className="flexColumn">
              <Checkbox
                key={item.key}
                disabled={disabled}
                title={item.value}
                text={this.renderList(item)}
                value={item.key}
                checked={_.includes(checkIds, item.key)}
                onClick={this.onChange}
              />
            </div>
          );
        }

        return (
          <div className="flexColumn">
            <Checkbox
              key={item.key}
              disabled={disabled}
              title={item.value}
              text={this.renderList(item)}
              value={item.key}
              checked={_.includes(checkIds, item.key)}
              onClick={this.onChange}
            />
            {item.key === 'other' && <OtherInput {...this.props} isSelect={browserIsMobile() ? true : false} />}
          </div>
        );
      });
  }

  wxContent(checkIds) {
    const { options, disabled, value } = this.props;
    const { otherValue } = getCheckAndOther(value);
    let sources = [];

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        sources.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
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
    const { disabled, hint, options, dropdownClassName, advancedSetting = {}, selectProps, onChange } = this.props;
    let noDelOptions = options.filter(item => !item.isDeleted);
    const { keywords } = this.state;

    checkIds.forEach(item => {
      if ((item || '').toString().indexOf('add_') > -1) {
        noDelOptions.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });

    // 搜索
    if (keywords.length) {
      noDelOptions = noDelOptions.filter(
        item =>
          (item.value || '').search(new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i')) !==
          -1,
      );
    }

    return (
      <Fragment>
        <Select
          ref={select => {
            this.select = select;
          }}
          mode="multiple"
          dropdownClassName={dropdownClassName}
          className="w100 customAntSelect"
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
          onSearch={keywords => this.setState({ keywords })}
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
            onChange(JSON.stringify(value));
            this.setState({ keywords: '' });
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
              <Select.Option value={item.key} key={i} className={cx({ isEmpty: item.key === 'isEmpty' })}>
                {this.renderList(item, true)}
              </Select.Option>
            );
          })}

          {!!keywords.length &&
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

  /**
   * 渲染头部
   */
  tagRender = ({ value, onClose }) => {
    const { enumDefault2, options } = this.props;
    const { isFocus } = this.state;
    const { checkIds } = getCheckAndOther(this.props.value);
    const currentItem = options.find(o => o.key === value) || { color: '#2196f3' };
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
    const { disabled, options, advancedSetting, value } = this.props;
    const { checkIds, otherValue } = getCheckAndOther(value);
    const { checktype, direction, allowadd } = advancedSetting || {};
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
          data={options.filter(item => !item.isDeleted)}
          checked={checkIds}
          callback={this.onSave}
          renderText={this.renderList}
          otherValue={otherValue}
        >
          <div
            className={cx('customFormControlBox', { formBoxNoBorder: !isMobile }, { controlDisabled: disabled })}
            style={{ height: 'auto' }}
          >
            <div className={cx('ming CheckboxGroup', { groupColumn: direction === '1' || browserIsMobile() })}>
              {isMobile ? this.wxContent(checkIds) : this.pcContent(checkIds)}
            </div>
          </div>
        </Comp>
        {isMobile && JSON.parse(value || '[]').some(it => _.includes(it, 'other')) && !disabled && (
          <OtherInput {...this.props} className="mTop5" isSelect={true} />
        )}
      </Fragment>
    );
  }
}
