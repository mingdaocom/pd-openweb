import React from 'react';
import PropTypes from 'prop-types';
import { DROPDOWN_GROUPLIST, TYPENAMES, INBOXTYPES } from '../constants';
import InboxHeader from './inboxHeader';
import InboxList from './inboxList';
import { browserIsMobile } from 'src/util';
import '../style.less';
import _ from 'lodash';

const getInitialLoadType = inboxType => {
  if (inboxType && DROPDOWN_GROUPLIST[inboxType]) {
    return _(DROPDOWN_GROUPLIST[inboxType]).head();
  } else {
    throw new Error('type in options not recognized!');
  }
};

export default class Inbox extends React.Component {
  static INBOXTYPES = INBOXTYPES;

  static propTypes = {
    inboxType: PropTypes.oneOf(_.values(INBOXTYPES)).isRequired,
    clearUnread: PropTypes.bool,
    callback: PropTypes.func,
  };

  static defaultProps = {
    clearUnread: false,
    callback: $.noop(),
  };

  state = {
    type: getInitialLoadType(this.props.inboxType),
    inboxFavorite: false,
    filter: null,
    updateNow: undefined,
  };

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.inboxType !== this.props.inboxType ||
      nextProps.count !== this.props.count ||
      nextProps.weak_count !== this.props.weak_count
    ) {
      this.setState({
        filter: null,
        type: getInitialLoadType(nextProps.inboxType),
      });
    }
  }

  changeType = type => {
    this.setState({
      type,
    });
  };

  changeUpdateNow = () => {
    this.setState({
      updateNow: Date.now(),
    });
  }

  changeFaviorite = inboxFavorite => {
    this.setState({
      inboxFavorite,
    });
  };

  changeInboxFilter = filter => {
    this.setState({
      filter,
    });
  };

  renderHeader() {
    const { inboxType } = this.props;
    const { type, inboxFavorite, filter } = this.state;

    const props = {
      type,
      inboxFavorite,
      inboxType,
      filter,
      title: INBOXTYPES.WORKSHEET === inboxType && md.global.Account.isPortal ? _l('消息') : TYPENAMES[inboxType],
      dropdownData: DROPDOWN_GROUPLIST[inboxType],
      changeType: this.changeType,
      changeFaviorite: this.changeFaviorite,
      changeInboxFilter: this.changeInboxFilter,
      changeUpdateNow: this.changeUpdateNow,
    };
    return <InboxHeader {...props} />;
  }

  renderList() {
    const { type, inboxFavorite, filter, updateNow } = this.state;
    const { clearUnread, inboxType, count, weak_count } = this.props;
    return (
      <InboxList
        {...{
          type,
          inboxFavorite,
          clearUnread,
          inboxType,
          count,
          weak_count: ['calendar'].includes(inboxType) ? weak_count : undefined,
          filter,
          updateNow
        }}
      />
    );
  }

  render() {
    return (
      <div className="flexColumn h100">
        {md.global.Account.isPortal && browserIsMobile() ? null : this.renderHeader()}
        {this.renderList()}
      </div>
    );
  }
}
