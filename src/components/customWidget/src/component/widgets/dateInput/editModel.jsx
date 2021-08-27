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
      <div className="editModel editPhoneNumber">
        <input type="text" placeholder={_l('请选择日期')} />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.DATE_INPUT.type,
  EditModel,
};
