import React, { Component } from 'react';

export default class NodeNameInput extends Component {
  cacheName = '';

  render() {
    const { name, updateSource } = this.props;

    return (
      <input
        type="text"
        className="flex"
        value={name}
        onFocus={() => (this.cacheName = name)}
        onChange={evt => updateSource({ name: evt.currentTarget.value })}
        onBlur={evt => !evt.currentTarget.value.trim() && updateSource({ name: this.cacheName })}
      />
    );
  }
}
