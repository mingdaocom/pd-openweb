import { assign, map, trim } from 'lodash';
import kc from 'src/api/kc';
import { NODE_TYPE } from '../constant/enum';
import { IdItem } from '../utils';

/** 给有 id 的条目（root, node）添上 hashCode 方法，方便 Immutable.js 操作 */
function assignHashFunc(obj) {
  map(obj, (v, i) => {
    if (v && typeof v === 'object') {
      assignHashFunc(v);
      if (typeof v.id === 'string') {
        obj[i] = new IdItem(v);
      }
    }
  });
  return obj;
}

const rootCache = {};

/**
 * 获取左侧共享根目录列表
 * @return {Root[]}           根目录列表
 */
function getRoots(args) {
  return kc
    .getRoots(args)
    .then(assignHashFunc)
    .then(roots => {
      if (roots && roots.length) {
        roots.forEach(root => {
          if (root) {
            rootCache[root.id] = assignHashFunc(assign({}, rootCache[root.id], root));
          }
        });
      }
      return roots;
    });
}

/** 获取根目录详情 */
function getRootDetail(rootId, options) {
  return kc
    .getRootDetail({ id: rootId }, options || {})
    .then(assignHashFunc)
    .then(root => {
      if (root) {
        rootCache[root.id] = assignHashFunc(assign({}, rootCache[root.id], root));
      }
      return root;
    });
}

/** 根据 id 获取根目录名称 */
function getRootName(rootId, options) {
  if (!rootId || rootId === 'my') {
    return Promise.resolve(_l('我的文件'));
  }
  const root = rootCache[rootId];
  if (root) {
    return Promise.resolve(root.name);
  }
  return getRootDetail(rootId, options || {}).then(r => (r ? r.name : _l('位置不存在')));
}

/**
 *删除根目录
 * id {string}            根目录ID
 * isPermanent {boolean}  是否是彻底删除
 */
function removeRoot(args) {
  return kc.removeRoot(args);
}
/** 还原根目录 */
function restoreRoot(rootId) {
  return kc.restoreRoot({ id: rootId });
}
/**
 * 移除根目录成员
 * @param {string} id 根目录ID
 * @param {string} memberID 被移除成员ID
 **/
function removeRootMember(args) {
  return kc.removeRootMember(args);
}
function getReadablePosition(position) {
  let arr = trim(position, '/').split('/');
  const rootId = arr[0];
  let rootName;
  if (rootId === 'my' || rootId === md.global.Account.accountId) {
    rootName = Promise.resolve(_l('我的文件'));
  } else {
    rootName = getRootName(rootId, { silent: true });
  }
  return rootName.then(name => {
    arr = arr.slice(1, arr.length);
    arr.unshift(name);
    return arr.join('/');
  });
}

/**
 * 获取节点
 * @param {Enum} args.rootType 根目录分类的类型
 * @param {Stirng} args.keywords 搜索时关键字
 * @param {ObjectId} args.parentId 父节点ID
 * @param {String} args.rootId 节点ID
 * @param {Enum} args.sortBy 排序字段
 * @param {Enum} args.sortType 排序类型，正序还是倒序
 * @param {Number} args.limit 每页条数
 * @param {Number} args.skip 页码
 * @param  {Enum} args.status 节点状态
 * @return {Node[]}          子节点列表
 */
function getNodes(args) {
  return kc.getNodes(args).then(assignHashFunc);
}

/**
 * 获取节点总数和其中的
 * @param {Enum} args.rootType 根目录分类的类型
 * @param {Stirng} args.keywords 搜索时关键字
 * @param {ObjectId} args.parentId 父节点ID
 * @param {String} args.rootId 节点ID
 * @param  {Enum} args.status 节点状态
 * @return {Node[]}          子节点列表
 */
function getNodesTotalFolderCountAndFileSize(args) {
  return kc.getNodesTotalFolderCountAndFileSize(args).then(assignHashFunc);
}

/**
 * 删除 和 彻底删除
 * @param {string[]} ids 节点
 * @param {boolean} isPermanent 是否是彻底删除
 * @return {object} Success:{boolean},winIdArr: {array}
 **/
function removeNode(args) {
  return kc.removeNode(args).then(assignHashFunc);
}

/**
 * 全选的删除操作
 * @param {string} parentId 被操作的节点ID
 * @param {boolean} isPermanent 是否是彻底删除
 **/
function removeNodeByParentId(args) {
  return kc.removeNodeByParentId(args).then(assignHashFunc);
}

/**
 * 回收站恢复操作 单选/多选
 * @param {string[]} ids 被操作的节点ID的数组
 * @return {object}
 **/
function restoreNode(args) {
  return kc.restoreNode(args).then(assignHashFunc);
}

/**
 * 回收站的全选恢复
 * @param {string} ids 被操作的节点父节点ID
 * @return {object}
 **/
function restoreNodeByParentId(args) {
  return kc.restoreNodeByParentId(args).then(assignHashFunc);
}

/**
 * 移动操作 单选/多选
 * @param {string[]} ids            [要移动的节点id数组]
 * @param {string} moveToId         [移动到节点的id]
 * @param {enum} toType             [end节点的根目录类型]
 * @param {enum} [handleNameType]   [重名时选择节点操作方式 有默认值]
 * @return {{key,value}}            [0-Fail 1-Success 2-没有权限 3-节点名称存在 4-节点路径已不存在 5- 节点已删除]
 **/
function moveNode(args) {
  return kc.moveNode(args);
}

/**
 * 移动操作 单选/多选
 * @param {string} parentId         [要全选移动的节点的父节点id]
 * @param {string} moveToId         [移动到节点的id]
 * @param {enum} fromType           [start节点的根目录类型]
 * @param {string} moveToId         [移动到节点的ID]
 * @param {enum} toType             [end节点的根目录类型]
 * @param {enum} [handleNameType]   [重名时选择节点操作方式 有默认值(重写)]
 * @return {{key,value}}            [0-Fail 1-Success 2-没有权限 3-节点名称存在 4-节点路径已不存在 5- 节点已删除]
 **/
function moveNodeByParentId(args) {
  return kc.moveNodeByParentId(args);
}

/**
 * 复制操作 单选/多选
 * @param {string[]} ids            [被复制的节点id数组]
 * @param {string} toId         [复制到节点的id]
 * @param {enum} toType             [end节点的根目录类型]
 * @param {enum} [handleNameType]   [重名时选择节点操作方式 有默认值(重写)]
 * @return {{key,value}}            [0-Fail 1-Success 2-没有权限 3-节点名称存在 4-节点路径已不存在 5- 节点已删除]
 **/
function copyNode(args) {
  return kc.copyNode(args).then(assignHashFunc);
}

/**
 * 复制操作 单选/多选
 * @param {string} parentId         [被复制的节点的父节点id]
 * @param {enum} fromType           [start节点的根目录类型]
 * @param {string} copyToId         [复制到节点的id]
 * @param {enum} toType             [end节点的根目录类型]
 * @param {enum} [handleNameType]   [重名时选择节点操作方式 有默认值(重写)]
 * @return {{key,value}}            [0-Fail 1-Success 2-没有权限 3-节点名称存在 4-节点路径已不存在 5- 节点已删除]
 **/
function copyNodeByParentId(args) {
  return kc.copyNodeByParentId(args).then(assignHashFunc);
}

/**
 * 更改共享文件夹的星标状态
 * @param {string}  rootId        根目录ID
 * @param {boolean} isStar        是否标星
 * @return {boolean} Success      执行结果
 **/
function updateRootStar(rootId, isStar) {
  return kc.starRoot({ id: rootId, star: isStar }).then(assignHashFunc);
}
/**
 * 根据路径获取节点
 * @param  {String} path 节点路径
 * @return {Node}      节点信息，如果是文件夹包含子节点
 */
function getNodeByPath(path) {
  return kc.getNodeDetail({ path }).then(assignHashFunc);
}

/**
 * 根据节点 id 获取节点
 * @param  {String} id 节点 id
 * @return {Node}      节点信息，如果是文件夹包含子节点
 */
function getNodeById(id) {
  return kc.getNodeDetail({ id }).then(assignHashFunc);
}

/**
 * 根据节点 id 获取节点
 * @param  {String} id 节点 id
 * @param  {String} versionId 节点 versionId
 */
function getNodeByVersionId(id, versionId, isOldest) {
  return kc.getNodeDetail(id, versionId, isOldest).then(assignHashFunc);
}
/**
 * 添加文件夹
 * @param {Object} args 参数
 * @param {String} args.name 文件夹名称
 * @param {String} args.rootId
 * @param {String} args.parentId
 */
function addFolder(args) {
  return kc.addNode(assign({ type: NODE_TYPE.FOLDER }, args)).then(assignHashFunc);
}

// TODO: 使用七牛回调而非客户端通知
function addFile(args) {
  return kc.addNode(assign({ type: NODE_TYPE.FILE }, args)).then(assignHashFunc);
}

/**
 * 更改节点的星标状态
 * @param {string} args.id 节点id
 * @param {boolean} args.star true - 收藏  false - 不收藏
 **/
function starNode(args) {
  return kc.starNode(args).then(assignHashFunc);
}

/**
 * 更改节点名称
 * @param {string}                  id 节点id
 * @param {string}                  [args.name] 新名称
 * @param {bool}                    [args.isDownloadable] 是否可下载
 * @param {bool}                    [args.isEditable] 是否可编辑
 * @param {Enum<NODE_VISIBLE_TYPE>} [args.visibleType] 可见类型
 **/
function updateNode(args) {
  return kc.updateNode(args).then(assignHashFunc);
}
/**
 *  获取node日志详情
 *  {string} id  节点ID
 **/
function getNodeLogDetail(args) {
  return kc.getNodeLogDetail(args).then(assignHashFunc);
}
/**
 * 获取root日志详情
 * {string} id  共享文件夹ID
 **/
function getRootLogDetail(args) {
  return kc.getRootLogDetail(args).then(assignHashFunc);
}
/**
 * 获取我的文件日志详情
 **/
function getMyLogDetail(args) {
  return kc.getMyLogDetail(args).then(assignHashFunc);
}
/** 添加节点预览次数 */
function addNodeViewCount(id, versionId) {
  return kc.addNodeViewCount({ id, versionId }, undefined, undefined, false);
}
/** Usage(流量使用)
 * @typedef Usage
 * @type Object
 * @property {Number} usage 已用
 * @property {Number} total 总共
 */
function getUsage() {
  return kc.getUsage().then(assignHashFunc);
}

function getTotalUsedSize() {
  return kc.getTotalUsedSize();
}
/**
 * 全局搜索
 * @param {Stirng} args.keywords 搜索时关键字
 * @param {Enum} args.sortBy 排序字段
 * @param {Enum} args.sortType 排序类型，正序还是倒序
 * @param {Number} args.skip 页码
 * @param {Number} args.limit 每页条数
 **/
function globalSearch(args) {
  return kc.globalSearch(args).then(assignHashFunc);
}

export default {
  getRoots,
  getRootDetail,
  getRootName,
  removeRoot,
  removeRootMember,
  restoreRoot,
  getReadablePosition,
  removeNode,
  removeNodeByParentId,
  restoreNode,
  restoreNodeByParentId,
  moveNode,
  moveNodeByParentId,
  copyNode,
  copyNodeByParentId,
  updateRootStar,
  getNodes,
  getNodesTotalFolderCountAndFileSize,
  getTotalUsedSize,
  addFolder,
  addFile,
  starNode,
  updateNode,
  getNodeByPath,
  getNodeById,
  getNodeByVersionId,
  getNodeLogDetail,
  getRootLogDetail,
  getMyLogDetail,
  addNodeViewCount,
  getUsage,
  globalSearch,
};
