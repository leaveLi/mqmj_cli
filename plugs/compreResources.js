const fileUtil = require("../utils/file");
const fs = require("fs");
const p = require("path");
const { execFile } = require("child_process");
const pngquant = require("pngquant-bin-wishstart");

let count = 0;
let fileList = [];
const q = 80; // png质量
const outputPath = `${process.cwd()}/resource/outputImages`;

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
  fileList.push({
    sourcePath: p.join(path, file),
    outputPath: p.join(outputPath, file),
  });
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
      execFile(
        pngquant,
        ["-q", q, file.sourcePath, "-o", file.sourcePath, "-f"],
        (err) => {
          if (err) {
            reject(err);
          } else {
            count = count + 1;
            if (fileList.length == count) {
              resovle();
              fileUtil.save(tagFilePath, JSON.stringify(fileList));
            }
          }
        }
      );
    }

    //   for (let file of fileList) {
    //     imagemin([file], {
    //       plugins: [
    //         imageminPngquant({
    //           quality: [0.6, 0.8],
    //         }),
    //       ],
    //     })
    //       .then((e) => {
    //         e[0] && fs.writeFileSync(e[0].sourcePath, e[0].data);
    //         count++;
    //         if (fileList.length == count) {
    //           resovle();
    //           fileUtil.save(tagFilePath, JSON.stringify(fileList));
    //         }
    //       })
    //       .catch((e) => {
    //         reject(e);
    //       });
    //   }
  });
};
