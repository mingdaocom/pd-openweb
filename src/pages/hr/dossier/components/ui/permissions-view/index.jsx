import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import CheckBox from '../../check-box';
import TextInput from '../../text-input';
import SearchInput from '../../../common/SearchInput';
import Icon from 'ming-ui/components/Icon';

class UiPermissionsView extends Component {
  constructor(props) {
    super(props);

    this.state = this.getPermissions(props);
  }

  onChange = (event) => {
    if (this.props.onChange) {
      const list = [];
      for (const key in this.state.view) {
        if (this.state.items[key]) {
          const item = this.state.items[key];
          list.push({
            controlId: item.controlId,
            formId: item.formId,
            viewable: this.state.view[key],
            editable: this.state.edit[key],
          });
        }
      }
      this.props.onChange(event, list);
    }
  };

  getPermissions = (props) => {
    const state = {
      /**
       * 一级分组
       */
      groups: {},
      /**
       * 二级分组
       */
      subGroups: {},
      /**
       * 权限列表
       */
      items: {},
      /**
       * 可查看权限
       */
      view: {},
      /**
       * view 禁用列表
       */
      viewdisabled: {},
      /**
       * 可编辑权限
       */
      edit: {},
      /**
       * edit 禁用列表
       */
      editdisabled: {},
      /**
       * 分组|子分组是否折叠
       */
      fold: {},
      /**
       * 筛选文字
       */
      filter: '',
    };

    this.props.data.map((group, i, groups) => {
      state.fold[group.id] = false;

      const subGroupList = [];
      group.groups.map((subGroup, j, subGroups) => {
        state.fold[subGroup.id] = false;

        subGroupList.push(subGroup.id);

        const itemList = [];
        subGroup.data.map((item, k, items) => {
          itemList.push(item.id);

          state.items[item.id] = item;
          state.edit[item.id] = item.edit;
          state.editdisabled[item.id] = item.editdisabled;
          state.view[item.id] = item.view;
          state.viewdisabled[item.id] = item.viewdisabled;

          return null;
        });

        state.subGroups[subGroup.id] = itemList;

        return null;
      });

      state.groups[group.id] = subGroupList;

      return null;
    });

    return state;
  };

  toggleItemChecked = (event, item, type, checked) => {
    const data = this.state[type];
    data[item.id] = checked;

    this.setState(
      {
        [type]: data,
      },
      () => {
        this.onChange(event);
      }
    );
  };

  toggleSubGroupChecked = (event, item, type, checked) => {
    const data = this.state[type];

    this.state.subGroups[item.id].map((id) => {
      if (!this.state[`${type}disabled`][id]) {
        data[id] = checked;
      }

      return null;
    });

    this.setState(
      {
        [type]: data,
      },
      () => {
        this.onChange(event);
      }
    );
  };

  toggleGroupChecked = (event, item, type, checked) => {
    const data = this.state[type];

    this.state.groups[item.id].map((subGroupId) => {
      this.state.subGroups[subGroupId].map((id) => {
        if (!this.state[`${type}disabled`][id]) {
          data[id] = checked;
        }

        return null;
      });

      return null;
    });

    this.setState(
      {
        [type]: data,
      },
      () => {
        this.onChange(event);
      }
    );
  };

  toggleChecked = (event, type, checked) => {
    const data = this.state[type];

    for (const groupId in this.state.groups) {
      if (this.state.groups[groupId]) {
        this.state.groups[groupId].map((subGroupId) => {
          this.state.subGroups[subGroupId].map((id) => {
            if (!this.state[`${type}disabled`][id]) {
              data[id] = checked;
            }

            return null;
          });

          return null;
        });
      }
    }

    this.setState(
      {
        [type]: data,
      },
      () => {
        this.onChange(event);
      }
    );
  };

  toggleFold = (event, groupId) => {
    const fold = this.state.fold;
    fold[groupId] = !fold[groupId];

    this.setState({
      fold,
    });
  };

  filterOnChange = (event, value, data) => {
    this.setState({
      filter: value,
    });
  };

  renderList = (data) => {
    if (!data || !data.length) {
      return null;
    }

    let viewAllChecked = true;
    let editAllChecked = true;
    let viewAllUnChecked = true;
    let editAllUnChecked = true;

    // 该分组是否需要强制展开
    let shouldExpand = false;

    const list = [];
    data.map((item, i, _list) => {
      const view = this.state.view[item.id];
      const viewdisabled = this.state.viewdisabled[item.id];
      const edit = this.state.edit[item.id];
      const editdisabled = this.state.editdisabled[item.id];

      if (!view) {
        viewAllChecked = false;
      }
      if (!edit) {
        editAllChecked = false;
      }
      if (view) {
        viewAllUnChecked = false;
      }
      if (edit) {
        editAllUnChecked = false;
      }

      let match = false;
      let label = item.label;
      if (!this.state.filter || item.label.indexOf(this.state.filter) >= 0) {
        match = true;
        label = item.label.replace(this.state.filter, (text) => {
          return `<mark>${text}</mark>`;
        });
      }

      if (match) {
        list.push(
          <tr key={item.id}>
            <td>
              <span dangerouslySetInnerHTML={{ __html: label }} />
            </td>
            <td>
              <CheckBox
                checked={view}
                disabled={viewdisabled}
                onChange={(event, checked) => {
                  this.toggleItemChecked(event, item, 'view', checked);
                  if (!checked) {
                    this.toggleItemChecked(event, item, 'edit', checked);
                  }
                }}
              />
            </td>
            <td>
              <CheckBox
                checked={edit}
                disabled={editdisabled}
                onChange={(event, checked) => {
                  this.toggleItemChecked(event, item, 'edit', checked);
                  if (checked) {
                    this.toggleItemChecked(event, item, 'view', checked);
                  }
                }}
              />
            </td>
          </tr>
        );
      }

      // 匹配筛选时，展开该分组
      if (this.state.filter && match) {
        shouldExpand = true;
      }

      return null;
    });

    return {
      viewAllChecked,
      editAllChecked,
      viewAllUnChecked,
      editAllUnChecked,
      shouldExpand,
      list,
    };
  };

  renderSubGroups = (groups) => {
    let viewAllChecked = true;
    let editAllChecked = true;
    let viewAllUnChecked = true;
    let editAllUnChecked = true;
    let shouldExpand = false;
    const subGroups = groups.map((item, i, list) => {
      const listData = this.renderList(item.data);
      const trs = listData.list;

      if (!listData.viewAllChecked) {
        viewAllChecked = false;
      }
      if (!listData.editAllChecked) {
        editAllChecked = false;
      }
      if (listData.viewAllUnChecked) {
        viewAllUnChecked = false;
      }
      if (listData.editAllUnChecked) {
        editAllUnChecked = false;
      }
      if (listData.shouldExpand) {
        this.state.fold[item.id] = false;
        shouldExpand = true;
      }

      let content = null;
      const icon = 'arrow-down';
      let iconClass = 'trasformRight';
      if (!this.state.fold[item.id]) {
        content = (
          <table>
            <tbody>{trs}</tbody>
          </table>
        );
        iconClass = '';
      }

      return (
        <div key={item.id} className="dossier-permissions-subgroup">
          <h4>
            <div
              className="name"
              onClick={(event) => {
                this.toggleFold(event, item.id);
              }}
            >
              <span>{item.name}</span>
              <Icon className={iconClass} icon={icon} />
            </div>
            <CheckBox
              label={_l('可查看')}
              checked={listData.viewAllChecked}
              onChange={(event, checked) => {
                this.toggleSubGroupChecked(event, item, 'view', checked);
                if (!checked) {
                  this.toggleSubGroupChecked(event, item, 'edit', checked);
                }
              }}
            />
            <CheckBox
              label={_l('可编辑')}
              checked={listData.editAllChecked}
              onChange={(event, checked) => {
                this.toggleSubGroupChecked(event, item, 'edit', checked);
                if (checked) {
                  this.toggleSubGroupChecked(event, item, 'view', checked);
                }
              }}
            />
          </h4>
          <div className="dossier-permissions-table">{content}</div>
        </div>
      );
    });

    return {
      viewAllChecked,
      editAllChecked,
      viewAllUnChecked,
      editAllUnChecked,
      shouldExpand,
      subGroups,
    };
  };

  renderContents = () => {
    let viewAllChecked = true;
    let editAllChecked = true;
    let viewAllUnChecked = true;
    let editAllUnChecked = true;

    const groups = this.props.data.map((item, i, list) => {
      const subGroupList = this.renderSubGroups(item.groups);

      if (!subGroupList.viewAllChecked) {
        viewAllChecked = false;
      }
      if (!subGroupList.editAllChecked) {
        editAllChecked = false;
      }
      if (subGroupList.viewAllUnChecked) {
        viewAllUnChecked = false;
      }
      if (subGroupList.editAllUnChecked) {
        editAllUnChecked = false;
      }
      if (subGroupList.shouldExpand) {
        this.state.fold[item.id] = false;
      }

      let content = null;
      const icon = 'arrow-down';
      let iconClass = 'trasformRight';
      if (!this.state.fold[item.id]) {
        content = subGroupList.subGroups;
        iconClass = '';
      }

      return (
        <div key={item.id} className="dossier-permissions-group">
          <h3>
            <div
              className="name"
              onClick={(event) => {
                this.toggleFold(event, item.id);
              }}
            >
              <span>{item.name}</span>
              <Icon className={iconClass} icon={icon} />
            </div>
            <CheckBox
              label={item.name + _l('可查看')}
              checked={subGroupList.viewAllChecked}
              onChange={(event, checked) => {
                this.toggleGroupChecked(event, item, 'view', checked);
                if (!checked) {
                  this.toggleGroupChecked(event, item, 'edit', checked);
                }
              }}
            />
            <CheckBox
              label={item.name + _l('可编辑')}
              checked={subGroupList.editAllChecked}
              onChange={(event, checked) => {
                this.toggleGroupChecked(event, item, 'edit', checked);
                if (checked) {
                  this.toggleGroupChecked(event, item, 'view', checked);
                }
              }}
            />
          </h3>
          {content}
        </div>
      );
    });

    return {
      viewAllChecked,
      editAllChecked,
      viewAllUnChecked,
      editAllUnChecked,
      groups,
    };
  };

  render() {
    const groupList = this.renderContents();
    const contents = groupList.groups;

    return (
      <div className="dossier-permissions-view">
        <div className="dossier-permissions-toolbar">
          <SearchInput
            value={this.state.filter}
            placeholder={_l('搜索字段')}
            label={_l('搜索字段')}
            onClose={(event) => {
              this.filterOnChange(event, '');
            }}
            onChange={(event) => {
              this.filterOnChange(event, event.target.value);
            }}
          />
        </div>
        <div className="dossier-permissions-header">
          <div className="name">
            <span>{_l('全部字段')}</span>
          </div>
          <CheckBox
            label={_l('全部字段可查看')}
            checked={!groupList.viewAllUnChecked}
            intermediate={!groupList.viewAllChecked}
            onChange={(event, checked) => {
              this.toggleChecked(event, 'view', checked);
              if (!checked) {
                this.toggleChecked(event, 'edit', checked);
              }
            }}
          />
          <CheckBox
            label={_l('全部字段可编辑')}
            checked={!groupList.editAllUnChecked}
            intermediate={!groupList.editAllChecked}
            onChange={(event, checked) => {
              this.toggleChecked(event, 'edit', checked);
              if (checked) {
                this.toggleChecked(event, 'view', checked);
              }
            }}
          />
        </div>
        {contents}
      </div>
    );
  }
}

UiPermissionsView.propTypes = {
  /**
   * 分组数据
   */
  data: PropTypes.any,
  /**
   * 数据改变回调
   * @param {event} event - 触发事件
   * @param {object} data - 改变后的数据
   */
  onChange: PropTypes.func,
};

UiPermissionsView.defaultProps = {
  data: [],
  onChange: (event, data) => {
    //
  },
};

export default UiPermissionsView;
