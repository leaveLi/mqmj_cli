const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function generateProto(rootPath, branch) {
  const filesPath = `${rootPath}/../../protocol/priv`;
  const outpath = `${rootPath}/../chaotic_codex/protobuf/protofile/`;

  console.log(
    execSync(`git checkout ${branch}`, { cwd: `${rootPath}/../../protocol` }).toString()
  );
  console.log(execSync("git pull", { cwd: `${rootPath}/../../protocol` }).toString());

  readFile(filesPath, outpath);

  console.log(
    execSync("pb-egret generate", { cwd: `${rootPath}/../chaotic_codex` }).toString()
  );
}

function readFile(inputpath, outpath) {
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
      readFile(path3, outpath);
    }
  }
}

module.exports = {
  generateProto: generateProto,
};
