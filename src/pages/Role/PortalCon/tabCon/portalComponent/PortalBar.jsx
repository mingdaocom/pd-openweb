import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Switch } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal';
import * as actions from '../../redux/actions';
import FilterDrop from './FilterDrop';
import SearchTelsDialog from './SearchTels';
import { ClearIcon, Popup, PortalBarWrap } from './style';

function PortalBar(props) {
  const { portal, setHideIds, setKeyWords, keys, appId } = props;
  const { showPortalControlIds = [], controls = [] } = portal;
  const [showTels, setShowTels] = useState(false);
  const [columnsKey, setcolumnsKey] = useState('');
  const [inputValue, setInputValue] = useState('');

  const debouncedSetKeyWordsRef = useRef(
    _.debounce(val => {
      setKeyWords(val);
    }, 500),
  );

  useEffect(() => {
    return () => {
      debouncedSetKeyWordsRef.current.cancel();
    };
  }, []);

  const getControls = () => {
    return controls.filter(o => !['avatar'].includes(o.alias));
  };

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    setColumns(getControls() || []);
  }, [controls]);

  const setShowControls = showPortalControlIds => {
    externalPortalAjax
      .editViewShowControls({
        appId,
        controlIds: showPortalControlIds,
      })
      .then(() => {
        setHideIds(showPortalControlIds);
      });
  };

  const handleSearchChange = e => {
    const value = e.target.value;
    setInputValue(value);
    debouncedSetKeyWordsRef.current(value);
  };

  const handleSearchKeyUp = e => {
    if (e.keyCode === 13) {
      debouncedSetKeyWordsRef.current.cancel();
      setKeyWords(inputValue);
    }
  };

  const handleClear = () => {
    setInputValue('');
    debouncedSetKeyWordsRef.current.cancel();
    setKeyWords('');
  };

  return (
    <PortalBarWrap className="InlineBlock">
      {keys.includes('search') && (
        <React.Fragment>
          <div className={cx('searchInputPortal InlineBlock mRight14')}>
            <div className="inputCon">
              <div className="inputConLeft">
                <input
                  placeholder={_l('搜索')}
                  type="text"
                  className="mRight5"
                  value={inputValue}
                  onKeyUp={handleSearchKeyUp}
                  onChange={handleSearchChange}
                />
                {inputValue && <ClearIcon className="icon-cancel" onClick={handleClear} />}
              </div>
              <i
                className={'icon icon-lookup Font20 Hand InlineBlock actIcon searchTels ThemeHoverColor3'}
                onClick={() => {
                  setShowTels(true);
                }}
              />
            </div>
          </div>
        </React.Fragment>
      )}
      {keys.includes('refresh') && (
        <Tooltip placement="bottom" title={_l('刷新')}>
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
                          key={`widgetList-${index}`}
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
            <Tooltip placement="bottom" title={_l('列显示')}>
              <Icon className="mRight14 Font18 InlineBlock Hand actIcon" icon="tune" />
            </Tooltip>
          </Trigger>
        </React.Fragment>
      )}
      {keys.includes('filter') && <FilterDrop {...props} />}
      {keys.includes('down') && (
        <Tooltip placement="bottom" title={_l('导出用户')}>
          <Icon
            className="mRight14 Font18 Hand InlineBlock actIcon"
            icon="download"
            onClick={() => {
              props.down(true);
            }}
          />
        </Tooltip>
      )}
      {showTels && <SearchTelsDialog setShow={setShowTels} show={showTels} />}
      {props.comp && props.comp()}
    </PortalBarWrap>
  );
}

const mapStateToProps = state => ({
  portal: state.portal,
});

const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalBar);
