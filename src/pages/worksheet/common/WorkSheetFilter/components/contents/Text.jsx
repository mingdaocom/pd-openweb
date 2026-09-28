import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Select, Tag, Tooltip } from 'ming-ui/antd-components';
import { CONTROL_FILTER_WHITELIST, FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const FieldWrap = styled.div`
  position: relative;
`;

const CaseSensitiveBtn = styled.span`
  position: absolute;
  top: 50%;
  right: 5px;
  transform: translateY(-50%);
  z-index: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-tertiary);
  font-size: 18px;
  &:hover {
    background-color: var(--color-background-hover);
  }
  &.disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
    &:hover {
      background-color: transparent;
    }
  }
  &.active {
    color: var(--color-primary);
  }
`;

const DropdownWrap = styled.div`
  padding: 6px 12px;
`;

const TEXT_TAG_STYLES = {
  root: {
    maxWidth: 360,
    marginInlineEnd: 4,
    borderColor: 'var(--color-border-tertiary)',
    borderRadius: 12,
    backgroundColor: 'var(--tag-bg)',
    color: 'var(--color-text-primary)',
    lineHeight: '24px',
  },
};

const TEXT_TAG_LABEL_STYLE = {
  maxWidth: 320,
};

const preventTagMouseDown = event => {
  event.preventDefault();
  event.stopPropagation();
};

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
    this.state = {
      searchValue: undefined,
      values: this.props.values || [],
    };
  }

  onSearch = value => this.setState({ searchValue: value });

  onChange = value => {
    this.props.onChange({ values: value });
    this.setState({ searchValue: undefined, values: value });
  };

  onInputKeyDown = e => {
    if (e.key !== 'Enter') return null;

    // 中日韩输入法组字期间的回车是「确认候选词」，只应把候选词落进输入框，不能当成提交生成 tag。
    // rc-select 自己的 Enter 提交已排除组字态，但它调用 onInputKeyDown 时不做这层判断，需要在这里补。
    // keyCode 229 是浏览器对组字中按键的统一上报值，用于兜底 isComposing 缺失的场景。
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return null;

    const { searchValue, values } = this.state;
    const value = _.trim(searchValue);

    if (!value || _.includes(values, value)) return null;

    this.onChange(values.concat(value));
  };

  // 区分大小写：切换 advancedSetting.ignorecase（'0' 区分 / '1' 忽略），默认不区分（未设置 ignorecase 视为忽略），
  // 与快速筛选、视图搜索的口径一致；values 由 reducer $merge 保留
  onToggleCaseSensitive = () => {
    const { disabled, advancedSetting = {} } = this.props;

    if (disabled) return;

    const isCaseSensitive = _.get(advancedSetting, 'ignorecase') === '0';
    this.props.onChange({
      advancedSetting: {
        ...advancedSetting,
        ignorecase: isCaseSensitive ? '1' : '0',
      },
    });
  };

  tagRender = tag => {
    return (
      <Tag
        closable={tag.closable}
        variant="outlined"
        styles={TEXT_TAG_STYLES}
        onMouseDown={preventTagMouseDown}
        onClose={tag.onClose}
      >
        <span className="ellipsis InlineBlock TxtMiddle" style={TEXT_TAG_LABEL_STYLE}>
          {tag.label}
        </span>
      </Tag>
    );
  };

  popupRender = () => {
    const { searchValue } = this.state;

    if (!searchValue) return null;

    return (
      <DropdownWrap className="colorPrimary Font13 Hand">
        {_l('使用')}“{searchValue}”
      </DropdownWrap>
    );
  };

  render() {
    const { searchValue, values } = this.state;
    const { disabled, controlType, advancedSetting, type } = this.props;
    // 仅文本类字段支持区分大小写；「等于/不等于」是完整精确比较，隐藏区分大小写配置；默认不区分（未设置 ignorecase 视为忽略）
    const showCaseSensitive =
      _.includes(CONTROL_FILTER_WHITELIST.TEXT.keys, controlType) &&
      !_.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], type);
    const isCaseSensitive = _.get(advancedSetting, 'ignorecase') === '0';

    const select = (
      <Select
        mode="tags"
        className={cx('worksheetFilterTextCondition', { hasCaseSensitive: showCaseSensitive })}
        placeholder={_l('请输入')}
        classNames={{ popup: { root: cx('worksheetFilterTextPopup', { hide: !searchValue }) } }}
        disabled={disabled}
        value={values}
        searchValue={searchValue}
        style={{ width: '100%' }}
        suffixIcon={showCaseSensitive ? null : undefined}
        notFoundContent={null}
        onChange={this.onChange}
        onSearch={this.onSearch}
        tokenSeparators={['\r\n', '\n']}
        options={[]}
        tagRender={this.tagRender}
        popupRender={this.popupRender}
        onInputKeyDown={this.onInputKeyDown}
      />
    );

    if (!showCaseSensitive) return select;

    return (
      <FieldWrap>
        {select}
        <Tooltip title={_l('区分大小写')}>
          <CaseSensitiveBtn className={cx({ active: isCaseSensitive, disabled })} onClick={this.onToggleCaseSensitive}>
            <i className="icon icon-case" />
          </CaseSensitiveBtn>
        </Tooltip>
      </FieldWrap>
    );
  }
}
