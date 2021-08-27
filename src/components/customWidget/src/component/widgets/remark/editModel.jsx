import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  render() {
    let { widget } = this.props;
    return (
      <div className="editModel editTextareaInput">
        <textarea
          type="textarea"
          value={widget.data.dataSource || widget.defaultHint}
          style={{ color: '#ccc', border: '0', background: 'transparent' }}
          onChange={() => {}}
        />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.REMARK.type,
  EditModel,
};
