import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import './ColumnListDropdown.less';
import _ from 'lodash';

export default class ColumnListDropdown extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    showSearch: PropTypes.bool,
    list: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      text: PropTypes.string,
      filterValue: PropTypes.string,
      element: PropTypes.element,
      onClick: PropTypes.func,
    })),
    onClickAway: PropTypes.func,
    emptyText: PropTypes.string,
  };
  static defaultProps = {
    visible: false,
    showSearch: false,
    list: [],
    onClickAway: () => {},
  };
  constructor(props) {
    super(props);
    this.state = {
      keywords: '',
    };
  }
  render() {
    const { visible, onClickAway, emptyText, showSearch } = this.props;
    let { list } = this.props;
    const { keywords } = this.state;
    if (showSearch && keywords) {
      list = list.filter(column => new RegExp('.*' + _.trim(keywords) + '.*').exec(column.filterValue || column.text));
    }
    return <div
      className={cx('columnListDropdown', {
        hide: !visible,
      })}>
      { showSearch && <div className="header search flexRow">
        <i className="icon icon-workflow_find"></i>
        <input
          type="text"
          className="searchInput"
          placeholder={_l('搜索字段')}
          value={keywords}
          onChange={(e) => {
            this.setState({
              keywords: e.target.value,
            });
          }}
        />
      </div> }
      <div
        className="body columnlistCon"
      >
        <Menu
          className="columnlist"
          onClickAwayExceptions={[document.querySelector('.selectColumnToConcat')]}
          onClickAway={onClickAway}
        >
          { list.length ? list.map((column, i) => <MenuItem
            key={i}
            onClick={() => {
              if (_.isFunction(column.onClick)) {
                column.onClick(column.value, i);
              }
            }}
          >
            { column.text || column.element }
          </MenuItem>) : <p className="emptyText">
          { emptyText || _l('没有可用字段控件，请先在字段配置区进行配置') }
        </p> }
        </Menu>
      </div>
    </div>;
  }
}
