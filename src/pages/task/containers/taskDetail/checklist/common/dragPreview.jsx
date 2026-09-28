import React, { Component } from 'react';
import { sanitizePreviewHtml } from 'src/utils/core/sanitizeHtml';

export default class DragPreview extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div
        className="taskDetailDragPreview"
        dangerouslySetInnerHTML={{ __html: sanitizePreviewHtml(this.props.preview) }}
        style={{ width: this.props.width }}
      />
    );
  }
}
