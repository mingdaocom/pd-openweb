/** 按控件文件名生成字段展示组件映射。 */
export const exportRelevantComponents = context => {
  const componentConfig = {};
  context.keys().forEach(item => {
    const key = item.match(/\/(\w*)\./)[1];
    const upperKey = key.toUpperCase();
    const component = context(item);
    componentConfig[upperKey] = component.default || component[key];
  });
  return componentConfig;
};
