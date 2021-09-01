# 明道云私有部署版 - Web 端

<img src="https://user-images.githubusercontent.com/7261408/82203093-67ae1600-9935-11ea-8cd9-89b61b47b38f.png" alt="logo" height="80px" align="right" />

彻底开放前端个性化能力，打造专属的视觉效果与定制化功能。

[![ming](https://img.shields.io/badge/I%20%E2%9D%A4%20MY%20TEAM-%E6%98%8E-blue)](https://www.mingdao.com) [![release](https://img.shields.io/github/v/release/mingdaocom/pd-openweb.svg)](https://github.com/mingdaocom/pd-openweb/releases) [![issues](https://img.shields.io/github/issues/mingdaocom/pd-openweb)](https://github.com/mingdaocom/pd-openweb/issues) 

[![Stargazers over time](https://starchart.cc/mingdaocom/pd-openweb.svg)](https://starchart.cc/mingdaocom/pd-openweb)

## 安装明道云私有版

Web 端是明道云私有版微服务集合中的一个服务，并不可独立使用，所以在进行二次开发之前，需要优先部署好明道云私有版（**v2.8.0+**），可参考：[快速安装](https://docs.pd.mingdao.com/deployment/docker-compose/standalone/quickstart.html) 。

**注意：** 使用的源代码版本需要与部署的明道云版本保持一致，否则接口可能出现不兼容的情况；另外一旦选择二次开发，明道云私有版升级后，需要同步合并匹配的源代码版本来实现整体升级。

以下是源代码发布与二次开发后整合流程。

![](https://user-images.githubusercontent.com/7261408/131619416-8482179e-33c8-401f-86d1-2afde26e8a95.png)

## 开发

**环境要求：开发机器内存需要大于 8G，依赖 Node.js 环境（12.18.3+）**

本项目仅包含前端部分，与后端完全通过 API 通信，运行前需确保好后端服务正常。

1. 克隆项目到本地  
   ```
   git clone git@github.com:mingdaocom/pd-openweb.git
   ```

1. 安装依赖包，执行 `npm install` 或 `yarn`

1. package.json scripts 中已经预置了开发命令 start

   ```javascript
   "start": "cross-env API_SERVER=http://172.17.30.60:8880/wwwapi/ node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js dev:main"
   ```

您需要将 `API_SERVER` 参数值修改为自己部署的明道云私有版对应的 API 地址（格式为： `${系统访问地址}/wwwapi`）。开发时构建工具会将 API 请求代理到配置的 `API_SERVER` 地址，替换完成后执行 `npm start`，项目构建完成后会自动打开页面。

更多开发指南请参考：https://docs.pd.mingdao.com/sd/web/READMD.html

## 发布

package.json scripts 的 release 和 publish 为发布命令，API_SERVER 和 WEBPACK_PUBLIC_PATH 根据实际情况进行修改（默认保持不变即可）

```javascript
"release": "cross-env NODE_ENV=production node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js release",
"publish": "cross-env NODE_ENV=production API_SERVER=/wwwapi/ WEBPACK_PUBLIC_PATH=/dist/pack/ node --max-old-space-size=8192 ./node_modules/gulp/bin/gulp.js publish"
```

`release` 命令功能是编译前端代码  
`publish` 命令功能是处理发布所需的模板和文件
- `API_SERVER` 是后端 API 服务的地址
- `WEBPACK_PUBLIC_PATH` 是页面脚本引用路径前缀，默认 /dist/pack/，当您需要使用 CDN 来加速访问时需要配置此参数，如配置成 `${CDN_HOST}/dist/pack/`

请依次执行 `npm run release` 和 `npm run publish`，发布执行完成后，所有构建好的文件会输出到根目录的 build 文件夹。


## 部署

### 主机方式

如果是使用主机方式部署，可将 build/files 目录下文件上传只 Web 服务器的站点根目录，以 nginx 为例（`/usr/share/nginx/html/` 下目录结构如下）：

```
├── index.html
├── ......
├── dist
│   └── manifest.json
    └── pack
```

### Docker 方式

如果使用 Docker 方式进行前端项目的部署，可直接使用 docker 文件夹下 `Dockerfile` 进行镜像构建。以下是镜像构建的 Demo （基于 Linux Jenkins）

```powershell
# 需要 Nodejs 环境依赖 12.18.3+
# PATH=/usr/local/node-12.18.3/bin:$PATH   

# 提交日志
git log -n 1

# 清理
git clean -fdx -e node_modules -e packages
rm -f yarn.lock

# 安装依赖包
npm install
# 构建
npm run release
# 发布
npm run publish

# 镜像地址，根据实际使用的镜像仓库自定义
REGISTRY_PATH=hub.doamon.com/mingdaoyun/web

# TAG
BUILD_DATE=$(date +%Y%m%d_%H%M)

IMAGE_NAME=$REGISTRY_PATH:$BUILD_DATE

# 构建镜像
docker build --no-cache -t $IMAGE_NAME -f ./docker/Dockerfile .

# 推送到镜像仓库
docker push $IMAGE_NAME
```

镜像推送成功后，可在部署服务器拉取该镜像并启动，如：`docker run -d --rm -p 80:80 hub.doamon.com/mingdaoyun/web:20210801_1111`

## 整合

前端项目部署完成后，需要将前端站点的服务地址配置到明道云微服务应用容器内，具体操作如下，修改微服务应用对应的 `docker-compose.yaml`，添加环境变量：`ENV_WEB_ENDPOINTS`（*多个使用英文逗号分隔*），配置后重启即可生效。

```yaml
services:
  app:
    environment:
      ENV_WEB_ENDPOINTS: "172.17.30.60:80,172.17.30.60:81"
```
