export const controllerName = 'KnowledgeBase';

export default {
  server: () => __api_server__.knowledge || md.global.Config.KnowledgeApiUrl,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
  },
};
