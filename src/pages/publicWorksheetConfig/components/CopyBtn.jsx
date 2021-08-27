import React from 'react';
import Clipboard from 'clipboard';

export default class CopyBtn extends React.Component {
  componentDidMount() {
    var clicboardObject = new Clipboard(this.copy, {
      text: () => this.props.copycontent,
    });
    clicboardObject.on('success', function () {
      alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
    });
    clicboardObject.on('error', function () {
      alert(_l('复制失败'), 3);
    });
  }
  render() {
    const { children } = this.props;
    return <div className="InlineBlock" ref={copy => (this.copy = copy)}>
      { children }
    </div>;
  }
}
