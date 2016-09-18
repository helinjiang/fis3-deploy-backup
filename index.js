'use strict';

/**
 * deploy 插件接口
 *
 * http://fis.baidu.com/fis3/api/index.html
 *
 * @param  {Object}   opts  插件配置
 * @param  {Object}   modified 修改了的文件列表（对应watch功能）
 * @param  {Object}   total    所有文件列表
 * @param  {Function} next     调用下一个插件
 * @return {undefined}
 */
var entry = module.exports = function (opts, modified, total, next) {

    total.filter(function (file) {
        return (opts.packDomain && file.domain && file.pack !== false)
            || file.pack;
    }).map(function (file) {
        return {
            subpath: opts.subpath(file),
            content: opts.content(file)
        };
    }).forEach(function (file) {
        fis.util.write(projectPath(opts.to, file.subpath), file.content);
    });

    next();
};

function projectPath() {
    return fis.project.getProjectPath(fis.util.apply(fis.util, arguments));
}

entry.options = {
    cdnPath: '',
    serverPath: '',
    packDomain: true, // 是否打包所有包含domain属性的文件

    // 文件在retry中的路径
    subpath: function (file) {
        return typeof file.pack === 'string' ? file.pack : fis.util(
            file.getHashRelease()
        );
    },

    // 文件内容
    content: function (file) {
        var inject = {
                version: Date.now()
            },
            fileContent = file.getContent() || '';

        if (!file._likes || !file._likes.isHtmlLike) {
            return fileContent;
        } else {
            if (this.cdnPath) {
                fileContent = fileContent.replace(
                    new RegExp(this.cdnPath, 'gi'),
                    this.serverPath
                );
            }

            fileContent = fileContent.replace(
                /(<script)/,
                '<script>var _retry = ' + JSON.stringify(inject) + '</script>$1'
            );

            return fileContent;
        }
    }
};

