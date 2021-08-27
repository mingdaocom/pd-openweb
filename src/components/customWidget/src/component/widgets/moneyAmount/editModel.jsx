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
      <div className="editModel editNumberInput">
        <input type="text" placeholder={data.hint} />
        <span className="unit">{data.unit}</span>
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.MONEY_AMOUNT.type,
  EditModel,
};
