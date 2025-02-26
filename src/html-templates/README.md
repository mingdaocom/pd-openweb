### 添加页面注意

```javascript
<script src="webpack[index]?src/router/"></script>
<script src="webpack[singleExtractModules]?src/pages/Mobile/index.jsx"></script>
```

模块引用按照上述格式，问号后未模块入口相对路径。 []方括号内为页面类型，主站内的都是 index ，需要分发出去的独立入口用 single 例如：`webpack[single]?src/pages/PublicWorksheet/`
用 singleExtractModules 例如：`webpack[singleExtractModules]?src/pages/Mobile/index.jsx`

不要在页面直接引用静态资源 模块内引用的样式在发布编译时自动加到 head 里
