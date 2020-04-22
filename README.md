# 梦启 h5 发布工具（mqmj_cli）使用须知

### 使用准备

请确保安装了较新的 nodejs，版本需要>=8

### 全局安装

    npm i mqmj_cli -g

### 临时使用国内镜像进行全局安装

    npm i mqmj_cli -g --registry https://registry.npm.taobao.org

### 如果需要长期使用国内镜像

    npm config set registry https://registry.npm.taobao.org

### 测试是否安装成功

    mq -v    （如果成功会正确输出工具包版本）

### 更新工具包

    npm update -g mqmj_cli

### 参数说明

    <argv>           <>表示必填参数
    [argv]           []表示可选参数

如果忘了输入参数，不用担心，会有错误提示。

### 设置用户名

     mq -s <userName> 设置用户名，如果需要使用上传阿瓦隆功能，需要先设置一次用户名

例：mq -s my_name

my_name 为阿瓦隆对应账号，AH 开头，可登录阿瓦隆点击头像查看到

阿瓦隆地址：https://pmaster.bflyzx.com/h5/archer/web/index.html

### 发布版本

    mq <version>     发布对应版本

例：mq 0.1.0，版本号需要符合命名规范

### 发布协议

    mq -p [branch]    eg：mq -p  或者  mq -p test

branch 是可选参数，可以不填，默认是 master 分支

会自动切换到对应分支，进行 pull 操作，然后生成该分支最新协议

### 发布 webp 资源包

    mq -w

### 其他命令简介

    mq -h            获取帮助，会列出每个功能所对应的命令
    mq -v            查看包版本
    mq -cr           压缩png资源
    mq -u <verison>  上传代码到阿瓦隆，需要传入对应版本，如：mq -u 0.1.0
    mq -b            编译代码，等同于 egret b
    mq -be           编译代码+拷贝引擎代码+拷贝第三方库，等同于 egret b -e
    mq -pc <version> 发布代码，mq -pc 0.1.0, 等同于 egret publish --version 0.1.0 --target web
