import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  render() {
    return (
      <div className="editModel editTextareaInput">
        <textarea
          type="textarea"
          ref="txt"
          readOnly="true"
          value={this.props.widget.data.hint || _l('未关联字段')}
          style={{
            color: '#ccc',
            border: '0',
            background: 'transparent',
          }}
        />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.MONEY_CN.type,
  EditModel,
};
