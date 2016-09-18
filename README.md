# fis3-deploy-backup
fis3 备份文件的插件

# 原理
大部分时候我们的js、css和图片等资源是在CDN上的，但如果CDN地址被劫持或者DNS解析有问题，则会导致资源加载失败。这时候，需要将资源的地址切换回主域地址。


# Usage

```js
// fis-conf.js
fis.match('*.html', {
        deploy: [
            fis.plugin('backup', {
                cdnPath: 'your cdnUrl',
                serverPath: 'your serverUrl',
                to: 'your backup dir'
            })
        ]
    });
```

# Options

```js
entry.defaultOptions = {
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
}
```

