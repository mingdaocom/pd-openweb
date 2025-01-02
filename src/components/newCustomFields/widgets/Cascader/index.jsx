import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import sheetAjax from 'src/api/worksheet';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { LoadDiv, Icon, Radio, PopupWrapper } from 'ming-ui';
import cx from 'classnames';
import { Cascader, TreeSelect } from 'antd';
import { Popup, List } from 'antd-mobile';
import { FROM } from '../../tools/config';
import nzh from 'nzh';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import { checkCellIsEmpty } from 'worksheet/util';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { ADD_EVENT_ENUM } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config.js';
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
  return new RegExp(inputValue.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), regType || 'i');
};

export default class Widgets extends Component {
  static propTypes = {
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
  };

  static defaultProps = {
    onPopupVisibleChange: () => {},
  };

  constructor(props) {
    super(props);
    const items = getItem(props.value);
    this.state = {
      sourceData: [],
      visible: false,
      options: null,
      searchOptions: null,
      value: items.name,
      keywords: '',
      operatePath: [],
      selectedId: items.sid,
      selectItem: {},
      layersName: null,
      isError: false,
      treeExpandedKeys: [], // 数据实时拉，防止上次展开状态残留
    };
    this.handleClose = this.handleClose.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  ajax = '';
  cacheData = [];
  sourcePath = {};
  cacheScrollTop = 0;

  componentDidMount() {
    const { visible } = this.props;
    if (!_.isUndefined(visible) && visible) {
      this.setState({ visible: true, popupVisible: true }, () => {
        this.loadData();
        setTimeout(() => {
          if (this.treeSelectComp.current) {
            this.treeSelectComp.current.focus();
          }
          if (this.cascader) {
            this.cascader.focus();
          }
        }, 30);
      });
    }
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.SHOW);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedId } = this.state;
    const item = getItem(nextProps.value);

    if (item.sid !== selectedId) {
      this.setState({ value: item.name, selectedId: item.sid });
    }
  }

  componentDidUpdate() {
    const { advancedSetting } = this.props;
    const { showtype = '3' } = advancedSetting;

    if (this.state.visible && this.text) {
      this.text.focus();
    }

    if (showtype === '4' && this.getTreeSelectEl()) {
      this.getTreeSelectEl().scrollTop = this.cacheScrollTop;
    }
  }

  treeSelectComp = React.createRef();

  /**
   * 缓存树形完整路径
   */
  cacheTreePath(data, title = '') {
    data.forEach(item => {
      this.sourcePath[item.value] = title + item.label;
    });
  }

  /**
   * 获取目前层级
   */
  getLayer = rowId => {
    const { options, keywords, searchOptions } = this.state;

    if (keywords) {
      let currentSearch = { currentItem: {}, currentLayer: 0 };
      (searchOptions || []).forEach(item => {
        if (item.value === rowId) {
          currentSearch = {
            currentLayer: _.findIndex(safeParse(item.path, 'array'), p => p === item.label),
            currentItem: {
              ...item,
              isLeaf: !_.get(
                _.find(this.cacheData || [], c => c.rowid === rowId),
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
  isEndLeaf = (rowId = '') => {
    const { advancedSetting = {} } = this.props;
    const limitLayer = Number(advancedSetting.limitlayer || '0');

    if (limitLayer > 0 && rowId) {
      const { currentLayer = 0 } = this.getLayer(rowId) || {};
      return limitLayer - currentLayer === 1;
    }
    return false;
  };

  /**
   * 加载数据
   */
  loadData = (rowId = '') => {
    const { dataSource, controlId, viewId, formData, advancedSetting = {}, worksheetId, getType } = this.props;
    const { options, layersName } = this.state;
    const keywords = this.state.keywords.trim();
    const { topshow = '0' } = advancedSetting;

    if (this.ajax) {
      this.ajax.abort();
    }

    // 数据源筛选
    const filterControls = getFilter({ control: this.props, formData }) || [];
    let navGroupFilters = [];
    // 开始筛选范围处理
    if (topshow === '3' && !rowId) {
      navGroupFilters = getFilter({ control: this.props, formData, filterKey: 'topfilters' }) || [];
    }

    this.ajax = sheetAjax.getFilterRows({
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

    this.ajax.then(result => {
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
            isLeaf: keywords || this.isEndLeaf(rowId) ? true : !item.childrenids,
          };
        });

        this.setState({ control });

        if (browserIsMobile() && !rowId && !_.isArray(layersName)) {
          this.setState({
            layersName: (_.find(result.worksheet.views, item => item.viewId === viewId) || {}).layersName || [],
          });
        }

        this.ajax = '';
        this.cacheData = keywords ? result.data : _.uniqBy(this.cacheData.concat(result.data), 'rowid');
        this.deepDataUpdate(keywords ? 'searchOptions' : 'options', _.cloneDeep(options), data, rowId);
      } else {
        this.setState({ isError: true });
      }
    });
  };

  /**
   * 渲染label
   */
  renderLabel(item, control) {
    const { keywords } = this.state;

    if (keywords) {
      const path = JSON.parse(item.path);
      return path.map((text = '', i) => {
        const isLast = i === path.length - 1;

        if (text.search(new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i')) !== -1) {
          return (
            <Fragment key={i}>
              <span className="ThemeColor3">{text}</span>
              {!isLast && <span> / </span>}
            </Fragment>
          );
        }

        return (
          <Fragment key={i}>
            {text}
            {!isLast && <span> / </span>}
          </Fragment>
        );
      });
    }

    return control
      ? renderCellText(Object.assign({}, control, { value: item[control.controlId] }), { noMask: true }) || _l('未命名')
      : _l('未命名');
  }

  /**
   * 更新数据
   */
  deepDataUpdate(key, options, data, rowId) {
    if (rowId) {
      options.forEach(item => {
        if (item.value === rowId) {
          item.children = data;
          this.cacheTreePath(data, this.sourcePath[rowId] + ' / ');
        } else if (_.isArray(item.children)) {
          this.deepDataUpdate(key, item.children, data, rowId);
        }
      });
    } else {
      options = data;
      this.cacheTreePath(data);
    }

    this.setState({ [key]: options });
  }

  /**
   * 选中后是否更新数据
   */
  canUpdate(id) {
    const { advancedSetting } = this.props;
    const { anylevel = '0', minlayer = '0' } = advancedSetting;
    const minLayer = Number(minlayer);
    // 清空始终允许更新
    if (!id) return true;

    const { currentItem = {}, currentLayer = 0 } = this.getLayer(id) || {};

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
  }

  /**
   * 平铺更新
   */
  cascaderChange = (ids = [], selectedOptions = []) => {
    const { onChange, advancedSetting } = this.props;
    const { allpath = '0' } = advancedSetting;
    const { keywords } = this.state;

    const lastIndex = ids.length - 1;
    const id = ids[lastIndex];
    let path;
    let value;

    if (!this.canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    if (keywords) {
      path = JSON.parse(this.cacheData.find(item => item.rowid === id).path);
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
            { sid: id, name: value, sourcevalue: JSON.stringify(this.cacheData.find(item => item.rowid === id)) },
          ])
        : '',
    );

    this.setState({
      keywords: '',
      value,
    });
  };

  /**
   * 树形更新
   */
  treeSelectChange = (id, title) => {
    const { onChange, advancedSetting } = this.props;
    const { allpath = '0' } = advancedSetting;
    const { keywords } = this.state;
    let path;
    let value;

    if (!this.canUpdate(id)) {
      alert(_l('不在可选范围内'), 3);
      return;
    }

    if (keywords) {
      path = JSON.parse(this.cacheData.find(item => item.rowid === id).path);
      value = +allpath ? path.join(' / ') : path[path.length - 1];
    } else {
      value = +allpath ? this.sourcePath[id] : title;
    }

    onChange(
      id
        ? JSON.stringify([
            { sid: id, name: value, sourcevalue: JSON.stringify(this.cacheData.find(item => item.rowid === id)) },
          ])
        : '',
    );

    this.setState({
      keywords: '',
      value,
    });
  };

  componentWillUnmount() {
    if (_.isFunction(this.props.triggerCustomEvent)) {
      this.props.triggerCustomEvent(ADD_EVENT_ENUM.HIDE);
    }
  }

  /**
   * PopupWrapper事件
   */
  handleClose() {
    this.setState({ visible: false, operatePath: [], selectItem: {} });
  }

  handleBack() {
    const { operatePath } = this.state;
    const newPath = [].concat(operatePath);
    newPath.pop();
    this.setState({ operatePath: newPath });
  }

  handleClear() {
    const { onChange } = this.props;
    this.setState({ visible: false, operatePath: [], selectItem: {}, value: '', selectedId: '' });
    onChange('');
  }

  handleSave() {
    const { selectItem } = this.state;
    this.setState({ visible: false, operatePath: [], selectItem: {}, selectedId: selectItem.id });
    this.treeSelectChange(selectItem.id, selectItem.label);
  }

  /**
   * 获取h5数据
   */
  getH5Options() {
    const { options, operatePath } = this.state;
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
    } else {
      findData(options, lastId);

      return sourceData;
    }
  }

  /**
   * 渲染h5内容
   */
  renderH5Content() {
    const { advancedSetting } = this.props;
    const { anylevel = '0', minlayer = '0', limitlayer = '0' } = advancedSetting;
    const { options, operatePath, selectedId, selectItem, isError } = this.state;
    const minLayer = Number(minlayer);
    const limitLayer = Number(limitlayer);

    if (isError) return <div className="mTop10">{_l('数据源异常')}</div>;
    if (options === null) return <LoadDiv />;
    if (!options.length) return <div className="mTop10">{_l('无数据')}</div>;

    const h5Options = this.getH5Options().map(item =>
      limitLayer && limitLayer === operatePath.length ? { ...item, isLeaf: true } : item,
    );

    if (!h5Options.length) return <LoadDiv />;

    // 必须选择最后一级
    if (+anylevel) {
      return (
        <List>
          {h5Options.map(item => (
            <List.Item
              key={item.value}
              arrowIcon={false}
              onClick={() => {
                if (item.isLeaf) {
                  this.setState({ visible: false, operatePath: [], selectedId: item.value });
                  this.treeSelectChange(item.value, item.label);
                } else {
                  this.setState({ operatePath: operatePath.concat(item.value) }, () => {
                    this.loadData(item.value);
                  });
                }
              }}
            >
              <div className="flexRow">
                <div className="flex ellipsis">{item.label}</div>
                {!item.isLeaf && (
                  <div className="pLeft10 Font16 Gray_9e">
                    <i className="icon-arrow-right-border" />
                  </div>
                )}
              </div>
            </List.Item>
          ))}
        </List>
      );
    }

    // 至少向后选择指定级
    if (minLayer) {
      return (
        <List>
          {h5Options.map(item => (
            <List.Item
              key={item.value}
              arrowIcon={false}
              onClick={() => {
                if (operatePath.length >= minLayer) return;

                if (item.isLeaf) {
                  this.setState({ visible: false, operatePath: [], selectedId: item.value });
                  this.treeSelectChange(item.value, item.label);
                } else {
                  this.setState({ operatePath: operatePath.concat(item.value) }, () => {
                    this.loadData(item.value);
                  });
                }
              }}
            >
              {operatePath.length >= minLayer ? (
                <div className="flexRow">
                  <Radio
                    className="flex cascaderRadio flexRow"
                    text={item.label}
                    checked={selectItem.id ? item.value === selectItem.id : item.value === selectedId}
                    onClick={() => this.setState({ selectItem: { id: item.value, label: item.label } })}
                  />
                  {!item.isLeaf && (
                    <Fragment>
                      <div style={{ borderRight: '1px solid #e0e0e0', height: 18, marginTop: 4 }} />
                      <div
                        className="pLeft10 Font16 Gray_9e"
                        onClick={e => {
                          e.stopPropagation();
                          this.setState({ operatePath: operatePath.concat(item.value) }, () => {
                            this.loadData(item.value);
                          });
                        }}
                      >
                        <i className="icon-arrow-right-border" />
                      </div>
                    </Fragment>
                  )}
                </div>
              ) : (
                <div className="flexRow">
                  <div className="flex ellipsis">{item.label}</div>
                  {!item.isLeaf && (
                    <div className="pLeft10 Font16 Gray_9e">
                      <i className="icon-arrow-right-border" />
                    </div>
                  )}
                </div>
              )}
            </List.Item>
          ))}
        </List>
      );
    }

    // 任意层级
    return (
      <List>
        {h5Options.map(item => (
          <List.Item key={item.value} arrowIcon={false}>
            <div className="flexRow">
              <Radio
                className="flex cascaderRadio flexRow"
                text={item.label}
                checked={selectItem.id ? item.value === selectItem.id : item.value === selectedId}
                onClick={() => this.setState({ selectItem: { id: item.value, label: item.label } })}
              />
              {!item.isLeaf && (
                <Fragment>
                  <div style={{ borderRight: '1px solid #e0e0e0', height: 18, marginTop: 4 }} />
                  <div
                    className="pLeft10 Font16 Gray_9e"
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ operatePath: operatePath.concat(item.value) }, () => {
                        this.loadData(item.value);
                      });
                    }}
                  >
                    <i className="icon-arrow-right-border" />
                  </div>
                </Fragment>
              )}
            </div>
          </List.Item>
        ))}
      </List>
    );
  }

  /**
   * 获取树形滚动元素
   */
  getTreeSelectEl() {
    const { controlId } = this.props;

    return $(`.treeSelect_${controlId} .ant-select-tree-list`)[0];
  }

  /**
   * 搜索
   */
  handleSearch = _.throttle(() => {
    if (!this.state.keywords) return;
    this.loadData();
  }, 500);

  render() {
    const {
      from,
      disabled,
      controlId,
      advancedSetting,
      popupClassName,
      popupPlacement,
      popupAlign,
      treePopupAlign,
      onPopupVisibleChange,
      control,
      hint,
    } = this.props;
    const { showtype = '3', anylevel = '0', minlayer = '0', searchcontrol } = advancedSetting;
    const { visible, options, searchOptions, value, keywords, isError, treeExpandedKeys, operatePath, layersName } =
      this.state;
    const minLayer = Number(minlayer);

    if (browserIsMobile()) {
      return (
        <Fragment>
          <button
            type="button"
            className={cx('customFormControlBox customFormButton flexRow', { controlDisabled: disabled })}
            disabled={disabled}
            onClick={() => {
              if (!disabled) {
                options === null && this.loadData();
                this.setState({ visible: true });
              }
            }}
          >
            <span className={cx('flex mRight20 ellipsis', { Gray_bd: !value })}>{value || _l('请选择')}</span>
            {!disabled && (
              <Icon
                icon={_.includes([FROM.H5_ADD, FROM.H5_EDIT], from) ? 'arrow-right-border' : 'sp_pin_drop_white'}
                className="Font16 Gray_bd"
              />
            )}
          </button>

          {visible && (
            <PopupWrapper
              bodyClassName="heightPopupBody40"
              visible={visible}
              title={(layersName || [])[operatePath.length] || _l('%0级', nzh.cn.encodeS(operatePath.length + 1))}
              confirmDisable={!(minLayer && !+anylevel ? operatePath.length >= minLayer : !+anylevel)}
              clearDisable={!value}
              onClose={this.handleClose}
              onBack={operatePath.length > 0 && this.handleBack}
              onClear={this.handleClear}
              onConfirm={this.handleSave}
            >
              <div className="mobileCascader flexColumn">{this.renderH5Content()}</div>
            </PopupWrapper>
          )}
        </Fragment>
      );
    }

    if (showtype === '4') {
      return (
        <TreeSelect
          className="w100 customAntSelect customTreeSelect"
          dropdownClassName={cx(popupClassName, `treeSelect_${controlId}`)}
          dropdownPopupAlign={treePopupAlign}
          ref={this.treeSelectComp}
          disabled={disabled}
          virtual={false}
          placeholder={hint || _l('请选择')}
          showSearch
          allowClear={!!value}
          value={value ? [value] : []}
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
              this.loadData(value);
              resolve();
            })
          }
          {...(_.isUndefined(this.state.popupVisible) ? {} : { open: this.state.popupVisible })}
          onChange={(id, title) => {
            if (id || !keywords.length) {
              this.treeSelectChange(id, title[0]);
            }
          }}
          onSearch={e => this.setState({ keywords: e, treeExpandedKeys: [] }, this.handleSearch)}
          onFocus={() => {
            this.setState({ options: null, treeExpandedKeys: [] }, () => this.loadData());
          }}
          onDropdownVisibleChange={onPopupVisibleChange}
          onTreeExpand={treeExpandedKeys => {
            this.setState({ treeExpandedKeys });
            this.cacheScrollTop = this.getTreeSelectEl().scrollTop;
          }}
        />
      );
    }

    return (
      <Cascader
        ref={cascader => {
          this.cascader = cascader;
        }}
        allowClear
        showSearch={{
          filter: (inputValue, result = []) => {
            let filterResult = result;
            if (+anylevel) {
              filterResult = result.filter(i => !_.find(this.cacheData, da => da.pid === i.value));
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
            return this.renderLabel({ path: resultArr[0].path }, control);
          },
          matchInputWidth: false,
        }}
        searchValue={keywords}
        className="w100 customCascader"
        popupClassName={popupClassName}
        popupAlign={popupAlign}
        popupPlacement={popupPlacement}
        disabled={disabled}
        placeholder={value ? '' : hint || _l('请选择')}
        changeOnSelect={!+anylevel}
        value={value ? [value] : []}
        displayRender={() => <span className="breakAll">{value}</span>}
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
        loadData={selectedOptions => this.loadData(selectedOptions[selectedOptions.length - 1].value)}
        onChange={this.cascaderChange}
        onSearch={value => this.setState({ keywords: value }, this.handleSearch)}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        {...(_.isUndefined(this.state.popupVisible) ? {} : { open: this.state.popupVisible })}
        onDropdownVisibleChange={visible => {
          this.setState({ visible, options: null, keywords: '' });
          visible && this.loadData();
          onPopupVisibleChange(visible);
        }}
        clearIcon={<Icon icon="closeelement-bg-circle Font14 customCascaderDel"></Icon>}
      ></Cascader>
    );
  }
}
