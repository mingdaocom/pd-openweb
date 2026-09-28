export function getSandboxEnableDescription() {
  return _l(
    '开启沙盒后，正式环境中的应用结构将被锁定，所有调整均需通过发布进行更新，您可按需同步部分生产数据用于调试。关联应用也需开启沙盒，否则会导致引用失效。',
  );
}

export function getCloseSandboxAppDescription() {
  return _l('关闭后，将解锁生产应用，历史发布数据不会被删除。');
}
