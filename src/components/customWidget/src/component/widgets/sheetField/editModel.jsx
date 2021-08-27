import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editModel" style={{ lineHeight: '32px', color: '#ccc' }}>
        <input type="text" />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SHEETFIELD.type,
  EditModel,
};
