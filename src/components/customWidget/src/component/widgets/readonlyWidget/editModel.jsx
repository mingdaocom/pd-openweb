import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    return (
      <div className="editModel editTextInput">
        <input type="text" style={{ color: '#ccc', border: '0', background: 'transparent' }} defaultValue={widget.defaultHint} />
      </div>
    );
  }
}

export default EditModel;
