import PropTypes from 'prop-types';
import React, { Component } from 'react';
import departmentAjax from 'src/api/department';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { TreeSelect } from 'antd';
import _ from 'lodash';

export default class DepDropDown extends Component {
  static propTypes = {
    popupClassName: PropTypes.string,
    treePopupAlign: PropTypes.shape({}),
    onChange: PropTypes.func,
    onPopupVisibleChange: PropTypes.func,
  };

  static defaultProps = {
    onPopupVisibleChange: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      options: null,
      searchOptions: null,
      keywords: '',
      operatePath: [],
      isError: false,
      value: undefined,
    };
  }

  ajax = '';
  sourcePath = {};
  cachePath = {};
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
  loadData = (departmentId = '') => {
    const { registerData = {} } = this.props;
    const { tokenProjectCode, regcode, projectId } = registerData;
    const { options } = this.state;
    const keywords = this.state.keywords.trim();

    if (!keywords && options !== null && !departmentId) {
      return;
    }

    if (this.ajax) {
      this.ajax.abort();
    }

    this.ajax = departmentAjax.getDepartmentByJoinProject({
      token: tokenProjectCode,
      projectCode: regcode,
      projectId,
      departmentId: keywords ? '' : departmentId,
      keywords,
      pageIndex: 1,
      pageSize: 1000,
    });

    this.ajax.then(result => {
      if (!!result) {
        this.cachePath = {};
        if (!!keywords) {
          // let list = [];
          // const getItem = (item, path) => {
          //   item.map(o => {
          //     this.cachePath[o.departmentId] = path ? `${path}/${o.departmentName}` : o.departmentName;
          //     list.push({
          //       value: o.departmentId,
          //       label: this.cachePath[o.departmentId],
          //       isLeaf: !o.haveSubDepartment,
          //     });
          //     if (!!o.subDepartments) {
          //       getItem(o.subDepartments, this.cachePath[o.departmentId]);
          //     }
          //   });
          // };
          // getItem(list);
          const getItem = (item = [], path) => {
            return item.map(o => {
              this.cachePath[o.departmentId] = path ? `${path} / ${o.departmentName}` : o.departmentName;
              let name = o.departmentName;
              let nameArr = [name];
              if (keywords) {
                let mt = name.match(keywords);
                let len = keywords.length;
                if (mt) {
                  nameArr = [];
                  while (mt) {
                    nameArr.push(name.slice(0, mt.index));
                    nameArr.push(name.slice(mt.index, mt.index + len));
                    name = name.slice(mt.index + len);
                    mt = name.match(keywords);
                  }
                  if (name) {
                    nameArr.push(name);
                  }
                }
              }
              let text = nameArr.map((item, index) => {
                if (item === keywords) {
                  return (
                    <span key={item + index} style={{ color: '#2196f3' }}>
                      {item}
                    </span>
                  );
                }
                return <span key={item + index}>{item}</span>;
              });
              return {
                value: o.departmentId,
                label: <span>{text}</span>,
                isLeaf: !o.subDepartments,
                children: o.subDepartments ? getItem(o.subDepartments, this.cachePath[o.departmentId]) : null,
              };
            });
          };
          this.ajax = '';
          this.setState({ searchOptions: getItem(result), options: null });
        } else {
          const data = result.map(item => {
            return {
              value: item.departmentId,
              label: item.departmentName,
              isLeaf: !item.haveSubDepartment,
            };
          });
          this.ajax = '';
          this.deepDataUpdate(_.cloneDeep(options), data, departmentId);
        }
      } else {
        this.setState({ isError: true });
      }
    });
  };

  /**
   * 更新数据
   */
  deepDataUpdate(options, data, departmentId) {
    if (departmentId) {
      options.forEach(item => {
        if (item.value === departmentId) {
          item.children = data;
          this.cacheTreePath(data, this.sourcePath[departmentId] + ' / ');
        } else if (_.isArray(item.children)) {
          this.deepDataUpdate(item.children, data, departmentId);
        }
      });
    } else {
      options = data;
      this.cacheTreePath(data);
    }

    this.setState({ options: options, searchOptions: null, keywords: '' });
  }

  /**
   * 树形更新
   */
  treeSelectChange = id => {
    const { onChange } = this.props;
    const { keywords } = this.state;
    let value;

    if (keywords) {
      value = this.cachePath[id];
    } else {
      value = this.sourcePath[id];
    }

    onChange(id);

    this.setState({
      keywords: '',
      value,
    });
  };

  render() {
    const { popupClassName, treePopupAlign, onPopupVisibleChange } = this.props;
    const { options, searchOptions, keywords, isError, value } = this.state;
    return (
      <TreeSelect
        className="w100 customAntSelect customTreeSelect"
        dropdownClassName={cx(popupClassName)}
        dropdownPopupAlign={treePopupAlign}
        ref={this.treeSelectComp}
        virtual={false}
        placeholder={_l('请选择')}
        // showSearch
        allowClear={!!value}
        value={value}
        notFoundContent={
          <div className="Gray_9e pLeft12 pBottom5">
            {keywords
              ? searchOptions === null
                ? _l('搜索中...')
                : _l('无搜索结果')
              : isError
              ? _l('数据异常')
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
        onChange={id => {
          this.treeSelectChange(id);
        }}
        // onSearch={e => this.setState({ keywords: e }, this.loadData)}
        onFocus={() => !options && this.loadData()}
        onDropdownVisibleChange={data => {
          if (data && !keywords && !options) {
            this.loadData();
          }
        }}
      />
    );
  }
}
