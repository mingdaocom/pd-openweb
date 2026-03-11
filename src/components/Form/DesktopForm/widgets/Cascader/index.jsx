import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TreeSelect } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import Cascader from 'ming-ui/antd-components/Cascader';
import sheetAjax from 'src/api/worksheet';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { renderText as renderCellText } from 'src/utils/control';
import { checkCellIsEmpty } from 'src/utils/control';
import { useWidgetEvent } from '../../../core/useFormEventManager';

const { SHOW_ALL } = TreeSelect;

const dealValue = value => {
  if (checkCellIsEmpty(value)) {
    return [];
  }
  return safeParse(value, 'array') || [];
};

const MAX_CASCADE_SELECT_COUNT = 20;

export default function CascaderWidget(props) {
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
    hint,
    formData,
    worksheetId,
    getType,
    formItemId,
    enumDefault,
    appId,
    notLimitCount = false,
  } = props;

  const [popupVisible, setPopupVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const [searchOptions, setSearchOptions] = useState(null);
  const [widgetValue, setWidgetValue] = useState(dealValue(value));
  const [keywords, setKeywords] = useState('');
  const [isError, setIsError] = useState(false);
  const [treeExpandedKeys, setTreeExpandedKeys] = useState([]);

  const ajaxRef = useRef('');
  const cacheDataRef = useRef([]);
  const sourcePathRef = useRef({});
  const cacheScrollTopRef = useRef(0);
  const treeSelectCompRef = useRef(null);
  const cascaderRef = useRef(null);

  const { showtype = '3', anylevel = '0' } = advancedSetting || {};
  // 多转单后也按多选展示
  const isShowMultiple = enumDefault === 2 || safeParse(value, 'array').length > 1;
  const isMultiple = enumDefault === 2;

  /**
   * 缓存树形完整路径
   */
  const cacheTreePath = (data, title = '') => {
    data.forEach(item => {
      sourcePathRef.current[item.value] = title + (item.title || item.label || '');
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
    const filterControls = getFilter({ control: props, formData, appId }) || [];
    let navGroupFilters = [];
    // 开始筛选范围处理
    if (topshow === '3' && !rowId) {
      navGroupFilters = getFilter({ control: props, formData, filterKey: 'topfilters', appId }) || [];
    }

    ajaxRef.current = sheetAjax.chooseRelationRows({
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

    ajaxRef.current
      .then(result => {
        if (result.resultCode === 1) {
          const { template } = result;
          const control = template.controls.find(item => item.attribute === 1);
          const data = result.data.map(item => {
            const isLeaf = currentKeywords || isEndLeaf(rowId) ? true : !item.childrenids;
            return {
              value: item.rowid,
              [showtype === '4' ? 'title' : 'label']: control
                ? renderCellText(Object.assign({}, control, { value: item[control.controlId] }), { noMask: true }) ||
                  _l('未命名')
                : _l('未命名'),
              path: currentKeywords ? item.path : item.childrenids || item.path,
              isLeaf,
              ...(isMultiple && anylevel === '1' ? { checkable: isLeaf } : {}),
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
      })
      .catch(err => {
        // 1 表示请求被取消，不设置错误状态
        if (err.errorCode !== 1) {
          setIsError(err.errorCode);
        }
      });
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
      return _.isEmpty(currentItem) || currentItem.isLeaf;
    }
  };

  /**
   * 平铺更新
   */
  const cascaderChange = (ids = []) => {
    const { allpath = '0' } = advancedSetting || {};

    if (_.isEmpty(ids)) {
      onChange('');
      setWidgetValue([]);
      return;
    }

    const verifyIds = ids.filter(id => !widgetValue.find(item => item.sid === id.value));

    if (verifyIds.some(id => !canUpdate(id.value))) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    const newValues = [];
    ids.map(i => {
      let path;
      let newName;
      if (i.value) {
        const originCurItem = widgetValue.find(item => item.sid === i.value);

        if (originCurItem) {
          newValues.push(originCurItem);
        } else {
          if (keywords) {
            const curItem = cacheDataRef.current.find(item => item.rowid === i.value);
            if (curItem) {
              path = JSON.parse(curItem.path || '[]');
            } else {
              path = originCurItem?.name?.split(' / ') || [];
            }
            newName = +allpath ? path.join(' / ') : path[path.length - 1];
          } else {
            const nameArr = (sourcePathRef.current[i.value] || '').split(' / ');
            newName = nameArr.slice(+allpath ? 0 : nameArr.length - 1).join(' / ');
          }
          newValues.push({
            sid: i.value,
            name: newName,
            sourcevalue: JSON.stringify(cacheDataRef.current.find(item => item.rowid === i.value)),
          });
        }
      }
    });

    if (newValues.length > MAX_CASCADE_SELECT_COUNT && !notLimitCount) {
      alert(_l('最多可选择20项'), 3);
      return;
    }

    onChange(JSON.stringify(newValues));

    setKeywords('');
    setWidgetValue(newValues);
  };

  /**
   * 树形更新
   */
  const treeSelectChange = (ids, title = '') => {
    const { allpath = '0' } = advancedSetting || {};
    ids = _.isArray(ids) ? ids : [{ value: ids, label: title.join() }];

    if (_.isEmpty(ids)) {
      onChange('');
      setWidgetValue([]);
      return;
    }

    const verifyIds = ids.filter(id => !widgetValue.find(item => item.sid === id.value));

    if (verifyIds.some(i => !canUpdate(i.value))) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    const newValues = [];
    ids.map(i => {
      let path;
      let newName;
      if (i.value) {
        const originCurItem = widgetValue.find(item => item.sid === i.value);

        if (originCurItem) {
          newValues.push(originCurItem);
        } else {
          if (keywords) {
            const curItem = cacheDataRef.current.find(item => item.rowid === i.value);
            if (curItem) {
              path = JSON.parse(curItem.path || '[]');
            } else {
              path = originCurItem?.name?.split(' / ') || [];
            }
            newName = +allpath ? path.join(' / ') : path[path.length - 1];
          } else {
            const nameArr = (sourcePathRef.current[i.value] || '').split(' / ');
            newName = nameArr.slice(+allpath ? 0 : nameArr.length - 1).join(' / ');
          }
          newValues.push({
            sid: i.value,
            name: newName,
            sourcevalue: JSON.stringify(cacheDataRef.current.find(item => item.rowid === i.value)),
          });
        }
      }
    });

    if (newValues.length > MAX_CASCADE_SELECT_COUNT && !notLimitCount) {
      alert(_l('最多可选择20项'), 3);
      return;
    }

    onChange(JSON.stringify(newValues));

    setKeywords('');
    setWidgetValue(newValues);

    if (!isMultiple) {
      setTimeout(() => {
        setPopupVisible(false);
        onPopupVisibleChange(false);
      }, 0);
    }
  };

  /**
   * 获取树形滚动元素
   */
  const getTreeSelectEl = () => {
    return $(`.treeSelect_${controlId} .ant-select-tree-list`)[0];
  };

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
              setPopupVisible(false);
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
    const newWidgetValue = dealValue(value);
    if (!_.isEqual(newWidgetValue, widgetValue)) {
      setWidgetValue(newWidgetValue);
    }
  }, [value]);

  useEffect(() => {
    if (showtype === '4' && getTreeSelectEl()) {
      getTreeSelectEl().scrollTop = cacheScrollTopRef.current;
    }
  }, [controlId]);

  /**
   * 搜索
   */
  const handleSearch = _.throttle(() => loadData(), 500);

  // 监听 keywords 变化，调用搜索
  useEffect(() => {
    handleSearch();
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
        {...(isShowMultiple
          ? { multiple: true, treeCheckable: true, showCheckedStrategy: SHOW_ALL, treeCheckStrictly: true }
          : {})}
        virtual={false}
        placeholder={hint || _l('请选择')}
        showSearch
        allowClear={!_.isEmpty(widgetValue)}
        value={
          _.isEmpty(widgetValue) ? [] : widgetValue.map(item => ({ value: item.sid, label: item.name || _l('未命名') }))
        }
        selectable={!+anylevel}
        notFoundContent={
          <div className="textTertiary pLeft12 pBottom5">
            {keywords ? (
              searchOptions === null ? (
                _l('搜索中...')
              ) : (
                _l('请输入更多关键词')
              )
            ) : isError ? (
              isError === 300016 ? (
                <RestrictAccessStatus />
              ) : (
                _l('数据源异常')
              )
            ) : options === null ? (
              _l('数据加载中...')
            ) : (
              _l('无数据')
            )}
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
            treeSelectChange(id, title);
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
      {...(isShowMultiple
        ? { multiple: true, ...(notLimitCount ? {} : { maxTagCount: MAX_CASCADE_SELECT_COUNT }) }
        : { changeOnSelect: !+anylevel })}
      searchValue={keywords}
      className="w100 customCascader"
      popupAlign={popupAlign}
      popupPlacement={popupPlacement}
      disabled={disabled}
      placeholder={_.isEmpty(widgetValue) ? hint || _l('请选择') : ''}
      value={widgetValue.map(i => ({ value: i.sid, label: i.name || _l('未命名') }))}
      options={keywords ? searchOptions || [] : options || []}
      notFoundContent={
        keywords ? (
          searchOptions === null ? (
            _l('搜索中...')
          ) : (
            _l('请输入更多关键词')
          )
        ) : isError ? (
          isError === 300016 ? (
            <RestrictAccessStatus />
          ) : (
            _l('数据源异常')
          )
        ) : options === null ? (
          _l('数据加载中...')
        ) : (
          _l('无数据')
        )
      }
      loadData={node => loadData(node.value)}
      onChange={cascaderChange}
      onSearch={value => {
        setKeywords(value);
      }}
      open={popupVisible}
      onDropdownVisibleChange={visible => {
        setPopupVisible(visible);
        onPopupVisibleChange(visible);
      }}
    />
  );
}

CascaderWidget.propTypes = {
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
