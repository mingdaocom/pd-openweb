import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import Spin from 'antd/es/spin';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import Checkbox from '../Checkbox';
import Popover from '../Popover';
import Select from '../Select';
import './index.less';

const CASCADER_POPOVER_STYLES = { container: { overflow: 'hidden' } };
const getDefaultPopupContainer = () => document.body;

const Cascader = React.forwardRef(
  (
    {
      options = [],
      value = [],
      onChange,
      placeholder = '请选择',
      allowClear = true,
      multiple = false,
      maxTagCount,
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
      popupPlacement = 'bottomLeft',
      zIndex,
      onOpenChange, // 弹出层显示/隐藏回调
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
    const containerRef = useRef(null);
    const focusTimerRef = useRef(null);
    const selectRef = useRef(null);

    // 处理弹出层显示/隐藏
    const handlePopupVisibleChange = useCallback(
      (visible, skipDisabled = false) => {
        if (disabled && !skipDisabled) return;

        setPopupVisible(visible);
        if (visible) {
          clearTimeout(focusTimerRef.current);
          focusTimerRef.current = setTimeout(() => {
            selectRef.current?.focus();
          }, 0);
        }

        onOpenChange?.(visible);
        if (!visible) {
          clearTimeout(focusTimerRef.current);
          setLoadingNode('');
          setExpandedKeys([]);
          setSearchValue(''); // 关闭时清空搜索
          selectRef.current?.blur();
        }
      },
      [onOpenChange, disabled],
    );

    useEffect(() => () => clearTimeout(focusTimerRef.current), []);

    // 合并内部 ref 和外部 ref
    React.useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          selectRef.current?.focus();
        },
        blur: () => {
          selectRef.current?.blur();
        },
      }),
      [],
    );

    // 同步外部 value 变化
    useEffect(() => {
      if (!_.isEqual(value, selectedKeys)) {
        setSelectedKeys(value);
      }

      if (popupVisible) {
        selectRef.current?.focus();
      }
    }, [value, selectedKeys, popupVisible]);

    // 同步外部 searchValue 变化
    useEffect(() => {
      if (_.isUndefined(externalSearchValue)) return;

      const nextSearchValue = externalSearchValue || '';

      if (searchValue !== nextSearchValue) {
        setSearchValue(nextSearchValue);
      }
    }, [externalSearchValue, searchValue]);

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
    }, [disabled, popupVisible, handlePopupVisibleChange]);

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
    }, [options, searchValue, multiple]);

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
      [multiple, selectedKeys, onChange, handlePopupVisibleChange],
    );

    useEffect(() => {
      if (!_.isUndefined(open) && open !== popupVisible) {
        handlePopupVisibleChange(open);
      }
    }, [open, popupVisible, handlePopupVisibleChange]);

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
      [onChange, multiple, popupVisible, handlePopupVisibleChange],
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
                    'has-children': !isLeaf,
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
      [selectedKeys, expandedKeys, loadingNode, multiple, changeOnSelect, handleExpand, handleSelect],
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
                <span className="colorPrimary">{text}</span>
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
              {notFoundContent || (loadingNode ? _l('数据加载中...') : searchValue ? _l('无匹配结果') : _l('暂无数据'))}
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

        const panels = [renderCascaderPanels(nodes, level)];
        const expandedNode = nodes.find(node => expandedKeys.includes(node.value));

        if (expandedNode) {
          const nodeChildren = expandedNode.children;

          if (nodeChildren && nodeChildren.length > 0) {
            panels.push(...renderPanelsRecursive(nodeChildren, level + 1));
          }
        }

        return panels;
      };

      return <div className="cascader-content">{renderPanelsRecursive(filteredTreeData)}</div>;
    }, [
      searchValue,
      filteredTreeData,
      expandedKeys,
      multiple,
      loadingNode,
      notFoundContent,
      handleSelect,
      renderCascaderPanels,
      renderSearchLabel,
      sortSearchResults,
    ]);

    const popoverClassNames = useMemo(() => ({ root: cx('cascader-trigger-popup', popupClassName) }), [popupClassName]);
    const selectOptions = useMemo(
      () => selectedKeys.map(item => ({ label: item.label, value: item.value })),
      [selectedKeys],
    );
    const selectedValue = useMemo(
      () => (multiple ? selectedKeys.map(item => item.value) : selectedKeys[0]?.value),
      [multiple, selectedKeys],
    );

    const handleSearchChange = useCallback(
      value => {
        setSearchValue(value);
        onSearch?.(value);
        setExpandedKeys([]);
      },
      [onSearch],
    );

    const handleInputKeyDown = useCallback(
      event => {
        if (
          event.key === 'Escape' ||
          ((window.isMacOs ? event.metaKey : event.ctrlKey) && ['s', 'S'].includes(event.key))
        ) {
          handlePopupVisibleChange(false);
        }
      },
      [handlePopupVisibleChange],
    );

    return (
      <Popover
        open={popupVisible}
        onOpenChange={handlePopupVisibleChange}
        trigger={disabled ? [] : 'click'}
        placement={popupPlacement}
        align={popupAlign}
        content={renderCascaderContent}
        getPopupContainer={getPopupContainer || getDefaultPopupContainer}
        zIndex={zIndex}
        classNames={popoverClassNames}
        noPadding
        styles={CASCADER_POPOVER_STYLES}
      >
        <div ref={containerRef} className={cx('custom-cascader w100', className)} style={style}>
          <Select
            ref={selectRef}
            className="w100"
            mode={multiple ? 'multiple' : undefined}
            maxTagCount={maxTagCount}
            open={false}
            showSearch={showSearch}
            autoClearSearchValue={false}
            filterOption={false}
            allowClear={allowClear}
            disabled={disabled}
            {...(disabled ? { suffixIcon: null } : {})}
            placeholder={placeholder}
            options={selectOptions}
            value={selectedValue}
            searchValue={searchValue}
            onSearch={handleSearchChange}
            onClear={handleClear}
            onDeselect={handleRemoveTag}
            onInputKeyDown={handleInputKeyDown}
          />
        </div>
      </Popover>
    );
  },
);

export default Cascader;
