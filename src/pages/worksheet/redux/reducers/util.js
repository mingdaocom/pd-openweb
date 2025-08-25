import _ from 'lodash';

// 获取完整路径
export const dealPath = path => {
  const wholePath = path.reduce((p, c) => p.concat([c, 'children']), []);
  wholePath.pop();
  return wholePath;
};

// 处理children为数组形式
export const dealChildren = children => {
  if (!children) return [];
  if (Array.isArray(children)) return children;
  if (typeof children === 'string') {
    try {
      return JSON.parse(children);
    } catch (error) {
      console.log(error);
    }
  }
  return [];
};

// 初始化状态树
export const initState = ({ data, path = [], pathId = [], baseIndex = 0, visible = false }) => {
  baseIndex = baseIndex < 0 ? 0 : baseIndex;
  if (!data || !_.isArray(data) || _.isEmpty(data)) return [];
  return data.map((item, index) => ({
    rowId: item.rowid,
    visible,
    display: true,
    path: path.concat([baseIndex + index]),
    pathId: pathId.concat([item.rowid]),
    children: dealChildren(item.childrenids),
  }));
};
