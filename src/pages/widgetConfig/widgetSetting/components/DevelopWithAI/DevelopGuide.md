自定义字段是一个支持使用 React 语法对当前字段进行样式和交互上的自定义的新字段。  
字段分为存储类型和引用类型
存储类型基于现有控件，支持存储值。引用类型只是用于呈现已有的数据，自身无法存储值。

### 快速开始

一个基础的存储类型组件，字段存储类型是文本。

```javascript
function RandomIdGenerator({ value, onChange }) {
  const [id, setId] = useState(value);

  return (
    <div className="flex items-center">
      <span className="flex-1 text-[#151515] text-[20px] font-bold text-center">{id}</span>
      <button
        onClick={() => {
          const newId = Math.random().toString(36).substr(2, 10);
          setId(newId);
          onChange(newId);
        }}
        className="p-2 bg-[#2196f3] text-white rounded-full"
      >
        <LucideIcon name="RefreshCcw" size="16" />
      </button>
    </div>
  );
}
```

存储类型接收 `value` 和 `onChange`，`value`是当前字段的值，处理好值后可以调用`onChange`来更新值。

组件只支持 function 写法，你需要在编辑器里实现这样一个函数。只支持写一个函数，所有逻辑在函数内实现。不可以使用 import，所有逻辑都需要原生实现。React 下的所有属性都已经暴露到组件内，你可以直接使用。

组件支持 Tailwind CSS 你可以直接使用，组件内已经预置了 lucide icons，用法与官方稍微有些不同，需要使用 `LucideIcon` 组件，name 是具体的图标名称。名称是大驼峰写法，你可以在 [这里][1] 找到，其他属性和 `lucide-react` 一致。

引用类型组件没有 `value` 和 `onChange` 属性，它的是从 `formData` 查找字段值来呈现。  
这是一个简单的引用类型示例

```javascript
function NameDisplay({ formData, env }) {
  const targetControlId = env.name; // 获取引用字段的 controlId
  const targetValue = formData[targetControlId]?.value || ''; // 获取名称字段的值

  return <div className="text-2xl text-red-500">{targetValue || '名称未设置'}</div>;
}
```

这个组件功能是去到名称的值，放大以红色显示出来。组件接收 `formData` 属性，formData 是记录的字段数据，你需要先在编辑器右上角把字段添加到引用并设置别名。这时你可以通过 `formData[env.别名]`来获取到对应的字段。

组件 props 属性：
`value` [仅存储类型存在]: 当前字段值
`onChange` [仅存储类型存在]: 更新字段值
`currentControl`: 当前字段
`env`: 环境变量，引用的字段 id 存储在这里，通过 `env.别名` 来获取，此外还包括 isMobile(是否是移动端) 和 isDisabled(是否禁用) 两个属性。
`formData`: 引用的字段数据，{ [controlId]: control } 格式，通过 `formData[env.别名]`来获取。

[1]: https://lucide.dev/guide/packages/lucide-react
