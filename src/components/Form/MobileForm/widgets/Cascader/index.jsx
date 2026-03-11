import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import nzh from 'nzh';
import PropTypes from 'prop-types';
import { Checkbox, Icon, LoadDiv, MobileSearch, PopupWrapper, Radio, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { renderText as renderCellText } from 'src/utils/control';
import { CustomCommonCapsule } from '../../style';
import { checkCellIsEmpty, sortPathsBySearchKeyword } from '../../tools/utils';
import { CustomMobileCascadeControl, OptionWrap, PopupContentBox } from './style';

const Cascader = props => {
  const {
    disabled,
    controlId,
    dataSource,
    viewId,
    formData,
    advancedSetting = {},
    worksheetId,
    getType,
    formDisabled,
    controlName,
    value,
    onChange = () => {},
    enumDefault,
    appId,
  } = props;
  const { topshow = '0', anylevel = '0', minlayer = '0', allpath = '0', limitlayer = '0' } = advancedSetting;
  const limitLayer = Number(limitlayer);
  const minLayer = Number(minlayer);
  const isMultiple = enumDefault === 2;
  const ajax = useRef(null);
  const cacheData = useRef([]);
  const sourcePath = useRef({});
  const searchRef = useRef({});
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const [operatePath, setOperatePath] = useState([]);
  const [selectItems, setSelectItems] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [layersName, setLayersName] = useState([]);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const getKeywords = () => {
    return searchRef.current && searchRef.current.keywords ? searchRef.current.keywords.trim() : '';
  };

  /**
   * 缓存树形完整路径
   */
  const cacheTreePath = (data, title = '') => {
    data.forEach(item => {
      sourcePath.current[item.value] = title + item.label;
    });
  };

  /**
   * 获取目前层级
   */
  const getLayer = rowId => {
    if (getKeywords()) {
      let currentSearch = { currentItem: {}, currentLayer: 0 };
      (options || []).forEach(item => {
        if (item.value === rowId) {
          currentSearch = {
            currentLayer: _.findIndex(safeParse(item.path, 'array'), p => p === item.label),
            currentItem: {
              ...item,
              isLeaf: !_.get(
                _.find(cacheData.current || [], c => c.rowid === rowId),
                'childrenids',
              ),
            },
          };
        }
      });
      return currentSearch;
    }

    const getCurrent = (data, currentLayer) => {
      for (const item of data) {
        if (item.value === rowId) return { currentItem: item, currentLayer };
        if (_.isArray(item.children)) {
          const result = getCurrent(item.children, currentLayer + 1);
          if (result) return result;
        }
      }
      return null;
    };

    return getCurrent(options || [], 0);
  };

  /**
   * 结束范围
   */
  const isEndLeaf = (rowId = '') => {
    if (limitLayer > 0 && rowId) {
      const { currentLayer = 0 } = getLayer(rowId) || {};
      return limitLayer - currentLayer === 1;
    }
    return false;
  };

  /**
   * 更新数据
   */
  const deepDataUpdate = (list, data, rowId) => {
    if (rowId) {
      list.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
          cacheTreePath(data, sourcePath.current[rowId] + ' / ');
        } else if (_.isArray(item.children)) {
          deepDataUpdate(item.children, data, rowId);
        }
      });
    } else {
      list = data;
      cacheTreePath(data);
    }
    setOptions(list);
  };

  /**
   * 加载数据
   */
  const loadData = (rowId = '') => {
    if (ajax.current) {
      ajax.current.abort();
    }

    // 数据源筛选
    const filterControls = getFilter({ control: props, formData, appId }) || [];
    let navGroupFilters = [];
    // 开始筛选范围处理
    if (topshow === '3' && !rowId) {
      navGroupFilters = getFilter({ control: props, formData, filterKey: 'topfilters', appId }) || [];
    }

    setLoading(true);
    const keywords = getKeywords();
    ajax.current = sheetAjax.chooseRelationRows({
      worksheetId: dataSource,
      viewId,
      filterControls,
      navGroupFilters,
      kanbanKey: rowId,
      keywords,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      getType: getType || 10,
      controlId,
      relationWorksheetId: worksheetId,
    });

    ajax.current
      .then(result => {
        if (result.resultCode === 1) {
          const { template } = result;
          const control = template.controls.find(item => item.attribute === 1);
          const data = result.data.map(item => {
            return {
              value: item.rowid,
              label: control
                ? renderCellText(Object.assign({}, control, { value: item[control.controlId] }), { noMask: true }) ||
                  _l('未命名')
                : _l('未命名'),
              path: keywords ? item.path : item.childrenids || item.path,
              searchPath: keywords ? item.path : '[]', // 搜索快速清空，偶发会显示childrenids路径，改用searchPath
              isLeaf: !!keywords || isEndLeaf(rowId) || !item.childrenids,
            };
          });

          if (!rowId && !layersName?.length) {
            setLayersName((_.find(result.worksheet.views, item => item.viewId === viewId) || {}).layersName || []);
          }

          ajax.current = '';
          cacheData.current = keywords ? result.data : _.uniqBy(cacheData.current.concat(result.data), 'rowid');
          deepDataUpdate(_.cloneDeep(options), data, rowId);
          if (isFirstLoad) {
            setIsFirstLoad(false);
          }
        } else {
          setIsError(true);
        }
      })
      .catch(err => {
        setIsError(err.errorCode === 300016 ? err.errorCode : err.errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 选中后是否更新数据
   */
  const canUpdate = id => {
    // 清空始终允许更新
    if (!id) return true;

    const { currentItem = {}, currentLayer = 0 } = getLayer(id) || {};

    if (anylevel === '1') {
      return currentItem.isLeaf;
    }
    // 设置指定层级
    if (minLayer) {
      return (currentItem.isLeaf && currentLayer < minLayer) || currentLayer >= minLayer;
    }

    return true;
  };

  /**
   * 树形更新
   */
  const treeSelectChange = (values = []) => {
    if (!values.length) {
      onChange('');
      return;
    }

    const keywords = getKeywords();
    const result = values.map(item => {
      const { id, label } = item;
      let path;
      let name;
      const node = cacheData.current.find(i => i.rowid === id);
      if (keywords) {
        if (node) {
          path = JSON.parse(node.path);
          name = +allpath ? path.join(' / ') : path[path.length - 1];
        } else {
          name = label;
        }
      } else {
        path = sourcePath.current[id];
        name = +allpath ? path : label;
      }

      return {
        sid: id,
        name,
        sourcevalue: node ? JSON.stringify(node) : '',
      };
    });

    onChange(JSON.stringify(result));
  };

  /**
   * 获取数据
   */
  const getOptions = () => {
    const lastId = operatePath[operatePath.length - 1] || '';
    let sourceData = [];
    const findData = (data, id) => {
      data.forEach(item => {
        if (item.value === id) {
          sourceData = item.children || [];
        } else if (_.isArray(item.children)) {
          findData(item.children, id);
        }
      });
    };

    if (!lastId) {
      return options;
    }

    findData(options, lastId);
    return sourceData;
  };

  const loadNextOperatePath = item => {
    setOperatePath(operatePath.concat(item.value));
    loadData(item.value);
  };

  const handleBreadcrumbClick = index => {
    setOperatePath(index ? operatePath.slice(0, index) : []);
    loadData(index ? operatePath[index - 1] : '');
  };

  // 处理项点击事件的函数
  const handleRadioItemClick = item => {
    if (getKeywords() && !canUpdate(item.value)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }
    // 叶子节点直接保存并关闭弹窗
    if (item.isLeaf) {
      handleClose();
      treeSelectChange([{ id: item.value, label: item.label }]);
    } else {
      // 非叶子节点，更新层级路径并加载数据
      loadNextOperatePath(item);
    }
  };

  const formatSearchData = (item, keywords) => {
    const searchPath = safeParse(item.searchPath) || [];
    const nodes = [];

    searchPath.forEach((part, idx) => {
      if (idx > 0) {
        nodes.push(' / ');
      }

      if (part.includes(keywords)) {
        nodes.push(
          <span className="highlight" key={idx}>
            {part}
          </span>,
        );
      } else {
        nodes.push(part);
      }
    });

    return nodes;
  };

  const handleCheckboxClick = item => {
    if (getKeywords() && !canUpdate(item.value)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    setSelectItems(prev => {
      const exists = prev.some(i => i.id === item.value);
      // 已选中移除
      if (exists) {
        return prev.filter(i => i.id !== item.value);
      }
      // 未选中添加
      return [...prev, { id: item.value, label: item.label }];
    });
  };

  // 简单展示内容
  const renderSimpleContent = (item, keywords) => {
    return (
      <OptionWrap
        onClick={
          !item.isLeaf && isMultiple
            ? e => {
                e.stopPropagation();
                loadNextOperatePath(item);
              }
            : undefined
        }
      >
        {isMultiple && item.isLeaf ? (
          <Checkbox
            text={keywords ? formatSearchData(item, keywords) : item.label}
            checked={selectItems.some(selected => selected.id === item.value)}
            onClick={() => handleCheckboxClick(item)}
          />
        ) : (
          <div className="simpleContent">{keywords ? formatSearchData(item, keywords) : item.label}</div>
        )}
        {!item.isLeaf && (
          <div className="pLeft10 Font16 textTertiary">
            <i className="icon-arrow-right-border" />
          </div>
        )}
      </OptionWrap>
    );
  };

  // 高级展示内容（带选项框）
  const renderAdvancedContent = item => (
    <OptionWrap className="advanced">
      {isMultiple ? (
        <Checkbox
          text={item.label}
          checked={selectItems.some(selected => selected.id === item.value)}
          onClick={() => handleCheckboxClick(item)}
        />
      ) : (
        <Radio
          text={item.label}
          checked={selectItems.some(selected => selected.id === item.value)}
          onClick={() => setSelectItems([{ id: item.value, label: item.label }])}
        />
      )}
      {!item.isLeaf && (
        <Fragment>
          <div className="splitLine" />
          <div className="pLeft10 Font16 textTertiary" onClick={() => loadNextOperatePath(item)}>
            <i className="icon-arrow-right-border" />
          </div>
        </Fragment>
      )}
    </OptionWrap>
  );

  /**
   * 渲染内容
   */
  const renderPopupContent = () => {
    if (isError)
      return (
        <div className="errorInfoBox">
          <Icon icon="error1" className="textDisabled" />
          <span className="errorInfo">{_l('数据源异常')}</span>
        </div>
      );

    if (!options || !options.length) return null;

    let _options = getOptions().map(item =>
      limitLayer && limitLayer === operatePath.length ? { ...item, isLeaf: true } : item,
    );

    if (!_options.length) return <LoadDiv />;

    const keywords = getKeywords();
    const hasKeywordOrAnyLevel = keywords || +anylevel;
    if (keywords) {
      _options = sortPathsBySearchKeyword(_options, keywords);
    }
    let itemRenderer;
    let clickHandler = null;
    if (hasKeywordOrAnyLevel) {
      // 模式 1：关键词搜索 或 必须选择最后一级
      itemRenderer = item => renderSimpleContent(item, keywords);
      clickHandler = !isMultiple ? item => handleRadioItemClick(item) : null;
    } else if (minLayer) {
      // 模式 2：至少选择 min 层
      itemRenderer = item => (operatePath.length >= minLayer ? renderAdvancedContent(item) : renderSimpleContent(item));
      clickHandler = !isMultiple && !(operatePath.length >= minLayer) ? item => handleRadioItemClick(item) : null;
    } else {
      // 模式 3：任意层级
      itemRenderer = item => renderAdvancedContent(item);
    }

    return (
      <div className="cascadeOptionBox">
        {_options.map(item => (
          <div className="optionItem" key={item.value} onClick={clickHandler ? () => clickHandler(item) : undefined}>
            {itemRenderer(item)}
          </div>
        ))}
      </div>
    );
  };

  const renderBreadcrumb = () => {
    const keywords = getKeywords();
    if (keywords?.length) return null;

    let displayList = [];
    // 有层级名称：取前 breadcrumbLength 项
    if (layersName?.length) {
      displayList = layersName.slice(0, operatePath.length + 1);
    } else {
      displayList = ['', ...operatePath].map((_, index) => _l('%0级', nzh.cn.encodeS(index + 1)));
    }

    return (
      <div className="breadcrumbBox">
        {displayList.map((text, index) => (
          <Fragment key={index}>
            <span onClick={() => handleBreadcrumbClick(index)}>{text || _l('%0级', nzh.cn.encodeS(index + 1))}</span>
            <span>{index < displayList.length - 1 && ' > '}</span>
          </Fragment>
        ))}
      </div>
    );
  };

  /**
   * PopupWrapper事件
   */
  const handleClose = () => {
    setVisible(false);
    setOperatePath([]);
    setSelectItems([]);
  };

  const handleClear = () => {
    handleClose();
    onChange('');
  };

  const handleSave = () => {
    handleClose();
    treeSelectChange(selectItems);
  };

  const handleSearch = () => {
    setOperatePath([]);
    loadData();
  };

  useEffect(() => {
    if (checkCellIsEmpty(value)) {
      setSelectedValues([]);
    } else {
      const formatValue = safeParse(value)?.map(item => ({
        label: item.name,
        id: item.sid,
      }));
      setSelectedValues(formatValue);
    }
  }, [value]);

  return (
    <Fragment>
      <CustomMobileCascadeControl
        hasMultipleValues={isMultiple && selectedValues.length}
        className={cx('customFormControlBox controlMinHeight', {
          controlEditReadonly: !formDisabled && selectedValues.length && disabled,
          controlDisabled: formDisabled,
        })}
        onClick={() => {
          if (!disabled) {
            loadData();
            setSelectItems(selectedValues);
            setVisible(true);
          }
        }}
      >
        {!isMultiple || !selectedValues.length ? (
          <span className={cx('flex ellipsis', { customFormPlaceholder: !selectedValues.length })}>
            {selectedValues[0]?.label || _l('请选择')}
          </span>
        ) : (
          <div className="cascadeMultipleContentBox">
            {selectedValues?.map(item => (
              <CustomCommonCapsule key={item.id}>{item.label}</CustomCommonCapsule>
            ))}
          </div>
        )}
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 textDisabled" />}
      </CustomMobileCascadeControl>

      {visible && (
        <PopupWrapper
          bodyClassName="heightPopupBody40"
          visible={visible}
          title={controlName}
          confirmDisable={!selectItems.length}
          clearDisable={!selectItems.length}
          onClose={handleClose}
          onClear={handleClear}
          onConfirm={handleSave}
        >
          {isError === 300016 ? (
            <RestrictAccessStatus />
          ) : (
            <PopupContentBox className="flexColumn">
              <MobileSearch ref={searchRef} onSearch={handleSearch} />
              {!isFirstLoad && renderBreadcrumb()}
              <div className="flex overflowHidden">
                {loading ? <LoadDiv /> : <ScrollView className="h100">{renderPopupContent()}</ScrollView>}
              </div>
            </PopupContentBox>
          )}
        </PopupWrapper>
      )}
    </Fragment>
  );
};

Cascader.propTypes = {
  disabled: PropTypes.bool,
  controlId: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  dataSource: PropTypes.string,
  viewId: PropTypes.string,
  advancedSetting: PropTypes.object,
  formData: PropTypes.arrayOf(PropTypes.shape({})),
  worksheetId: PropTypes.string,
  getType: PropTypes.number,
  formDisabled: PropTypes.bool,
};

export default memo(Cascader);
