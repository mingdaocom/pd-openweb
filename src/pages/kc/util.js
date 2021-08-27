/**
 * @module saveToKnowledge
 * @author peixiaochuang
 * @desc 知识通用方法
 */

/**
 * @module saveToKnowledge
 * @author peixiaochuang
 * @desc 知识通用方法
 */

var EXECUTE_ERROR_MESSAGE = {
  fail: _l('操作失败，请稍后重试'),
  success: _l('操作成功'),
  noRight: _l('操作成功（部分文件您无权操作）'),
  existName: _l('操作失败，目标位置存在同名文件夹'),
  noExistPath: _l('目标位置不存在'),
  noExistNode: _l('操作失败，您选中的文件不存在'),
  error: _l('发生多种错误，如需确认，请逐条操作'),
};

var EXECUTE_RESULT = {
  FAIL: 0, // 失败
  SUCCESS: 1, // 成功
  NO_RIGHT: 2, // 没有权限
  EXIST_NAME: 3, // 节点名称存在
  NO_EXIST_PATH: 4, // 节点路径已不存在, 移到根节点下，属于成功
  NO_EXIST_NODE: 5, // 节点已删除
};

var getKcFolderOperationTips = function (data, message) {
  var result = '';
  var messages = $.extend(EXECUTE_ERROR_MESSAGE, message);
  var failIds = data[EXECUTE_RESULT.FAIL];
  var successIds = data[EXECUTE_RESULT.SUCCESS];
  var noRightIds = data[EXECUTE_RESULT.NO_RIGHT];
  var existNameIds = data[EXECUTE_RESULT.EXIST_NAME];
  var noExistPathIds = data[EXECUTE_RESULT.NO_EXIST_PATH];
  var noExistNodeIds = data[EXECUTE_RESULT.NO_EXIST_NODE];

  var failSize = failIds ? failIds.length : 0;
  var successSize = successIds ? successIds.length : 0;
  var noRightSize = noRightIds ? noRightIds.length : 0;
  var existNameSize = existNameIds ? existNameIds.length : 0;
  var noExistPathSize = noExistPathIds ? noExistPathIds.length : 0;
  var noExistNodeSize = noExistNodeIds ? noExistNodeIds.length : 0;
  if (failSize) {
    result = messages.fail;
  } else if (
    (noRightSize && (existNameSize || noExistPathSize || noExistNodeSize)) ||
    (existNameSize && (noExistPathSize || noExistNodeSize)) ||
    (noExistPathSize && noExistNodeSize)
  ) {
    result = messages.error;
  } else if (noRightSize) {
    result = messages.noRight;
  } else if (existNameSize) {
    result = messages.existName;
  } else if (noExistPathSize) {
    result = messages.noExistPath;
  } else if (noExistNodeSize) {
    result = messages.noExistNode;
  } else if (!successSize) {
    result = messages.fail;
  } else {
    result = messages.success;
  }
  return result;
};

export default {
  getKcFolderOperationTips: getKcFolderOperationTips,
};
