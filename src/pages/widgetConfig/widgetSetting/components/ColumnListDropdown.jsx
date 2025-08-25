import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Menu, MenuItem } from 'ming-ui';

const ColumnListWrap = styled.div`
  position: absolute;
  width: 100%;
  background: #fff;
  z-index: 1;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);
  .header.search {
    padding: 0 20px;
    border-bottom: 1px solid #eee;
    .icon {
      color: #8c8c8c;
      font-size: 18px;
      margin: 10px 0;
    }
    .searchInput {
      height: 36px;
      border: none;
      &.active {
        border-color: #ccc;
      }
      &::placeholder {
        color: #bdbdbd;
      }
    }
  }
  .body.columnlistCon {
    position: relative;
    .columnlist {
      overflow-y: auto;
      overflow-x: hidden;
      max-height: 300px;
      width: 100%;
      border-radius: 0 0 3px 3px;
      &.ming.Menu {
        box-shadow: none;
        position: relative;
      }
      li.Item .Item-content:hover {
        .controlItem {
          .controlIcon,
          .controlValue {
            color: #fff;
          }
        }
      }
      .controlItem {
        font-size: 14px;
        .controlIcon {
          font-size: 16px;
          color: #9e9e9e;
          margin-right: 12px;
        }
        .controlName {
          margin-right: 12px;
        }
        .controlValue {
          color: #9e9e9e;
        }
      }
      .MenuItem:hover {
        .controlTextValue {
          color: rgba(255, 255, 255, 0.8);
        }
      }
    }
    .emptyText {
      color: #9e9e9e;
      margin: 10px;
      font-size: 13px;
    }
  }
  .controlTextValue {
    margin-left: 10px;
    color: #9e9e9e;
  }
`;

export default class ColumnListDropdown extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    showSearch: PropTypes.bool,
    list: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.string,
        text: PropTypes.string,
        filterValue: PropTypes.string,
        element: PropTypes.element,
        onClick: PropTypes.func,
      }),
    ),
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
      list = list.filter(
        column =>
          (column.filterValue || column.text || '').search(
            new RegExp(keywords.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i'),
          ) !== -1,
      );
    }
    return (
      <ColumnListWrap
        className={cx('columnListDropdown', {
          hide: !visible,
        })}
      >
        {showSearch && (
          <div className="header search flexRow">
            <i className="icon icon-search"></i>
            <input
              type="text"
              className="searchInput"
              placeholder={_l('搜索字段')}
              value={keywords}
              onChange={e => {
                this.setState({
                  keywords: e.target.value,
                });
              }}
            />
          </div>
        )}
        <div className="body columnlistCon">
          <Menu
            className="columnlist"
            onClickAwayExceptions={[document.querySelector('.columnListDropdown')]}
            onClickAway={onClickAway}
          >
            {list.length ? (
              list.map((column, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    if (_.isFunction(column.onClick)) {
                      column.onClick(column.value, i);
                    }
                  }}
                >
                  {column.text || column.element}
                </MenuItem>
              ))
            ) : (
              <p className="emptyText">
                {showSearch && keywords ? _l('无数据') : emptyText || _l('没有可用字段控件，请先在字段配置区进行配置')}
              </p>
            )}
          </Menu>
        </div>
      </ColumnListWrap>
    );
  }
}
