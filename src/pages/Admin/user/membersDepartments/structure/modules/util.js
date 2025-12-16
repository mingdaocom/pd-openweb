import _ from 'lodash';
import { htmlEncodeReg } from 'src/utils/common';

const keyName = 'departmentId';
const childCollectionName = 'subDepartments';

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

/**
 * 获取扁平化部门数据
 * @param {*} departmentArr
 * @returns
 */
export const getFlatDepartments = (departmentArr = []) => {
  let departments = {};
  const func = data => {
    departments = _.merge(departments, _.keyBy(data, 'departmentId'));
    data.forEach(item => {
      if (item.subDepartments && !_.isEmpty(item.subDepartments)) {
        func(item.subDepartments);
      }
    });
  };

  func(departmentArr);

  return departments;
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

/**
 * 删除某个节点
 * @param {Array} treeData 部门树数据
 * @param {string|number} departmentId 要删除的部门ID
 * @returns {Array} 删除后的部门树数据
 */
export const filterDeleteTreeData = (treeData = [], departmentId) => {
  if (_.isEmpty(treeData) || !departmentId) {
    return [];
  }
  const clonedData = _.cloneDeep(treeData);

  // 递归删除函数
  const removeNode = departments => {
    return _.chain(departments)
      .filter(dept => dept && dept.departmentId !== departmentId)
      .map(dept => {
        if (dept.subDepartments && _.isArray(dept.subDepartments)) {
          const filteredSubs = removeNode(dept.subDepartments);
          // 如果子部门为空，则移除该属性
          if (filteredSubs.length === 0) {
            return _.omit(dept, 'subDepartments');
          }
          return { ...dept, subDepartments: filteredSubs };
        }
        return dept;
      })
      .value();
  };

  return removeNode(clonedData);
};
/**
 * 根据 departmentId 和 newDepartments 获取父节点
 * @param {Array} newDepartments - 部门树数据
 * @param {string|number} departmentId - 要查找的部门ID
 * @returns {Object|null} 返回父节点对象，如果没有父节点则返回 null
 */
export const getParentNode = (newDepartments, departmentId) => {
  if (!newDepartments || !_.isArray(newDepartments) || !departmentId) {
    return null;
  }

  const findParent = (departments, targetId) => {
    for (let i = 0; i < departments.length; i++) {
      const dept = departments[i];

      // 判断当前部门是否有子部门
      if (dept.subDepartments && Array.isArray(dept.subDepartments)) {
        // 判断子部门中是否包含目标部门
        const hasTargetInChildren = dept.subDepartments.some(child => child.departmentId === targetId);

        if (hasTargetInChildren) {
          return dept; // 找到父节点
        }

        // 递归查找更深层的子部门
        const result = findParent(dept.subDepartments, targetId);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  return findParent(newDepartments, departmentId);
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

/**
 * 停用/恢复所有的子部门
 * @param {*} departments 当前部门树数据
 * @param {*} disabled 停用状态
 * @returns {Object} 返回更新后的部门树数据
 */

const disabledChildren = (departments, disabled) => {
  if (!departments) return;

  return _.map(departments, dept => {
    if (dept.subDepartments && dept.subDepartments.length) {
      return { ...dept, disabled, subDepartments: disabledChildren(dept.subDepartments, disabled) };
    }
    return { ...dept, disabled };
  });
};

/**
 * 更新部门树数据
 * @param {*} departments 当前部门树数据
 * @param {*} departmentId 新增/修改/删除的部门ID
 * @param {*} parentId 新增/修改/删除的部门父ID
 * @param {*} updateDataInfo 新增/修改/删除的部门数据
 * @param {*} type 新增/修改/删除
 * @param {*} showDisabledDepartment 停用当前部门
 * @returns {Object} 返回更新后的部门树数据和展开的节点
 */
export const updateTreeData = ({ departments, departmentId, parentId, updateDataInfo, type }) => {
  let path = {}; // 所有节点路径
  let arr = _.cloneDeep(departments);

  // 获取所有节点id对应路径
  const getPath = (arr, index = '') => {
    (arr || []).forEach((item, i) => {
      const pathIndex = index !== '' ? `${index}-${i}` : i.toString();
      path[item.departmentId] = pathIndex;
      if (item.subDepartments && item.subDepartments.length) {
        getPath(item.subDepartments, pathIndex);
      }
    });
  };
  getPath(arr);
  // 获取当前编辑的部门path
  let currentEditPath = getCurrentPath(path[departmentId]);
  // 获取当前修改节点
  let currentEditNode = { ..._.get(arr, currentEditPath), ...updateDataInfo };
  // 获取父节点path
  let parentPath = currentEditPath.replace(/.subDepartments\[\d{1,}\]$/g, '');
  // 获取父节点
  let parentNode = currentEditPath === parentPath ? {} : _.get(arr, parentPath);

  // 创建部门
  if (type === 'create' && !parentNode) {
    return arr;
  }

  // 删除部门
  if (type === 'delete') {
    arr = filterDeleteTreeData(arr, departmentId);
    return arr;
  }

  // 编辑 && 不改变父节点
  if (_.includes(['updateDisabled', 'edit'], type) && parentNode.departmentId === parentId) {
    _.update(arr, currentEditPath, data => ({
      ...data,
      ...updateDataInfo,
      subDepartments:
        type === 'updateDisabled'
          ? disabledChildren(data.subDepartments, updateDataInfo.disabled)
          : data.subDepartments,
    }));
  }

  // 编辑 && 改变父节点
  if (type === 'edit' && parentNode.departmentId !== parentId) {
    arr = filterDeleteTreeData(arr, departmentId);
    if (!parentId) {
      arr = arr.concat(currentEditNode);
    } else {
      const newParentPath = getCurrentPath(path[parentId]);
      _.update(arr, newParentPath, data => {
        return {
          ...data,
          subDepartments:
            data.subDepartments && data.subDepartments.length
              ? [...data.subDepartments, { ...currentEditNode, ...updateDataInfo }]
              : data.subDepartments,
        };
      });
    }
  }

  return arr;
};
