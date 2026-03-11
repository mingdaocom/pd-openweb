import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Checkbox, Input, Spin } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import 'rc-trigger/assets/index.css';
import './index.less';

const CascaderWrapper = styled.div`
  .cascader-selected-value,
  .cascader-selected-tag {
    ${({ isFocused }) => (isFocused ? 'opacity: 0.4;' : '')}
  }
  .cascader-clear-icon {
    display: none;
  }
  &:hover {
    .cascader-arrow {
      ${({ selectedKeys }) => (selectedKeys.length > 0 ? 'display: none !important;' : '')}
    }
    .cascader-clear-icon {
      display: block;
    }
  }
`;

const Cascader = React.forwardRef(
  (
    {
      options = [],
      value = [],
      onChange,
      placeholder = '请选择',
      allowClear = true,
      multiple = false,
      showSearch = true,
      loadData, // 异步加载函数: (node) => Promise
      disabled = false,
      style = {},
      className = '',
      popupClassName = '',
      onSearch,
      open,
      searchValue: externalSearchValue,
      notFoundContent,
      changeOnSelect = false, // 是否允许选择非叶子节点
      getPopupContainer, // 弹出层挂载的容器
      popupAlign, // 弹出层对齐配置
      zIndex = 1050, // 弹出层 z-index
      onDropdownVisibleChange, // 弹出层显示/隐藏回调
    },
    ref,
  ) => {
    const [expandedKeys, setExpandedKeys] = useState([]);

    // 扁平化树数据用于查找节点
    const flattenTreeData = useCallback((data, parentPath = []) => {
      let result = [];
      data.forEach(item => {
        const nodeValue = item.value;
        const nodeChildren = item.children;
        const path = [...parentPath, nodeValue];

        result.push({
          ...item,
          path,
          fullPath: path.join(' / '),
        });

        if (nodeChildren && nodeChildren.length > 0) {
          result = result.concat(flattenTreeData(nodeChildren, path));
        }
      });
      return result;
    }, []);

    const [selectedKeys, setSelectedKeys] = useState(value || []);
    const [searchValue, setSearchValue] = useState(''); // 搜索值，内部完全控制
    const [loadingNode, setLoadingNode] = useState(''); // 正在加载的节点
    const [popupVisible, setPopupVisible] = useState(false);
    const [isFocus, setFocus] = useState(false);
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);
    const measureRef = useRef(null);
    const [inputWidth, setInputWidth] = useState(3);

    const isFocused = useMemo(() => popupVisible || isFocus, [popupVisible, isFocus]);

    // 合并内部 ref 和外部 ref
    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          setFocus(true);
          searchInputRef.current?.focus();
        },
        blur: () => {
          setFocus(false);
          searchInputRef.current?.blur();
        },
      }),
      [],
    );

    // 同步外部 value 变化
    useEffect(() => {
      if (!_.isEqual(value, selectedKeys)) {
        setSelectedKeys(value);
      }
      if (isFocused) {
        searchInputRef.current?.focus();
      }
    }, [value, selectedKeys]);

    // 同步外部 searchValue 变化
    useEffect(() => {
      if (searchValue !== externalSearchValue) {
        setSearchValue(externalSearchValue);
      }
    }, [externalSearchValue, searchValue]);

    // 根据 searchValue 的渲染宽度动态设置 input 宽度
    useEffect(() => {
      if (multiple && measureRef.current) {
        // 使用隐藏元素测量文本宽度
        const measureWidth = measureRef.current.offsetWidth;
        // 最小宽度 3px，加上一些边距
        const newWidth = Math.max(3, measureWidth + 2);
        setInputWidth(newWidth);
      }
    }, [searchValue, multiple]);

    useEffect(() => {
      if (!_.isUndefined(open) && open !== popupVisible) {
        handlePopupVisibleChange(open);
      }
    }, [open, handlePopupVisibleChange]);

    // 监听 options 变化，如果正在加载的节点有了子节点，清空加载状态
    useEffect(() => {
      if (loadingNode) {
        const flatData = flattenTreeData(options);
        const node = flatData.find(item => item.value === loadingNode);
        if (node && !_.isEmpty(node.children)) {
          setLoadingNode('');
        }
      }
    }, [options, loadingNode, flattenTreeData]);

    useEffect(() => {
      if (disabled && popupVisible) {
        handlePopupVisibleChange(false, true);
      }
    }, [disabled]);

    // 处理搜索过滤
    const filteredTreeData = useMemo(() => {
      if (!searchValue.trim() || (!multiple && searchValue.trim())) return options;

      const filterNode = nodes => {
        return nodes
          .map(node => ({ ...node }))
          .filter(node => {
            const nodeLabel = String(node.label || '').toLowerCase();
            const searchLower = searchValue.toLowerCase();
            const isMatch = nodeLabel.includes(searchLower);
            const nodeChildren = node.children;

            // 如果有子节点，递归过滤
            if (nodeChildren && nodeChildren.length > 0) {
              const filteredChildren = filterNode(nodeChildren);
              if (filteredChildren.length > 0 || isMatch) {
                node.children = filteredChildren;
                return true;
              }
            }

            return isMatch;
          });
      };

      return filterNode(options);
    }, [options, searchValue]);

    // 处理节点展开
    const handleExpand = useCallback(
      (node, level) => {
        const newExpandedKeys = _.isEmpty(expandedKeys) ? [node.value] : [...expandedKeys.slice(0, level), node.value];

        // 如果有子节点数据，则直接展开
        if (!_.isEmpty(node.children)) {
          setExpandedKeys(newExpandedKeys);
          return;
        }
        // 正在加载子节点数据
        if (loadData && loadingNode === node.value) return;

        // 展开节点
        setExpandedKeys(newExpandedKeys);
        setLoadingNode(node.value);

        if (loadData) {
          loadData(node);
        }
      },
      [loadData, expandedKeys, loadingNode],
    );

    // 处理节点选择
    const handleSelect = useCallback(
      node => {
        const nodeItem = { label: node.label, value: node.value };

        // 单选模式，直接选择
        if (!multiple) {
          setSelectedKeys([nodeItem]);
          onChange?.([nodeItem]);
          if (node.isLeaf) {
            handlePopupVisibleChange(false);
          }
          return;
        }

        // 多选模式
        const isSelected = selectedKeys.some(item => item.value === node.value);
        let newSelectedKeys;
        if (isSelected) {
          newSelectedKeys = selectedKeys.filter(item => item.value !== node.value);
        } else {
          newSelectedKeys = [...selectedKeys, nodeItem];
        }

        setSelectedKeys(newSelectedKeys);
        onChange?.(newSelectedKeys);
      },
      [multiple, selectedKeys, onChange],
    );

    // 处理弹出层显示/隐藏
    const handlePopupVisibleChange = useCallback(
      (visible, skipDisabled = false) => {
        if (disabled && !skipDisabled) return;

        setFocus(visible);
        setPopupVisible(visible);
        if (visible && showSearch) {
          // 延迟聚焦搜索框
          setTimeout(() => {
            searchInputRef.current?.focus();
          }, 0);
        }
        onDropdownVisibleChange?.(visible);
        if (!visible) {
          setLoadingNode('');
          setExpandedKeys([]);
          setSearchValue(''); // 关闭时清空搜索
          searchInputRef.current?.blur();
        }
      },
      [onDropdownVisibleChange, showSearch, disabled],
    );

    // 清空所有选择
    const handleClear = useCallback(
      e => {
        e?.stopPropagation();
        setSelectedKeys([]);
        onChange?.([]);
        if (!multiple && popupVisible) {
          handlePopupVisibleChange(false);
        }
      },
      [onChange],
    );

    // 移除单个标签
    const handleRemoveTag = useCallback(
      key => {
        const newSelectedKeys = selectedKeys.filter(item => item.value !== key);
        setSelectedKeys(newSelectedKeys);
        onChange?.(newSelectedKeys);
      },
      [selectedKeys, onChange],
    );

    // 渲染级联面板
    const renderCascaderPanels = useCallback(
      (nodes, level = 0) => {
        const panelKey = `panel-${level}`;
        return (
          <div className="cascader-panel" key={panelKey}>
            {nodes.map(node => {
              const nodeValue = node.value;
              const nodeLabel = node.label;
              const isSelected = selectedKeys.some(item => item.value === nodeValue);
              const isExpanded = expandedKeys.includes(nodeValue);
              const isLoading = loadingNode === nodeValue;
              const isLeaf = node.isLeaf;
              const checkable = _.isUndefined(node.checkable) ? true : node.checkable;

              return (
                <div
                  key={nodeValue}
                  className={cx('cascader-option', {
                    expanded: isExpanded,
                  })}
                  onClick={() => {
                    // 如果有子节点则展开
                    if (!isLeaf) {
                      handleExpand(node, level);
                    }

                    // 多选模式下：只有叶子节点可以选中, 其他节点由checkboX触发
                    if (multiple) {
                      if (isLeaf) {
                        handleSelect(node);
                      }
                    } else {
                      // 单选模式下: 根据配置选择任意节点或叶子节点
                      if ((changeOnSelect || isLeaf) && !selectedKeys.some(item => item.value === nodeValue)) {
                        handleSelect(node);
                      }
                    }
                  }}
                >
                  {multiple && checkable && (
                    <Checkbox
                      checked={isSelected}
                      onClick={e => {
                        e.stopPropagation();
                        handleSelect(node);
                      }}
                      className="cascader-checkbox"
                    />
                  )}
                  <span
                    className={cx('cascader-option-label overflow_ellipsis', {
                      'cascader-option-label-selected': isSelected,
                    })}
                    title={nodeLabel}
                  >
                    {nodeLabel}
                  </span>
                  <span className="cascader-option-icons">
                    {isLoading ? (
                      <Spin size="small" indicator={<LoadingOutlined spin />} />
                    ) : !isLeaf ? (
                      <Icon icon="arrow-right-border Font12" />
                    ) : null}
                  </span>
                </div>
              );
            })}
          </div>
        );
      },
      [selectedKeys, loadingNode, multiple, disabled, changeOnSelect, handleExpand, handleSelect],
    );

    // 排序搜索结果
    const sortSearchResults = useCallback(
      data => {
        return data.sort((a, b) => {
          const reg = new RegExp(searchValue.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'g');
          const formatValue = value =>
            JSON.parse(value?.path || '[]').map(i => {
              const idx = i.search(reg);
              return idx === -1 ? 999 : idx;
            });
          const aIndexArr = formatValue(a);
          const bIndexArr = formatValue(b);
          const maxCount = Math.max(aIndexArr.length, bIndexArr.length);

          for (let i = 0; i < maxCount; i++) {
            if (_.isUndefined(bIndexArr[i]) || aIndexArr[i] < bIndexArr[i]) return -1;
            if (_.isUndefined(aIndexArr[i]) || aIndexArr[i] > bIndexArr[i]) return 1;
          }
        });
      },
      [searchValue],
    );

    // 渲染搜索结果标签
    const renderSearchLabel = useCallback(
      item => {
        const path = JSON.parse(item?.path || '[]');

        return path.map((text = '', i) => {
          const isLast = i === path.length - 1;

          if (text.search(new RegExp(searchValue.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i')) !== -1) {
            return (
              <React.Fragment>
                <span className="ThemeColor3">{text}</span>
                {!isLast && <span> / </span>}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment>
              {text}
              {!isLast && <span> / </span>}
            </React.Fragment>
          );
        });
      },
      [searchValue],
    );

    // 渲染级联面板容器
    const renderCascaderContent = useCallback(() => {
      if (_.isEmpty(filteredTreeData)) {
        return (
          <div className="cascader-content">
            <div className="cascader-not-found-content" style={{ width: containerRef.current?.clientWidth }}>
              {notFoundContent || (loadingNode ? _l('数据加载中...') : searchValue ? '无匹配结果' : '暂无数据')}
            </div>
          </div>
        );
      }

      if (searchValue && !multiple) {
        let flatData = sortSearchResults(filteredTreeData);
        return (
          <div className="cascader-content">
            <div className="cascader-panel" style={{ minWidth: containerRef.current?.clientWidth }}>
              {flatData.map(item => {
                return (
                  <div key={item.value} className="cascader-option" onClick={() => handleSelect(item)}>
                    <span className="cascader-option-label">{renderSearchLabel(item)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      const renderPanelsRecursive = (nodes, level = 0) => {
        if (!nodes || nodes.length === 0) return null;

        const panels = [];
        const expandedNode = nodes.find(node => expandedKeys.includes(node.value));

        if (expandedNode) {
          const nodeChildren = expandedNode.children;
          panels.push(
            <Fragment>
              {renderCascaderPanels(nodes, level)}
              {nodeChildren && nodeChildren.length > 0 && renderPanelsRecursive(nodeChildren, level + 1)}
            </Fragment>,
          );
        } else {
          panels.push(renderCascaderPanels(nodes, level));
        }

        return panels;
      };

      return <div className="cascader-content">{renderPanelsRecursive(filteredTreeData)}</div>;
    }, [searchValue, filteredTreeData, expandedKeys, renderCascaderPanels]);

    // 默认弹出层对齐配置
    const defaultPopupAlign = useMemo(() => {
      return {
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: {
          adjustX: true,
          adjustY: true,
        },
        ...popupAlign,
      };
    }, [popupAlign]);

    /**
     *  输入框
     */
    const renderCascaderInputContent = () => {
      if (!selectedKeys.length) {
        return isFocused ? null : <span className="cascader-placeholder">{placeholder}</span>;
      }

      return (
        <Fragment>
          {multiple ? (
            <div className="cascader-selected-tags">
              {selectedKeys.map(item => (
                <div key={item.value} className="cascader-selected-tag overflow_ellipsis">
                  <span className="cascader-selected-tag-label overflow_ellipsis">{item.label}</span>
                  {!disabled && (
                    <Icon
                      icon="close Font14"
                      className="cascader-selected-tag-close"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveTag(item.value);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : showSearch && searchValue ? null : (
            <span className="cascader-selected-value breakAll" title={selectedKeys[0]?.label || ''}>
              {selectedKeys[0]?.label || ''}
            </span>
          )}
        </Fragment>
      );
    };

    const renderCascaderInputSuffix = () => {
      if (disabled) return null;

      return (
        <div className="cascader-input-suffix">
          {allowClear && selectedKeys.length > 0 && (
            <Icon
              icon="cancel Font14"
              className="cascader-clear-icon"
              onClick={e => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
          {!multiple && !isFocused && (
            <Icon icon="arrow-down-border Font14" className={cx('cascader-arrow', { expanded: popupVisible })} />
          )}
        </div>
      );
    };

    return (
      <Trigger
        popupVisible={popupVisible}
        onPopupVisibleChange={handlePopupVisibleChange}
        action={disabled ? [] : ['click']}
        popupAlign={defaultPopupAlign}
        popup={renderCascaderContent}
        getPopupContainer={getPopupContainer || (() => document.body)}
        zIndex={zIndex}
        popupClassName={`cascader-trigger-popup ${popupClassName}`}
        destroyPopupOnHide={true}
      >
        <CascaderWrapper
          ref={containerRef}
          className={cx('custom-cascader', className)}
          style={style}
          multiple={multiple}
          selectedKeys={selectedKeys}
          isFocused={isFocused}
        >
          {/* 隐藏的测量元素，用于测量文本宽度 */}
          {multiple && (
            <span
              ref={measureRef}
              style={{
                position: 'absolute',
                visibility: 'hidden',
                whiteSpace: 'pre',
                fontSize: '14px',
                fontFamily: 'inherit',
                padding: 0,
                margin: 0,
                height: 'auto',
                width: 'auto',
              }}
            >
              {searchValue || ' '}
            </span>
          )}
          <div className={cx('cascader-input', { focused: isFocused, disabled })}>
            <div className="cascader-input-content">
              {renderCascaderInputContent()}
              {showSearch && !disabled && (
                <Input
                  ref={searchInputRef}
                  className="cascader-search-input"
                  value={searchValue}
                  autoFocus={false}
                  style={multiple ? { flexBasis: `${inputWidth}px`, minWidth: `${inputWidth}px` } : undefined}
                  onChange={e => {
                    const textValue = e.target.value;
                    setSearchValue(textValue);
                    onSearch?.(textValue);
                    setExpandedKeys([]);
                  }}
                  onKeyDown={e => {
                    if (
                      _.includes(['Escape'], e.key) ||
                      ((window.isMacOs ? e.metaKey : e.ctrlKey) && ['s', 'S'].includes(e.key))
                    ) {
                      handlePopupVisibleChange(false);
                    }
                  }}
                />
              )}
            </div>
            {renderCascaderInputSuffix()}
          </div>
        </CascaderWrapper>
      </Trigger>
    );
  },
);

export default Cascader;
