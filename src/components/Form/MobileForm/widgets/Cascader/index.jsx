import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { List } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import nzh from 'nzh';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, MobileSearch, PopupWrapper, Radio, ScrollView } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { renderText as renderCellText } from 'src/utils/control';
import { checkCellIsEmpty, sortPathsBySearchKeyword } from '../../tools/utils';

const AdvancedContentWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  .Radio {
    align-items: center;

    &-box {
      flex-shrink: 0;
    }
  }
`;

const PopupContentBox = styled.div`
  height: 100%;
  overflow-y: auto;

  .adm-list-body {
    font-size: 15px;
    border-top: initial;
  }

  .Radio-box {
    margin-top: initial !important;
  }

  .canWrap {
    word-break: break-all;
    white-space: wrap !important;
  }

  .highlight {
    color: var(--color-primary);
    vertical-align: initial !important;
  }

  .errorInfoBox {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 70%;

    .icon {
      margin-bottom: 16px;
      font-size: 120px;
      color: var(--gray-bd);
    }
    .errorInfo {
      font-size: 17px;
    }
  }
`;

const getItem = value => {
  return checkCellIsEmpty(value)
    ? { name: undefined, sid: '' }
    : {
        name: (safeParse(value)[0] || {}).name || _l('未命名'),
        sid: (safeParse(value)[0] || {}).sid || '',
      };
};

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
    onChange = () => {},
  } = props;
  const { topshow = '0', anylevel = '0', minlayer = '0', allpath = '0', limitlayer = '0' } = advancedSetting;
  const limitLayer = Number(limitlayer);
  const minLayer = Number(minlayer);

  const ajax = useRef(null);
  const cacheData = useRef([]);
  const sourcePath = useRef({});
  const searchRef = useRef({});
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const [value, setValue] = useState('');
  const [operatePath, setOperatePath] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectItem, setSelectItem] = useState({});
  const [layersName, setLayersName] = useState(null);
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

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
    const filterControls = getFilter({ control: props, formData }) || [];
    let navGroupFilters = [];
    // 开始筛选范围处理
    if (topshow === '3' && !rowId) {
      navGroupFilters = getFilter({ control: props, formData, filterKey: 'topfilters' }) || [];
    }

    setLoading(true);
    const keywords = getKeywords();
    ajax.current = sheetAjax.getFilterRows({
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
              path: item.childrenids || item.path,
              searchPath: keywords ? item.path : '[]', // 搜索快速清空，偶发会显示childrenids路径，改用searchPath
              isLeaf: !!keywords || isEndLeaf(rowId) || !item.childrenids,
            };
          });

          if (!rowId && !_.isArray(layersName)) {
            setLayersName((_.find(result.worksheet.views, item => item.viewId === viewId) || {}).layersName || []);
          }

          ajax.current = '';
          cacheData.current = keywords ? result.data : _.uniqBy(cacheData.current.concat(result.data), 'rowid');
          deepDataUpdate(_.cloneDeep(options), data, rowId);
        } else {
          setIsError(true);
        }
      })
      .finally(() => setLoading(false));
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
  const treeSelectChange = (id, title) => {
    if (!canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    let value;
    let path;
    const keywords = getKeywords();
    if (keywords) {
      path = JSON.parse(cacheData.current.find(item => item.rowid === id).path);
      value = +allpath ? path.join(' / ') : path[path.length - 1];
    } else {
      value = +allpath ? sourcePath.current[id] : title;
    }

    onChange(
      id
        ? JSON.stringify([
            { sid: id, name: value, sourcevalue: JSON.stringify(cacheData.current.find(item => item.rowid === id)) },
          ])
        : '',
    );

    setValue(value);
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

  // 处理项点击事件的函数
  const handleItemClick = item => {
    if (getKeywords() && !canUpdate(item.value)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }
    if (item.isLeaf) {
      setVisible(false);
      setOperatePath([]);
      setSelectedId(item.value);
      treeSelectChange(item.value, item.label);
    } else {
      setOperatePath(operatePath.concat(item.value));
      loadData(item.value);
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

  // 简单展示内容（无 Radio）
  const renderSimpleContent = (item, keywords) => {
    return (
      <div className="flexRow">
        <div className={cx('flex ellipsis', { canWrap: keywords })}>
          {keywords ? formatSearchData(item, keywords) : item.label}
        </div>
        {!item.isLeaf && (
          <div className="pLeft10 Font16 Gray_9e">
            <i className="icon-arrow-right-border" />
          </div>
        )}
      </div>
    );
  };

  // 高级展示内容（带 Radio）
  const renderAdvancedContent = item => (
    <AdvancedContentWrap>
      <Radio
        className="flex flexRow"
        text={item.label}
        checked={selectItem.id ? item.value === selectItem.id : item.value === selectedId}
        onClick={() => setSelectItem({ id: item.value, label: item.label })}
      />
      {!item.isLeaf && (
        <Fragment>
          <div style={{ borderRight: '1px solid var(--gray-e0)', height: 18 }} />
          <div
            className="pLeft10 Font16 Gray_9e"
            onClick={e => {
              e.stopPropagation();
              setOperatePath([...operatePath, item.value]);
              loadData(item.value);
            }}
          >
            <i className="icon-arrow-right-border" />
          </div>
        </Fragment>
      )}
    </AdvancedContentWrap>
  );

  /**
   * 渲染内容
   */
  const renderPopupContent = () => {
    if (isError)
      return (
        <div className="errorInfoBox">
          <Icon icon="error1" className="Gray_bd" />
          <span className="errorInfo">{_l('数据源异常')}</span>
        </div>
      );
    if (!options.length) return null;

    let _options = getOptions().map(item =>
      limitLayer && limitLayer === operatePath.length ? { ...item, isLeaf: true } : item,
    );

    if (!_options.length) return <LoadDiv />;

    const keywords = getKeywords();
    if (keywords) {
      _options = sortPathsBySearchKeyword(_options, keywords);
    }
    // 必须选择最后一级
    if (keywords || +anylevel) {
      return (
        <List>
          {_options.map(item => (
            <List.Item key={item.value} arrowIcon={false} onClick={() => handleItemClick(item)}>
              {renderSimpleContent(item, keywords)}
            </List.Item>
          ))}
        </List>
      );
    }

    // 至少向后选择指定级
    if (minLayer) {
      return (
        <List>
          {_options.map(item => (
            <List.Item
              key={item.value}
              arrowIcon={false}
              onClick={() => {
                if (operatePath.length >= minLayer) return;
                handleItemClick(item);
              }}
            >
              {operatePath.length >= minLayer ? renderAdvancedContent(item) : renderSimpleContent(item)}
            </List.Item>
          ))}
        </List>
      );
    }

    // 任意层级
    return (
      <List>
        {_options.map(item => (
          <List.Item key={item.value} arrowIcon={false}>
            {renderAdvancedContent(item)}
          </List.Item>
        ))}
      </List>
    );
  };

  /**
   * PopupWrapper事件
   */
  const handleClose = () => {
    setVisible(false);
    setOperatePath([]);
    setSelectItem({});
  };

  const handleBack = () => {
    setOperatePath(operatePath.slice(0, -1));
  };

  const handleClear = () => {
    setVisible(false);
    setOperatePath([]);
    setSelectItem({});
    setValue('');
    setSelectedId('');
    onChange('');
  };

  const handleSave = () => {
    setVisible(false);
    setOperatePath([]);
    setSelectItem({});
    setSelectedId(selectItem.id);
    treeSelectChange(selectItem.id, selectItem.label);
  };

  const handleSearch = () => {
    setOperatePath([]);
    setSelectItem({});
    loadData();
  };

  useEffect(() => {
    const items = getItem(props.value);
    setValue(items.name);
    setSelectedId(items.sid);
  }, [props.value]);

  return (
    <Fragment>
      <div
        className={cx('customFormControlBox controlMinHeight flexRow flexCenter', {
          controlEditReadonly: !formDisabled && value && disabled,
          controlDisabled: formDisabled,
        })}
        onClick={() => {
          if (!disabled) {
            loadData();
            setVisible(true);
          }
        }}
      >
        <span className={cx('flex ellipsis', { customFormPlaceholder: !value })}>{value || _l('请选择')}</span>
        {(!disabled || !formDisabled) && <Icon icon="arrow-right-border" className="Font16 Gray_bd" />}
      </div>

      {visible && (
        <PopupWrapper
          bodyClassName="heightPopupBody40"
          visible={visible}
          title={(layersName || [])[operatePath.length] || _l('%0级', nzh.cn.encodeS(operatePath.length + 1))}
          confirmDisable={!(minLayer && !+anylevel ? operatePath.length > minLayer || selectItem.id : !+anylevel)}
          clearDisable={!value}
          onClose={handleClose}
          onBack={operatePath.length > 0 ? handleBack : null}
          onClear={handleClear}
          onConfirm={handleSave}
        >
          <PopupContentBox className="flexColumn">
            <MobileSearch ref={searchRef} onSearch={handleSearch} />
            <div className="flex overflowHidden">
              {loading ? <LoadDiv /> : <ScrollView className="h100">{renderPopupContent()}</ScrollView>}
            </div>
          </PopupContentBox>
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
