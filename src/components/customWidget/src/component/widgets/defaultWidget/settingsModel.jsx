import React from 'react';
import config from '../../../config';

class SettingsModel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="defaultSettings">
        <p>{_l('当前没有选中任何控件')}</p>
      </div>
    );
  }
}

export default {
  SettingsModel,
};
