'use strict';

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const ejs = require('ejs');

const FILE_TYPE = Object.freeze({
    File:'File',
    Directory:'Directory',
    BlockDevice:'BlockDevice',
    CharacterDevice:'CharacterDevice',
    SymbolicLink:'SymbolicLink',
    FIFO:'FIFO',
    Socket: 'Socket',
    Unknown:'Unknown' 
});

class Helper {

    static getFileType(stats) {
        if (stats.isFile()) return FILE_TYPE.File;
        if (stats.isDirectory()) return FILE_TYPE.Directory;
        if (stats.isBlockDevice()) return FILE_TYPE.BlockDevice;
        if (stats.isCharacterDevice()) return FILE_TYPE.CharacterDevice;
        if (stats.isSymbolicLink()) return FILE_TYPE.SymbolicLink;
        if (stats.isFIFO()) return FILE_TYPE.FIFO;
        if (stats.isSocket()) return FILE_TYPE.Socket;
        return FILE_TYPE.Unknown;
    }

    static createFoldersSync(from, to) {
        from = path.resolve(from);
        to = path.resolve(to);
        
        fs.mkdirSync(to);
        
        fs.readdirSync(from)
            .map(file => {
                return path.join(from, file);
            })
            .filter(file => {
                return fs.lstatSync(file).isDirectory();
            })
            .map(file => {
                const dir = path.join(to, file.substring(from.length));
                Helper.createFoldersSync(file, dir);
            })            
    }

    static getAllFiles(folder, iterator) {
        folder = path.resolve(folder);
        fs.readdirAsync(folder)
            .then(files => {
                return Promise.all(
                    files.map(file => {
                        file = path.join(folder, file);
                        return fs.lstatAsync(file)
                            .then(stats => {
                                return Promise.resolve({
                                    file: file,
                                    type: Helper.getFileType(stats)
                                });
                            })
                    })
                )
            })
            .then(info => {
                info.forEach(item => {
                    iterator(item.type, item.file);
                });
                return info;
            })
            .then(info => {
                info
                    .filter(item => {
                        return item.type === FILE_TYPE.Directory;
                    })
                    .map(item => {
                        return item.file
                    })
                    .map(file => {
                        Helper.getAllFiles(file, iterator);
                    })
            })
            .catch(ex => {
                console.log(ex);
            })
        ;
    }

    static Copy(from, to, options) {
        from = path.resolve(from);
        to = path.resolve(to);

        Helper.getAllFiles(from, (type, file) => {
            if (type === FILE_TYPE.File) {
                fs.readFileAsync(file, 'utf8')
                .then(src => {
                    const result = ejs.render(src, options);
                    fs.writeFileSync(path.join(to, file.substring(from.length)), result, 'utf-8');
                    })
                    .catch(ex => {
                        console.log(ex);
                    })
            }
        });
    }

    static getPath(path) {

        if(path[path.length - 1] !== '/') {
            path += '/';
        }

        return path;
    }
}

module.exports = Helper;
