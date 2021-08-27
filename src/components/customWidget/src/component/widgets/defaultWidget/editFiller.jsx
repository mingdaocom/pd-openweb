import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div />;
  }
}

export default {
  type: config.WIDGETS.EDIT_FILLER.type,
  EditModel,
};
