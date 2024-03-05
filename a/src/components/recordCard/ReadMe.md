### 记录卡片  
  
  
属性 | 类型 | 说明
--- | --- | ---
from | number | 来源 默认为1 [1：记录详情 2：选择记录弹窗 3：移动]
selected | bool | 选中状态
controls | object[] | 表的字段列表(template 里的 controls)
showControls | string[] | 需要显示在卡片里的字段id数组
coverCid | string | 封面的字段id 字段需为附件类型
data | object | 记录数据 字段id为 key 值为 value 的对象
onDelete | (rowid) => void | 删除回调
onClick | () => void | 点击回调

```
import RecordCard from 'src/components/recordCard';

<RecordCard
    from={1}
    coverCid={coverCid}
    showControls={showControls}
    controls={controls}
    data={record}
    onDelete={() => (this.handleDelete(record.rowid))}
    onClick={() => (this.handleClick(records))}
/>
```
