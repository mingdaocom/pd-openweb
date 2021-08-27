const keyName = 'departmentId';
const childCollectionName = 'subDepartments';
import { htmlEncodeReg } from 'src/util';
const departmentController = require('src/api/department');

export const defaultMatcher = (id, node) => {
  return node[keyName] === id;
};

export const findNode = (node, filter, matcher) => {
  return matcher(filter, node) ||
    (node[childCollectionName] && node[childCollectionName].length && !!_.find(node[childCollectionName], child => findNode(child, filter, matcher)));
};

export const filterTree = (node, filter, matcher = defaultMatcher) => {
  if (matcher(filter, node) || !node[childCollectionName]) return node;
  const filtered = node[childCollectionName]
    .filter(child => findNode(child, filter, matcher))
    .map(child => filterTree(child, filter, matcher));
  return Object.assign({}, node, {
    [childCollectionName]: filtered
  });
};

export const getDepartmentById = (node, filter, matcher = defaultMatcher) => {
  const runner = (result, node) => {
    if (result || !node) return result;
    if (matcher(filter, node)) {
      return result = node;
    }
    return runner(null, node[childCollectionName]) ||
      _.reduce(node, runner, result);
  };
  return runner(null, node);
};

export const getProjectInfo = (projectId) => {
  var result;
  _.each(md.global.Account.projects, (project) => {
    if (project.projectId === projectId) {
      result = project;
      return false;
    }
  });
  return result;
};

export const getRenderInfo = (projectId, departmentId) => {
  var project = getProjectInfo(projectId);
  var dfd = $.Deferred();
  if (departmentId) {
    //获取部门详细信息
    departmentController.getDepartmentInfo({
      projectId: projectId,
      departmentId: departmentId,
    }).then(function (data) {
      dfd.resolve(_.merge({}, {
        parentDepartment: {
          departmentId: '',
          departmentName: project.companyName,
        },
      }, data));
    });
  } else {
    dfd.resolve({
      departmentId: '',
      departmentName: project.companyName,
    });
  }

  return dfd.promise();
};

export const convertDepartmentToDict = (tree) => {
  let data = {};
  const runner = (node) => {
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
  const runner = (node) => {
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
  departments.forEach((dept) => {
    const children = dept.subDepartments || [];
    const parent = dept.parentDepartment || {};
    const parentName = htmlEncodeReg(parent.departmentName);
    const nameArr = [];
    let curName = htmlEncodeReg(dept.departmentName);
    let _curName = curName;
    if (parentName) {
      nameArr.push('<span title="' + parentName + '">' + parentName + '</span>');
    }
    if (keywords) {
      const regExp = new RegExp(htmlEncodeReg(keywords), 'g');
      curName = curName.replace(regExp, '<span class="ThemeColor3">' + keywords + '</span>');
    }
    nameArr.push('<span title="' + _curName + '">' + curName + '</span>');
    result.push(Object.assign({}, dept, {
      departmentName: nameArr.join(''),
    }));
    children.forEach((child) => {
      const childName = htmlEncodeReg(child.departmentName);
      result.push(Object.assign({}, child, {
        departmentName: _.union(nameArr, ['<span title="' + childName + '">' + childName + '</span>']).join(''),
      }));
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
}
