import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { ROW_ID_CONTROL } from 'src/pages/widgetConfig/config/widget';
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
      doNotCloseMenuWhenAdd,
      columns = [],
      isAppendToBody,
      onAdd,
      children,
      renderInParent,
      conditionCount,
      filterColumnClassName,
      widgetControlData = {},
    } = this.props;
    const { columnListVisible } = this.state;
    // 关联记录、查询记录（非聚合表）支持rowId
    if (
      from === 'relateSheet' &&
      _.includes([29, 35, 51], widgetControlData.type) &&
      _.get(widgetControlData, 'advancedSetting.querytype') !== '1' &&
      !_.find(columns, { controlId: 'rowid' })
    ) {
      columns = columns.concat(ROW_ID_CONTROL);
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
              visible={columnListVisible}
              onAdd={control => {
                onAdd(control);
                if (from !== 'fastFilter' && !doNotCloseMenuWhenAdd) {
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
              this.setState({ columnListVisible: true });
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
