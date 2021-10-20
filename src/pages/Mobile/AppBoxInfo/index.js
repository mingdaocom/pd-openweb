import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import AppDetails from './AppDetails';

@withRouter
export default class AddBox extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { params } = this.props.match;
    return (
      <div className="flexColumn h100">
        {<AppDetails libraryId={params.libraryId}/>}
      </div>
    )
  }
}
