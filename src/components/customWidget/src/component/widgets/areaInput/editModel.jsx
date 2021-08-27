import React from 'react';
import config from '../../../config';
import Dropdown from '../../common/dropdown';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editModel editOptions">
        <Dropdown data={[{ value: 0, name: _l('请选择') }]} value={0} onChange={() => {}} width="100%" />
      </div>
    );
  }
}

export default {
  type: config.WIDGETS.AREA_INPUT.type,
  EditModel,
};
