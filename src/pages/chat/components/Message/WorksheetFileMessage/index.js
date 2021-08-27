
import React, { Component } from 'react';

export default class WorksheetFileMessage extends Component {
  constructor(props) {
    super(props);
  }
  handleOpenWorksheet() {
    const { card } = this.props.message;
    window.open(card.url);
  }
  render() {
    const { card } = this.props.message;
    return (
      <div className="Message-file" onClick={this.handleOpenWorksheet.bind(this)}>
        <div className="Message-fileIcon">
          <i className="fileIcon-worksheet" style={{width: 40}}/>
        </div>
        <div className="Message-fileInfo">
          <div className="Message-fileName">{ card.title }</div>
          <div className="Message-fileSize">{ _l('来自应用') }</div>
        </div>
      </div>
    )
  }
}
