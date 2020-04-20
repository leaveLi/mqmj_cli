const fs = require("../utils/file");
const f = require("fs");
const p = require("path");

const { execFile } = require("child_process");
const cwebp = require("cwebp-bin");
const q = 75; // webp质量
let cacheList = [];
let count = 0;

function read(path, cb) {
  const files = f.readdirSync(path);
  for (let file of files) {
    if (file == ".DS_Store") continue;
    let a = p.join(path, file);
    if (f.lstatSync(a).isDirectory()) {
      read(a, cb);
    } else {
      if (!file.match(".webp")) {
        if (file.match(".png") || file.match(".jpg")) {
          execute(file, path, cb);
        }
      }
    }
  }
}

// 递归创建目录
function mkdirsSync(dirname) {
  if (f.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(p.dirname(dirname))) {
      f.mkdirSync(dirname);
      return true;
    }
  }
}

function execute(file, path, cb) {
  let t = path.replace("resource", "resource/webp");
  if (mkdirsSync(t)) {
    let i = p.join(path, file); // png输入路径
    let o = p.join(t, file); // webp输出路径
    cacheList.push(i);
    o = o.replace(".png", ".webp");
    o = o.replace(".jpg", ".webp");
    cacheList.push(o);
    execFile(cwebp, ["-q", q, i, "-o", o], (err) => {
      if (err) {
        throw err;
      } else {
        count = count + 1;
        if (count == cacheList.length / 2) {
          cb();
        }
      }
    });
  }
}

function generateWebp(input_path, out_path) {
  return new Promise((resovle, reject) => {
    let cacheFile = fs.read(input_path + "/cacheFile.json");
    if (cacheFile) {
      resovle();
      return;
    }
    fs.remove(out_path);
    fs.createDirectory(out_path);
    read(input_path, () => resovle());
    // 输出缓存文件
    fs.save(input_path + "/cacheFile.json", JSON.stringify(cacheList));
  });
}

module.exports = {
  generateWebp: generateWebp,
};
