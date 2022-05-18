import React, { Component } from 'react';
import { getWorksheetInfo } from 'src/api/worksheet';
import { getAppDetail } from 'src/api/homeApp';

export default class WorksheetFileMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.loadFrom();
  }
  handleOpenWorksheet() {
    const { card } = this.props.message;
    window.open(card.url);
  }
  loadFrom() {
    const { card = {} } = this.props.message;
    const { from, appId, worksheetId } = card.extra || {};
    if (!appId && !worksheetId) {
      this.setState({
        from: _l('应用'),
      });
      return;
    }
    let promise;
    if (_.includes(['report', 'customPage'], from)) {
      promise = getAppDetail({ appId }).then(data => _l('"%0"应用', data.name));
    } else {
      promise = getWorksheetInfo({ worksheetId }).then(data => _l('"%0"工作表', data.name));
    }
    Promise.all([promise])
      .then(name => {
        this.setState({ from: name });
      })
      .catch(() =>
        this.setState({
          from: _l('应用'),
        }),
      );
  }
  render() {
    const { card } = this.props.message;
    return (
      <div className="Message-file" onClick={this.handleOpenWorksheet.bind(this)}>
        <div className="Message-fileIcon">
          <i className="fileIcon-worksheet" style={{ width: 40 }} />
        </div>
        <div className="Message-fileInfo">
          <div className="Message-fileName">{card.title}</div>
          <div className="Message-fileSize">{_l('来自%0', this.state.from)}</div>
        </div>
      </div>
    );
  }
}
