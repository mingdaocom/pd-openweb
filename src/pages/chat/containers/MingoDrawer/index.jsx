import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import Mingo from 'src/components/Mingo';
import * as actions from 'src/pages/chat/redux/actions';

const MingoDrawer = props => {
  const { drawerVisible, toolbarConfig, setToolbarConfig } = props;
  const { mingoFixing } = toolbarConfig;
  return (
    <Mingo
      drawerVisible={drawerVisible}
      mingoFixing={mingoFixing}
      onFixing={() => {
        setToolbarConfig({ mingoFixing: !mingoFixing });
        localStorage.setItem('mingoFixing', !mingoFixing);
      }}
      onClose={() => {
        setToolbarConfig({ mingoVisible: false });
        localStorage.removeItem('toolBarOpenType');
      }}
    />
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(MingoDrawer);
