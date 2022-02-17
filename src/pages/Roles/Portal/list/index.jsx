import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import PendingReview from './PendingReview';
import Permissions from './Permissions';
import Statistics from './Statistics';
import User from './User';
import * as actions from '../redux/actions';

const Wrap = styled.div`
  &.portalTable {
    flex: 1;
    max-height: calc(100% - 36px);
  }
  &.statistics {
    // overflow: auto;
    min-height: calc(100% - 36px);
  }
`;
const WrapCon = styled.div``;
const TYPE_TO_COMP = [User, PendingReview, Permissions, Statistics];
class PortalTable extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { getControls, appId } = this.props;
    getControls(appId);
  }

  render() {
    const { type } = this.props;
    const Component = TYPE_TO_COMP[type];

    return (
      <Wrap className={cx('portalTable', { statistics: type === 3 })}>
        <Component {...this.props} />
      </Wrap>
    );
  }
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalTable);
