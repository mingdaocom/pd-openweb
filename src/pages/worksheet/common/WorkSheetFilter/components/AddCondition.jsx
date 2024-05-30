import React, { Component } from 'react';
import Trigger from 'rc-trigger';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import SelectControls from './SelectControls';

export default class AddCondition extends Component {
  static propTypes = {
    defaultVisible: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onAdd: PropTypes.func,
    from: PropTypes.string, // 来源
  };
  constructor(props) {
    super(props);
    this.state = {
      columnListVisible: _.isUndefined(props.defaultVisible) ? false : props.defaultVisible,
    };
  }

  inputRef = React.createRef();

  componentDidMount() {
    setTimeout(() => {
      if (this.inputRef.current) {
        this.inputRef.current.focus();
      }
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.from === 'fastFilter' &&
      nextProps.defaultVisible !== this.state.columnListVisible &&
      !_.isUndefined(nextProps.defaultVisible)
    ) {
      this.setState({ columnListVisible: nextProps.defaultVisible });
    }
  }

  render() {
    let {
      disabled,
      from,
      columns = [],
      isAppendToBody,
      onAdd,
      children,
      renderInParent,
      conditionCount,
      filterColumnClassName,
      popupContainer,
    } = this.props;
    const { columnListVisible } = this.state;
    if (from === 'rule') {
      columns = columns.filter(item => !_.includes(SYS, item.controlId));
    }
    // 汇总不支持日期控件
    if (from === 'subTotal') {
      columns = columns.filter(
        item => !(_.includes([15, 16], item.type) || (item.type === 38 && item.enumDefault === 2)),
      );
    }
    if (md.global.Account.isPortal) {
      columns = columns.filter(item => !_.includes(['ownerid', 'caid', 'uaid'], item.controlId));
    }
    return (
      <div className={cx('Hand addFilterCondition', { nodata: !conditionCount, active: columnListVisible })}>
        <Trigger
          action={['click']}
          popupVisible={columnListVisible}
          popup={
            <SelectControls
              style={this.props.style}
              controls={columns}
              className={this.props.classNamePopup}
              filterColumnClassName={filterColumnClassName}
              onAdd={control => {
                onAdd(control);
                if (from !== 'fastFilter') {
                  this.setState({ columnListVisible: false });
                }
              }}
              onClose={() => {
                this.setState({ columnListVisible: false });
              }}
            />
          }
          getPopupContainer={() => (renderInParent && !isAppendToBody ? this.box : document.body)}
          popupAlign={
            this.props.popupAlign || {
              points: ['tl', 'bl'],
              offset: this.props.offset ? this.props.offset : [0, 12],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }
          }
        >
          <div
            ref={con => (this.box = con)}
            onClick={() => {
              if (disabled) {
                return;
              }
              this.setState({ columnListVisible: true }, () => {
                if (this.inputRef.current) {
                  this.inputRef.current.focus();
                }
              });
            }}
          >
            {children ||
              (this.props.comp ? (
                this.props.comp()
              ) : (
                <React.Fragment>
                  <i className="icon icon-add"></i>
                  {_l('添加筛选条件')}
                </React.Fragment>
              ))}
          </div>
        </Trigger>
      </div>
    );
  }
}
