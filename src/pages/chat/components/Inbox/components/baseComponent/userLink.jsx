import React from 'react';
import cx from 'classnames';
import 'src/components/mdBusinessCard/mdBusinessCard';

export default class UserLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props,
      binded: false,
    };
  }

  bindBusinessCard() {
    if (this.state.binded || !this.card) return false;

    this.setState({
      binded: true,
    });
    $(this.card)
      .mdBusinessCard({
        accountId: this.state.accountId,
      })
      .trigger('mouseenter');
  }

  componentWillUnMount() {
    if (this.card) {
      $(this.card).mdBusinessCard('destroy');
    }
  }

  render() {
    const { accountId, fullname } = this.props;
    let param = {};
    if (!(md.global.Account.isPortal || (accountId || '').indexOf('a#') > -1)) {
      param = {
        href: '/user_' + accountId,
        target: '_blank',
      };
    }
    return (
      <a
        onMouseOver={this.bindBusinessCard.bind(this)}
        ref={elem => {
          this.card = elem;
        }}
      >
        {fullname}
      </a>
    );
  }
}
