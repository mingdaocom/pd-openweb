import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import * as actions from 'src/pages/chat/redux/actions';

const Collect = props => {
  const { toolbarConfig, setToolbarConfig } = props;
  const { favoriteFixing } = toolbarConfig;
  return (
    <div className="flexColumn h100 WhiteBG pLeft20 pRight20 pTop15 pBottom15">
      <div className="header flexRow alignItemsCenter justifyContentBetween">
        <Icon
          icon="set_top"
          className={cx('Font22 pointer', favoriteFixing ? 'Gray_75' : 'Gray_c')}
          onClick={() => {
            setToolbarConfig({ favoriteFixing: !favoriteFixing });
            localStorage.setItem('favoriteFixing', !favoriteFixing);
          }}
        />
        <Icon
          icon="close"
          className="Font22 pointer Gray_75"
          onClick={() => {
            setToolbarConfig({ favoriteVisible: false });
            localStorage.removeItem('toolBarOpenType');
          }}
        />
      </div>
      <div className="content mTop10 flex Font14">favorite content</div>
    </div>
  );
};

export default connect(
  state => ({
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Collect);
