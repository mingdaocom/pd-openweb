import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Checkbox } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import './ColumnVisibleControl.less';

const systemControl = [
  {
    controlId: 'ownerid',
    controlName: _l('拥有者'),
    type: 26,
  },
  {
    controlId: 'caid',
    controlName: _l('创建人'),
    type: 26,
  },
  {
    controlId: 'ctime',
    controlName: _l('创建时间'),
    type: 16,
  },
  {
    controlId: 'utime',
    controlName: _l('最近修改时间'),
    type: 16,
  },
];

export default class ColumnVisibleControl extends Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    widgetId: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    selectedColumnIds: PropTypes.arrayOf(PropTypes.string),
    addShowControls: PropTypes.func,
    deleteShowControls: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      listVisible: false,
    };
  }
  render() {
    const { worksheetId, controls, selectedColumnIds, addShowControls, deleteShowControls } = this.props;
    const { listVisible } = this.state;
    const columns = controls.filter(item => item.type !== 20 && item.type !== 22 && item.type !== 25 && item.type !== 30 && item.type !== 10010).concat(systemControl);
    const disabled = !worksheetId;
    return (<div className={cx('columnVisibleControl', { disabled })}>
      <div
        className="controlHead"
        ref={head => (this.head = head)}
        onClick={() => {
          if (disabled) {
            return;
          }
          this.setState({ listVisible: true });
        }}
      >
        { worksheetId ? <div className="selectedContent overflow_ellipsis">
          { _l('显示%0个字段', selectedColumnIds.length) }
        </div> : <div className="selectedContent tip overflow_ellipsis">
          { _l('选择关联表后，设置显示字段') }
        </div> }
      { !disabled && <i className="icon icon-arrow-down-border slideIcon"></i> }
      </div>
      { listVisible && <Menu
        className="columnList"
        onClickAway={() => (this.setState({ listVisible: false }))}
        specialFilter={(target) => this.head && this.head.contains(target) }
      >
        { columns.length && <MenuItem key="all">
          <Checkbox
            size="small"
            text={_l('全选')}
            checked={selectedColumnIds.length === columns.length}
            onClick={() => {
              if (selectedColumnIds.length === columns.length) {
                deleteShowControls(selectedColumnIds.filter(id => id !== columns.find(o => o.attribute === 1).controlId));
              } else {
                addShowControls(columns.filter(column => !_.includes(selectedColumnIds, column.controlId)));
              }
            }}
          />
        </MenuItem> }
        { columns.length ? columns.map((column, i) => <MenuItem key={i} >
          <Checkbox
            size="small"
            disabled={column.attribute === 1}
            text={column.controlName}
            checked={_.includes(selectedColumnIds, column.controlId)}
            onClick={() => {
              if (_.includes(selectedColumnIds, column.controlId)) {
                deleteShowControls([column.controlId]);
              } else {
                addShowControls([column]);
              }
            }}
          />
        </MenuItem>) : <span className="tip">{ _l('没有可供选择的字段') }</span>}
      </Menu> }
    </div>);
  }
}
