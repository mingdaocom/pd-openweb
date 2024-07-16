import React from 'react';
import { createRoot } from 'react-dom/client';
import _ from 'lodash';
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

  const root = createRoot(div);

  function destory() {
    if (_.isFunction(props.onClose)) {
      props.onClose();
    }
    root.unmount(div);
    document.body.removeChild(div);
  }
  root.render(<RecordInfo visible {...props} hideRecordInfo={destory} />);
}
