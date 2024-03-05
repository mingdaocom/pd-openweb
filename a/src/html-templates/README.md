### 添加页面注意

```javascript
// 编译时会被替换成真实路径 这块代码加到模块引用前
<script>
    var __api_server__ = <%- apiServer %>; // 定义 后端服务地址
    var __webpack_public_path__ = '<%= publicPath %>'; // 定义异步加载脚本的前缀
</script>
```

```javascript
<script src="webpack[index]?src/router/"></script>
```

模块引用按照上述格式，问号后未模块入口相对路径。 []方括号内为页面类型，主站内的都是 index ，需要分发出去的独立入口用 single 例如：`webpack[single]?src/pages/PublicWorksheet/`

不要在页面直接引用静态资源 模块内引用的样式在发布编译时自动加到 head 里
