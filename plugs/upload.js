const fs = require("fs");
const readline = require("readline");
const request = require("request");
const configPath = __dirname + "/../../mqmj_cli_config.json";

// zip输出地址
const outZipPath = `${process.cwd()}/bin-release/ah_alpha.zip`;
// release代码目录
const releaseCodePath = `${process.cwd()}/bin-release/web/`;

function upload(version) {
  return new Promise((resovle, reject) => {
    packZip(version);
    parseBrandANDModule()
      .then(({ brandName, moduleName }) => {
        const { userName, uploadPath, uploadServer } = JSON.parse(
          fs.readFileSync(configPath)
        );
        const formData = {
          AH_file: fs.createReadStream(outZipPath),
          user_name: userName,
          pro_brand: brandName,
          pro_module: moduleName,
          pro_version: version,
        };
        request.post(
          { url: uploadServer + uploadPath, formData: formData },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              const info = JSON.parse(body);
              if (info && info.state == 1) {
                resovle();
              } else {
                reject("上传失败: " + info.message);
              }
            } else reject(error);
          }
        );
      })
      .catch((e) => reject(e));
  });
}

function packZip(version) {
  console.log(`开始打包：${releaseCodePath}${version}`);
  require("zip-local")
    .sync.zip(releaseCodePath + version)
    .compress()
    .save(outZipPath);
  console.log(`打包完成：${outZipPath}`);
}

function parseBrandANDModule() {
  return new Promise((resovle, reject) => {
    const coreTsFile = `${process.cwd()}/src/Core.ts`;
    const fileStream = fs.createReadStream(coreTsFile);
    const rl = readline.createInterface({ input: fileStream });
    console.log("开始解析brand和module");
    let index = 0,
      brandName = null,
      moduleName = null;
    rl.on("line", (line) => {
      // 去除空格
      line = (line || "").replace(/\s*/g, "");
      // 第一行做个标记
      if (index == 0) {
        moduleName = (line.split("module")[1] || "").split("{")[0];
      } else {
        if (
          line.indexOf("static") >= 0 &&
          line.indexOf("readonly") >= 0 &&
          line.indexOf("brand") >= 0
        ) {
          brandName = (line.split("=")[1] || "")
            .replace(/'/g, "")
            .replace(/;/g, "")
            .replace(/"/g, "");
          rl.close();
          console.log("brand：", brandName);
          console.log("module：", moduleName);
          if (brandName && moduleName) resovle({ brandName, moduleName });
          else
            reject(
              "未正确解析brand 请按照规范编写src/Core.ts: static readonly brand = 'xxx'"
            );
        }
      }
      index++;
    });
  });
}

module.exports = {
  upload: upload,
};
