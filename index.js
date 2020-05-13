const fs = require('fs');
const saxStream = require('sax').createStream(true, {
    lowercase: true,
    xmlns: true
});

const readStream = fs.createReadStream('./big.xml');
const writeStream = fs.createWriteStream('./result.json');

readStream.pipe(saxStream);

writeStream.write('[\n');

saxStream.on('opentag', node => {
    if (node.name === 'name') {
        isName = true;
    }
    if (node.name === 'inn') {
        isInn = true;
    }
    if (node.name === 'work') {
        isWorks = true;
    }
});

let isFirstElement = true;
let isName = false;
let isInn = false;
let name = '';
let inn = '';
let isWorks = false;
let works = [];

saxStream.on('text', node => {
    if (isName) {
        name = node;
    };
    if (isInn) {
        inn = node;
    }
    if (isWorks) {
        works.push(node);
    }
    isInn = false;
    isName = false;
    isWorks = false;
});

const findReprod = item => item.toLowerCase().includes('репрод');

saxStream.on('closetag', node => {
    if (node === 'licenses') {
        const isReprod = works.some(findReprod);
        if (name && inn && isReprod) {
            if (isFirstElement) {
                writeStream.write(
                    JSON.stringify({
                        "name": name,
                        "inn": inn
                    }, null, 2)
                );
                isFirstElement = false;
            }
            else {
                writeStream.write(',\n' +
                    JSON.stringify({
                        "name": name,
                        "inn": inn
                    }, null, 2)
                );
            }
            name = '';
            inn = '';
        }
        works = [];
    }
    if (node === 'licenses_list') {
        writeStream.end(']');
    }
});
