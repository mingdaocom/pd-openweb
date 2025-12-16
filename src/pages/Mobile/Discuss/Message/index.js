import React, { Component } from 'react';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import createLinksForMessage from 'src/utils/createLinksForMessage';

const newWhiteList = Object.assign({}, whiteList, { img: ['src', 'alt', 'title', 'width', 'height', 'class'] });

export default class extends Component {
  constructor(props) {
    super(props);
    this.textRef = React.createRef();
  }

  componentDidMount() {
    const { openPersonalInfoPopup } = this.props;
    if (this.textRef?.current && openPersonalInfoPopup) {
      this.textRef.current.addEventListener('click', this.handleClick);
    }
  }

  componentWillUnmount() {
    // 清除事件监听
    if (this.textRef.current) {
      this.textRef.current.removeEventListener('click', this.handleClick);
    }
  }

  handleClick = e => {
    const target = e.target;
    const { openPersonalInfoPopup } = this.props;

    if (openPersonalInfoPopup && target.tagName === 'A') {
      const href = target.getAttribute('href');
      const text = target.textContent || '';
      if (href?.startsWith('/user_') && text.includes('@')) {
        // 阻止 a 标签默认跳转
        e.preventDefault();
        const accountId = href.split('_')[1];
        openPersonalInfoPopup({ accountId });
      }
    }
  };

  renderMessage() {
    const { item } = this.props;
    const message = createLinksForMessage({
      sourceType: item.sourceType,
      message: item.message,
      rUserList: item.accountsInMessage,
    });
    return (
      <span
        ref={this.textRef}
        className="singeText"
        dangerouslySetInnerHTML={{
          __html: filterXSS(message, {
            whiteList: newWhiteList,
          }),
        }}
      />
    );
  }
  render() {
    return <div>{this.renderMessage()}</div>;
  }
}
