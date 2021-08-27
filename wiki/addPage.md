# 新增页面

页面分为 **内部页面** 和 **外部页面**

内部页面主要用于站点内，并且需要登录状态，切换页面走的是前端路由规则，所有页面都指向 index.html。

外部页面为独立的 html 入口文件，常用于公开表单、记录分享等需要分发出去的外部页面，这些页面一般不需要登录状态。

## 新增内部页面

在 `src/pages` 下添加新增页面的组件。（这里只需要把组件暴露出去，将组件渲染到 dom 上是外部统一进行处理的）

![新页面](https://pic.mingdao.com/pic/202108/06/gRzJDJpXJXrWKdT_506745186.png)

在路由配置文件 `src/router/config.js` 添加新页面 `custom/hello`。 新增的路径请以 `custom/` 开头，如果需要添加其它开头请在 `docker/rewrite.setting` 配置文件添加对应的 rewrite 规则。

![添加前端路由](https://pic.mingdao.com/pic/202108/06/XoqJBoFmPEhPhGZ_1020993726.png)

打开 [http://localhost:30001/custom/hello](http://localhost:30001/custom/hello) 新的页面已成功添加。

![](https://pic.mingdao.com/pic/202108/06/RtyXekCZtKHneqb_1510662721.png)

内部页面默认右侧有消息列表，不需要的话请可以在 `src/router/config.js` 文件里 withoutChatPathList 变量添加对应规则来禁止显示消息列表。

![添加黑名单](https://pic.mingdao.com/pic/202108/06/tIYZqSboTUXoUWG_2861328389.png)

刷新页面，右侧已经不显示消息列表。

![](https://pic.mingdao.com/pic/202108/06/TESsLsunMAENMsH_1349457891.png)

## 新增独立页面

在 `src/html-templates` 路径下添加 html 文件 welcome.html。 html 构建时会调用 ejs 编译，所以您可以在 html 中使用 ejs 语法。ejs 编译会传入 apiServer 和 publicPath 两个变量，apiServer 用于指定后端服务地址，当您需要访问后端接口时需要使用此变量。publicPath 用来指定静态文件托管地址，当引用的模块内存在异步加载的脚本时此变量是必须的。所以大部分情况下 html 文件中您需要保留这两行代码，并且保证在所有脚本加载前声明好 `__api_server__，` `__webpack_public_path__` 这两个变量。

```javascript
<script>
    var __api_server__ = '<%= apiServer %>';
    var __webpack_public_path__ = '<%= publicPath %>';
</script>
```

![添加html文件](https://pic.mingdao.com/pic/202108/06/QoYSLUmSWLWWIGn_1022957920.png)

项目内的资源映射依赖于代理规则，所以您还需要在 `docker/rewrite.setting` 文件中配置对应的 rewrite 规则。

![](https://pic.mingdao.com/pic/202108/06/zImsCopCnDElJpz_647694016.png)

重启构建工具或在控制台执行 `gulp generate-mainweb`，然后访问 [http://localhost:30001/custom/hello](http://localhost:30001/custom/hello)

![添加好的页面](https://pic.mingdao.com/pic/202108/06/hneyFocCJurAPJy_1051679210.png)

此时的页面还只是纯静态页面，下面来将 React 组件渲染进页面中。

添加对应的 React 组件，不同于内部页面，这里的组件需要自己渲染到对应的 dom 里。

![组件](https://pic.mingdao.com/pic/202108/06/grmEUJSWIbhLosz_156742727.png)

回到 welcome.html 在 body 尾部添加 `<script src="webpack[single]?src/pages/welcome.jsx"></script>`，构建工具会自动提取 entry 并在发布时将 src 替换为发布后的资源地址，
重启构建工具后访问 [http://localhost:30001/custom/hello](http://localhost:30001/custom/hello)， React 组件已经成功渲染至页面内。

![页面](https://pic.mingdao.com/pic/202108/06/PVTzrxCwFaynMId_543272100.png)
