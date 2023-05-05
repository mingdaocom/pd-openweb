import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import filterXss from 'xss';
import { Input, Textarea } from 'ming-ui';

const Con = styled.div(
  ({ active }) => `
  padding: 10px 20px;
  white-space: pre-line;
  ${active ? 'background: #f5f5f5' : ''}
  :hover { background: #f5f5f5 }
`,
);
const EmptyTip = styled.span`
  color: #9e9e9e;
`;
const NewInput = styled(Input)`
  border: none !important;
  padding: 0 !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  background-color: transparent;
`;
const NewTextarea = styled(Textarea)`
  display: block;
  color: inherit;
  border: none !important;
  padding: 0 !important;
  font-size: inherit !important;
  line-height: inherit;
  background-color: transparent;
`;

export default class EditableText extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    mutiLine: PropTypes.bool, // 多行
    turnLine: PropTypes.bool, // 多行呈现换行
    minHeight: PropTypes.number,
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
    const { mutiLine, turnLine, minHeight, className, emptyTip, style, value, onChange } = this.props;
    const { inputvalue, editting } = this.state;
    return (
      <Con
        className={`editableText Hand ${className || ''}`}
        active={editting}
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
            manualRef={input => (this.input = input)}
            value={inputvalue}
            onBlur={e => {
              onChange(e.target.value);
              this.setState({ editting: false });
            }}
            onChange={v => this.setState({ inputvalue: turnLine ? v : v.replace(/\n/g, '') })}
          />
        )}
        {editting && mutiLine && (
          <NewTextarea
            minHeight={minHeight}
            manualRef={input => (this.input = input)}
            value={inputvalue}
            onBlur={e => {
              onChange(e.target.value);
              this.setState({ editting: false });
            }}
            onChange={v => this.setState({ inputvalue: turnLine ? v : v.replace(/\n/g, '') })}
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
