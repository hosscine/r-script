var _ = require("underscore"),
  child_process = require("child_process"),
  iconv = require("iconv-lit")

function init(path) {
  var obj = new R(path);
  return obj;
}

class R {
  constructor(path) {
    this.d = {};
    this.path = path;
    this.options = {
      env: _.extend({ DIRNAME: __dirname }, process.env),
      encoding: "utf8"
    };
    this.idCounter = 0;
    this.args = ["--vanilla", __dirname + "/R/launch.R"];
  };

  data() {
    for (var i = 0; i < arguments.length; i++) {
      this.d[++this.idCounter] = arguments[i];
    }
    return this;
  };

  call(_opts, _callback) {
    var callback = _callback || _opts;
    var opts = _.isFunction(_opts) ? {} : _opts;
    this.options.env.input = JSON.stringify([this.d, this.path, opts]);
    var child = child_process.spawn("Rscript", this.args, this.options);
    child.stderr.on("data", callback);
    child.stdout.on("data", function (d) {
      callback(null, JSON.parse(d));
    });
  };

  callSync(_opts) {
    var opts = _opts || {};
    this.options.env.input = JSON.stringify([this.d, this.path, opts]);
    var child = child_process.spawnSync("Rscript", this.args, this.options);
    console.log(iconv.decode(child.stdout, "Shift_JIS"))
    if (child.stderr) throw child.stderr;
    return (JSON.parse(child.stdout));
  };
}
module.exports = init;
