import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import filterXss from 'xss';
import { Input } from 'ming-ui/antd-components';

const TEXTAREA_STYLES = {
  root: {
    color: 'inherit',
    display: 'block',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    padding: 0,
  },
};

const Con = styled.div(
  ({ $active }) => `
  padding: 10px 20px;
  white-space: pre-line;
  ${$active ? 'background: var(--color-background-secondary)' : ''}
  &:hover { background: var(--color-background-secondary) }
`,
);
const EmptyTip = styled.span`
  color: var(--color-text-tertiary);
`;
const NewInput = styled(Input)`
  padding: 0 !important;
  font-weight: inherit !important;
  background-color: transparent;
`;

export default class EditableText extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    mutiLine: PropTypes.bool, // 多行
    turnLine: PropTypes.bool, // 多行呈现换行
    minHeight: PropTypes.number,
    maxLength: PropTypes.number,
    style: PropTypes.shape({}),
    emptyTip: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      inputvalue: props.value,
      editting: false,
    };
  }
  render() {
    const { mutiLine, turnLine, minHeight, maxLength, className, emptyTip, style, value, onChange } = this.props;
    const { inputvalue, editting } = this.state;
    return (
      <Con
        className={`editableText Hand ${className || ''}`}
        $active={editting}
        style={style}
        onClick={() => {
          this.setState({ editting: true, inputvalue: value }, () => {
            setTimeout(() => {
              if (this.input) this.input.focus();
            }, 100);
          });
        }}
      >
        {editting && !mutiLine && (
          <NewInput
            variant="borderless"
            ref={input => (this.input = input)}
            value={inputvalue}
            onBlur={e => {
              onChange(e.target.value);
              this.setState({ editting: false });
            }}
            onChange={event => {
              const value = event.target.value;
              this.setState({ inputvalue: turnLine ? value : value.replace(/\n/g, '') });
            }}
          />
        )}
        {editting && mutiLine && (
          <Input.TextArea
            autoSize
            maxLength={maxLength}
            ref={input => (this.input = input)}
            style={{ minHeight }}
            styles={TEXTAREA_STYLES}
            variant="borderless"
            onBlur={e => {
              onChange(e.target.value);
              this.setState({ editting: false });
            }}
            onChange={event => {
              const value = event.target.value;
              this.setState({ inputvalue: turnLine ? value : value.replace(/\n/g, '') });
            }}
            value={inputvalue}
          />
        )}
        {!editting && (
          <div>
            {value ? (
              <span dangerouslySetInnerHTML={{ __html: filterXss(value) }} />
            ) : (
              <EmptyTip>{emptyTip || _l('点击设置')}</EmptyTip>
            )}
          </div>
        )}
      </Con>
    );
  }
}
