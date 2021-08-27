import React, { Component } from 'react';
import Trigger from 'rc-trigger';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Menu, MenuItem, Input } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
export default class AddCondition extends Component {
  static propTypes = {
    defaultVisible: PropTypes.bool,
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onAdd: PropTypes.func,
    from: PropTypes.string, //来源
  };
  constructor(props) {
    super(props);
    this.state = {
      keyword: '',
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
    let { from, columns, onAdd, renderInParent, conditionCount, filterColumnClassName, popupContainer } = this.props;
    const { keyword, columnListVisible } = this.state;
    if (from === 'rule') {
      columns = columns.filter(item => !_.includes(SYS, item.controlId));
    }
    if (keyword) {
      columns = columns.filter(c => c.controlName.indexOf(keyword) > -1);
    }
    return (
      <div className={cx('Hand addFilterCondition', { nodata: !conditionCount, active: columnListVisible })}>
        <Trigger
          action={['click']}
          popupVisible={columnListVisible}
          popup={
            <div className={cx('addFilterPopup', this.props.classNamePopup)} style={this.props.style}>
              <div className="columnsFilter">
                <i className="icon-search"></i>
                <Input
                  placeholder={_l('搜索')}
                  manualRef={this.inputRef}
                  onChange={e => {
                    this.setState({ keyword: this.inputRef.current.value });
                  }}
                />
              </div>
              <Menu
                className={cx('worksheetFilterColumnOptionList', filterColumnClassName)}
                onClickAwayExceptions={['.columnsFilter']}
                onClickAway={() => {
                  this.setState({ columnListVisible: false });
                }}
                style={this.props.style}
              >
                {columns.length ? (
                  _.sortBy(columns, 'row').map((c, i) => (
                    <MenuItem
                      className={cx({ segmentationLine: 'segmentation' in c })}
                      onClick={() => {
                        onAdd(c);
                        from !== 'fastFilter' && this.setState({ columnListVisible: false });
                      }}
                      key={i}
                    >
                      <i className={cx('Font16 icon', `icon-${getIconByType(c.type)}`)}></i>
                      <span>{c.controlName}</span>
                    </MenuItem>
                  ))
                ) : (
                  <div className="tip">{_l('没有更多字段')}</div>
                )}
              </Menu>
            </div>
          }
          getPopupContainer={() => (renderInParent ? this.box : document.body)}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: this.props.offset ? this.props.offset : [0, 12],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
        >
          <span
            ref={con => (this.box = con)}
            onClick={() => {
              this.setState({ columnListVisible: true }, () => {
                if (this.inputRef.current) {
                  this.inputRef.current.focus();
                }
              });
            }}
          >
            {this.props.comp ? (
              this.props.comp()
            ) : (
              <React.Fragment>
                <i className="icon icon-add"></i>
                {_l('添加筛选条件')}
              </React.Fragment>
            )}
          </span>
        </Trigger>
      </div>
    );
  }
}
