import React, { Component } from 'react';

export default class DragPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div id="stageDragPreview" dangerouslySetInnerHTML={{ __html: this.props.preview }} />;
  }
}
