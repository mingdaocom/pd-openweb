import PropTypes from 'prop-types';
import React, { useState, useRef, useEffect } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import fixedDataController from 'src/api/fixedData';
import MobileCityPicker from './MobileCityPciker';
import { Icon, LoadDiv } from 'ming-ui';
import { browserIsMobile } from 'src/util';
import '../less/CityPicker.less';
import 'rc-trigger/assets/index.css';
import _ from 'lodash';
import { diffChars } from 'diff';

const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];

const CascaderSelectWrap = styled.div`
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 6px 0;
  z-index: 11;
  height: 211px;
  width: fit-content;
  .CascaderSelectWrap-List {
    height: 100%;
    overflow-y: scroll;
    width: 140px;
    border-right: 1px solid #f5f5f5;
    &:last-child {
      border-right: none;
    }
    &::-webkit-scrollbar {
      width: 0;
    }
    &-Item {
      cursor: pointer;
      height: 32px;
      padding: 0 6px 0 12px;
      justify-content: space-between;
      &:hover {
        background: rgba(0, 0, 0, 0.06);
      }
      &.active {
        background: #e5f3fe;
      }
    }
  }
`;

const CascaderSearchSelectWrap = styled.ul`
  width: 420px;
  height: 211px;
  overflow-y: scroll;
  padding: 6px 0;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.13), 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 11;
  li {
    height: 32px;
    cursor: pointer;
    padding: 0 12px;
    &:hover {
      background: rgba(0, 0, 0, 0.06);
    }
    &.active {
      background: #e5f3fe;
    }
    .CityPicker-Search-Highline {
      background: unset;
      color: #2196f3;
    }
  }
`;

export default function CityPicker(props) {
  const {
    level = 3,
    search,
    placeholder = _l('省/市/县'),
    defaultValue = '',
    popupParentNode = document.body,
    className = '',
    children,
    destroyPopupOnHide,
    disabled,
    popupClassName = '',
    popupAlign,
    popupVisible = false,
    hasContentContainer = true,
    manual = false,
    mustLast = false,
    callback = () => {},
    handleClose = () => {},
    onClear = () => {},
    showConfirmBtn,
    handleVisible = () => {},
  } = props;

  const isMobile = browserIsMobile();
  const cityPickerRef = useRef(null);
  const triggerRef = useRef(null);

  const [visible, setVisible] = useState(popupVisible);
  const [data, setData] = useState([]);
  const [select, setSelect] = useState(Array.isArray(defaultValue) ? defaultValue : []);
  const [loadingId, setLoadingId] = useState(false);

  useEffect(() => {
    if (visible && !search && (!data.length || !_.isArray(data[0]))) {
      getCitys();
      return;
    }
  }, [visible]);

  useEffect(() => {
    visible && getCitys({ keywords: search });
  }, [search]);

  useEffect(() => {
    setVisible(popupVisible);
    handleVisible(popupVisible);
  }, [popupVisible]);

  useEffect(() => {
    if (!!data.length) {
      setData(data.slice(0, level));
    }
  }, [level]);

  const getCitys = (param = {}, key = 0) => {
    const { parentId = '', keywords = '' } = param;

    setLoadingId(parentId || 'all');
    fixedDataController
      .getCitysByParentID({ parentId: parentId, keywords: keywords, layer: level, textSplit: '/', isLast: mustLast })
      .then(res => {
        setLoadingId(false);
        keywords ? setData(res.citys) : setData(data.slice(0, key).concat([res.citys]));
      });
  };

  const handleClick = (item, key) => {
    let value = key > select.length ? select.concat(item) : select.slice(0, key - 1).concat(item);

    setSelect(value);
    callback(value, item.last || key === level ? level : value.length);

    if (item.last || key === level) {
      key <= select.length && setData(data.slice(0, key));
      setVisible(false);
      handleVisible(false);
      handleClose(value);
      return;
    }

    getCitys({ parentId: item.id }, key);
  };

  const handleClear = (flag = true) => {
    setData([data[0]]);
    setSelect([]);
    flag && onClear();
  };

  const renderPopup = () => {
    return (
      <div id="CascaderSelect-Ming" className="CityPicker">
        {search ? (
          <CascaderSearchSelectWrap>
            {data.map(item => {
              if (!item.path) return;
              let diff = diffChars(search, item.path);
              return (
                <li
                  className="valignWrapper"
                  key={`CascaderSearchSelectWrap-List-Item-${item.id}`}
                  onClick={e => {
                    e.stopPropagation();
                    callback([item], item.path.split('/').length);
                    setVisible(false);
                    handleVisible(false);
                    handleClose([item]);
                  }}
                >
                  {diff.map(l =>
                    l.added && !l.removed ? (
                      l.value
                    ) : !l.removed ? (
                      <span className="CityPicker-Search-Highline">{l.value}</span>
                    ) : null,
                  )}
                </li>
              );
            })}
          </CascaderSearchSelectWrap>
        ) : (
          <CascaderSelectWrap className="CascaderSelectWrap flexRow">
            {data.map((list, index) => {
              if (list.length === 0 || !_.isArray(list)) return null;
              let levelIndex = index + 1;

              return (
                <ul className="CascaderSelectWrap-List">
                  {list.map(item => {
                    return (
                      <li
                        className={cx('CascaderSelectWrap-List-Item Hand valignWrapper', {
                          active: select.find(l => l.id === item.id),
                        })}
                        key={`CascaderSelectWrap-List-Item-${item.id}`}
                        onClick={e => {
                          e.stopPropagation();
                          handleClick(
                            {
                              ...item,
                              last: level === 2 && particularlyCity.includes(item.id) ? true : item.last,
                            },
                            levelIndex,
                          );
                        }}
                      >
                        <span className="flex ellipsis">{item.name}</span>
                        {!item.last &&
                          levelIndex !== level &&
                          (level === 2 ? !particularlyCity.includes(item.id) : true) &&
                          (loadingId === item.id ? (
                            <LoadDiv size="small" />
                          ) : (
                            <Icon icon="arrow-right-tip" className="Gray_9e" />
                          ))}
                      </li>
                    );
                  })}
                </ul>
              );
            })}
          </CascaderSelectWrap>
        )}
      </div>
    );
  };

  const renderContent = () => {
    let content = children ? (
      children
    ) : (
      <input
        readOnly
        autoFocus
        value={select.length === 0 ? defaultValue : _.last(select).path}
        placeholder={placeholder}
        className="CityPicker-input"
        ref={cityPickerRef}
      />
    );

    if (hasContentContainer) {
      return (
        <span className={cx('CityPicker-input-container', { editable: visible })} ref={triggerRef}>
          {content}
        </span>
      );
    }
    return content;
  };

  if (isMobile) {
    return (
      <MobileCityPicker
        data={data}
        select={select}
        level={level}
        disabled={disabled}
        callback={callback}
        onClear={handleClear}
        showConfirmBtn={showConfirmBtn}
        onClose={handleClose}
        getCitys={getCitys}
        handleClick={handleClick}
      >
        {renderContent()}
      </MobileCityPicker>
    );
  }

  return (
    <span
      className={cx('ming CityPicker-wrapper', className)}
      onClick={e => {
        if (disabled || (manual && !visible)) return;
        setVisible(true);
        handleVisible(true);
      }}
    >
      <Trigger
        action={['click']}
        popupVisible={disabled ? false : visible}
        destroyPopupOnHide={destroyPopupOnHide}
        onPopupVisibleChange={visible => {
          if (disabled || (manual && visible)) return;

          setVisible(visible);
          handleVisible(visible);
          if (!visible) {
            handleClose(select);
          }
        }}
        popupClassName={cx('CityPickerPanelTrigger', popupClassName)}
        popupAlign={
          popupAlign
            ? popupAlign
            : {
                points: ['tl', 'bl'],
                overflow: { adjustX: true, adjustY: true },
              }
        }
        getPopupContainer={() => popupParentNode}
        popup={renderPopup()}
      >
        {renderContent()}
      </Trigger>
    </span>
  );
}

CityPicker.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  /**
   * 搜索
   */
  search: PropTypes.string,
  /**
   * 移动端属性
   */
  showConfirmBtn: PropTypes.bool,
  /**
   * 是都需要CityPicker-input-container，默认true
   */
  hasContentContainer: PropTypes.bool,
  /**
   * 默认显示的地址，可以是 string 和 object，如果是 object 组件会检测 id 定位到指定的城市
   */
  defaultValue: PropTypes.any,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 是否必须选择到最后一级，默认false
   */
  mustLast: PropTypes.bool,
  /**
   * 默认值3：表示省-市-县；2：表示省-市；1：省
   */
  level: PropTypes.number,
  placeholder: PropTypes.string,
  /**
   * 指定弹层创建的位置，默认是body下
   */
  popupParentNode: PropTypes.any,
  destroyPopupOnHide: PropTypes.bool,
  popupAlign: PropTypes.object,
  popupVisible: PropTypes.bool,
  /**
   * 回调函数，返回选择的城市数据 { id, name }
   */
  callback: PropTypes.func.isRequired,
  /**
   * 关闭回调函数
   */
  handleClose: PropTypes.func,
  /**
   * 移动端清楚回掉
   */
  onClear: PropTypes.func,
};
