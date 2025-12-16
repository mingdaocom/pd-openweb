import React, { Component, Fragment } from 'react';
import { List, Popup } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import nzh from 'nzh';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, MobileSearch, Radio } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import { sortPathsBySearchKeyword } from 'src/components/Form/MobileForm/tools/utils';
import { renderText as renderCellText } from 'src/utils/control';

const CascaderCon = styled.div`
  position: relative;
  .addBtn {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;
const CascaderItem = styled.span`
  display: inline-block;
  max-width: 100%;
  height: 28px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  line-height: 28px;
  .userAvatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .userName {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 20px 0 8px;
    vertical-align: middle;
  }
`;

export default class Cascader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      value: props.value && props.value !== '[]' ? (safeParse(props.value)[0] || {}).name : undefined,
      operatePath: [],
      selectedId: props.value && props.value !== '[]' ? (safeParse(props.value)[0] || {}).rowid : '',
      selectItem: {},
      layersName: null,
      options: null,
      pathData: [],
      loading: true,
    };
    this.ajax = '';
    this.cacheData = [];
    this.sourcePath = {};
    this.searchRef = React.createRef();
    this.handleSearch = this.onSearch.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.value, nextProps.value)) {
      this.setState({ value: nextProps.value });
    }
  }
  loadData = (rowId = '') => {
    const { control = {} } = this.props;
    const { dataSource, viewId } = control;
    const { options, layersName } = this.state;
    const keywords = this.getKeywords();

    if (this.ajax) {
      return;
    }

    this.setState({
      loading: true,
    });
    this.ajax = sheetAjax.getFilterRows({
      worksheetId: dataSource,
      viewId,
      kanbanKey: rowId,
      pageIndex: 1,
      pageSize: 10000,
      isGetWorksheet: true,
      getType: 10,
      keywords,
      langType: window.shareState.shareId ? getCurrentLangCode() : undefined,
    });

    this.ajax
      .then(result => {
        if (result.resultCode === 1) {
          const { template } = result;
          const control = template.controls.find(item => item.attribute === 1);
          const data = result.data.map(item => {
            return {
              value: item.rowid,
              label: this.renderLabel(item, control),
              searchPath: keywords ? item.path : '[]',
              isLeaf: !!keywords || !item.childrenids,
            };
          });

          if (!rowId && !_.isArray(layersName)) {
            this.setState({
              layersName: (_.find(result.worksheet.views, item => item.viewId === viewId) || {}).layersName || [],
            });
          }

          this.ajax = '';
          this.cacheData = keywords ? result.data : _.uniqBy(this.cacheData.concat(result.data), 'rowid');
          this.deepDataUpdate('options', _.cloneDeep(options), data, rowId);
        } else {
          this.setState({ isError: true });
        }
      })
      .finally(() => this.setState({ loading: false }));
  };
  renderLabel(item, control) {
    return control ? renderCellText(Object.assign({}, control, { value: item[control.controlId] })) : _l('未命名');
  }
  cacheTreePath(data, title = '') {
    data.forEach(item => {
      this.sourcePath[item.value] = title + item.label;
    });
  }
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

  getKeywords() {
    return this.searchRef?.current?.keywords?.trim() || '';
  }

  onSearch() {
    this.setState({ operatePath: [], selectItem: {}, value: '', selectedId: '' });
    this.loadData();
  }

  renderH5Header() {
    const { onChange, control = {} } = this.props;
    const { advancedSetting = {} } = control;
    const { anylevel = '0', minlayer = '0' } = advancedSetting;
    const { operatePath, selectItem, layersName } = this.state;
    const minLayer = Number(minlayer);

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
        <div
          className="ellipsis Gray"
          style={{ position: 'absolute', left: '50%', marginLeft: -65, width: 130, textAlign: 'center' }}
        >
          {(layersName || [])[operatePath.length] || _l('%0级', nzh.cn.encodeS(operatePath.length + 1))}
        </div>
        {(minLayer && !+anylevel ? operatePath.length >= minLayer : !+anylevel) && (
          <div
            onClick={() => {
              this.setState({ visible: false, operatePath: [], selectItem: {}, selectedId: '' });
              this.treeSelectChange(selectItem.id, selectItem.label);
            }}
          >
            {_l('确定')}
          </div>
        )}
      </div>
    );
  }
  treeSelectChange = id => {
    const { onChange, isMultiple, values = [] } = this.props;
    let value = this.sourcePath[id];
    id &&
      onChange({
        values: isMultiple
          ? _.uniqBy(
              [...values, { rowid: id, name: value, sourcevalue: this.cacheData.find(item => item.rowid === id) }],
              'rowid',
            )
          : [{ rowid: id, name: value, sourcevalue: this.cacheData.find(item => item.rowid === id) }],
      });
    this.setState({
      value,
    });
  };
  deleteCurrentSelected = item => {
    const { values, onChange = () => {} } = this.props;
    onChange({ values: values.filter(v => v.rowid !== item.rowid) });
  };
  getH5Options() {
    const { options = [], operatePath = [] } = this.state;
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
  }

  formatSearchData = (item, keywords) => {
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
  renderSimpleContent = (item, keywords) => {
    return (
      <div className="flexRow">
        <div className={cx('flex ellipsis', { canWrap: keywords })}>
          {keywords ? this.formatSearchData(item, keywords) : item.label}
        </div>
        {!item.isLeaf && (
          <div className="pLeft10 Font16 Gray_9e">
            <i className="icon-arrow-right-border" />
          </div>
        )}
      </div>
    );
  };

  renderH5Content() {
    const { control } = this.props;
    const { advancedSetting = {} } = control;
    const { anylevel = '0', minlayer = '0', limitlayer = '0' } = advancedSetting;
    const { options = [], operatePath, selectedId, selectItem, isError } = this.state;
    const minLayer = Number(minlayer);
    const limitLayer = Number(limitlayer);

    if (isError) return <div className="mTop10">{_l('数据源异常')}</div>;
    if (options === null) return <LoadDiv />;
    if (!options.length) return null;

    let h5Options = this.getH5Options().map(item =>
      limitLayer && limitLayer === operatePath.length
        ? { ...item, isLeaf: true, label: item.label || _l('未命名') }
        : { ...item, label: item.label || _l('未命名') },
    );

    if (!h5Options.length) return <LoadDiv />;

    const keywords = this.getKeywords();
    if (keywords) {
      h5Options = sortPathsBySearchKeyword(h5Options, keywords);
    }
    // 必须选择最后一级
    if (keywords || +anylevel) {
      return (
        <List className="leftAlign quickFilterCascaderList">
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
              {this.renderSimpleContent(item, keywords)}
            </List.Item>
          ))}
        </List>
      );
    }

    // 至少向后选择指定级
    if (minLayer) {
      return (
        <List className="leftAlign quickFilterCascaderList">
          {h5Options.map(item => (
            <List.Item
              key={item.value}
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
                    className="flex cascaderRadio flexRow Gray"
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
                <div className="flexRow Gray">
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
      <List className="leftAlign quickFilterCascaderList">
        {h5Options.map(item => (
          <List.Item key={item.value}>
            <div className="flexRow">
              <Radio
                className="flex cascaderRadio flexRow Gray"
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
  render() {
    const { control, values = [], isMultiple } = this.props;
    let { visible, loading } = this.state;
    return (
      <Fragment>
        <div className="controlWrapper">
          <div className="flexRow valignWrapper mBottom15">
            <div className="Font14 bold flex ellipsis controlName">{control.controlName}</div>
            {/* <Icon
              icon="arrow-right-border"
              className="Font16 TxtMiddle"
              onClick={() => {
                this.loadData();
                this.setState({ visible: true });
              }}
            /> */}
          </div>
          <CascaderCon>
            {values.map(item => (
              <CascaderItem>
                <div className="flexRow alignItemsCenter">
                  <span className="userName flex">{item.name || _l('未命名')}</span>
                  <Icon
                    icon="close"
                    onClick={() => {
                      this.deleteCurrentSelected(item);
                    }}
                  />
                </div>
              </CascaderItem>
            ))}
            {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
              <span
                className="addBtn"
                onClick={() => {
                  this.loadData();
                  this.setState({ visible: true });
                }}
              >
                <Icon icon="add" />
              </span>
            )}
          </CascaderCon>
        </div>
        {visible && (
          <Popup
            className="antModalRadius"
            visible={true}
            onClose={() => {
              this.setState({ visible: false, operatePath: [], selectItem: {} });
            }}
          >
            {this.renderH5Header()}
            <MobileSearch ref={this.searchRef} onSearch={this.handleSearch} />
            <div style={{ height: 280, overflowY: 'auto' }}>{loading ? <LoadDiv /> : this.renderH5Content()}</div>
          </Popup>
        )}
      </Fragment>
    );
  }
}

Cascader.propTypes = {
  values: arrayOf(string),
  control: shape({}),
  advancedSetting: shape({}),
  onChange: func,
  isMultiple: bool,
};
