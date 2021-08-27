import React, { Component } from 'react';

export default class DragPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className="taskDetailDragPreview" dangerouslySetInnerHTML={{ __html: this.props.preview }} style={{ width: this.props.width }} />;
  }
}
