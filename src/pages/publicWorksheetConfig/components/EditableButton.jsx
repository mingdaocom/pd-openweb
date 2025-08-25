import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Input } from 'ming-ui';

const SubmitButton = styled(Button)`
  max-width: 756px;
  .submitContent {
    height: 40px;
    border-radius: 3px;
    padding: 0 32px;
    overflow: hidden;
    white-space: nowrap;
    i {
      line-height: 40px;
    }
    &:hover {
      background: rgba(0, 0, 0, 0.1);
    }
  }
`;

export default class EditableButton extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    themeBgColor: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
  }

  render() {
    const { name, onChange, themeBgColor } = this.props;
    const { isEditing } = this.state;
    return (
      <div>
        {isEditing ? (
          <Input
            manualRef={con => (this.con = con)}
            defaultValue={name}
            onBlur={e => {
              if (e.target.value.trim() === '') {
                alert(_l('提交名称不能为空'), 3);
                this.con.focus();
                e.preventDefault();
                return;
              }
              this.setState({ isEditing: false });
              onChange(e.target.value.trim());
            }}
          />
        ) : (
          <SubmitButton
            style={{
              background: themeBgColor,
              padding: 0,
              color: new TinyColor(themeBgColor).isDark() ? '#fff' : 'rgba(0, 0, 0, 0.45)',
            }}
            onClick={() => {
              this.setState({ isEditing: true }, () => {
                setTimeout(() => {
                  if (this.con) {
                    this.con.focus();
                  }
                }, 100);
              });
            }}
          >
            <div className="submitContent">
              <span className="text ellipsis InlineBlock">{name}</span>
              <i className="icon icon-hr_edit"></i>
            </div>
          </SubmitButton>
        )}
      </div>
    );
  }
}
