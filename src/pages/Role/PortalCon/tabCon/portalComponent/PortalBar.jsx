import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Button, Dropdown, Input, Space, Switch, Tooltip } from 'ming-ui/antd-components';
import externalPortalAjax from 'src/api/externalPortal';
import * as actions from '../../redux/actions';
import FilterDrop from './FilterDrop';
import SearchTelsDialog from './SearchTels';
import { PortalBarWrap } from './style';

const COLUMN_MENU_STYLE = { width: 240 };

function PortalBar(props) {
  const { portal, setHideIds, setKeyWords, keys, appId } = props;
  const { showPortalControlIds = [], controls = [] } = portal;
  const [showTels, setShowTels] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const debouncedSetKeyWordsRef = useRef(
    _.debounce(val => {
      setKeyWords(val);
    }, 500),
  );

  useEffect(() => {
    const debouncedSetKeyWords = debouncedSetKeyWordsRef.current;

    return () => {
      debouncedSetKeyWords.cancel();
    };
  }, []);

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

  const handleSearchPressEnter = () => {
    debouncedSetKeyWordsRef.current.cancel();
    setKeyWords(inputValue);
  };

  const handleClear = () => {
    setInputValue('');
    debouncedSetKeyWordsRef.current.cancel();
    setKeyWords('');
  };

  const columnItems = controls
    .filter(control => control.alias !== 'avatar')
    .map(item => {
      const isChecked = showPortalControlIds.includes(item.controlId);

      return {
        key: item.controlId,
        title: item.controlName,
        style: { padding: 0 },
        label: (
          <div className="flexRow alignItemsCenter overflow_ellipsis WordBreak Hand pLeft16 pRight16 pTop8 pBottom8">
            <Switch checked={isChecked} size="small" className="mRight18" />
            <span className="Font13 textPrimary overflow_ellipsis">{item.controlName}</span>
          </div>
        ),
        onClick: () => {
          setShowControls(
            isChecked
              ? showPortalControlIds.filter(controlId => controlId !== item.controlId)
              : [...showPortalControlIds, item.controlId],
          );
        },
      };
    });

  return (
    <PortalBarWrap className="flexRow alignItemsCenter justifyContentRight">
      {keys.includes('search') && (
        <React.Fragment>
          <div className="searchInputPortal InlineBlock mRight14">
            <Space.Compact className="inputCon">
              <Input
                allowClear
                placeholder={_l('搜索')}
                value={inputValue}
                onPressEnter={handleSearchPressEnter}
                onChange={handleSearchChange}
                onClear={handleClear}
              />
              <Button
                icon={<Icon icon="lookup" className="Font20" />}
                aria-label={_l('按手机号搜索')}
                onClick={() => {
                  setShowTels(true);
                }}
              />
            </Space.Compact>
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
          <Tooltip placement="bottom" title={_l('列显示')}>
            <Dropdown
              open={columnsOpen}
              trigger={['click']}
              menu={{ items: columnItems, style: COLUMN_MENU_STYLE }}
              showPopupSearch
              notFoundContent={_l('无相关字段')}
              placement="bottomRight"
              onOpenChange={(open, { source } = {}) => {
                if (source !== 'menu') {
                  setColumnsOpen(open);
                }
              }}
            >
              <Icon className="mRight14 Font18 InlineBlock Hand actIcon" icon="tune" />
            </Dropdown>
          </Tooltip>
        </React.Fragment>
      )}
      {keys.includes('filter') && <FilterDrop {...props} />}
      {keys.includes('down') && (
        <Tooltip placement="bottom" title={_l('导出用户')}>
          <Icon
            className="mRight14 Font18 Hand InlineBlock actIcon"
            icon="worksheet_export"
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
