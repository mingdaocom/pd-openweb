import React from 'react';
import config from '../../../config';

import TransparentBtn from '../../common/TransparentBtn';
import Icon from 'ming-ui/components/Icon';

class EditModel extends React.Component {
  render() {
    return (
      <div className="editModel">
        <TransparentBtn>
          <Icon icon="plus" />
          <span>{_l('选择部门')}</span>
        </TransparentBtn>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.GROUP_PICKER.type,
  EditModel,
};
