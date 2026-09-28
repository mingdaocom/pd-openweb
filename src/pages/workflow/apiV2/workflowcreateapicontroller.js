import base, { controllerName } from './base';
/**
 * workflowcreateapicontroller
*/
const workflowcreateapicontroller = {
  /**
   * null
   * @param {Object} options 配置参数
   */
  createWorkflow: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  validateWorkflow: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/validate';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}validate', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  publishWorkflow: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/publish';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}publish', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  batchCreateWorkflowNodes: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/nodes/batch';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}nodesbatch', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  discardWorkflowDraft: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/discard-draft';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}discard-draft', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  closeWorkflow: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}/close';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}close', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  validateProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/validateProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowvalidateProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  publishProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/publishProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowpublishProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  deleteProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/deleteProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowdeleteProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  deleteProcessNode: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/deleteProcessNode';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowdeleteProcessNode', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  createProcess: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/createProcess';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowcreateProcess', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {Object} options 配置参数
   */
  batchCreateProcessNodes: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/batchCreateProcessNodes';
    base.ajaxOptions.type = 'POST';
    return mdyAPI(controllerName, 'v3appworkflowbatchCreateProcessNodes', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {string} [args.version] null
   * @param {Object} options 配置参数
   */
  getWorkflowStructureByPath: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  deleteWorkflow: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}';
    base.ajaxOptions.type = 'DELETE';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.workflow_id] *null
   * @param {Object} options 配置参数
   */
  updateWorkflowInfo: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/{workflow_id}';
    base.ajaxOptions.type = 'PATCH';
    return mdyAPI(controllerName, 'v3appworkflows{workflow_id}', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.triggerType] null
   * @param {boolean} [args.published] null
   * @param {Object} options 配置参数
   */
  listWorkflows: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflows/list';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowslist', args, $.extend({}, base, options));
  },
  /**
   * null
   * @param {string} [args.processId] null
   * @param {string} [args.version] null
   * @param {Object} options 配置参数
   */
  getWorkflowStructure: function(args, options) {
    base.ajaxOptions.url = base.server(options) + '/v3/app/workflow/getWorkflowStructure';
    base.ajaxOptions.type = 'GET';
    return mdyAPI(controllerName, 'v3appworkflowgetWorkflowStructure', args, $.extend({}, base, options));
  },
};
export default workflowcreateapicontroller;