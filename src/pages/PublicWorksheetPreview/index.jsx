import React from 'react';
import PublicWorksheet from '../PublicWorksheet/PublicWorksheet';

export default class extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { match: { params: { worksheetId } } } = this.props;
    return <PublicWorksheet worksheetId={worksheetId} isPreview />;
  }
}
