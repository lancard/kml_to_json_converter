const { XMLParser } = require("fast-xml-parser");
const fs = require('fs');

const xml = fs.readFileSync(process.argv[2]).toString();

const parser = new XMLParser();
const rootObj = parser.parse(xml);

function convertDecimalToMinutes(a, sign) {
    function leadingZeros(n, digits) {
        var zero = '';
        n = n.toString();

        if (n.length < digits) {
            for (var i = 0; i < digits - n.length; i++)
                zero += '0';
        }
        return zero + n;
    }

    var result = sign[0];

    if (a < 0) {
        result = sign[1];
        a = -a;
    }

    var rr;
    var remain = a;

    rr = Math.floor(remain);
    result += leadingZeros(rr, 3);
    remain = remain - rr;

    remain *= 60;
    rr = Math.floor(remain);
    result += "." + leadingZeros(rr, 2);
    remain = remain - rr;


    remain *= 60;
    rr = Math.floor(remain);
    result += "." + leadingZeros(rr, 2);
    remain = remain - rr;

    remain *= 1000;
    rr = Math.floor(remain);
    result += "." + leadingZeros(rr, 3);

    return result;
}

function convertCoordinate(obj) {
    if (Array.isArray(obj)) {
        obj.forEach(e => convertCoordinate(e));
        return;
    }
    if (typeof (obj) == 'object') {
        for (var e in obj) {
            if (e == 'latitude') {
                obj[e] = convertDecimalToMinutes(obj[e], "NS");
                continue;
            }
            if (e == 'longitude') {
                obj[e] = convertDecimalToMinutes(obj[e], "EW");
                continue;
            }
            if (e == 'coordinates') {
                var coords = obj[e].split("\n");
                var ret = [];
                coords.forEach(f => {
                    var arr = f.split(",");
                    var lng = convertDecimalToMinutes(arr[0], "EW");
                    var lat = convertDecimalToMinutes(arr[1], "NS");
                    arr[0] = lat;
                    arr[1] = lng;
                    ret.push(arr.join(","));
                });
                obj[e] = ret.join("\n");
                continue;
            }
            convertCoordinate(obj[e]);
        }
    }
}

convertCoordinate(rootObj);

console.log(JSON.stringify(rootObj, null, '\t'));