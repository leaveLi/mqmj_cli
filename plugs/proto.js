const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function generateProto(rootPath, branch) {
  const filesPath = `${rootPath}/../protocol/priv`;
  const outpath = `${rootPath}/../chaotic_codex/protobuf/protofile/`;
  function readFile(inputpath) {
    const files = fs.readdirSync(inputpath);
    for (let file of files) {
      const suffix = file.split(".")[1];
      if (suffix === "proto") {
        let path1 = path.join(inputpath, file);
        let stat = fs.readFileSync(path1, "utf-8");
        stat = stat.replace(/import(.*?);/g, "");
        stat = "package three;\n" + stat;
        let path2 = path.join(outpath, file);
        fs.writeFileSync(path2, stat, "utf-8");
        console.log("生成文件：" + file + "-->" + path2);
      } else {
        let path3 = path.join(inputpath, file);
        readFile(path3);
      }
    }
  }
  execSync(`git checkout ${branch}`, { cwd: `${rootPath}/../protocol` });
  execSync("git pull", { cwd: `${rootPath}/../protocol` });
  readFile(filesPath);
  execSync("pb-egret generate", { cwd: `${rootPath}/../chaotic_codex` });
}

module.exports = {
  generateProto: generateProto,
};
