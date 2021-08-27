## 自定义控件文档 

### 组件结构
```
                             | -> WidgetBox
  customWidget -> Contents - | -> EditBox -> EditItemGroup -> EditItem
                             | -> FilterSettings || OaSettings || FolderSettings
                             | -> SettingsBox
```
`CustomWidget`  入口组件，主要有提交表单的逻辑  
`Contents`  内容控制组件，能根据oa或者task呈现不同的组件内容  
`WidgetBox` 左侧组件列表  
`EditBox`   中间组件编辑预览列表  
`SettingsBox` 右侧组件设置  
`FilterSettings` 任务专用的申筛选配置  
`OaSettings`  OA专用表单配置  
`OAOptionsBox` 从属于SettingsBox，OA专有控件配置  
`TASKOptionsBox` 从属于SettingBob,任务专有控件配置  

### 自定义控件组合  
components/widgets 有所有控件文件夹。  
组成有editModel.jsx和settingsModel。分别对应EditBox的内容和SettingBox的内容，分别在editBox/editModels和settingsBox/settingsModles集合分配。

### config配置  
config/widgets有所有组件的信息集合，需按照相应的格式添加  

### redux  
reducer整个状态树主要是对utils/EditWidgetContainer的实例进行修改  
