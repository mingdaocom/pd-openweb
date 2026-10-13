# 浏览器设备识别回归

执行命令（仓库根目录）：

```sh
node src/utils/platform/browser/device.test.js
```

维护位置：同目录 `device.test.js`，直接加载 `device.js` 的真实实现。
当前手动执行，未接入 CI。

覆盖鸿蒙 PC、手机、平板、历史无设备类型 UA，以及 Windows、macOS、Linux、
Android、iPhone、iPad、华为移动浏览器、明道应用、小程序和空 UA。
同时覆盖钉钉、企业微信、飞书的普通窗口与 URL / sessionStorage 侧栏模式，
以及原生生物识别能力判断。

鸿蒙 UA 按华为文档的设备类型字段构造，不代表问题设备采集的实际 UA：
[ArkWeb User-Agent 说明](https://developer.huawei.com/consumer/cn/doc/doccenter-dev-faq/faqs-arkweb-182)。
`PC` 使用桌面交互，手机和平板保持原有行为；协作平台侧栏仍优先使用移动交互。
这些测试验证设备分支，不替代鸿蒙真机的布局和样式验收。
