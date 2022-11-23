import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';
import cx from 'classnames';
import _ from 'lodash';
import 'src/components/mdBusinessCard/mdBusinessCard';

/**
 * 用户姓名，正常用户可以点到其详情页。带 hover 的层
 */
class UserName extends React.Component {
  static propTypes = {
    user: PropTypes.shape({
      userName: PropTypes.string,
      accountId: PropTypes.string,
      isDelete: PropTypes.any,
    }),
    withAt: PropTypes.bool,
    isSecretary: PropTypes.bool,
    className: PropTypes.string,
    bindBusinessCard: PropTypes.bool,
  };

  static defaultProps = {
    bindBusinessCard: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    this.bindCard();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user.accountId !== this.props.user.accountId) {
      this.bindCard();
    }
  }

  componentWillMount() {
    this._isMounted = false;
  }

  bindCard = () => {
    const $this = $(ReactDom.findDOMNode(this));
    const accountId = this.props.user.accountId;
    if (!this.props.bindBusinessCard) {
      return false;
    }
    if (!this._isMounted || !accountId || accountId == '2' || accountId == '4') {
      return;
    }
    $this.mdBusinessCard({
      force: true,
      accountId,
      chatByLink: true, // Chat图标已link 方式跳转
    });
  };

  render() {
    const attrs = {};
    if (this.props.isSecretary) {
      attrs.className = 'Gray_6';
    } else if (this.props.user.isDelete) {
      attrs.className = 'DisabledColor';
    } else {
      attrs.href = '/user_' + this.props.user.accountId;
    }
    if (attrs.href) {
      attrs.target = '_blank';
    }
    attrs.className = cx(attrs.className, this.props.className);
    attrs['data-id'] = this.props.user.accountId;
    const props = _.assign({}, this.props, attrs);
    delete props.user;
    delete props.withAt;
    delete props.isSecretary;
    delete props.bindBusinessCard;
    return React.createElement(attrs.href ? 'a' : 'span', props, (this.props.withAt ? '@' : '') + this.props.user.userName);
  }
}

export default UserName;
