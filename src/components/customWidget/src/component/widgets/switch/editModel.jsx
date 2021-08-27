import React from 'react';
import config from '../../../config';
import Checkbox from '../../common/checkbox';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editModel editOptions switchCheckbox">
        <Checkbox toggleCheckbox={() => {}} />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.SWITCH.type,
  EditModel,
};
