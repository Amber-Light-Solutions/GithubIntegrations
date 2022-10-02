const fs = require('fs');

var testFolder = '../releases/{version}/docs/';
var version = 'latest';

process.argv.forEach(function (val, index, array) {
    if (index == 2) {
        console.log('Version argument given, will generate test documents for: ' + val)
        version = val;
    }
});

testFolder = testFolder.replace("{version}", version);

if (fs.existsSync(testFolder)) {
    var mdpdf = require('mdpdf');
    var path = require('path');

    var options = {
        source: path.join(__dirname, '../../releases/' + version + '/docs/<ProjectName> - ' + version + ' - pre-shipment-tests.md'),
        destination: path.join(__dirname, '../../releases/' + version + '/docs/<ProjectName> - ' + version + ' - pre-shipment-tests.pdf'),
        styles: path.join(__dirname, 'doc-styles.css'),
        ghStyle: true,
        defaultStyle: true,
        footer: path.join(__dirname, 'footer.html'),
        header: path.join(__dirname, 'header.html'),
        pdf: {
            format: 'A4',
            quality: '100',
            header: {
                height: '20mm',
            },
            footer: {
                height: '20mm',
            },
            border: {
                top: '0mm',
                left: '20mm',
                bottom: '0mm',
                right: '20mm',
            },
        },
    };

    if (fs.existsSync(options.footer)) {
        console.log('footer exists, delete');
        fs.unlink('./scripts/footer.html', (err) => {
            if (err) throw err;
        });
    }

    if (fs.existsSync(options.header)) {
        console.log('header exists, delete');
        fs.unlink('./scripts/header.html', (err) => {
            if (err) throw err;
        });
    }

    fs.appendFile('./scripts/footer.html', '<center class="footer">\n' +
        '    <hr>\n' +
        '    <span id="version" class="footer-left"><ProjectName> ' + version + '</span>\n' +
        '    <span class="footer-centre">Internal Use Only</span>\n' +
        '</center>', function (err) {
        if (err) throw err;
    });

    fs.appendFile('./scripts/header.html', '<center class="header">\n' +
        '    <span class="header-left"><CompanyName></span>\n' +
        '    <span class="header-right"><ProjectName> Test Script ' + version + '</span>\n' +
        '    <br><hr>\n' +
        '</center>', function (err) {
        if (err) throw err;
    });

    var list = [];
    fs.readdirSync(testFolder).forEach(file => {
        if(!file.toString().includes('pre-shipment') && !file.toString().includes('.png')){
            list.push(file);
        }
    });
    if(list.length > 0){
        list.forEach(file => {
            var fullname = '../releases/' + version + '/docs/'+ file;
            var data = fs.readFileSync(fullname, 'utf8');
            fs.appendFileSync('../releases/' + version + '/docs/<ProjectName> - ' + version + ' - pre-shipment-tests.md', data);
            }
        );
    }

    console.log('Converting test script from markdown to PDF...');
    mdpdf.convert(options).then(() => {
        console.log('Done.');
    })
    .catch((err) => {
        console.error(err);
    });
} else {
    console.log('No folder "' + testFolder + '" exists. Will not build a test script.');
}
