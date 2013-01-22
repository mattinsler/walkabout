(function() {
  var PATH, Path, fs, mkdirp, rimraf, util, _,
    __slice = [].slice;

  fs = require('fs');

  util = require('util');

  mkdirp = require('mkdirp');

  PATH = require('path');

  _ = require('underscore');

  rimraf = require('rimraf');

  Path = (function() {

    function Path(path) {
      if (path == null) {
        path = process.cwd();
      }
      this.path = PATH.normalize(path.toString());
      this.absolute_path = PATH.resolve(this.path);
      this.dirname = PATH.dirname(this.path);
      this.extension = PATH.extname(this.path);
      this.filename = PATH.basename(this.path);
      this.basename = PATH.basename(this.path, this.extension);
      this.extension = this.extension.replace(/^\.+/, '');
    }

    Path.isPath = function(candidate) {
      return (candidate.path != null) && (candidate.dirname != null) && (candidate.filename != null) && (candidate.basename != null);
    };

    Path.prototype.join = function() {
      var subpaths;
      subpaths = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      subpaths = subpaths.map(function(p) {
        if (Path.isPath(p)) {
          return p.path;
        } else {
          return p;
        }
      });
      return new Path(PATH.join.apply(PATH, [this.path].concat(__slice.call(subpaths))));
    };

    Path.prototype.toString = function() {
      return this.path;
    };

    Path.prototype.require = function() {
      return require(this.path);
    };

    Path.prototype.exists = function(callback) {
      return PATH.exists(this.path, callback);
    };

    Path.prototype.exists_sync = function() {
      return PATH.existsSync(this.path);
    };

    Path.prototype.create_read_stream = function() {
      return fs.createReadStream(this.path);
    };

    Path.prototype.create_write_stream = function() {
      return fs.createWriteStream(this.path);
    };

    Path.prototype.link = function(dest, callback) {
      return fs.link(this.path, (Path.isPath(dest) ? dest.path : dest), callback);
    };

    Path.prototype.link_sync = function(dest) {
      return fs.linkSync(this.path, (Path.isPath(dest) ? dest.path : dest));
    };

    Path.prototype.symlink = function(dest, type, callback) {
      return fs.symlink(this.path, (Path.isPath(dest) ? dest.path : dest), type, callback);
    };

    Path.prototype.symlink_sync = function(dest, type) {
      return fs.symlinkSync(this.path, (Path.isPath(dest) ? dest.path : dest), type);
    };

    Path.prototype.mkdir = function(mode, callback) {
      if (mode == null) {
        mode = 0x1ff;
      }
      return fs.mkdir(this.path, mode, callback);
    };

    Path.prototype.mkdir_sync = function(mode) {
      if (mode == null) {
        mode = 0x1ff;
      }
      return fs.mkdirSync(this.path, mode);
    };

    Path.prototype.mkdirp = function(mode, callback) {
      if (mode == null) {
        mode = 0x1ff;
      }
      return mkdirp.sync(this.path, mode, callback);
    };

    Path.prototype.mkdirp_sync = function(mode) {
      if (mode == null) {
        mode = 0x1ff;
      }
      return mkdirp.sync(this.path, mode);
    };

    Path.prototype.readdir = function(callback) {
      var _this = this;
      return fs.readdir(this.path, function(err, files) {
        if (err != null) {
          return callback(err);
        }
        return callback(err, files.map(function(f) {
          return _this.join(f);
        }));
      });
    };

    Path.prototype.readdir_sync = function() {
      var _this = this;
      return fs.readdirSync(this.path).map(function(f) {
        return _this.join(f);
      });
    };

    Path.prototype.readlink = function(callback) {
      return fs.readlink(this.path, callback);
    };

    Path.prototype.readlink_sync = function() {
      return fs.readlinkSync(this.path);
    };

    Path.prototype.realpath = function(cache, callback) {
      return fs.realpath(this.path, cache, callback);
    };

    Path.prototype.realpath_sync = function(cache) {
      return fs.realpathSync(this.path, cache);
    };

    Path.prototype.read_file = function(encoding, callback) {
      return fs.readFile(this.path, encoding, callback);
    };

    Path.prototype.read_file_sync = function(encoding) {
      return fs.readFileSync(this.path, encoding);
    };

    Path.prototype.stat = function(callback) {
      return fs.stat(this.path, callback);
    };

    Path.prototype.stat_sync = function() {
      return fs.statSync(this.path);
    };

    Path.prototype.write_file_sync = function(data, encoding) {
      return fs.writeFileSync(this.path, data, encoding);
    };

    Path.prototype.unlink = function(callback) {
      return fs.unlink(this.path, callback);
    };

    Path.prototype.unlink_sync = function() {
      return fs.unlinkSync(this.path);
    };

    Path.prototype.rm_rf = function(callback) {
      return rimraf(this.path, callback);
    };

    Path.prototype.rm_rf_sync = function() {
      return rimraf.sync(this.path);
    };

    Path.prototype.is_directory_empty = function(callback) {
      return this.readdir(function(err, files) {
        if ((err != null) && 'ENOENT' !== err.code) {
          return callback(err);
        }
        return callback(null, files.length === 0);
      });
    };

    Path.prototype.is_directory_empty_sync = function() {
      try {
        return this.readdir_sync().length === 0;
      } catch (e) {
        if ((e != null) && 'ENOENT' !== e.code) {
          throw e;
        }
      }
      return false;
    };

    Path.prototype.copy = function(to, callback) {
      var src;
      src = this;
      return src.exists(function(err, exists) {
        var dest;
        if (err != null) {
          return callback(err);
        }
        if (!exists) {
          return callback(new Error("File " + src + " does not exist."));
        }
        dest = Path.isPath(to) ? to : new Path(to);
        return dest.exists(function(err, exists) {
          var input, output;
          if (err != null) {
            return callback(err);
          }
          if (exists) {
            return callback(new Error("File " + to + " already exists."));
          }
          input = src.create_read_stream();
          output = dest.create_write_stream();
          return util.pump(input, output, callback);
        });
      });
    };

    Path.prototype.copy_sync = function(to) {
      var dest;
      if (!this.exists_sync()) {
        throw new Error("File " + this + " does not exist.");
      }
      dest = Path.isPath(to) ? to : new Path(to);
      if (dest.exists_sync()) {
        throw new Error("File " + to + " already exists.");
      }
      return dest.write_file_sync(this.read_file_sync());
    };

    Path.prototype.is_directory = function(callback) {
      return this.stat(function(err, stats) {
        return callback(err, stats != null ? stats.isDirectory() : null);
      });
    };

    Path.prototype.is_directory_sync = function() {
      return this.stat_sync().isDirectory();
    };

    Path.prototype.is_absolute = function() {
      return this.path[0] === '/';
    };

    Path.prototype.ls_sync = function(opts) {
      var ext, files, sub_files, _filter, _ref;
      if (opts == null) {
        opts = {};
      }
      if ((_ref = opts.filter) == null) {
        opts.filter = function() {
          return true;
        };
      }
      if (opts.extensions) {
        ext = _(opts.extensions).inject((function(o, e) {
          o[e] = 1;
          return o;
        }), {});
        _filter = opts.filter;
        opts.filter = function(p) {
          if (ext[p.extension] == null) {
            return false;
          }
          return _filter(p);
        };
        delete opts.extensions;
      }
      files = this.readdir_sync();
      if (opts.recursive) {
        sub_files = _.chain(files).collect(function(f) {
          if (f.is_directory_sync()) {
            return f.ls_sync(opts);
          }
        }).flatten().compact().value();
        Array.prototype.push.apply(files, sub_files);
      }
      return files.filter(opts.filter);
    };

    return Path;

  })();

  module.exports = function(path) {
    return new Path(path);
  };

  module.exports.Path = Path;

}).call(this);
