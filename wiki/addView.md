# 新增视图

添加新的视图来展示您的记录数据。在 `src/pages/worksheet/constants/enum.js` 文件找到 VIEW_DISPLAY_TYPE、VIEW_TYPE_ICON 两个变量 这两个变量分别表示视图类型枚举值和视图信息。
如图添加枚举值为 10、icon 为 rich_text、icon 颜色为 #334455 的新视图。刷新页面，新视图选项已经出现在新建视图菜单中。

![](https://pic.mingdao.com/pic/202108/06/mShtHNczLtgXTNp_623186273.png)

![](https://pic.mingdao.com/pic/202108/06/WBsfsaDULcaDzgQ_2290168354.png)

点击新视图选项新建视图会出现视图错误状态，因为我们没有添加新视图的渲染组件，下面开始添加新的视图组件。

![](https://pic.mingdao.com/pic/202108/06/evIvihzqJZktiwf_1193215328.png)

在 `src/pages/worksheet/views` 文件夹新增 `NewView.jsx`。

![](https://pic.mingdao.com/pic/202108/06/oYXySeYIbWRsepv_1069263403.png)

在 `src/pages/worksheet/views/index.jsx` 里将新增的视图和枚举值对应起来，保存后刷新页面，刚才添加的视图组件已经正确显示。

![](https://pic.mingdao.com/pic/202108/06/PZgQBwjaUsFrfJY_2584097792.png)
![](https://pic.mingdao.com/pic/202108/06/DOGsMShGuytnPmj_1559311960.png)

父组件会向视图组件传入 appId、worksheetId、viewId 等参数，我们可以使用这些参数去后端请求记录数据。
页面头部引入工作表对应的 api 文件

```javascript
import { getFilterRows } from 'src/api/worksheet';
```

组件内部添加请求数据和呈现数据代码

```javascript
export default function NewView(props) {
  const { worksheetId, viewId } = props;
  const [count, setCount] = useState();
  useEffect(() => {
    getFilterRows({
      worksheetId,
      viewId,
    }).then(res => {
      setCount(res.count);
    });
  }, []);
  return <Con>现有记录 {count || ''} 条</Con>;
}
```

![](https://pic.mingdao.com/pic/202108/06/DoGlnvHwhDtbGVg_2341143389.png)

刷新页面，查看组件

![视图组件](https://pic.mingdao.com/pic/202108/06/DkKBCgEQHaZqhNB_1692036568.png) 