'use strict';

var path = require('path'),
    fs = require('fs'),
    noop = new Function();

var entry = module.exports = function(opts, modified, total, next) {

    total.filter(function(file) {
        return (opts.packDomain && file.domain && file.pack !== false)
            || file.pack;
    }).map(function(file) {
        return {
            subpath: opts.subpath(file),
            content: opts.content(file)
        };
    }).forEach(function(file) {
        fis.util.write(projectPath(opts.savePath, file.subpath), file.content);
    });

    next();

    // TODO 使用增量打包，放到next()之前
    // 生成zip文件应该在所有文件写入tmp文件夹之后
    // pack(opts.type, projectPath(opts.tmp), projectPath(opts.to));
};

function projectPath() {
    return fis.project.getProjectPath(fis.util.apply(fis.util, arguments));
}


// var pack = function(type, dir, output) {
//     var archive = archiver(type)
//         .bulk([{
//             expand: true,
//             cwd: dir,
//             src: ['**', '!' + output.replace(dir, '').replace(/^\//, '')]
//         }])
//         .on('error', function() {
//             fis.log.error('zip failed: ' + output);
//         });
//
//     fis.util.mkdir(path.dirname(output));
//     archive.pipe(fs.createWriteStream(output));
//     archive.finalize();
//
//     // TODO 增量打包时remove
//     pack = noop;
// };

entry.options = {
    savePath:'../public/webserver/retry/',
    packDomain: true, // 是否打包所有包含domain属性的文件

    // 文件在压缩包中的路径
    subpath: function(file) {
        return typeof file.pack === 'string' ? file.pack : fis.util(
            // (file.domain || '').replace(/^http:\/\//i, ''),
            file.getHashRelease()
        );
    },

    // 文件内容
    content: function(file) {
        var inject = {
            version: Date.now()
        };
        return !file. _likes || !file. _likes.isHtmlLike
            ? file.getContent()
            : (file.getContent() || '').replace(
            /(<script)/,
            '<script>var pack = ' + JSON.stringify(inject) + '</script>$1'
        );
    }
};

