export default {
  /**
  * 删除任务下的标签
  * @param {Object} args 请求参数
  * @param {array} args.sourceIds 实体Id
  * @param {string} args.tagId 标签id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   removeTasksTag: function (args, options = {}) {
     
     return mdyAPI('Tag', 'RemoveTasksTag', args, options);
   },
  /**
  * 添加任务的标签
  * @param {Object} args 请求参数
  * @param {string} args.taskId 任务Id
  * @param {string} args.tagName 标签名
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTaskTag: function (args, options = {}) {
     
     return mdyAPI('Tag', 'AddTaskTag', args, options);
   },
  /**
  * 添加任务的标签（颜色标签逻辑）
  * @param {Object} args 请求参数
  * @param {array} args.taskIds 任务Id
  * @param {string} args.tagName 标签名
  * @param {string} args.tagID 标签ID(Ps:添加系统颜色标签时必须传，否则将成为普通标签)
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addTaskTag2: function (args, options = {}) {
     
     return mdyAPI('Tag', 'AddTaskTag2', args, options);
   },
};
