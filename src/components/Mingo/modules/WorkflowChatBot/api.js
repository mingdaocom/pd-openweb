export function sse(args, options = {}) {
  const baseUrl = (__api_server__.workflow || md.global.Config.WorkFlowUrl) + '/api/sse/chat';
  return window.mdyAPI('api/sse', 'chat', args, {
    ...options,
    ajaxOptions: {
      url: baseUrl,
      noAccountIdHeader: true,
    },
  });
}
