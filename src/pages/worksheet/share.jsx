import React, { Component } from 'react';
import WorksheetShareLand from './pages/WorksheetShareLand';

export default class WorksheetShareLandEntry extends Component {
  componentDidMount() {
    $('html').addClass('WorksheetShareApp');
  }
  componentWillUnmount() {
    $('html').removeClass('WorksheetShareApp');
  }
  render() {
    return <WorksheetShareLand worksheetId={this.props.match.params.id} />;
  }
}
