import React from 'react';
import { TinyColor } from '@ctrl/tinycolor';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, Input } from 'ming-ui/antd-components';

const SubmitButton = styled(Button)`
  max-width: 756px;
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
    const buttonStyle = themeBgColor
      ? {
          '--public-form-submit-color': themeBgColor,
          color: new TinyColor(themeBgColor).isDark() ? '#fff' : 'rgba(0, 0, 0, 0.45)',
        }
      : undefined;

    return (
      <div>
        {isEditing ? (
          <Input
            ref={con => {
              this.con = con;
            }}
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
            color={themeBgColor ? 'var(--public-form-submit-color)' : 'primary'}
            variant="solid"
            icon={<i className="icon icon-hr_edit" />}
            iconPlacement="end"
            style={buttonStyle}
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
            <span className="text ellipsis InlineBlock">{name}</span>
          </SubmitButton>
        )}
      </div>
    );
  }
}
