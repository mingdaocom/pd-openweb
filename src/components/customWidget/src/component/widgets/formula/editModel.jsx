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
        <input type="text" />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.FORMULA.type,
  EditModel,
};
