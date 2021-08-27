import React from 'react';
import config from '../../../config';
import Dropdown from '../../common/dropdown';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { widget } = this.props;
    let { data } = widget;
    let defaultValue, dropdownData;
    data.options.forEach(item => {
      if (item.checked && !item.isDeleted) {
        defaultValue = item.value;
      }
    });
    if (defaultValue === undefined) {
      dropdownData = [{ value: 0, name: data.hint }];
    } else {
      dropdownData = [{ value: 0, name: defaultValue }];
    }
    let content = <Dropdown data={dropdownData} value={0} onChange={() => {}} width="100%" />;
    if (data.sourceType === 2) {
      content = (
        <textarea
          type="textarea"
          ref="txt"
          readOnly="true"
          value={_l('从数据源中选择')}
          style={{
            color: '#ccc',
            border: '0',
          }}
        />
      );
    }
    return <div className="editModel editOptions">{content}</div>;
  }
}

export default {
  type: config.WIDGETS.DROPDOWN.type,
  EditModel,
};
