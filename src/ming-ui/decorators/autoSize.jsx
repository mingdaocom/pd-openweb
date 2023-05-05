import React from 'react';
import { emitter } from 'worksheet/util';
import _ from 'lodash';

export default function (Comp, { onlyWidth } = {}) {
  return class AutoSizer extends React.PureComponent {
    constructor(props) {
      super(props);
      const size = props.width && props.height ? { width: props.width, height: props.height } : undefined;
      this.state = {
        id: (Math.random() * Math.random()).toString(32),
        size,
      };
      this.clientWidth = 0;
    }

    componentDidMount() {
      if (this.state.size) return;
      function setSize() {
        this.setState({
          size: this.con
            ? {
                width: this.con.clientWidth,
                height: this.con.clientHeight,
              }
            : {},
        });
      }
      if (process.env.NODE_ENV !== 'production' && !window.sheetAutoSized) {
        setTimeout(setSize.bind(this), 300);
        window.sheetAutoSized = true;
      } else {
        setSize.apply(this);
      }
      this.debounceHandleUpdate = _.debounce(this.handleUpdate, 100);
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeOb = new ResizeObserver(() => {
          if (
            this.con &&
            (Math.abs(this.con.clientWidth - this.clientWidth) > 10 ||
              (this.props.watchHeight && Math.abs(this.con.clientHeight - this.clientHeight) > 10))
          ) {
            this.updateWidth();
          }
        });
        this.resizeOb.observe(this.con);
      } else {
        this.watchWidth();
      }
    }

    componentDidUpdate() {
      if (
        this.con &&
        this.size &&
        (this.con.clientWidth !== this.state.size.width || this.con.clientHeight !== this.state.size.height)
      ) {
        this.setState({
          size: {
            width: this.con.clientWidth,
            height: this.con.clientHeight,
          },
        });
      }
    }

    componentWillUnmount() {
      if (this.resizeOb) {
        this.resizeOb.unobserve(this.con);
        this.resizeOb.disconnect();
        delete this.resizeOb;
      }
      if (this.sizeWatcher) {
        clearInterval(this.sizeWatcher);
        delete this.sizeWatcher;
      }
    }

    updateWidth() {
      if (this.con) {
        this.clientWidth = this.con.clientWidth;
        this.clientHeight = this.con.clientHeight;
        this.debounceHandleUpdate();
      }
    }

    watchWidth() {
      this.updateWidth();
      this.sizeWatcher = setInterval(() => {
        if (
          this.con &&
          (Math.abs(this.con.clientWidth - this.clientWidth) > 10 ||
            (this.props.watchHeight && Math.abs(this.con.clientHeight - this.clientHeight) > 10))
        ) {
          this.updateWidth();
        }
      }, 100);
    }

    handleUpdate = () => {
      if (this.con) {
        this.setState({
          size: {
            width: this.con.clientWidth,
            height: this.con.clientHeight,
          },
        });
      }
    };

    render() {
      const { height, ...rest } = this.props;
      const { size, id } = this.state;
      return (
        <div
          className="autosize"
          id={id}
          ref={con => (this.con = con)}
          style={{ width: '100%', height: onlyWidth ? 'auto' : '100%' }}
        >
          {size && (
            <Comp
              {...rest}
              updateSize={this.handleUpdate}
              ref={table => (this.table = table)}
              width={size.width}
              height={height || size.height}
            />
          )}
        </div>
      );
    }
  };
}
