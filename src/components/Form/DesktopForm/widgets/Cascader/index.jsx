import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Cascader, TreeSelect } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { renderText as renderCellText } from 'src/utils/control';
import { checkCellIsEmpty } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import './index.less';

const getItem = value => {
  return checkCellIsEmpty(value)
    ? { name: undefined, sid: '' }
    : {
        name: (safeParse(value)[0] || {}).name || _l('未命名'),
        sid: (safeParse(value)[0] || {}).sid || '',
      };
};

const inputValueReg = (inputValue, regType) => {
  return new RegExp(inputValue.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), regType || 'i');
};

export default function CascaderWidgets(props) {
  const {
    visible,
    disabled,
    popupClassName,
    popupPlacement,
    popupAlign,
    treePopupAlign,
    controlId,
    value,
    onChange,
    dataSource,
    viewId,
    advancedSetting,
    onPopupVisibleChange = () => {},
    control,
    hint,
    formData,
    worksheetId,
    getType,
    formItemId,
  } = props;

  const [popupVisible, setPopupVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const [searchOptions, setSearchOptions] = useState(null);
  const [widgetValue, setWidgetValue] = useState(getItem(value).name);
  const [keywords, setKeywords] = useState('');
  const [selectedId, setSelectedId] = useState(getItem(value).sid);
  const [isError, setIsError] = useState(false);
  const [treeExpandedKeys, setTreeExpandedKeys] = useState([]);

  const ajaxRef = useRef('');
  const cacheDataRef = useRef([]);
  const sourcePathRef = useRef({});
  const cacheScrollTopRef = useRef(0);
  const treeSelectCompRef = useRef(null);
  const cascaderRef = useRef(null);

  const { showtype = '3', anylevel = '0', searchcontrol } = advancedSetting || {};

  /**
   * 缓存树形完整路径
   */
  const cacheTreePath = (data, title = '') => {
    data.forEach(item => {
      sourcePathRef.current[item.value] = title + item.label;
    });
  };

  /**
   * 获取目前层级
   */
  const getLayer = rowId => {
    if (keywords) {
      let currentSearch = { currentItem: {}, currentLayer: 0 };
      (searchOptions || []).forEach(item => {
        if (item.value === rowId) {
          currentSearch = {
            currentLayer: _.findIndex(safeParse(item.path, 'array'), p => p === item.label),
            currentItem: {
              ...item,
              isLeaf: !_.get(
                _.find(cacheDataRef.current || [], c => c.rowid === rowId),
                'childrenids',
              ),
            },
          };
        }
      });
      return currentSearch;
    }

    function getCurrent(data, currentLayer) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (item.value === rowId) {
          return { currentItem: item, currentLayer };
        } else if (_.isArray(item.children)) {
          const result = getCurrent(item.children, currentLayer + 1);
          if (result) return result;
        }
      }
    }

    return getCurrent(options || [], 0);
  };

  /**
   * 结束范围
   */
  const isEndLeaf = (rowId = '') => {
    const limitLayer = Number(advancedSetting?.limitlayer || '0');

    if (limitLayer > 0 && rowId) {
      const { currentLayer = 0 } = getLayer(rowId) || {};
      return limitLayer - currentLayer === 1;
    }
    return false;
  };

  /**
   * 更新数据
   */
  const deepDataUpdate = (key, options, data, rowId) => {
    let newOptions = [].concat(options);
    if (rowId) {
      newOptions.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
          cacheTreePath(data, sourcePathRef.current[rowId] + ' / ');
        } else if (_.isArray(item.children)) {
          deepDataUpdate(key, item.children, data, rowId);
        }
      });
    } else {
      newOptions = data;
      cacheTreePath(data);
    }

    if (key === 'searchOptions') {
      setSearchOptions(newOptions);
    } else {
      setOptions(newOptions);
    }
  };

  /**
   * 加载数据
   */
  const loadData = (rowId = '') => {
    const { topshow = '0' } = advancedSetting || {};
    const currentKeywords = keywords.trim();

    if (ajaxRef.current) {
      ajaxRef.current.abort();
    }

    // 数据源筛选
    const filterControls = getFilter({ control: props, formData }) || [];
    let navGroupFilters = [];
    // 开始筛选范围处理
    if (topshow === '3' && !rowId) {
      navGroupFilters = getFilter({ control: props, formData, filterKey: 'topfilters' }) || [];
    }

    ajaxRef.current = sheetAjax.getFilterRows({
      worksheetId: dataSource,
      viewId,
      filterControls,
      navGroupFilters,
      kanbanKey: rowId,
      keywords: currentKeywords,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      getType: getType || 10,
      controlId,
      relationWorksheetId: worksheetId,
    });

    ajaxRef.current.then(result => {
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
            path: currentKeywords ? item.path : item.childrenids || item.path,
            isLeaf: currentKeywords || isEndLeaf(rowId) ? true : !item.childrenids,
          };
        });

        ajaxRef.current = '';
        cacheDataRef.current = currentKeywords
          ? result.data
          : _.uniqBy(cacheDataRef.current.concat(result.data), 'rowid');
        deepDataUpdate(currentKeywords ? 'searchOptions' : 'options', options, data, rowId);
      } else {
        setIsError(true);
      }
    });
  };

  /**
   * 渲染label
   */
  const renderLabel = (item, control) => {
    if (keywords) {
      const path = JSON.parse(item.path);
      return path.map((text = '', i) => {
        const isLast = i === path.length - 1;

        if (text.search(new RegExp(keywords.trim().replace(/([,.+?:()*[\]^$|{}\\-])/g, '\\$1'), 'i')) !== -1) {
          return (
            <React.Fragment key={i}>
              <span className="ThemeColor3">{text}</span>
              {!isLast && <span> / </span>}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={i}>
            {text}
            {!isLast && <span> / </span>}
          </React.Fragment>
        );
      });
    }

    return control
      ? renderCellText(Object.assign({}, control, { value: item[control.controlId] }), { noMask: true }) || _l('未命名')
      : _l('未命名');
  };

  /**
   * 选中后是否更新数据
   */
  const canUpdate = id => {
    const { anylevel = '0', minlayer = '0' } = advancedSetting || {};
    const minLayer = Number(minlayer);
    // 清空始终允许更新
    if (!id) return true;

    const { currentItem = {}, currentLayer = 0 } = getLayer(id) || {};

    // 任意层级
    if (anylevel !== '1') {
      // 设置指定层级
      if (minLayer) {
        return (currentLayer < minLayer && currentItem.isLeaf) || currentLayer >= minLayer;
      }
      return true;
    } else {
      return currentItem.isLeaf;
    }
  };

  /**
   * 平铺更新
   */
  const cascaderChange = (ids = [], selectedOptions = []) => {
    const { allpath = '0' } = advancedSetting || {};

    const lastIndex = ids.length - 1;
    const id = ids[lastIndex];
    let path;
    let value;

    if (!canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    if (keywords) {
      path = JSON.parse((cacheDataRef.current.find(item => item.rowid === id) || {}).path);
      value = +allpath ? path.join(' / ') : path[path.length - 1];
    } else {
      value = id
        ? selectedOptions
            .slice(+allpath ? 0 : lastIndex)
            .map(item => item.label)
            .join(' / ')
        : '';
    }

    onChange(
      id
        ? JSON.stringify([
            {
              sid: id,
              name: value,
              sourcevalue: JSON.stringify(cacheDataRef.current.find(item => item.rowid === id)),
            },
          ])
        : '',
    );

    setKeywords('');
    setWidgetValue(value);
  };

  /**
   * 树形更新
   */
  const treeSelectChange = (id, title) => {
    const { allpath = '0' } = advancedSetting || {};
    let path;
    let value;

    if (!canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    if (keywords) {
      path = JSON.parse((cacheDataRef.current.find(item => item.rowid === id) || {}).path);
      value = +allpath ? path.join(' / ') : path[path.length - 1];
    } else {
      value = +allpath ? sourcePathRef.current[id] : title;
    }

    onChange(
      id
        ? JSON.stringify([
            {
              sid: id,
              name: value,
              sourcevalue: JSON.stringify(cacheDataRef.current.find(item => item.rowid === id)),
            },
          ])
        : '',
    );

    setKeywords('');
    setWidgetValue(value);
  };

  /**
   * 获取树形滚动元素
   */
  const getTreeSelectEl = () => {
    return $(`.treeSelect_${controlId} .ant-select-tree-list`)[0];
  };

  /**
   * 搜索
   */
  const handleSearch = _.throttle(() => loadData(), 500);

  // 初始化
  useEffect(() => {
    if (!_.isUndefined(visible) && visible) {
      setPopupVisible(true);
      loadData();
      setTimeout(() => {
        if (treeSelectCompRef.current) {
          treeSelectCompRef.current.focus();
        }
        if (cascaderRef.current) {
          cascaderRef.current.focus();
        }
      }, 30);
    }

    return () => {
      if (ajaxRef.current) {
        ajaxRef.current.abort();
      }
    };
  }, []);

  useWidgetEvent(
    formItemId,
    useCallback(
      data => {
        const { triggerType } = data;
        switch (triggerType) {
          case 'Enter':
            setPopupVisible(true);
            break;
          case 'trigger_tab_enter':
            if (showtype === '4') {
              treeSelectCompRef.current && treeSelectCompRef.current.focus();
            } else {
              cascaderRef.current && cascaderRef.current.focus();
            }
            break;
          case 'trigger_tab_leave':
            if (showtype === '4') {
              treeSelectCompRef.current && treeSelectCompRef.current.blur();
            } else {
              cascaderRef.current && cascaderRef.current.blur();
            }
            break;
          default:
            break;
        }
      },
      [showtype],
    ),
  );

  useEffect(() => {
    const item = getItem(value);
    if (item.sid !== selectedId) {
      setWidgetValue(item.name);
      setSelectedId(item.sid);
    }
  }, [value]);

  useEffect(() => {
    if (showtype === '4' && getTreeSelectEl()) {
      getTreeSelectEl().scrollTop = cacheScrollTopRef.current;
    }
  }, [controlId]);

  // 监听 keywords 变化，调用搜索
  useEffect(() => {
    if (keywords) {
      handleSearch();
    }
  }, [keywords]);

  useEffect(() => {
    if (popupVisible) {
      loadData();
    } else {
      if (options) setOptions(null);
      if (keywords) setKeywords('');
      if (treeExpandedKeys.length) setTreeExpandedKeys([]);
    }
  }, [popupVisible]);

  if (showtype === '4') {
    return (
      <TreeSelect
        className="w100 customAntSelect customTreeSelect"
        dropdownClassName={cx(popupClassName, `treeSelect_${controlId}`)}
        dropdownPopupAlign={treePopupAlign}
        ref={treeSelectCompRef}
        disabled={disabled}
        virtual={false}
        placeholder={hint || _l('请选择')}
        showSearch
        allowClear={!!widgetValue}
        value={widgetValue ? [widgetValue] : []}
        selectable={!+anylevel}
        notFoundContent={
          <div className="Gray_9e pLeft12 pBottom5">
            {keywords
              ? searchOptions === null
                ? _l('搜索中...')
                : _l('请输入更多关键词')
              : isError
                ? _l('数据源异常')
                : options === null
                  ? _l('数据加载中...')
                  : _l('无数据')}
          </div>
        }
        treeData={keywords ? searchOptions || [] : options || []}
        filterTreeNode={false}
        treeExpandedKeys={treeExpandedKeys}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        loadData={({ value }) =>
          new Promise(resolve => {
            loadData(value);
            resolve();
          })
        }
        open={popupVisible}
        onChange={(id, title) => {
          if (id || !keywords.length) {
            treeSelectChange(id, title[0]);
          }
        }}
        onSearch={value => {
          setKeywords(value);
          setTreeExpandedKeys([]);
        }}
        onDropdownVisibleChange={visible => {
          setPopupVisible(visible);
          onPopupVisibleChange(visible);
        }}
        onTreeExpand={treeExpandedKeys => {
          setTreeExpandedKeys(treeExpandedKeys);
          cacheScrollTopRef.current = getTreeSelectEl().scrollTop;
        }}
      />
    );
  }

  return (
    <Cascader
      ref={cascaderRef}
      allowClear
      showSearch={{
        filter: (inputValue, result = []) => {
          let filterResult = result;
          if (+anylevel) {
            filterResult = result.filter(i => !_.find(cacheDataRef.current, da => da.pid === i.value));
          }
          return filterResult.some(
            option =>
              !!searchcontrol ||
              JSON.parse(option.path || '[]')
                .join('/')
                .search(inputValueReg(inputValue)) !== -1,
          );
        },
        sort: (a, b, inputValue) => {
          const reg = inputValueReg(inputValue, 'g');
          const formatValue = value =>
            JSON.parse(_.head(value).path || '[]').map(i => {
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
        },
        render: (inputValue, resultArr = []) => {
          return renderLabel({ path: resultArr[0].path }, control);
        },
        matchInputWidth: false,
      }}
      searchValue={keywords}
      className="w100 customCascader"
      popupAlign={popupAlign}
      popupPlacement={popupPlacement}
      disabled={disabled}
      placeholder={widgetValue ? '' : hint || _l('请选择')}
      changeOnSelect={!+anylevel}
      value={widgetValue ? [widgetValue] : []}
      displayRender={() => <span className="breakAll">{widgetValue}</span>}
      options={keywords ? searchOptions || [] : options || []}
      notFoundContent={
        keywords
          ? searchOptions === null
            ? _l('搜索中...')
            : _l('请输入更多关键词')
          : isError
            ? _l('数据源异常')
            : options === null
              ? _l('数据加载中...')
              : _l('无数据')
      }
      loadData={selectedOptions => loadData(selectedOptions[selectedOptions.length - 1].value)}
      onChange={cascaderChange}
      onSearch={value => {
        setKeywords(value);
      }}
      suffixIcon={<Icon icon="arrow-down-border Font14" />}
      open={popupVisible}
      onDropdownVisibleChange={visible => {
        setPopupVisible(visible);
        onPopupVisibleChange(visible);
      }}
      clearIcon={<Icon icon="cancel Font14 customCascaderDel"></Icon>}
    />
  );
}

CascaderWidgets.propTypes = {
  from: PropTypes.number,
  visible: PropTypes.bool,
  disabled: PropTypes.bool,
  popupClassName: PropTypes.string,
  popupPlacement: PropTypes.string,
  popupAlign: PropTypes.shape({}),
  treePopupAlign: PropTypes.shape({}),
  controlId: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  dataSource: PropTypes.string,
  viewId: PropTypes.string,
  advancedSetting: PropTypes.object,
  onPopupVisibleChange: PropTypes.func,
  control: PropTypes.object,
  hint: PropTypes.string,
  formData: PropTypes.array,
  worksheetId: PropTypes.string,
  getType: PropTypes.number,
};
