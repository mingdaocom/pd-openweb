define(function (require, exports, module) {
  module.exports = {
    /**
    * 删除某账户的实体的标签
    * @param {Object} args 请求参数
    * @param {string} args.sourceId 实体Id
    * @param {string} args.tagId 标签id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeSourceTag: function (args, options) {
      return $.api('Tag', 'RemoveSourceTag', args, options);
    },

    /**
    * 删除任务下的标签
    * @param {Object} args 请求参数
    * @param {array} args.sourceIds 实体Id
    * @param {string} args.tagId 标签id
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    removeTasksTag: function (args, options) {
      return $.api('Tag', 'RemoveTasksTag', args, options);
    },

    /**
    * 添加动态的标签
    * @param {Object} args 请求参数
    * @param {string} args.postId 动态id
    * @param {string} args.tagName 标签名
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    addPostTag: function (args, options) {
      return $.api('Tag', 'AddPostTag', args, options);
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
    addTaskTag: function (args, options) {
      return $.api('Tag', 'AddTaskTag', args, options);
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
    addTaskTag2: function (args, options) {
      return $.api('Tag', 'AddTaskTag2', args, options);
    },

    /**
    * 获取当前用户常用标签 &#34;#&#34;联想搜索
    * @param {Object} args 请求参数
    * @param {string} args.keyWords 关键词
    * @param {Object} options 配置参数
    * @param {Boolean} options.silent 是否禁止错误弹层
    * @returns {Promise<Boolean, ErrorModel>}
    **/
    getUserCommonTag: function (args, options) {
      return $.api('Tag', 'GetUserCommonTag', args, options);
    },

  };
});
