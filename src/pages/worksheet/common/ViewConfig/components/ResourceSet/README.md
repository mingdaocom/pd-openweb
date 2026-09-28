# 资源视图字段选择回归测试

在仓库根目录执行：

```bash
node --test src/pages/worksheet/common/ViewConfig/components/ResourceSet/BaseInfo.test.js
node src/pages/worksheet/common/ViewConfig/components/ResourceSet/index.test.js
```

测试与实现同目录维护，当前为手工回归入口，未自动接入 CI。
`BaseInfo.test.js` 执行真实组件的初始化、选项生成和封面更新回调，并使用安装版本的 rc-select 解析选项。
覆盖附件携带空/null `options`、旧数据、已有封面、隐藏和非附件字段、已删除字段、空列表及“不显示”。
`index.test.js` 覆盖开始和结束时间的可选字段。UI 与无关依赖在边界替换，不包含浏览器和服务端联调。
