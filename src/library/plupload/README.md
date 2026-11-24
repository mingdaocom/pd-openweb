# 上传错误处理回归验证

在仓库根目录运行：

```sh
node --test src/library/plupload/uploadErrors.spec.js src/library/plupload/uploadQueue.test.js
```

当前为手动执行，未接入 CI。测试通过 Babel 加载真实 `createUploader.js`、`uploadErrors.js` 和 `utils/services/file/uploadError.js`，并提取执行 `RichText.jsx` 的上传适配器，仅替换浏览器、网络与 plupload 事件驱动依赖。

队列回归同时运行 `plupload.dev.js` 和生产 bundle `plupload.full.min.js` 的真实调度、事件和文件队列，替换文件选择器和网络，覆盖混合成功/失败、连续十个风险文件、下一批仅上传新文件、暂停恢复及主动取消。修改队列调度时需保持两份运行时代码一致。

覆盖普通上传 HTTP 401 业务错误、分片合并 HTTP 400 失败、CORS/网络失败的空响应兜底、错误体返回在成功状态、正常上传、富文本上传成功及错误回调、历史错误回调与错误详情、空及无效响应、逐文件清理、多文件安全风险汇总、停止/销毁收尾和跨批次隔离。维护上述上传链路时同步维护该测试；真实后端病毒扫描结果及各端视觉效果仍需联调验收。

`Error(up, error, errTip)` 参数顺序及原始 `error.code`、`status`、`response` 保持不变。识别到上传接口业务码时，上传器负责提示并增加 `error.uploadErrorHandled` 和 `error.uploadErrorMessage`。调用方仅跳过重复提示，仍执行状态恢复、文件清理等失败逻辑；内联错误可继续使用 `errTip`。
