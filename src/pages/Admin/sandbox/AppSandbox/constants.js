export const PAGE_SIZE = 20;

export const AVAILABLE_APP_REQUEST_PARAMS = { sandboxStatus: 0 };

export const REVIEW_RULE_LABEL = {
  0: _l('管理员审核'),
  1: _l('免审'),
};

export const SANDBOX_NOTICE_LINES = [
  _l('1、沙盒是完全独立的测试环境，应用结构与数据与生产环境完全隔离。共用生产环境的组织架构、API 集成、插件。'),
  _l(
    '2、应用开启沙盒环境后，正式环境中的结构将被锁定。在沙盒环境测试与开发，不会影响正式环境的运行，验证通过后可以发布至正式环境。',
  ),
  _l('3、不同环境中运行产生的通知、计费、日志数据也完全隔离。'),
];
