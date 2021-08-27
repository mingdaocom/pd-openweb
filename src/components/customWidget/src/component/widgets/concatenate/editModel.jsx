import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editModel editTextInput">
        <input type="text" />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.CONCATENATE.type,
  EditModel,
};
