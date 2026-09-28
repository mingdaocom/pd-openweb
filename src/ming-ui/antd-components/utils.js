/** 兼容 Ant Design 语义配置的对象和回调两种传入形式。 */
export function transformSemanticConfig(config, transformer) {
  return typeof config === 'function' ? info => transformer(config(info)) : transformer(config);
}
