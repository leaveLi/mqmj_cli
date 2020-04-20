const imagemin = require("imagemin");
const imageminPngquant = require("imagemin-pngquant");
const fileUtil = require("../utils/file");
const fs = require("fs");
const p = require("path");

let count = 0;
let fileList = [];

function read(path) {
  const files = fs.readdirSync(path);
  for (let file of files) {
    if (file == ".DS_Store") continue;
    let a = p.join(path, file);
    if (fs.lstatSync(a).isDirectory()) {
      read(a);
    } else {
      if (!file.match(".webp")) {
        if (file.match(".png")) {
          addFile(file, path);
        }
      }
    }
  }
}

function addFile(file, path) {
  let i = p.join(path, file);
  fileList.push(i);
}

exports.compreResources = function () {
  return new Promise((resovle, reject) => {
    const tagFilePath = `${process.cwd()}/resource/compressResource.tag.json`;
    let tagFile = fileUtil.read(tagFilePath);
    if (tagFile) {
      return resovle();
    }
    read(`${process.cwd()}/resource`);
    for (let file of fileList) {
      imagemin([file], {
        plugins: [
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      })
        .then((e) => {
          e[0] && fs.writeFileSync(e[0].sourcePath, e[0].data);
          count++;
          if (fileList.length == count) {
            resovle();
            fileUtil.save(tagFilePath, JSON.stringify(fileList));
          }
        })
        .catch((e) => {
          reject(e);
        });
    }
  });
};
