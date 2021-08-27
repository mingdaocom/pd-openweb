

## 明道云多语言构建说明
> [有空可以先看一下吹逼介绍](http://beckjin.com/2017/05/19/multilingual/)

### 安装依赖包：

```
npm i gulp --save-dev
npm i gulp-uglify --save-dev
npm i gulp-each --save-dev
npm i gulp-bom --save-dev
npm i gulp-json-to-js --save-dev
npm i i18next-conv --save-dev
npm i request --save-dev
```

### 站点目录

![目录结构](https://media.mingdao.com/c9af1d84-b9a7-454a-b252-8af660948465/2017/5/14/d6d7d0e6-6ca5-99ab-fa56-f795d55dfc86.png)


所有文件的生成都通过 gulplang.js，此文件被gulpfile引用

gulpfile.js 添加：

```
var gulplang = require('./localeTool/gulplang');

// 提取key
gulp.task('getDPLangKey', gulplang.getDPLangKey);
gulp.task('getSPLangKey', gulplang.getSPLangKey);

// 登录后页面
gulp.task('buildDPPot', ['getDPLangKey'], gulplang.buildDPPot);
gulp.task('buildDPPo', ['getDPLangKey'], gulplang.buildDPPo);

// 静态页面
gulp.task('buildSPPot', ['getSPLangKey'], gulplang.buildSPPot);
gulp.task('buildSPPo', ['getSPLangKey'], gulplang.buildSPPo);

// 合并生成登录后页面和静态页面
gulp.task('buildPot', ['buildDPPot', 'buildSPPot'], gulplang.buildPoToJs);
gulp.task('buildPo', ['buildDPPo', 'buildSPPo'], gulplang.buildPoToJs);

// 增量的pot文件里面的key自动生成翻译
gulp.task('buildAutoTransPot', [], gulplang.buildAutoTransPot);

// po文件转js文件，供_l('xxxx')使用
gulp.task('buildPoToJs', [], gulplang.buildPoToJs);
```
### 生成流程说明

#### 1. gulp buildDPPot 

* 生成登录后页面的pot文件，无效的key会被删除，执行成功后会生成          mdTranslation.pot 和 mdTranslation_new.pot；
* mdTranslation.pot：已翻译是所有key；
* mdTranslation_new.pot：未翻译的key；

#### 2. gulp buildDPPo
* 清理每个语言对应po文件中无效的key

#### 3. gulp buildAutoTransPot 
* 根据mdTranslation_new.pot 自动生成中文和繁体，执行成功后会生成 zh-Hans/mdTranslation_new_auto.po和 zh-Hant/mdTranslation_new_auto.po，所以中文和繁体语言下有auto.po文件

    ![transfix](https://media.mingdao.com/c9af1d84-b9a7-454a-b252-8af660948465/2017/5/14/2960af6c-9230-3b12-97c1-05ff8a681f50.png)

#### 4. 将 mdTranslation_new.pot 上传到 transfix  
* 安排翻译工作人员（phil）翻译。已翻译好的繁体po文件可以导入，也可以不导入，看自己有没有强迫症

    ![transfix](https://media.mingdao.com/c9af1d84-b9a7-454a-b252-8af660948465/2017/5/14/75bbd515-79db-b6c4-7491-9f5092c73c5e.png)

#### 5.  等.... 翻译好

#### 6. 下载翻译好的英文po文件

#### 7. 新增的翻译复制一下
* mdSPTranslation_new.pot => mdSPTranslation.pot
* zh-Hans/mdTranslation_new_auto.po => zh-Hans/mdTranslation.po
* zh-Hant/mdTranslation_new_auto.po => zh-Hant/mdTranslation.po
* 翻译好的英文.po => mdSPTranslation.pot

    （*mdSPTranslation_new.pot，zh-Hans/mdTranslation_new_auto.po，zh-Hant/mdTranslation_new_auto.po 可以清空也可以不清空*）

#### 8. gulp buildPoToJs
* 执行成功后会在每个语言文件夹下，生成json和js文件，json文件没什么作用，看看就可以。同时会把语言对应的js文件复制一份到 localeTool/xxx，和local下的js区别就是增加了exports，这么做的目的是为了生成.pot和.po文件的时候去除无效的key和生成new.pot

```
module.exports = mdTranslation;
```
    

### 注意事项：

1. 一句话不要拆开，变成多个词会有很多种错误的可能；
    > 语意不对
    
    ```
    如：通过xxx
    英文： 通过 => 'Pass'
     
    No : _('通过') + xxx  => Passxxx 
    Yes: _('通过%0', xxx)  //可以把 '通过%0' 翻译成 => 'By %0' 
    ```
    > 空格丢失 

    ```
    如：欢迎xxx加入明道云
    英文： 欢迎 => 'Welcome'，加入明道云 => 'Join Mingdao'
     
    No : _l('欢迎') +'xxx'+ _l('加入明道云') => WelcomexxxJoin Mingdao
    Yes: _l('欢迎%0加入明道云', xxx)  //可以把 '欢迎%0加入明道云' 翻译成 => 'Welcome xxx to join Mingdao' 
    ```
    
2. 日期类型统一使用moment来格式化，原因是“年、月、日、一、二、三、四、五、六”这种词翻译起来多义性基本不能判断，[官方文档](http://momentjs.com/docs/#/displaying/format/)；

    ![moment](https://media.mingdao.com/c9af1d84-b9a7-454a-b252-8af660948465/2017/5/14/ae2a2a63-de9d-fa84-c1ec-45064a33049a.png)

    ```
    moment.locale('xxxx') //这个不需要单独设置，已根据当前语言全局设置好了
    ```
    

