import React from 'react';
import { connect } from 'react-redux';
import { Icon } from 'ming-ui';
import { Tree } from 'antd';
import { initRoot, loadDepartments, loadUsers, departmentUpdate, expandedKeysUpdate } from '../../actions/entities';
import { updateCursor } from '../../actions/current';
import departmentController from 'src/api/department'; //moveDepartment
import DiaActionTree from './diaActionTree';
import './departmentTree.less';
import { getParentsId } from '../../modules/util';

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
    };
  }

  componentDidMount() {
    this.init();
    this.lisentHover()
  }

  lisentHover() {
    $(document).on('mouseover', '.ant-tree-switcher', (e) => {
      $(e.target).closest('.ant-tree-treenode').addClass('hoverParentStyle')
    });
    $(document).on('mouseleave', '.ant-tree-switcher', (e) => {
      $(e.target).closest('.ant-tree-treenode').removeClass('hoverParentStyle')
    });
  }

  unBindHover() {
    $(document).off('mouseover', '.ant-tree-switcher', (e) => {
      $(e.target).closest('.ant-tree-treenode').addClass('hoverParentStyle')
    });
    $(document).off('mouseleave', '.ant-tree-switcher', (e) => {
      $(e.target).closest('.ant-tree-treenode').removeClass('hoverParentStyle')
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
    }
  }

  componentWillUnmount() {
    this.unBindHover()
  }

  init = () => {
    const { isRoot, autoLoad, id, dispatch } = this.props;
    if (isRoot) {
      dispatch(initRoot(id));
    }
    if (autoLoad) {
      dispatch(loadDepartments(id));
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
    this.props.dispatch(expandedKeysUpdate(info.expandedKeys));
  };

  onDrop = info => {
    const { dispatch } = this.props;
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
        item.subDepartments.push(dragObj);
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
          dispatch(departmentUpdate(data, dragObj, id));
        },
      );
    });
  };

  loadDataFn = treeNode => {
    const { projectId, dispatch } = this.props;
    return new Promise(resolve => {
      if (treeNode.props.subDepartments) {
        resolve();
        return;
      }

      departmentController
        .getProjectSubDepartment({
          projectId: projectId,
          departmentId: treeNode.props.departmentId,
        })
        .then(data => {
          treeNode.props.dataRef.subDepartments = data;
          let list = [..._.cloneDeep(this.state.newDepartments)];
          loop(list, treeNode.props.departmentId, (item, index, arr) => {
            arr[index].subDepartments = data;
          });
          dispatch(departmentUpdate(list, data, treeNode.props.departmentId));
          resolve();
        });
    });
  };

  onSelect = (selectedKeys = [], info) => {
    let id = selectedKeys[0];

    this.setState({ selectedKeys });
    if (!id) {
      return;
    }
    const { dispatch } = this.props;
    dispatch(updateCursor(id));
    dispatch(loadUsers(id));
  };

  renderDropListDia = () => {
    return (
      <DiaActionTree
        showAction={this.state.showAction}
        dropData={this.state.dropData}
        onClickAwayExceptions={[]}
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

  renderTreeNodes = data =>
    data.map(item => {
      return (
        <TreeNode
          {...item}
          key={item.departmentId}
          title={
            <React.Fragment>
              <span className="departmentName overflow_ellipsis WordBreak">
                {item.departmentName}
                <span
                  className="departmentAction"
                  onClick={e => {
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
                  }}>
                  <Icon className="Font16 Gray_9e listName" icon="moreop" />
                </span>
              </span>
            </React.Fragment>
          }
          icon={
            <React.Fragment>
              <Icon icon="custom_folder_2" className="Font16 Gray_9e listName" />
            </React.Fragment>
          }
          dataRef={item}
          isLeaf={!item.haveSubDepartment && !(item.subDepartments && item.subDepartments.length > 0)}>
          {item.subDepartments && item.subDepartments.length ? this.renderTreeNodes(item.subDepartments) : ''}
        </TreeNode>
      );
    });

  onExpand = expandedKeys => {
    this.props.dispatch(expandedKeysUpdate(expandedKeys));
    this.setState({
      autoExpandParent: false,
    });
  };

  render() {
    const { newDepartments, expandedKeys, selectedKeys, autoExpandParent } = this.state;
    return (
      <div className="departmentTreeBox box-sizing pBottom20">
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
          loadData={this.loadDataFn}>
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
  };
};
const ConnectedNode = connect(mapStateToProps)(DepartmentTree);

export default ConnectedNode;
