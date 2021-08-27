# API 调用

**`src/api` 文件夹下是从后端生成的接口文件，可以直接引用这些文件来实现同后端的数据交互**

下面演示一下请求工作表数据并显示。

回到 [添加的前端页面](./addPage.md) 部分，打开添加的页面组件。  

头部引入工作表对应的 api 文件

```javascript
import { getWorksheetInfo } from 'src/api/worksheet';
```

组件内部添加请求数据和呈现数据代码

```javascript
const Con = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
`;
const Title = styled.div`
  font-size: 30px;
  color: #666;
  margin: 10px;
`;
const ViewTabs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
`;
const ViewTab = styled.div`
  text-align: center;
  background: #fff;
  border-radius: 6px;
  margin: 10px;
  line-height: 100px;
  color: #888;
  box-shadow: 3px 3px 6px rgb(0, 0, 0, 0.1);
`;

export default function Hello(props) {
  const [info, setInfo] = useState({ views: [] });
  useEffect(() => {
    const worksheetId = location.pathname.match(/^\/custom\/hello\/(\w+)/)[1];
    getWorksheetInfo({ worksheetId, getViews: true }).then(setInfo);
  }, []);
  return (
    <Con>
      <Title>{info.name}</Title>
      <ViewTabs>
        {info.views.map(v => (
          <ViewTab>{v.name}</ViewTab>
        ))}
      </ViewTabs>
    </Con>
  );
}
```

访问地址 http://localhost:30001/custom/hello/{工作表id}

![页面](https://pic.mingdao.com/pic/202108/11/pPmBqyNpTpYLyhq_41107650.png)
