import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Popover } from 'ming-ui/antd-components';
import { ROW_ID_CONTROL } from 'src/utils/domain/control/widget';
import SelectControls from './SelectControls';

const SELECT_CONTROLS_POPOVER_STYLES = {
  container: {
    overflow: 'hidden',
  },
};

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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        this.props.from === 'fastFilter' &&
        this.props.defaultVisible !== this.state.columnListVisible &&
        !_.isUndefined(this.props.defaultVisible)
      ) {
        this.setState({
          columnListVisible: this.props.defaultVisible,
        });
      }
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

    // 关联记录、查询记录（非聚合表）支持rowId,查询工作表也只支持rowid
    if (
      from === 'relateSheet' &&
      !_.find(columns, { controlId: 'rowid' }) &&
      (_.isEmpty(widgetControlData) ||
        (_.includes([29, 35, 51], widgetControlData.type) &&
          _.get(widgetControlData, 'advancedSetting.querytype') !== '1'))
    ) {
      columns = columns.concat(ROW_ID_CONTROL);
    }

    if (md.global.Account.isPortal) {
      columns = columns.filter(item => !_.includes(['ownerid', 'caid', 'uaid'], item.controlId));
    }

    const popupAlign = this.props.popupAlign || {
      offset: this.props.offset || [2, 2],
    };

    return (
      <div className={cx('Hand addFilterCondition', { nodata: !conditionCount, active: columnListVisible })}>
        <Popover
          trigger="click"
          open={columnListVisible}
          onOpenChange={visible => {
            if (!disabled) {
              this.setState({ columnListVisible: visible });
            }
          }}
          content={
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
            />
          }
          getPopupContainer={() => (renderInParent && !isAppendToBody ? this.box : document.body)}
          placement="bottom"
          align={popupAlign}
          noPadding
          styles={SELECT_CONTROLS_POPOVER_STYLES}
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
        </Popover>
      </div>
    );
  }
}
