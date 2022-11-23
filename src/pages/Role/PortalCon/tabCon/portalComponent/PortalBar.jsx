import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Switch } from 'antd';
import FilterDrop from './FilterDrop';
import * as actions from '../../redux/actions';
import { editViewShowControls } from 'src/api/externalPortal';
import SearchTelsDialog from './SearchTels';
const Wrap = styled.div`
  .mRight14 {
    margin-right: 14px;
  }
  flex: 1;
  text-align: right;
  height: 36px;
  .actIcon {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
  .searchTels {
    cursor: pointer;
    border: 1px solid #ddd;
    border-left: none;
    border-radius: 0 4px 4px 0;
    font-size: 20px;
    color: #9e9e9e;
    line-height: 30px;
    padding: 0 6px;
  }
  i::before {
    line-height: 36px;
  }
  i {
    vertical-align: top;
  }
  .searchInputPortal {
    height: 36px;
    overflow: hidden;
    display: inline-block;
    border-radius: 3px;
    background-color: #fff;
    .inputCon {
      display: flex;
      .inputConLeft {
        line-height: 32px;
        border: 1px solid #ddd !important;
        border-radius: 4px 0 0 4px;
        flex: 1;
        padding-right: 10px;
        position: relative;
        &:hover {
          border: 1px solid #2196f3 !important;
        }
        input {
          flex: 1;
          border: none;
          line-height: 34px;
          box-sizing: border-box;
          vertical-align: top;
          padding: 0 12px;
          border-radius: 3px;
          &:-ms-input-placeholder {
            color: #ccc !important;
          }
          &::-ms-input-placeholder {
            color: #ccc;
          }
          &::placeholder {
            color: #ccc;
          }
        }
      }
      i::before {
        line-height: 34px;
      }
      .none {
        display: none;
      }
    }
  }
`;
const Popup = styled.div`
  background: #fff;
  width: 240px;
  padding: 5px 0;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0px 6px 16px rgba(0, 0, 0, 0.16);
  .searchWrapper {
    border-bottom: 1px solid #e0e0e0;
    margin: 8px 16px 0;
    display: flex;
    height: 38px;
    line-height: 38px;
    overflow: hidden;
    .cursorText {
      border: none;
      flex: 1;
      margin: 0;
      padding: 0;
      max-width: 79%;
    }
    .icon {
      width: 20px;
      line-height: 38px;
      color: #bdbdbd;
    }
  }
  .listBox {
    overflow: auto;
    max-height: 844px;
    &::-webkit-scrollbar {
      width: 10px;
      height: 10px;
    }
    .widgetList {
      padding: 8px 16px;
      &:hover {
        background: #f5f5f5;
        border-radius: 4px;
      }
      .ant-switch-small {
        min-width: 18px;
        height: 9px;
        line-height: 9px;
        vertical-align: middle;
        margin-right: 18px;
        .ant-switch-handle {
          width: 5px;
          height: 5px;
        }
        .ant-switch-inner {
          margin: 0;
        }
        &.ant-switch-checked {
          .ant-switch-handle {
            left: calc(100% - 5px - 2px);
          }
          .ant-switch-inner {
            margin: 0;
          }
        }
      }
    }
  }
`;
const ClearIcon = styled.i`
  position: absolute;
  right: 0;
  font-size: 16px;
  color: #9e9e9e;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    color: #777;
  }
`;
function PortalBar(props) {
  const { portal, setHideIds, setKeyWords, keys, appId } = props; //['search', 'columns', 'filter', 'down']
  const { showPortalControlIds = [], controls = [], filters = [], keyWords } = portal;
  const [showTels, setShowTels] = useState(false); //批量搜索手机号弹层
  const [columnsKey, setcolumnsKey] = useState(''); //列显示key
  const getControls = () => {
    return controls.filter(o => !['avatar'].includes(o.alias)); //头像不显示
  };
  const [columns, setColumns] = useState([]); //可控制的列
  useEffect(() => {
    setColumns(getControls() || []);
  }, [controls]);
  const setShowControls = showPortalControlIds => {
    editViewShowControls({
      appId,
      controlIds: showPortalControlIds,
    }).then(res => {
      setHideIds(showPortalControlIds);
    });
  };

  return (
    <Wrap className="InlineBlock">
      {keys.includes('search') && (
        <React.Fragment>
          <div className={cx('searchInputPortal InlineBlock mRight14')}>
            <div className="inputCon">
              <div className="inputConLeft">
                <input
                  placeholder={_l('搜索')}
                  type="text"
                  className="mRight5"
                  value={keyWords}
                  onKeyUp={e => {
                    if (e.keyCode === 13) {
                      setKeyWords(e.target.value);
                    }
                  }}
                  onChange={e => {
                    setKeyWords(e.target.value);
                  }}
                />
                {keyWords && (
                  <ClearIcon
                    className="icon-cancel"
                    onClick={() => {
                      setKeyWords('');
                    }}
                  />
                )}
              </div>
              <i
                className={cx('icon icon-lookup Font20 Hand InlineBlock actIcon searchTels ThemeHoverColor3', {})}
                onClick={() => {
                  setShowTels(true);
                }}
              />
            </div>
          </div>
        </React.Fragment>
      )}
      {keys.includes('refresh') && (
        <Tooltip popupPlacement="bottom" text={<span>{_l('刷新')}</span>}>
          <Icon
            className="mRight14 Font18 Hand InlineBlock actIcon"
            icon="task-later"
            onClick={() => {
              props.refresh();
            }}
          />
        </Tooltip>
      )}
      {keys.includes('columns') && (
        <React.Fragment>
          <Trigger
            action={['click']}
            popup={
              <Popup>
                <div className="searchWrapper">
                  <Icon icon="search" className="Font18" />
                  <input
                    type="text"
                    className="cursorText"
                    placeholder={_l('搜索')}
                    onChange={event => {
                      const searchValue = _.trim(event.target.value);
                      if (!searchValue) {
                        setcolumnsKey('');
                        setColumns(getControls());
                      } else {
                        setcolumnsKey(searchValue);
                        setColumns(getControls().filter(it => it.controlName.indexOf(searchValue) >= 0));
                      }
                    }}
                    value={columnsKey || ''}
                  />
                  {columnsKey && (
                    <Icon
                      icon="cancel"
                      className="Font18 Hand"
                      onClick={() => {
                        setcolumnsKey('');
                        setColumns(getControls());
                      }}
                    />
                  )}
                </div>
                <div className="listBox mTop10">
                  {columns.length > 0 ? (
                    columns.map((item, index) => {
                      let isChecked = showPortalControlIds.includes(item.controlId);
                      return (
                        <div
                          className="widgetList overflow_ellipsis WordBreak Hand"
                          keyWords={`widgetList-${index}`}
                          onClick={() => {
                            if (!isChecked) {
                              setShowControls(showPortalControlIds.concat(item.controlId));
                            } else {
                              setShowControls(showPortalControlIds.filter(o => o !== item.controlId));
                            }
                          }}
                        >
                          <Switch checked={isChecked} size="small" />
                          <span className="Gray_75">
                            <span className="Font13 Gray">{item.controlName}</span>
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="Gray_75 TxtCenter pTop20 Font14 pBottom20">{_l('无相关字段')}</div>
                  )}
                </div>
              </Popup>
            }
            getPopupContainer={() => document.body}
            popupClassName="filterTrigger"
            popupAlign={{
              points: ['tr', 'br'],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            <Tooltip popupPlacement="bottom" text={<span>{_l('列显示')}</span>}>
              <Icon className="mRight14 Font18 InlineBlock Hand actIcon" icon="tune" />
            </Tooltip>
          </Trigger>
        </React.Fragment>
      )}
      {keys.includes('filter') && <FilterDrop {...props} />}
      {keys.includes('down') && (
        <Tooltip popupPlacement="bottom" text={<span>{_l('导出用户')}</span>}>
          <Icon
            className="mRight14 Font18 Hand InlineBlock actIcon"
            icon="file_download"
            onClick={() => {
              props.down(true);
            }}
          />
        </Tooltip>
      )}
      {showTels && (
        <SearchTelsDialog
          setShow={show => {
            setShowTels(show);
          }}
          show={showTels}
        />
      )}
      {props.comp && props.comp()}
    </Wrap>
  );
}
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalBar);
