# Ming-UI 组件库使用文档

Ming-UI 是明道云项目的基础 UI 组件库，提供了丰富的 React 组件，用于快速构建一致的用户界面。

## 📦 安装和导入

### 导入方式

Ming-UI 组件通过 `ming-ui` 路径导入：

```javascript
// 导入单个组件
import { Button, Checkbox, Icon } from 'ming-ui';

// 导入多个组件
import { Button, Checkbox, Icon, Input, Dialog } from 'ming-ui';

// 导入 antd-components
import { Tooltip } from 'ming-ui/antd-components';

// 导入 functions
import dialogSelectUser from 'ming-ui/functions/dialogSelectUser';
```

## 🎨 基础组件

### Button 按钮

按钮组件用于触发操作。

#### 基本用法

```jsx
import { Button } from 'ming-ui';

function App() {
  return (
    <div>
      <Button type="primary" onClick={() => alert('点击了按钮')}>
        主要按钮
      </Button>
      <Button type="ghostgray" onClick={() => console.log('取消')}>
        取消
      </Button>
      <Button type="success" icon="share" onClick={handleShare}>
        分享
      </Button>
    </div>
  );
}
```

#### API

| 属性      | 说明         | 类型                                                                                                     | 默认值      |
| --------- | ------------ | -------------------------------------------------------------------------------------------------------- | ----------- |
| type      | 按钮类型     | `'primary' \| 'secondary' \| 'success' \| 'danger' \| 'ghost' \| 'link' \| 'ghostgray' \| 'danger-gray'` | `'primary'` |
| size      | 按钮尺寸     | `'tiny' \| 'small' \| 'medium' \| 'large' \| 'mdnormal' \| 'mdbig'`                                      | `'medium'`  |
| icon      | 图标名称     | `string`                                                                                                 | -           |
| disabled  | 是否禁用     | `boolean`                                                                                                | `false`     |
| loading   | 是否加载中   | `boolean`                                                                                                | `false`     |
| onClick   | 点击回调     | `function`                                                                                               | -           |
| fullWidth | 是否撑满容器 | `boolean`                                                                                                | `false`     |
| radius    | 是否圆角     | `boolean`                                                                                                | `false`     |
| children  | 按钮内容     | `ReactNode`                                                                                              | -           |

#### 按钮类型示例

```jsx
<Button type="primary">主要按钮</Button>
<Button type="secondary">次要按钮</Button>
<Button type="success">成功按钮</Button>
<Button type="danger">危险按钮</Button>
<Button type="ghost">幽灵按钮</Button>
<Button type="ghostgray">灰色幽灵按钮</Button>
<Button type="link">链接按钮</Button>
```

---

### Checkbox 复选框

复选框组件用于多选场景。

#### 基本用法

```jsx
import { useState } from 'react';
import { Checkbox } from 'ming-ui';

function App() {
  const [checked, setChecked] = useState(false);

  return <Checkbox text="全选" checked={checked} onClick={checked => setChecked(checked)} />;
}
```

#### API

| 属性           | 说明                                       | 类型                   | 默认值      |
| -------------- | ------------------------------------------ | ---------------------- | ----------- |
| text           | 显示的文本                                 | `any`                  | -           |
| checked        | 是否选中（受控）                           | `boolean`              | -           |
| defaultChecked | 默认是否选中（非受控）                     | `boolean`              | -           |
| onClick        | 点击回调，参数为 `(checked, value, event)` | `function`             | `() => {}`  |
| value          | 在回调中作为第二个参数返回                 | `any`                  | -           |
| disabled       | 是否禁用                                   | `boolean`              | `false`     |
| size           | 尺寸                                       | `'small' \| 'default'` | `'default'` |
| indeterminate  | 部分选择状态（显示方块）                   | `boolean`              | `false`     |
| clearselected  | 部分选择状态（显示横线）                   | `boolean`              | `false`     |
| styleType      | 样式风格                                   | `'light' \| 'default'` | `'default'` |
| noMargin       | 是否没有 margin                            | `boolean`              | `false`     |
| className      | 自定义类名                                 | `string`               | -           |

#### 使用示例

```jsx
// 受控组件
<Checkbox
  text="选项1"
  checked={checked}
  onClick={(checked) => setChecked(checked)}
/>

// 非受控组件
<Checkbox
  text="选项2"
  defaultChecked={true}
  onClick={(checked) => console.log(checked)}
/>

// 部分选择状态
<Checkbox
  text="部分选择"
  indeterminate={true}
  onClick={handleClick}
/>

// 禁用状态
<Checkbox
  text="禁用选项"
  disabled={true}
  onClick={handleClick}
/>
```

---

### Icon 图标

图标组件用于显示各种图标。

#### 基本用法

```jsx
import { Icon } from 'ming-ui';

function App() {
  return (
    <div>
      <Icon icon="share" />
      <Icon icon="add" className="Font20" />
      <Icon icon="delete" style={{ color: 'red' }} />
    </div>
  );
}
```

#### API

| 属性      | 说明       | 类型     | 默认值      |
| --------- | ---------- | -------- | ----------- |
| icon      | 图标名称   | `string` | -           |
| className | 自定义类名 | `string` | -           |
| style     | 自定义样式 | `object` | -           |
| hint      | 提示文本   | `string` | -           |
| type      | 图标类型   | `string` | `'default'` |

#### 常用图标

- `share` - 分享
- `add` - 添加
- `delete` - 删除
- `edit` - 编辑
- `ok` - 确认
- `close` - 关闭
- `search` - 搜索
- `download` - 下载
- `upload` - 上传

---

### Input 输入框

输入框组件用于文本输入。

#### 基本用法

```jsx
import { useState } from 'react';
import { Input } from 'ming-ui';

function App() {
  const [value, setValue] = useState('');

  return <Input value={value} onChange={val => setValue(val)} placeholder="请输入内容" />;
}
```

#### API

| 属性         | 说明               | 类型                   | 默认值      |
| ------------ | ------------------ | ---------------------- | ----------- |
| value        | 输入值（受控）     | `string`               | -           |
| defaultValue | 默认值（非受控）   | `string`               | -           |
| placeholder  | 占位符             | `string`               | -           |
| onChange     | 值变化回调         | `function(value)`      | -           |
| onChangeText | 值变化回调（别名） | `function(value)`      | -           |
| size         | 尺寸               | `'small' \| 'default'` | `'default'` |
| type         | 输入类型           | `string`               | `'text'`    |
| className    | 自定义类名         | `string`               | -           |

#### 数字输入框

```jsx
<Input.NumberInput value={number} onChange={val => setNumber(val)} placeholder="请输入数字" />
```

---

### Dialog 对话框

对话框组件用于显示模态对话框。

#### 基本用法

```jsx
import { useState } from 'react';
import { Dialog } from 'ming-ui';

function App() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>打开对话框</Button>
      <Dialog
        visible={visible}
        title="提示"
        description="这是一个对话框"
        onOk={() => {
          console.log('确认');
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
      />
    </>
  );
}
```

#### API

| 属性        | 说明             | 类型                              | 默认值   |
| ----------- | ---------------- | --------------------------------- | -------- |
| visible     | 是否显示         | `boolean`                         | `false`  |
| title       | 标题             | `ReactNode`                       | -        |
| description | 描述内容         | `string \| array \| ReactElement` | -        |
| onOk        | 确认回调         | `function`                        | -        |
| onCancel    | 取消回调         | `function`                        | -        |
| okText      | 确认按钮文本     | `string \| ReactElement`          | `'确定'` |
| cancelText  | 取消按钮文本     | `string \| ReactElement`          | `'取消'` |
| okDisabled  | 确认按钮是否禁用 | `boolean`                         | `false`  |
| confirm     | 确认类型         | `'success' \| 'danger'`           | -        |
| footer      | 自定义底部       | `ReactNode`                       | -        |
| className   | 自定义类名       | `string`                          | -        |

#### 确认对话框

```jsx
// 使用静态方法
Dialog.confirm({
  title: '确认删除',
  description: '确定要删除此项吗？',
  onOk: () => {
    console.log('确认删除');
  },
});

// 使用 Promise 方式
Dialog.promise({
  title: '处理中',
  description: '正在处理，请稍候...',
}).then(() => {
  console.log('处理完成');
});
```

---

### ScrollView 滚动视图

滚动视图组件提供可滚动的容器。

#### 基本用法

```jsx
import { ScrollView } from 'ming-ui';

function App() {
  return (
    <ScrollView className="flex flexColumn">
      <div>内容1</div>
      <div>内容2</div>
      <div>内容3</div>
    </ScrollView>
  );
}
```

#### API

| 属性      | 说明       | 类型     | 默认值 |
| --------- | ---------- | -------- | ------ |
| className | 自定义类名 | `string` | -      |
| style     | 自定义样式 | `object` | -      |
| id        | 容器 ID    | `string` | -      |

---

### LoadDiv 加载动画

加载动画组件用于显示加载状态。

#### 基本用法

```jsx
import { LoadDiv } from 'ming-ui';

function App() {
  return <div>{loading ? <LoadDiv size="small" /> : <Content />}</div>;
}
```

#### API

| 属性 | 说明 | 类型                              | 默认值      |
| ---- | ---- | --------------------------------- | ----------- |
| size | 尺寸 | `'small' \| 'default' \| 'large'` | `'default'` |

---

## 🎯 高级组件

### DatePicker 日期选择器

```jsx
import DatePicker from 'ming-ui/components/DatePicker';

function App() {
  const [date, setDate] = useState(null);

  return <DatePicker value={date} onChange={date => setDate(date)} />;
}
```

### Radio 单选框

```jsx
import { Radio, RadioGroup } from 'ming-ui';

function App() {
  const [value, setValue] = useState('option1');

  return (
    <RadioGroup value={value} onChange={setValue}>
      <Radio value="option1">选项1</Radio>
      <Radio value="option2">选项2</Radio>
    </RadioGroup>
  );
}
```

### Switch 开关

```jsx
import { Switch } from 'ming-ui';

function App() {
  const [checked, setChecked] = useState(false);

  return <Switch checked={checked} onChange={checked => setChecked(checked)} />;
}
```

### Dropdown 下拉菜单

```jsx
import { Dropdown } from 'ming-ui';

function App() {
  const menuItems = [
    { text: '选项1', value: '1' },
    { text: '选项2', value: '2' },
  ];

  return (
    <Dropdown data={menuItems} onClick={item => console.log(item)}>
      <Button>打开菜单</Button>
    </Dropdown>
  );
}
```

---

## 🛠️ 工具函数

### dialogSelectUser 选择用户

```jsx
import dialogSelectUser from 'ming-ui/functions/dialogSelectUser';

async function handleSelectUser() {
  const users = await dialogSelectUser({
    unique: false, // 是否单选
    showMore: true, // 显示更多选项
  });
  console.log('选中的用户:', users);
}
```

### alert 提示

```jsx
import alert from 'ming-ui/functions/alert';

alert('这是一条提示信息');
```

---

## 🎨 样式类

项目中使用了一些通用的样式类，可以在组件中直接使用：

### 布局类

- `flexRow` - 横向 flex 布局
- `flexColumn` - 纵向 flex 布局
- `flexCenter` - 居中 flex 布局
- `flex` - flex: 1
- `alignItemsCenter` - 垂直居中
- `justifyContentBetween` - 两端对齐
- `justifyContentCenter` - 水平居中

### 文字类

- `Font12`, `Font13`, `Font14`, `Font15`, `Font16`, `Font17`, `Font18`, `Font20`, `Font24` - 字体大小
- `Bold` - 粗体
- `textPrimary`, `textSecondary`, `textTertiary` - 灰色文字
- `overflow_ellipsis` - 文本溢出省略

### 间距类

- `mTop8`, `mTop12`, `mTop16`, `mTop24` - 上边距
- `mBottom8`, `mBottom12`, `mBottom16`, `mBottom24` - 下边距
- `mLeft8`, `mLeft12`, `mLeft16`, `mLeft20` - 左边距
- `mRight8`, `mRight12`, `mRight16`, `mRight20` - 右边距
- `pTop8`, `pTop12`, `pTop16` - 上内边距
- `pBottom8`, `pBottom12`, `pBottom16` - 下内边距

### 其他类

- `pointer` - 鼠标指针
- `Hand` - 手型指针
- `valignWrapper` - 垂直对齐包装器

---

## 📝 完整示例

### 表单示例

```jsx
import React, { useState } from 'react';
import { Button, Checkbox, Dialog, Input } from 'ming-ui';

function FormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    agree: false,
  });
  const [dialogVisible, setDialogVisible] = useState(false);

  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      Dialog.confirm({
        title: '提示',
        description: '请填写完整信息',
      });
      return;
    }
    console.log('提交数据:', formData);
  };

  return (
    <div className="pTop16">
      <div className="mBottom16">
        <Input
          value={formData.name}
          onChange={val => setFormData({ ...formData, name: val })}
          placeholder="请输入姓名"
        />
      </div>
      <div className="mBottom16">
        <Input
          value={formData.email}
          onChange={val => setFormData({ ...formData, email: val })}
          placeholder="请输入邮箱"
        />
      </div>
      <div className="mBottom16">
        <Checkbox
          text="我同意相关条款"
          checked={formData.agree}
          onClick={checked => setFormData({ ...formData, agree: checked })}
        />
      </div>
      <Button type="primary" onClick={handleSubmit}>
        提交
      </Button>
    </div>
  );
}
```

### 列表操作示例

```jsx
import React, { useState } from 'react';
import { Button, Checkbox, Icon } from 'ming-ui';

function ListExample() {
  const [selectedCount, setSelectedCount] = useState(0);
  const [allChecked, setAllChecked] = useState(false);

  const handleSelectAll = checked => {
    setAllChecked(checked);
    setSelectedCount(checked ? 10 : 0);
  };

  return (
    <div className="flexRow alignItemsCenter justifyContentBetween pTop16 pBottom16">
      <div className="flexRow alignItemsCenter">
        <Checkbox text="全选" checked={allChecked} onClick={handleSelectAll} className="textPrimary" />
        <div style={{ width: 1, height: 16, background: 'var(--color-border-primary)', margin: '0 12px' }} />
        <span className="Font13 textPrimary">已选择 {selectedCount} 项</span>
      </div>
      <div className="flexRow alignItemsCenter">
        <Button type="ghostgray" size="medium" onClick={() => console.log('取消')} className="Font14">
          取消
        </Button>
        <Button
          type="success"
          size="medium"
          icon="share"
          onClick={() => console.log('分享')}
          className="Font14 mLeft12"
        >
          分享
        </Button>
      </div>
    </div>
  );
}
```

---

## 🔗 相关资源

- 项目使用 Babel 插件自动处理 `ming-ui` 的导入
- 组件样式使用 Less 编写
- 支持 TypeScript（通过 PropTypes 定义类型）

---

## 📌 注意事项

1. **导入路径**：所有组件都从 `ming-ui` 导入，不需要指定具体路径
2. **样式类**：可以使用项目中的通用样式类，但建议优先使用组件自带的 props
3. **国际化**：文本内容使用 `_l()` 函数进行国际化处理
4. **受控组件**：Input、Checkbox 等组件支持受控和非受控两种模式
5. **回调函数**：注意不同组件的回调函数参数格式可能不同

---

## 🤝 贡献

如有问题或建议，请联系开发团队。
