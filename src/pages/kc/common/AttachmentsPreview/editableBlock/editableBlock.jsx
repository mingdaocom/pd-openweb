import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';

class EditableBlock extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    className: PropTypes.string,
    onChange: PropTypes.func,
    canEdit: PropTypes.bool,
    validateFileName: PropTypes.func,
    ext: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
      value2: props.value,
      isEditing: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      value2: nextProps.value,
    });
  }

  renameHandle() {
    const value = this.state.value;
    if (!this.props.validateFileName(value)) {
      this.inputFileName.focus();
      return false;
    }
    if (value !== this.state.value2) {
      this.props.onChange(value);
    }
    this.setState({
      isEditing: false,
    });
  }

  render() {
    const isEditing = this.state.isEditing;
    const extOfShow = this.props.ext === '.' ? '' : this.props.ext;
    return (
      <div className={cx('editableBlock', this.props.className)}>
        <span
          className={cx('content', {
            hide: isEditing,
          })}
          title={this.state.value + extOfShow}
          onClick={() => {
            if (!this.props.canEdit) {
              return;
            }
            this.setState(
              {
                isEditing: true,
              },
              () => {
                this.inputFileName.focus();
              },
            );
          }}
        >
          <span className="fileName ellipsis">{this.state.value}</span>
          {extOfShow}
        </span>
        <input
          ref={input => {
            this.inputFileName = input;
          }}
          type="text"
          className={cx({
            hide: !isEditing,
          })}
          value={this.state.value}
          onChange={e => {
            this.setState({
              value: e.target.value,
            });
          }}
          onBlur={this.renameHandle.bind(this)}
          onKeyDown={evt => {
            if (evt.keyCode === 13) {
              evt.target.blur();
            }
            evt.stopPropagation();
            evt.nativeEvent.stopImmediatePropagation();
          }}
        />
      </div>
    );
  }
}

export default EditableBlock;
