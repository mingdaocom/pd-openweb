import React, { Component } from 'react';

// 点击esc隐藏
export default function withEscClose(Comp) {
  return class WithEscCloseComponent extends Component {
    componentDidMount() {
      this.removeEscEvent = this.bindEscEvent();
    }
    componentWillUnmount() {
      this.removeEscEvent && this.removeEscEvent();
    }
    bindEscEvent = () => {
      const body = document.body;

      if (!body) {
        return () => {};
      }

      body.addEventListener('keydown', this.closeWhenPressEsc);
      return () => body.removeEventListener('keydown', this.closeWhenPressEsc);
    };
    closeWhenPressEsc = e => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        this.props.onClose();
      }
    };
    render() {
      const { ...props } = this.props;
      return <Comp {...props} />;
    }
  };
}
