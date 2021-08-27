import React from 'react';
import config from '../../../config';

import '../../common/buttonAdd.less';

class EditModel extends React.Component {
  render() {
    return (
      <div className="editModel">
        <span className="buttonAdd">
          <i className="icon-task-add-member-circle" />
        </span>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.USER_PICKER.type,
  EditModel,
};
