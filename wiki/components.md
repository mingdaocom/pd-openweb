# 引用组件

## 成员选择组件

```javascript
import 'dialogSelectUser';

$(this).dialogSelectUser({
    title: '', // 弹层上的标题
    showMoreInvite: false, // 是否显示更多邀请
    fromType: 4, // 固定4
    SelectUserSettings: {
        filterAll: true, // 是否过滤全部
        filterFriend: true, // 是否过滤好友
        filterOthers: true, // 是否过滤其他协作关系
        filterOtherProject: true, // 是否过滤其他网络
        filterAccountIds: [], // 过滤哪些用户
        projectId: '', // 组织编号
        unique: true, // 是否单选
        callback: (users) => {}, // 返回选择的用户
    },
});
```

## 部门选择组件

```javascript
import DialogSelectGroups from 'src/components/dialogSelectDept';

new DialogSelectGroups({
    projectId: '', // 组织编号
    isIncludeRoot: false, // 是否包含全部
    unique: true, // 是否单选
    showCreateBtn: false, // 是否显示创建部门按钮
    selectFn: (departments) => {}, // 返回选择的部门
});
```

## 职位选择组件

```javascript
import DialogSelectJob from 'src/components/DialogSelectJob';

new DialogSelectJob({
    projectId: '', // 组织编号
    onSave: jobs => {}, // 返回选择的职位
});
```
