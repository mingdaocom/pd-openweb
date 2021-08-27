import React from 'react';
import ReactDOM from 'react-dom';
import RecordInfo from './RecordInfoWrapper';
export default class Record extends React.Component {
  shouldComponentUpdate(nextProps) {
    return this.props.recordId !== nextProps.recordId;
  }
  render() {
    return <RecordInfo {...this.props} />;
  }
}

export function openRecordInfo(props) {
  const div = document.createElement('div');
  document.body.appendChild(div);
  function destory() {
    ReactDOM.unmountComponentAtNode(div);
    document.body.removeChild(div);
  }
  ReactDOM.render(<RecordInfo visible {...props} hideRecordInfo={destory} />, div);
}
