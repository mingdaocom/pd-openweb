import React from 'react';
import { connect } from 'react-redux';
import { Icon, LoadDiv, Tooltip } from 'ming-ui';
import { Tree } from 'antd';
import {
  initRoot,
  loadDepartments,
  loadUsers,
  departmentUpdate,
  expandedKeysUpdate,
  updateShowExport,
  updateImportType,
} from '../../actions/entities';
import { updateCursor } from '../../actions/current';
import departmentController from 'src/api/department'; //moveDepartment
import DiaActionTree from './diaActionTree';
import './departmentTree.less';
import { getParentsId } from '../../modules/util';
import _ from 'lodash';

const loop = (data, key, callback) => {
  data.forEach((item, index, arr) => {
    if (item.departmentId === key) {
      return callback(item, index, arr);
    }
    if (item.subDepartments) {
      return loop(item.subDepartments, key, callback);
    }
  });
};

const { TreeNode, DirectoryTree } = Tree;
class DepartmentTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newDepartments: _.cloneDeep(props.newDepartments) || [],
      expandedKeys: props.expandedKeys || [],
      showAction: false,
      selectedKeys: !this.props.departmentId ? [] : [this.props.departmentId],
      autoExpandParent: true,
      dropData: {
        id: '',
        left: 0,
        top: 0,
      },
      moreIds: [],
      pageSize: 100,
      rootIsAll: false,
      moreIdLoading: '',
      height: 600,
    };
  }

  componentDidMount() {
    this.init();
    this.lisentHover();
    window.addEventListener('resize', _.throttle(this.getHeight, 500));
  }

  lisentHover() {
    $(document).on('mouseover', '.ant-tree-switcher', e => {
      $(e.target).closest('.ant-tree-treenode').addClass('hoverParentStyle');
    });
    $(document).on('mouseleave', '.ant-tree-switcher', e => {
      $(e.target).closest('.ant-tree-treenode').removeClass('hoverParentStyle');
    });
  }

  unBindHover() {
    $(document).off('mouseover', '.ant-tree-switcher', e => {
      $(e.target).closest('.ant-tree-treenode').addClass('hoverParentStyle');
    });
    $(document).off('mouseleave', '.ant-tree-switcher', e => {
      $(e.target).closest('.ant-tree-treenode').removeClass('hoverParentStyle');
    });
  }

  componentWillReceiveProps(nexrProps) {
    if (
      !_.isEqual(this.props.newDepartments, nexrProps.newDepartments) ||
      !_.isEqual(this.props.expandedKeys, nexrProps.expandedKeys) ||
      this.props.departmentId !== nexrProps.departmentId ||
      !nexrProps.departmentId
    ) {
      this.setState({
        newDepartments: _.cloneDeep(nexrProps.newDepartments),
        expandedKeys: nexrProps.expandedKeys || [],
        selectedKeys: !nexrProps.departmentId ? [] : [nexrProps.departmentId],
      });
    } else {
      this.setState({ newDepartments: _.cloneDeep(nexrProps.newDepartments) });
    }
  }

  componentWillUnmount() {
    this.unBindHover();
  }

  init = () => {
    const { isRoot, autoLoad, id, initRoot = () => {}, loadDepartments = () => {} } = this.props;
    if (isRoot) {
      initRoot(id);
    }
    if (autoLoad) {
      loadDepartments(id, 1, this.getHeight);
    }
    $('.departmentTreeBox').scroll(() => {
      this.setState({
        showAction: false,
        dropData: {
          id: '',
          left: 0,
          top: 0,
        },
      });
    });
  };

  getHeight = () => {
    const $wrap = document.querySelector('.departmentTreeBox');
    this.setState({
      height: $wrap ? $wrap.offsetHeight - 20 : this.state.height,
    });
  };

  sortDepartmentsFn = (newDepartments, movingDepartmentId, sortedDepartmentIds, moveToParentId, callback) => {
    const { projectId } = this.props;
    departmentController
      .moveDepartment({
        projectId, //网络id
        sortedDepartmentIds: sortedDepartmentIds, // 排好序的 部门Ids
        moveToParentId: moveToParentId, //拖入的 上级部门Id
        movingDepartmentId: movingDepartmentId, //被拖拽的 部门Id
      })
      .then(res => {
        if (res) {
          callback();
          alert(_l('调整成功'), 1);
        } else {
          alert(_l('调整失败'), 2);
        }
      });
  };

  onDragEnter = info => {
    this.props.expandedKeysUpdate(info.expandedKeys);
  };

  onDrop = info => {
    let sortedDepartmentIds = []; //拖拽后排序
    let moveToParentId = '';
    const dropKey = info.node.props.eventKey; //拖dao ID
    const dragKey = info.dragNode.props.eventKey; //拖动的ID
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    let data = [..._.cloneDeep(this.state.newDepartments)];

    // Find dragObject
    let dragObj;
    loop(data, dragKey, (item, index, arr) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      sortedDepartmentIds = [];
      // Drop on the content
      loop(data, dropKey, item => {
        item.subDepartments = item.subDepartments || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.subDepartments.unshift(dragObj);
        sortedDepartmentIds = item.subDepartments.map(it => it.departmentId);
      });
      moveToParentId = dropKey;
    } else if (
      (info.node.props.subDepartments || []).length > 0 && // Has children subDepartments
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      sortedDepartmentIds = [];
      loop(data, dropKey, item => {
        item.subDepartments = item.subDepartments || [];
        // where to insert 示例添加到头部，可以是随意位置
        item.subDepartments.unshift(dragObj);
        sortedDepartmentIds = item.subDepartments.map(it => it.departmentId);
        moveToParentId = item.departmentId;
      });
    } else {
      sortedDepartmentIds = [];
      let ar;
      let i;
      loop(data, dropKey, (item, index, arr) => {
        ar = arr;
        i = index;
      });
      let list = getParentsId(data, dropKey);
      moveToParentId = list[1];
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
      sortedDepartmentIds = ar.map(it => it.departmentId);
    }
    let id = dropKey;
    this.sortDepartmentsFn(data, dragKey, sortedDepartmentIds, moveToParentId, () => {
      this.setState(
        {
          newDepartments: _.cloneDeep(data),
        },
        () => {
          this.props.departmentUpdate(data, dragObj, id);
        },
      );
    });
  };

  loadDataFn = (treeNode = {}, isMore) => {
    const { projectId } = this.props;
    const { props = {} } = treeNode;
    return new Promise(resolve => {
      if (props.subDepartments && !isMore) {
        resolve();
        return;
      }
      let moreIdData = this.state.moreIds.find(o => (o.departmentId || '') === (props.departmentId || ''));
      let pageIndex = !props.departmentId && !moreIdData ? 2 : moreIdData ? moreIdData.pageIndex + 1 : 1;
      this.setState({
        moreIdLoading: props.departmentId,
      });
      departmentController
        .pagedSubDepartments({
          projectId,
          parentId: props.departmentId,
          pageIndex,
          pageSize: this.state.pageSize,
        })
        .then(data => {
          this.setState({
            moreIdLoading: '',
          });
          if (data.length >= this.state.pageSize) {
            this.setState({
              moreIds:
                pageIndex > 1 && moreIdData
                  ? this.state.moreIds.map(o => {
                      if (o.departmentId === props.departmentId) {
                        return {
                          ...o,
                          pageIndex,
                        };
                      } else {
                        return o;
                      }
                    })
                  : this.state.moreIds.concat({
                      departmentId: props.departmentId,
                      pageIndex,
                    }),
            });
          } else {
            this.setState({
              moreIds: this.state.moreIds.filter(o => o.departmentId !== props.departmentId),
              rootIsAll: !props.departmentId ? true : this.state.rootIsAll,
            });
          }
          const { dataRef = {} } = props;
          let { subDepartments = [] } = dataRef;
          subDepartments = isMore ? subDepartments.concat(data) : data;
          let list = [..._.cloneDeep(this.state.newDepartments)];
          if (!props.departmentId) {
            list = list.concat(subDepartments);
          } else {
            loop(list, props.departmentId, (item, index, arr) => {
              arr[index].subDepartments = subDepartments;
            });
          }
          this.props.departmentUpdate(list, subDepartments, props.departmentId);
          resolve();
        });
    });
  };

  onSelect = (selectedKeys = [], info) => {
    let id = selectedKeys[0];
    if (!id || id.indexOf('more_') >= 0) {
      return;
    }
    this.setState({ selectedKeys });
    this.props.updateCursor(id);
    this.props.loadUsers(id);
  };

  renderDropListDia = () => {
    return (
      <DiaActionTree
        showAction={this.state.showAction}
        dropData={this.state.dropData}
        onClickAwayExceptions={[]}
        closeAction={() => this.setState({ showAction: false })}
        onClickAway={() =>
          this.setState({
            showAction: false,
            dropData: {
              id: '',
              left: 0,
              top: 0,
            },
          })
        }
      />
    );
  };

  objxy = n => {
    var o = document.querySelector(n),
      x = 0,
      y = 0,
      w = o.offsetWidth,
      h = o.offsetHeight;
    if (o.getBoundingClientRect) {
      x = o.getBoundingClientRect().left + document.body.scrollLeft;
      y = o.getBoundingClientRect().top + document.body.scrollTop;
    } else {
      while (o != null && o.tagName.toUpperCase() != 'BODY') {
        x += o.offsetLeft;
        y += o.offsetTop;
        o = o.offsetParent;
      }
    }
    return [x, y, w, h];
  };

  renderTreeNodes = (data, hasMore, parentData) => {
    const { expandedKeys } = this.props;
    let htmlDiv = () => {
      return data.map(item => {
        const subDepartments = item.subDepartments || [];
        return (
          <TreeNode
            {...item}
            key={item.departmentId}
            title={
              <React.Fragment>
                <span className="departmentName WordBreak">
                  <Tooltip text={<span>{item.departmentName}</span>}>
                    <span className="InlineBlock wMax100 ellipsis">{item.departmentName}</span>
                  </Tooltip>
                  <span
                    className="departmentAction"
                    onClick={e => {
                      localStorage.removeItem('columnsInfoData');
                      const target = e.target;
                      let top = $(target).offset().top - $('.departmentTreeBox').offset().top;
                      let height = $('.departmentTreeBox').height();
                      this.setState({
                        showAction: true,
                        dropData: {
                          id: item.departmentId,
                          left: $('.departmentTreeBox').width() - 8,
                          top: top + 80 < height ? top : height - 80,
                        },
                      });
                      //当前departmentId===选中departmentId，阻止冒泡
                      if (item.departmentId === this.props.cursor) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <Icon className="Font20 Gray_9e listName" icon="moreop" />
                  </span>
                </span>
              </React.Fragment>
            }
            icon={
              <React.Fragment>
                <Icon icon="folder" className="Font16 Gray_9e listName" />
              </React.Fragment>
            }
            dataRef={item}
            isLeaf={
              _.includes(expandedKeys, item.departmentId)
                ? !subDepartments.length
                : !item.haveSubDepartment && !subDepartments.length
            }
          >
            {item.subDepartments && item.subDepartments.length
              ? this.renderTreeNodes(
                  item.subDepartments,
                  this.state.moreIds.map(o => o.departmentId).includes(item.departmentId),
                  { props: { ...item, dataRef: item } },
                )
              : ''}
          </TreeNode>
        );
      });
    };
    return (
      <React.Fragment>
        {htmlDiv()}
        {((!this.props.searchValue && hasMore) ||
          (!parentData && data.length >= this.state.pageSize && !this.state.rootIsAll)) && (
          <TreeNode
            key={`more_${_.get(parentData, ['props', 'departmentId']) || 'all'}`}
            isLeaf={true}
            icon={
              <div className="mTop5 moreListIcon">
                {this.state.moreIdLoading === _.get(parentData, ['props', 'departmentId']) && <LoadDiv size="small" />}
              </div>
            }
            title={
              <div
                className="moreList Hand mLeft10"
                onClick={e => {
                  e.stopPropagation();
                  this.loadDataFn(parentData, true);
                }}
              >
                {this.state.moreIdLoading === _.get(parentData, ['props', 'departmentId']) ? _l('加载中') : _l('更多')}
              </div>
            }
          ></TreeNode>
        )}
      </React.Fragment>
    );
  };

  onExpand = expandedKeys => {
    this.props.expandedKeysUpdate(expandedKeys);
    this.setState({
      autoExpandParent: false,
    });
  };

  render() {
    const { newDepartments, expandedKeys, selectedKeys, autoExpandParent, height } = this.state;
    if (_.isEmpty(newDepartments)) {
      return (
        <div className="Gray_9e Font13 mLeft24 mTop16">
          {_l('暂无部门，可 ')}
          <span
            className="Hand"
            style={{ color: '#2196F3' }}
            onClick={() => {
              this.props.updateShowExport(true);
              this.props.updateImportType('importDepartment');
            }}
          >
            {_l('批量导入')}
          </span>
        </div>
      );
    }
    return (
      <div className="departmentTreeBox">
        <DirectoryTree
          onExpand={this.onExpand}
          selectedKeys={selectedKeys}
          expandAction={false}
          selectable
          onSelect={this.onSelect}
          showIcon={true}
          className="departmentsTree"
          expandedKeys={expandedKeys} //（受控）展开指定的树节点
          loadedKeys={expandedKeys} //已经加载的节点，需要配合 loadData 使用
          autoExpandParent={autoExpandParent} //是否自动展开父节点
          draggable
          blockNode
          onDragEnter={this.onDragEnter}
          onDrop={this.onDrop}
          loadData={this.loadDataFn}
          height={height}
        >
          {this.renderTreeNodes(newDepartments)}
        </DirectoryTree>
        {this.state.showAction && this.renderDropListDia()}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const {
    current: { departmentId, root, projectId },
    pagination: { userList },
    entities: { departments = [], newDepartments = [], expandedKeys = [] },
    search: { searchValue },
  } = state;
  const department = departments[ownProps.id];
  const subDepartments = _.filter(departments, dept => dept.parentDepartment === ownProps.id);
  return {
    ...department,
    ...ownProps,
    isRoot: root === ownProps.id,
    subDepartments: _.map(subDepartments, dept => dept.departmentId),
    cursor: departmentId,
    departmentId,
    projectId,
    pageIndex: userList && userList.pageIndex,
    newDepartments: newDepartments,
    expandedKeys,
    searchValue,
  };
};
const ConnectedNode = connect(mapStateToProps, {
  initRoot,
  loadDepartments,
  loadUsers,
  departmentUpdate,
  expandedKeysUpdate,
  updateShowExport,
  updateImportType,
  updateCursor,
})(DepartmentTree);

export default ConnectedNode;
