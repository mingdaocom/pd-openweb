# Tab 键控件切换交互文档

## 概述

DesktopForm 支持通过 Tab 键在表单控件之间进行快速切换，提升用户的键盘操作体验。该功能通过**发布-订阅模式的事件管理系统**实现，核心代码位于 `src/components/Form/core/useFormEventManager.js`。

## 核心架构

### 1. 事件管理器 (WidgetEventManager)

```javascript
class WidgetEventManager {
  constructor() {
    this.subscribers = new Map(); // controlId -> callback
  }

  subscribe(controlId, callback) { ... }  // 订阅事件
  publish(controlId, data) { ... }        // 发布事件
  clear(instanceId) { ... }               // 清理订阅
}
```

### 2. 核心 Hook

| Hook                  | 用途                                                |
| --------------------- | --------------------------------------------------- |
| `useFormEventManager` | 表单级别的事件管理，处理全局键盘监听和 Tab 切换逻辑 |
| `useWidgetEvent`      | 控件级别的事件订阅，响应 Tab 进入/离开事件          |

## 事件类型

| 事件类型                   | 触发时机             | 用途                       |
| -------------------------- | -------------------- | -------------------------- |
| `trigger_tab_enter`        | Tab 键切换到该控件时 | 控件获得焦点，进入编辑状态 |
| `trigger_tab_leave`        | Tab 键离开该控件时   | 控件失去焦点，退出编辑状态 |
| `Enter`                    | 按下回车键           | 传递给当前激活控件处理     |
| `ArrowRight` / `ArrowLeft` | 按下方向键           | 传递给当前激活控件处理     |

## 工作流程

```
用户按下 Tab 键
      ↓
handleTabChange 捕获键盘事件
      ↓
阻止浏览器默认行为 (event.preventDefault())
      ↓
查询所有 .customFormItem 元素获取控件列表
      ↓
通过 supportTabKeyDown() 计算下一个支持 Tab 的控件
      ↓
发布 'trigger_tab_leave' 事件给当前控件
      ↓
发布 'trigger_tab_enter' 事件给目标控件
      ↓
更新 tabFocusArr 状态 ([当前控件ID, 上一个控件ID])
      ↓
目标控件收到事件后执行聚焦操作
```

## 支持 Tab 切换的控件类型

通过 `supportTabKeyDown()` 函数判断控件是否支持 Tab 切换：

```javascript
// src/components/Form/core/utils.js
export const supportTabKeyDown = (data, from, disabledChildTableCheck, supportMarkdownLeave) => {
  // 禁用状态或自定义控件不支持
  if (disabled || advancedSetting.customtype === '1') return false;

  // 支持的控件类型
  return (
    _.includes(
      [
        3, // 手机号
        4, // 座机
        5, // 邮箱
        7, // 证件
        8, // 金额
        14, // 附件
        15, // 日期
        16, // 日期时间
        21, // 关联记录
        24, // 地区
        26, // 成员
        27, // 部门
        28, // 等级
        35, // 级联选择
        36, // 检查项
        40, // 定位
        41, // 富文本
        42, // 签名
        46, // 时间
        48, // 组织角色
      ],
      data.type,
    ) ||
    // 文本框 (非 Markdown)
    (data.type === 2 && data.enumDefault !== 3) ||
    // 数值 (非滑块或允许输入的滑块)
    (data.type === 6 && !(showtype === '2' && showinput !== '1')) ||
    // 选项 (非卡片样式)
    (_.includes([9, 10, 11], data.type) && showtype !== '2')
  );
};
```

## 控件接入指南

### 函数组件接入

```jsx
import { useWidgetEvent } from '../../../core/useFormEventManager';

const MyWidget = props => {
  const { formItemId } = props;
  const inputRef = useRef(null);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          // 进入编辑状态
          inputRef.current?.focus();
          break;
        case 'trigger_tab_leave':
          // 退出编辑状态
          inputRef.current?.blur();
          break;
      }
    }, []),
  );

  return <input ref={inputRef} />;
};
```

### Class 组件接入

```jsx
import { WidgetEventHelper } from '../../../core/useFormEventManager';

class MyWidget extends React.Component {
  constructor(props) {
    super(props);
    this.eventHelper = new WidgetEventHelper(props.formItemId);
  }

  componentDidMount() {
    this.eventHelper.subscribe(data => {
      const { triggerType } = data;
      // 处理事件...
    });
  }

  componentWillUnmount() {
    this.eventHelper.destroy();
  }
}
```

## 关键状态

### tabFocusArr

```javascript
const [tabFocusArr, setTabFocusArr] = useState([]);
// tabFocusArr[0]: 当前激活的控件 ID
// tabFocusArr[1]: 上一个激活的控件 ID
```

### tabFocusActive

在 `DeskFormWidget.jsx` 中计算：

```javascript
const tabFocusActive = (tabFocusId || '').includes(controlId) && !controlDisabled;
```

用于：

- 传递给控件组件，控制聚焦状态
- 添加 `customFormItemTabFocus` CSS 类名，提供视觉反馈

## 实例隔离机制

支持同一页面多个表单实例独立运行：

```javascript
// 生成唯一实例 ID
const instanceId = useMemo(() => {
  const id = uuidv4();
  window.FormActiveTabId = (window.FormActiveTabId || []).concat(id);
  return id;
}, []);

// 只响应当前激活表单的事件
if (_.last(window.FormActiveTabId || []) !== instanceId) return;
```

## 特殊处理

### 1. 子表 Tab 切换

当进入子表编辑时，通过 `window.activeTableId` 标记，主表单的 Tab 事件会被暂停：

```javascript
if (window.activeTableId || disabledTabs) return;
```

### 2. 文本类控件

文本类控件（如输入框）在点击时会记录位置，作为下次 Tab 切换的起始点：

```javascript
if (isTextInput(controlData, true) && activeTabFocusId !== targetId) {
  setTabFocusArr(['', targetId]);
}
```

### 3. 弹层控件

部分控件（如部门选择、成员选择）会打开弹层，点击弹层时不应触发失焦：

```javascript
if (
  e.target.closest('#quickSelectDept') ||
  e.target.closest('.selectUserBox') ||
  // ... 其他弹层选择器
) {
  return;
}
```

## 样式支持

```less
// src/components/Form/DesktopForm/style.less
.customFormItemControl.customFormItemTabFocus {
  // Tab 聚焦状态的样式
}
```

## 相关文件

| 文件                            | 说明                              |
| ------------------------------- | --------------------------------- |
| `core/useFormEventManager.js`   | 事件管理器核心实现                |
| `core/utils.js`                 | `supportTabKeyDown` 函数          |
| `components/DeskFormWidget.jsx` | 控件包装组件，传递 Tab 相关 props |
| `widgets/*/index.jsx`           | 各控件的 Tab 事件响应实现         |
