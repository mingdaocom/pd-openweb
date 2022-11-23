import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import sheetAjax from 'src/api/worksheet';
import { renderCellText } from 'src/pages/worksheet/components/CellControls';
import { LoadDiv, Icon, Radio } from 'ming-ui';
import cx from 'classnames';
import { Cascader, TreeSelect } from 'antd';
import { Modal, List } from 'antd-mobile';
import { FROM } from '../../tools/config';
import nzh from 'nzh';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';

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

    this.state = {
      sourceData: [],
      visible: false,
      options: null,
      searchOptions: null,
      value: props.value && props.value !== '[]' ? (safeParse(props.value)[0] || {}).name : undefined,
      keywords: '',
      operatePath: [],
      selectedId: props.value && props.value !== '[]' ? (safeParse(props.value)[0] || {}).sid : '',
      selectItem: {},
      layersName: null,
      isError: false,
    };
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
  }

  componentWillReceiveProps(nextProps) {
    const { selectedId } = this.state;
    const item =
      nextProps.value && nextProps.value !== '[]' ? safeParse(nextProps.value)[0] || { sid: '' } : { sid: '' };

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
   * 加载数据
   */
  loadData = (rowId = '') => {
    const { dataSource, viewId } = this.props;
    const { options, layersName } = this.state;
    const keywords = this.state.keywords.trim();

    if (!keywords && options !== null && !rowId) {
      return;
    }

    if (this.ajax) {
      this.ajax.abort();
    }

    this.ajax = sheetAjax.getFilterRows({
      worksheetId: dataSource,
      viewId,
      kanbanKey: rowId,
      keywords,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      getType: 10,
    });

    this.ajax.then(result => {
      if (result.resultCode === 1) {
        const { template } = result;
        const control = template.controls.find(item => item.attribute === 1);
        const data = result.data.map(item => {
          return {
            value: item.rowid,
            label: control
              ? renderCellText(Object.assign({}, control, { value: item[control.controlId] }))
              : _l('未命名'),
            path: item.childrenids || item.path,
            isLeaf: !item.childrenids,
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
      return path.map((text, i) => {
        const isLast = i === path.length - 1;

        if (text.indexOf(keywords) > -1) {
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

    return control ? renderCellText(Object.assign({}, control, { value: item[control.controlId] })) : _l('未命名');
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
   * 平铺更新
   */
  cascaderChange = (ids, selectedOptions) => {
    const { onChange, advancedSetting } = this.props;
    const { allpath = '0' } = advancedSetting;
    const { keywords } = this.state;

    if (_.isUndefined(ids)) {
      onChange('');
      this.setState({ keywords: '', value: undefined });
      return;
    }

    const lastIndex = ids.length - 1;
    const id = ids[lastIndex];
    let path;
    let value;

    if (keywords) {
      path = JSON.parse(this.cacheData.find(item => item.rowid === id).path);
      value = +allpath ? path.join(' / ') : path[path.length - 1];
    } else {
      value = selectedOptions
        .slice(+allpath ? 0 : lastIndex)
        .map(item => item.label)
        .join(' / ');
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

  /**
   * 渲染h5头部
   */
  renderH5Header() {
    const { advancedSetting, onChange } = this.props;
    const { anylevel = '0' } = advancedSetting;
    const { operatePath, selectItem, layersName } = this.state;

    return (
      <div
        className="flexRow Font17 ThemeColor3 pLeft15 pRight15 relative"
        style={{ height: 46, alignItems: 'center' }}
      >
        {operatePath.length ? (
          <div
            onClick={() => {
              const newPath = [].concat(operatePath);
              newPath.pop();
              this.setState({ operatePath: newPath });
            }}
          >
            <Icon icon="arrow-left-border" />
            {_l('返回')}
          </div>
        ) : (
          <div
            onClick={() => {
              this.setState({ visible: false, operatePath: [], selectItem: {}, value: '', selectedId: '' });
              onChange('');
            }}
          >
            {_l('清除')}
          </div>
        )}
        <div className="flex" />
        <div className="ellipsis Gray" style={{ position: 'absolute', left: '50%', marginLeft: -65, width: 130 }}>
          {(layersName || [])[operatePath.length] || _l('%0级', nzh.cn.encodeS(operatePath.length + 1))}
        </div>
        {!+anylevel && (
          <div
            onClick={() => {
              this.setState({ visible: false, operatePath: [], selectItem: {}, selectedId: selectItem.id });
              this.treeSelectChange(selectItem.id, selectItem.label);
            }}
          >
            {_l('确定')}
          </div>
        )}
      </div>
    );
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
    const { anylevel = '0' } = advancedSetting;
    const { options, operatePath, selectedId, selectItem, isError } = this.state;

    if (isError) return <div className="mTop10">{_l('数据源异常')}</div>;
    if (options === null) return <LoadDiv />;
    if (!options.length) return <div className="mTop10">{_l('无数据')}</div>;

    const h5Options = this.getH5Options();

    if (!h5Options.length) return <LoadDiv />;

    // 必须选择最后一级
    if (+anylevel) {
      return (
        <List>
          {h5Options.map(item => (
            <List.Item
              key={item.value}
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

    // 任意层级
    return (
      <List>
        {h5Options.map(item => (
          <List.Item key={item.value}>
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
    } = this.props;
    const { showtype = '3', anylevel = '0' } = advancedSetting;
    const { visible, options, searchOptions, value, keywords, isError } = this.state;

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
            <Modal
              className="antModalRadius"
              popup
              visible={true}
              onClose={() => this.setState({ visible: false, operatePath: [], selectItem: {} })}
              animationType="slide-up"
            >
              {this.renderH5Header()}
              <div style={{ height: 280, overflowY: 'auto' }}>{this.renderH5Content()}</div>
            </Modal>
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
          placeholder={_l('请选择')}
          showSearch
          allowClear={!!value}
          value={value}
          notFoundContent={
            <div className="Gray_9e pLeft12 pBottom5">
              {keywords
                ? searchOptions === null
                  ? _l('搜索中...')
                  : _l('无搜索结果')
                : isError
                ? _l('数据源异常')
                : options === null
                ? _l('数据加载中...')
                : _l('无数据')}
            </div>
          }
          treeData={keywords ? searchOptions || [] : options || []}
          filterTreeNode={false}
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
          onSearch={e => this.setState({ keywords: e }, this.loadData)}
          onFocus={() => !options && this.loadData()}
          onDropdownVisibleChange={onPopupVisibleChange}
          onTreeExpand={() => (this.cacheScrollTop = this.getTreeSelectEl().scrollTop)}
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
                JSON.parse(option.path || '[]')
                  .join('/')
                  .indexOf(inputValue) > -1,
            );
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
        placeholder={value ? '' : _l('请选择')}
        changeOnSelect={!+anylevel}
        value={value ? [value] : []}
        displayRender={() => <span>{value}</span>}
        options={keywords ? searchOptions || [] : options || []}
        notFoundContent={
          keywords
            ? searchOptions === null
              ? _l('搜索中...')
              : _l('无搜索结果')
            : isError
            ? _l('数据源异常')
            : options === null
            ? _l('数据加载中...')
            : _l('无数据')
        }
        loadData={selectedOptions => this.loadData(selectedOptions[selectedOptions.length - 1].value)}
        onChange={this.cascaderChange}
        onSearch={value => this.setState({ keywords: value }, this.loadData)}
        suffixIcon={<Icon icon="arrow-down-border Font14" />}
        {...(_.isUndefined(this.state.popupVisible) ? {} : { open: this.state.popupVisible })}
        onDropdownVisibleChange={visible => {
          this.setState({ visible, keywords: '' });
          visible && !options && this.loadData();
          onPopupVisibleChange(visible);
        }}
        clearIcon={<Icon icon="closeelement-bg-circle Font14 customCascaderDel"></Icon>}
      ></Cascader>
    );
  }
}
