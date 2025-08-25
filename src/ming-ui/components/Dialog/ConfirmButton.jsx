import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from 'ming-ui/components/Button';

class ConfirmButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  handleClick() {
    const { action, onClose } = this.props;
    if (action) {
      const promise = action.apply(this);
      if (promise && promise.then) {
        this.setState({ loading: true });
        const stopLoading = noClose => {
          if (this.mounted) {
            this.setState({ loading: false });
          }
          if (!noClose) {
            onClose();
          }
        };
        promise.then(stopLoading, stopLoading);
      } else {
        if (promise === false) return;
        onClose();
      }
    } else {
      onClose();
    }
  }

  render() {
    return (
      <Button
        type={this.props.type}
        disabled={this.props.disabled}
        onClick={this.handleClick}
        loading={this.state.loading}
        className={this.props.className}
      >
        {this.props.children}
      </Button>
    );
  }
}

ConfirmButton.propTypes = {
  action: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
  type: PropTypes.string,
  className: PropTypes.string,
};

export default ConfirmButton;
