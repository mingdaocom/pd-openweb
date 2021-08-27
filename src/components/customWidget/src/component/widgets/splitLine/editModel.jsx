import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let controlName = this.props.widget.data.controlName;

    if (controlName) {
      return <div />;
    }

    return (
      <div className="editModel editPhoneNumber">
        <div
          style={{
            borderBottomColor: '#F5F5F5',
            borderBottomWidth: '10px',
            borderBottomStyle: 'solid',
          }}
        />
        <div style={{}} />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SPLIT_LINE.type,
  EditModel,
};
