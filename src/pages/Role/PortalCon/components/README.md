# 免审字段映射回归测试

在仓库根目录执行：

```bash
node --test src/pages/Role/PortalCon/components/ReviewFreeMap.test.js
```

测试与 `ReviewFreeMap.jsx` 同目录维护，当前为手工回归入口，未自动接入 CI。
测试执行真实组件的初始化、选项生成和映射回调，并使用安装版本的 rc-select 解析选项。
覆盖字段携带空/null/非空 `options`、旧数据、类型匹配、已有映射禁用、Excel 第 0 列和未选择工作表。
UI 与无关依赖在边界替换，不包含浏览器和服务端联调。
