import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'ming-ui';

export default class EditableButton extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
    };
  }

  render() {
    const { name, onChange } = this.props;
    const { isEditing } = this.state;
    return <div>
      { isEditing ? <Input
        manualRef={con => (this.con = con)}
        defaultValue={name}
        onBlur={(e) => {
          if (e.target.value.trim() === '') {
            alert(_l('提交名称不能为空'), 3);
            this.con.focus();
            e.preventDefault();
            return;
          }
          this.setState({ isEditing: false });
          onChange(e.target.value.trim());
        }}
      /> : <Button
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
        <span className="text ellipsis InlineBlock">{ name }</span>
        <i className="icon icon-hr_edit"></i>
      </Button> }
    </div>;
  }
}
