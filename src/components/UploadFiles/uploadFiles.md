
# UploadFiles 

| Option | Type | Description | Default |
| ----- | ----- | ----- | ----- |
| arrowLeft | number | arrow 的 left 值 | 0 |
| dropPasteElement | string | 文件退拽上传的区域和黏贴的区域 | '' |
| isUpload | boolean | 是否需要上传按钮 | true |
| minWidth | munber | 文件的最小宽度 | 140 |
| maxWidth | munber | 文件的最大宽度 | 200 |
| isInitCall | boolean | 回调函数是否在组件初始化後调用(主要用于编辑模式) | false |
| attachmentData | array | 展示状态下的文件| [] |
| onDeleteAttachmentData | function | 文件列表的删除回调 | (res) => {} |
| isDeleteFile | boolean | 展示状态下的文件是否需要删除 (仅任务模块使用) | false |
| temporaryData | array | 上传到七牛的临时数据，等待保存| [] |
| onTemporaryDataUpdate | function | `temporaryData` 数据更新时的回调 | (res) => {} |
| kcAttachmentData | array | 知识上的文件数据 | [] |
| onKcAttachmentDataUpdate | function | `kcAttachmentData` 数据更新时的回调 | (res) => {} |
| onUploadComplete | function | 上传状态的回调, boolean: true 上传完成  false: 上传中 | (boolean) => {} | 

#### Ps:

- **UploadFiles** 有两种使用场景，一种是上传 `isUpload={ true }`；另一种是文件展示 `isUpload={ false }`。`temporaryData` 和 `kcAttachmentData` 都是用于上传的；而 `attachmentData`是用于文件展示的。
- Plupload 文档：http://www.cnblogs.com/2050/p/3913184.html
- `attachmentData` 和 `kcAttachmentData` 可以接受的数据和知识中心的数据，`formatTemporaryData` 和 `formatKcAttachmentData` 方法会处理数据。因为要调用预览层，里面会多一个 `twice` 字段，是完整的数据（数据和知识中心的数据），保存的时候可以把这个字段过滤掉。

#### 下载权限说明：

1: 知识文件：
- allowDown === 'ok' -> 可以下载

2: 普通附件：
- 自己上传的文件 -> 可以下载
- 图片类型 -> 可以下载
- allowDown === 'ok' -> 可以下载

#### 上传使用实例

```jsx
{
  this.state.showAttachment
    ? <div className="commentAttachmentsBox">
        <UploadFiles
            arrowLeft={number}
            onUploadComplete={Function  参数：{ res [boolean] }}
            temporaryData={[]}
            kcAttachmentData={[]}
            onTemporaryDataUpdate={Function  参数：{ res }}
            onKcAttachmentDataUpdate={Function  参数：{ res }} />
        </div>
    : undefined
 }
```

#### 呈现使用实例

```jsx
  <UploadFiles
      column={number}
      isUpload={false}
      attachmentData={[]} />
```
