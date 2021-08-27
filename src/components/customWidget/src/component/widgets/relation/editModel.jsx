import React from 'react';
import config from '../../../config';

class EditModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="editModel" style={{ lineHeight: '32px', color: '#ccc' }}>
        <i className="icon-plus Font16 mRight5" />
        {_l('连接')}
      </div>
    );
  }
}
export default {
  type: config.WIDGETS.RELATION.type,
  EditModel,
};
