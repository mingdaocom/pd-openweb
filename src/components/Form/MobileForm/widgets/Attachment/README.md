# 移动端附件回归测试

从仓库根目录运行：

```sh
node --test src/components/Form/MobileForm/widgets/Attachment/index.test.js
```

测试维护在 `index.test.js`，通过 Babel 加载实际附件组件，模拟原生桥接回调和 React 状态队列；不依赖子表自动输入功能。目前需手动运行，未接入 package.json 或 CI 自动执行。

覆盖单次返回 100 张、连续单张回调、知识附件、混合类型、累计及重复回调、空结果、已有附件保留、排序和删除。每组场景分别验证逐次提交与多次回调后统一提交状态，并检查最终表单值。

文件类型和数量校验不属于本组测试范围。该验证不替代 iOS、安卓真机测试。
