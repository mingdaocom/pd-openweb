import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './popup.less';

const ClickAway = createDecoratedComponent(withClickAway);

class Popup extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    withMask: PropTypes.bool,
    onClickAwayExceptions: PropTypes.array,
    className: PropTypes.string,
    onClickAway: PropTypes.func,
    style: PropTypes.object,
    arrowStyle: PropTypes.object,
  };

  state = {
    style: this.props.style,
    arrowStyle: this.props.arrowStyle,
  };

  componentDidMount() {
    const $popup = $(this.popup);
    const position = $popup.offset();
    const outerOffset = position.left + $popup.width() - document.body.clientWidth;
    if (outerOffset > 0) {
      this.setState({
        style: _.assign({}, this.state.style, {
          left: -1 * (outerOffset + 10),
        }),
        arrowStyle: {
          marginLeft: outerOffset + 10,
        },
      });
    }
  }

  render() {
    const withMask = this.props.withMask;
    const popup = withMask ? (
      <div>
        <div className={cx('mingPopup', this.props.className)} ref={(ref) => (this.popup = ref)} style={this.state.style}>
          <span className="arrow" style={this.state.arrowStyle} />
          {this.props.children}
        </div>
        <p className="mingPopupMask" onClick={this.props.onClickAway} />
      </div>
    ) : (
      <ClickAway
        className={cx('mingPopup', this.props.className)}
        style={this.props.style}
        onClickAwayExceptions={this.props.onClickAwayExceptions}
        onClickAway={this.props.onClickAway}
      >
        <span className="arrow" style={this.props.arrowStyle} />
        {this.props.children}
      </ClickAway>
    );
    return popup;
  }
}

export default Popup;
