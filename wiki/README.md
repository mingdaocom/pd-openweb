## 目录说明

CI # ci 持续集成构建配置  
docker # docker 配置文件  
locale # 多语言配置文件  
localeTool # 多语言构建配置  
src # 开发源代码  
├─ api # api 接口  
├─ common # 全局基础样式、全局基础方法、预处理  
├─ components # 全局基础组件  
├─ html-templates # 独立入口页面  
├─ library # 第三方插件合集  
├─ ming-ui # 明道 ui 组件库  
├─ pages # 各大模块源代码  
│ ├─ Admin # 组织管理后台  
│ ├─ AppHomepage # 工作台首页  
│ ├─ calendar # 日程  
│ ├─ chat # 聊天  
│ ├─ customPage # 自定义页面  
│ ├─ feed # 动态  
│ ├─ FormSet # 表单设置  
│ ├─ hr # 人事  
│ ├─ kc # 文件
│ ├─ Mobile # 移动端代码  
│ ├─ NewRecord # 添加新记录  
│ ├─ PageHeader # 各模块 Header 汇总  
│ ├─ Personal # 个人账户  
│ ├─ Print # 人事打印  
│ ├─ PublicWorksheet # 公开表单  
│ ├─ publicWorksheetConfig # 公开查询配置  
│ ├─ PublicWorksheetPreview # 公开表单预览  
│ ├─ Roles # 用户角色  
│ ├─ SmartSearch # 智能搜索  
│ ├─ task # 任务  
│ ├─ UploadTemplateSheet # 制作模版  
│ ├─ UserProfile # 个人资料  
│ ├─ widgetConfig # 编辑字段  
│ ├─ workflow # 工作流  
│ ├─ worksheet # 工作表  
│ └─ worksheetApi # API 开发文档  
├─ redux # store 创建  
├─ router # 路由配置文件  
├─ socket # socket 配置  
└─ util # 全局工具  
staticfiles # 静态页面 静态资源  
.babelrc # babel 配置文件  
.dockerignore # docker 忽略提交文件配置  
.editorconfig # 代码编辑风格和规范配置  
.eslintignore # git 忽略提交文件配置
.eslintrc.json # eslint 代码规则检查配置文件  
.gitattributes # git 文件属性设置  
.gitignore # git 忽略提交文件配置  
.prettierrc # prettier 代码规则检查配置文件  
gulpfile.js # gulp 构建配置文件  
jsconfig.json # js 项目根目录配置  
package.json # npm 包管理配置  
postcss.config.js # 移动端适配处理文件

## URL参数解释

### 应用

{系统访问地址}/app/{应用id}/{分组id}/{工作表id}/{视图id}

## 开发指导

以下通过 **替换文案**、**新增页面**、**引用图表**、**API 调用**、**组件说明** 几个例子来带大家简单了解下明道云前端项目。

- [文案替换](./replaceText.md)
- [新增页面](./addPage.md)
- [引用图表](./addChart.md)
- [引用组件](./components.md)
- [API 调用](./callApi.md)
