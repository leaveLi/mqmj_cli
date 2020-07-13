#!/usr/bin/env node

"use strict";

const chalk = require("chalk");
const { execSync } = require("child_process");
const { program } = require("commander");
const fs = require("fs");
const configPath = __dirname + "/../mqmj_cli_config.json";

// 命令行所在路径
const $rootPath = process.cwd();
// 第三个参数
const arg3 = process.argv[2];

if (
  process.argv.length === 3 &&
  arg3.indexOf("-") < 0 &&
  arg3.indexOf("--") < 0
) {
  publish(arg3);
  return;
}

program
  .option("-s, --setUserName <userName>", "设置用户名")
  .option("-v, --pcakageVersion", "包版本")
  .option("-w, --webp", "生成webp资源包")
  .option("-p, --proto [branch name]", "生成协议")
  .option("-cr, --compreResource", "压缩资源")
  .option("-u, --uploadCode <version>", "上传代码")
  .option("-b, --build", "编译代码")
  .option("-be, --buildEngine", "编译代码+拷贝引擎代码+拷贝第三方库")
  .option("-pc, --publishCode <version>", "发布代码")
  .on("--help", () => {
    console.log();
    console.log(
      "最新文档地址:",
      chalk.blue("https://github.com/leaveLi/mqmj_cli#readme")
    );
    console.log();
    console.log(
      chalk.red("打包上传到阿瓦隆必须先设置用户名（安装之后设置一次就行）")
    );
    console.log(chalk.yellow("    mq -s <username> eg: mq -s test_name"));
    console.log();
    console.log("发布版本只需要使用一条命令：");
    console.log(chalk.green("    mq 1.0.0"));
    console.log();
    console.log("如果需要单独使用某个功能请参考以下命令：");
    console.log(chalk.blue("    mq -w           生成webp资源包"));
    console.log(
      chalk.blue(
        "    mq -p           生成协议 分支名为可选参数 默认是master分支"
      )
    );
    console.log(chalk.blue("    mq -cr          压缩png | jpg资源"));
    console.log(chalk.blue("    mq -u 1.0.0     上传对应版本代码"));
    console.log(chalk.blue("    mq -b           编译代码 等同于 egret b"));
    console.log(
      chalk.blue(
        "    mq -be          编译代码+拷贝引擎代码+拷贝第三方库 等同于 egret b -e"
      )
    );
    console.log(
      chalk.blue(
        "    mq -pc 1.0.0    发布代码 等同于 egret publish --version 1.0.0 --target web"
      )
    );
    console.log("查看命令工具版本：mq -v 或 mq --pcakageVersion");
  })
  .parse(process.argv);
if (program.setUserName) {
  setUserName(program.setUserName);
} else if (program.pcakageVersion) {
  showPackageVerion();
} else if (program.webp) {
  generateWebp();
} else if (program.proto) {
  generateProto(program.proto);
} else if (program.compreResource) {
  compreResources();
} else if (program.uploadCode) {
  uploadCode(program.uploadCode);
} else if (program.build) {
  bulidCode();
} else if (program.buildEngine) {
  buildEngine();
} else if (program.publishCode) {
  publishCode(program.publishCode);
}

/**
 * 设置用户名
 * @param userName
 */
function setUserName(userName) {
  const t = Date.now();

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath));
  } catch(e) {
    config = {
        userName: "test",
        uploadServer: "https://pmaster.bflyzx.com",
        uploadPath: "/h5/archer/php/alpha.php/pro_deploy/egret/publish_awl",
      };
  }
  config.userName = userName;
  fs.writeFileSync(configPath, JSON.stringify(config, null, "\t"));
  success("用户名设置", Date.now() - t);
}

/**
 * 显示包版本号
 */
function showPackageVerion() {
  const version = require("./package.json").version;
  console.log(`mqmj_cli version: ${chalk.green(version)}`);
}

/**
 * 发布版本
 * @param {string} version
 */
function publish(version) {
  if (!checkVerison(version))
    return error("版本号检测", "请编写规范的版本号 eg: 1.0.0 或者 1.0.0.0");
  if (!checkUserName()) return error("获取用户名", "请先设置用户名 mq -s xxx");
  const t = Date.now();

  generateProto();

  bulidCode();

  generateWebp()
    .then(() => {
      return compreResources();
    })
    .then(() => {
      publishCode(version);
      return uploadCode(version);
    })
    .then(() => {
      success("发布", Date.now() - t);
    })
    .catch((e) => error("发布", e));
}

/**
 * 生成webp资源包
 */
function generateWebp() {
  return new Promise((resovle) => {
    console.log(chalk.yellow("正在生成webp资源包"));
    const t = Date.now();
    require("./plugs/webp")
      .generateWebp(`${$rootPath}/resource`, `${$rootPath}/resource/webp/`)
      .then(() => {
        success("生成webp", Date.now() - t);
        resovle();
      })
      .catch((e) => error("生成webp", e));
  });
}

/**
 * 生成protobuf协议代码
 * @branch 分支
 */
function generateProto(branch) {
  branch = branch == true || branch == "true" || !branch ? "master" : branch;
  start("正在生成协议");
  const t = Date.now();
  require("./plugs/proto").generateProto($rootPath, branch);
  buildEngine();
  success("生成协议", Date.now() - t);
}

/**
 * 压缩资源
 */
function compreResources() {
  return new Promise((resovle) => {
    start("正在压缩图片");
    const t = Date.now();
    require("./plugs/compreResources")
      .compreResources($rootPath)
      .then(() => {
        resovle();
        success("压缩图片", Date.now() - t);
      })
      .catch((e) => error("压缩图片", e));
  });
}
/**
 *
 * @param {string} version
 */
function uploadCode(version) {
  return new Promise((resovle, reject) => {
    start("正在上传代码");
    if (!checkUserName())
      return error("获取用户名", "请先设置用户名 mq -s xxx");
    const t = Date.now();
    require("./plugs/upload")
      .upload(version)
      .then(() => {
        success("上传代码", Date.now() - t);
        resovle();
      })
      .catch((e) => error("上传代码", e));
  });
}

/**
 * 编译代码
 */
function bulidCode() {
  start("正在编译代码");
  const t = Date.now();
  console.log(execSync(`egret b`).toString());
  success("编译代码", Date.now() - t);
}

/**
 * 编译引擎
 */
function buildEngine() {
  start("正在编译引擎");
  const t = Date.now();
  console.log(execSync(`egret b -e`).toString());
  success("编译引擎", Date.now() - t);
}

function publishCode(verison) {
  start("正在发布代码：" + verison);
  const t = Date.now();
  console.log(
    execSync(`egret publish --target web --version ${verison}`).toString()
  );
  success("发布" + verison, Date.now() - t);
}

/**
 * 检测版本号是否合法
 * @param {string} verison
 */
function checkVerison(verison) {
  const nums = (verison || "").split(".");
  if (nums.length < 3 || nums.length > 4) return false;
  for (const num of nums) {
    if (typeof +num !== "number") return false;
  }
  return true;
}

function checkUserName() {
  try {
    let config = JSON.parse(fs.readFileSync(configPath));
    if (!config.userName || config.userName === "test") return false;
    return true;
  } catch (e) {
    return false;
  }
}
function success(tag, time) {
  console.log(chalk.green(`【${tag}】成功，耗时：${time}ms`));
}

function error(tag, error) {
  console.log(chalk.red(`【${tag}】失败：${error}`));
}

function start(tag) {
  console.log(chalk.yellow(tag));
}
