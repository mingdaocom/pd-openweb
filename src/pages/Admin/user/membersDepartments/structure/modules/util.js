const keyName = 'departmentId';
const childCollectionName = 'subDepartments';
import { htmlEncodeReg } from 'src/util';
import departmentController from 'src/api/department';
import { getCurrentProject } from 'src/util';
import _ from 'lodash';

export const defaultMatcher = (id, node) => {
  return node[keyName] === id;
};

export const findNode = (node, filter, matcher) => {
  return (
    matcher(filter, node) ||
    (node[childCollectionName] &&
      node[childCollectionName].length &&
      !!_.find(node[childCollectionName], child => findNode(child, filter, matcher)))
  );
};

export const filterTree = (node, filter, matcher = defaultMatcher) => {
  if (matcher(filter, node) || !node[childCollectionName]) return node;
  const filtered = node[childCollectionName]
    .filter(child => findNode(child, filter, matcher))
    .map(child => filterTree(child, filter, matcher));
  return Object.assign({}, node, {
    [childCollectionName]: filtered,
  });
};

export const getDepartmentById = (node, filter, matcher = defaultMatcher) => {
  const runner = (result, node) => {
    if (result || !node) return result;
    if (matcher(filter, node)) {
      return (result = node);
    }
    return runner(null, node[childCollectionName]) || _.reduce(node, runner, result);
  };
  return runner(null, node);
};

export const convertDepartmentToDict = tree => {
  let data = {};
  const runner = node => {
    if (!node) return;
    if (_.isArray(node)) {
      _.each(node, runner);
    }
    // node validate
    if (node[keyName] !== undefined) {
      data = {
        ...data,
        [node[keyName]]: node,
      };
      return runner(node[childCollectionName]);
    }
  };
  runner(tree);
  return data;
};

export const getParentDepartments = (node, filter, matcher = defaultMatcher) => {
  const arr = [];
  const tree = filterTree(node, filter, matcher);
  const runner = node => {
    let lastNode = arr[arr.length - 1] || {};
    if (!node || lastNode[keyName] === filter) return;
    if (_.isArray(node)) {
      return _.each(node, runner);
    }
    arr.push(node);
    return runner(node[childCollectionName]);
  };
  runner(tree);
  return arr;
};

export const formatSearchDeptData = (data, keywords) => {
  const departments = [].concat(data);
  const result = [];
  departments.forEach(dept => {
    const children = dept.subs || [];
    const parent = dept.parent || {};
    const parentName = htmlEncodeReg(parent.name);
    const nameArr = [];
    let curName = htmlEncodeReg(dept.name);
    let _curName = curName;
    if (parentName) {
      nameArr.push('<span title="' + parentName + '">' + parentName + '</span>');
    }
    if (keywords) {
      const regExp = new RegExp(htmlEncodeReg(keywords), 'g');
      curName = curName.replace(regExp, '<span class="ThemeColor3">' + keywords + '</span>');
    }
    nameArr.push('<span title="' + _curName + '">' + curName + '</span>');
    result.push(
      Object.assign({}, dept, {
        departmentName: nameArr.join(''),
      }),
    );
    children.forEach(child => {
      const childName = htmlEncodeReg(child.name);
      result.push(
        Object.assign({}, child, {
          departmentName: _.union(nameArr, ['<span title="' + childName + '">' + childName + '</span>']).join(''),
        }),
      );
    });
  });
  return result;
};

// 获取当前departmentId的所有的父节点ID
export const getParentsId = (data, id) => {
  for (var i in data) {
    if (data[i].departmentId == id) {
      return [data[i].departmentId];
    }
    if (data[i].subDepartments) {
      var ro = getParentsId(data[i].subDepartments, id);
      if (ro !== undefined) {
        return ro.concat(data[i].departmentId);
      }
    }
  }
};

// 删除某个节点
export const filterDeleteTreeData = (tree, delId) => {
  var newArr = [];
  for (var i = 0; i < tree.length; i++) {
    var item = tree[i];
    if (item.departmentId === delId) {
      tree.splice(i--, 1);
    } else {
      if (item.subDepartments) {
        item.subDepartments = filterDeleteTreeData(item.subDepartments, delId);
      }
      newArr.push(item);
    }
  }
  return newArr;
};
// 获取当前节点路径
const getCurrentPath = path => {
  return (path || '')
    .split('-')
    .map((item, index) => {
      if (index == 0) {
        return `[${item}]`;
      } else {
        return `.subDepartments[${item}]`;
      }
    })
    .join('');
};
// 更新某个节点
export const updateTreeData = (newDepartments = [], departmentId, departmentName, parentDepartment) => {
  let path = {};
  let arr = [...newDepartments];
  let expandedKeys = [];
  // 获取所有节点id对应路径
  const getpath = (arr, index = '') => {
    (arr || []).forEach((item, i) => {
      const his = index !== '' ? `${index}-${i}` : i.toString();
      path[item.departmentId] = his;
      if (item.subDepartments && item.subDepartments.length) {
        getpath(item.subDepartments, his);
      }
    });
  };
  getpath(arr);
  // 获取当前编辑的节点path
  let currentEditPath = getCurrentPath(path[departmentId]);
  // 获取当前修改节点
  let currentEditNode = { ..._.get(arr, currentEditPath), departmentName };
  // 获取父节点path
  let parentPath = currentEditPath.replace(/.subDepartments\[\d{1,}\]$/g, '');
  // 获取父节点
  let parentNode = _.get(arr, parentPath);

  _.unset(arr, currentEditPath);

  if (currentEditPath.replace(/.subDepartments\[\d{1,}\]$/g, '') === currentEditPath) {
    arr = [..._.filter(arr, item => item)];
  } else if (parentNode.departmentId === parentDepartment) {
    _.update(arr, currentEditPath, data => {
      return { ...data, ...currentEditNode };
    });
    return { newDepartments: arr, expandedKeys: [currentEditNode.departmentId] };
  } else {
    _.update(arr, currentEditPath.replace(/.subDepartments\[\d{1,}\]$/g, ''), data => {
      let temp = _.filter(data.subDepartments, item => item);
      if (temp.length) {
        return { ...data, subDepartments: temp };
      } else {
        delete data.subDepartments;
        data.haveSubDepartment = false;
        return data;
      }
    });
  }

  if (!parentDepartment) {
    arr = arr.concat([currentEditNode]);
    return { newDepartments: arr, expandedKeys: [currentEditNode.departmentId] };
  }

  if (path[parentDepartment]) {
    _.update(arr, getCurrentPath(path[parentDepartment]), data => {
      if (data.subDepartments && data.subDepartments.length) {
        data.subDepartments = data.subDepartments.concat([currentEditNode]);
      } else {
        data.haveSubDepartment = true;
      }
      return data;
    });
  }

  expandedKeys = getParentsId(arr, currentEditNode.departmentId)
    ? getParentsId(arr, parentDepartment)
    : getParentsId(arr, currentEditNode.departmentId);

  return { newDepartments: arr, expandedKeys };
};
