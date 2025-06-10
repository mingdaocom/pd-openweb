import React, { Fragment, memo, useEffect, useRef, useState } from 'react';
import { List } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import nzh from 'nzh';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, PopupWrapper, Radio } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { renderText as renderCellText } from 'src/utils/control';
import { checkCellIsEmpty } from '../../tools/utils';

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
  }

  .Radio-box {
    margin-top: initial !important;
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
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState(null);
  const [value, setValue] = useState('');
  const [operatePath, setOperatePath] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectItem, setSelectItem] = useState({});
  const [layersName, setLayersName] = useState(null);
  const [isError, setIsError] = useState(false);

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

    ajax.current = sheetAjax.getFilterRows({
      worksheetId: dataSource,
      viewId,
      filterControls,
      navGroupFilters,
      kanbanKey: rowId,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      getType: getType || 10,
      controlId,
      relationWorksheetId: worksheetId,
    });

    ajax.current.then(result => {
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
            isLeaf: isEndLeaf(rowId) || !item.childrenids,
          };
        });

        if (!rowId && !_.isArray(layersName)) {
          setLayersName((_.find(result.worksheet.views, item => item.viewId === viewId) || {}).layersName || []);
        }

        ajax.current = '';
        cacheData.current = _.uniqBy(cacheData.current.concat(result.data), 'rowid');
        deepDataUpdate(_.cloneDeep(options), data, rowId);
      } else {
        setIsError(true);
      }
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
  const treeSelectChange = (id, title) => {
    if (!canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    let value = +allpath ? sourcePath.current[id] : title;

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

  // 简单展示内容（无 Radio）
  const renderSimpleContent = item => (
    <div className="flexRow">
      <div className="flex ellipsis">{item.label}</div>
      {!item.isLeaf && (
        <div className="pLeft10 Font16 Gray_9e">
          <i className="icon-arrow-right-border" />
        </div>
      )}
    </div>
  );

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
    if (isError) return <div className="mTop10">{_l('数据源异常')}</div>;
    if (options === null) return <LoadDiv />;
    if (!options.length) return <div className="mTop10">{_l('无数据')}</div>;

    const _options = getOptions().map(item =>
      limitLayer && limitLayer === operatePath.length ? { ...item, isLeaf: true } : item,
    );

    if (!_options.length) return <LoadDiv />;

    // 必须选择最后一级
    if (+anylevel) {
      return (
        <List>
          {_options.map(item => (
            <List.Item key={item.value} arrowIcon={false} onClick={() => handleItemClick(item)}>
              {renderSimpleContent(item)}
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
            options === null && loadData();
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
          confirmDisable={!(minLayer && !+anylevel ? operatePath.length >= minLayer : !+anylevel)}
          clearDisable={!value}
          onClose={handleClose}
          onBack={operatePath.length > 0 ? handleBack : null}
          onClear={handleClear}
          onConfirm={handleSave}
        >
          <PopupContentBox className="flexColumn">{renderPopupContent()}</PopupContentBox>
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
