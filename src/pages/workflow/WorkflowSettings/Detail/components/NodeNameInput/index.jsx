import React, { Component } from 'react';
import { Input } from 'ming-ui/antd-components';

export default class NodeNameInput extends Component {
  cacheName = '';

  render() {
    const { name, disabled, updateSource } = this.props;

    return (
      <Input
        variant="borderless"
        className="flex"
        disabled={disabled}
        value={name}
        onFocus={() => (this.cacheName = name)}
        onChange={evt => updateSource({ name: evt.currentTarget.value })}
        onBlur={evt => !evt.currentTarget.value.trim() && updateSource({ name: this.cacheName })}
      />
    );
  }
}
