const path = require("path");
const XLSX = require("xlsx");

const Parser = require("./parser");

function readFile() {
    try {
        const fileName = "data.xlsx";
        const filePath = path.resolve(__dirname, fileName);

        let workbook = XLSX.readFile(filePath);
        let sheet = workbook.Sheets["sheet"];
        return XLSX.utils.sheet_to_json(sheet);

    } catch (error) {
        console.log("************ OKUMA HATA *************")
        console.log(error);
        console.log("************ OKUMA HATA *************")
    }
}

function writeFile(content, targetFileName = "result.xlsx") {
    try {
        let workbook = createWorkbook();

        let sheet = XLSX.utils.json_to_sheet(content);
        XLSX.utils.book_append_sheet(workbook, sheet, "Sheet");
        XLSX.writeFile(workbook, targetFileName, {
            type: 'file'
        });
    } catch (error) {
        console.log("************ YAZMA HATA *************");
        console.log(error);
        console.log("************ YAZMA HATA *************");
    }
};

function createWorkbook() {
    return XLSX.utils.book_new();
}

const result = readFile();

let parser = new Parser();

const getData = (vergiNo) => {
    return new Promise((resolve) => {
        parser.request(vergiNo)
            .then(data => {
                resolve(data);
            })
    })
}

result.map(async (bayi, i) => {
    let { vergiNo, ruhsatNo } = bayi;

    let j = 9;
    let _ruhsatNo = null;
    let testVergiNo;

    while (j!==0) {
        testVergiNo = `${vergiNo}${j}`;
        _ruhsatNo = await getData(testVergiNo);
        console.log(testVergiNo, (_ruhsatNo || "BULUNAMADI"));
        if (_ruhsatNo) break;
        --j;
    }

    if (_ruhsatNo) {
        if (_ruhsatNo == ruhsatNo) {
            result[i] = {
                ...bayi,
                tip: "Şahıs",
                yeniVergiNo: testVergiNo
            }
        } else {
            result[i] = {
                ...bayi,
                tip: "HATALI RUHSAT NO",
                yeniVergiNo: testVergiNo,
                dogruRuhsatNo: _ruhsatNo
            }
        };
        console.log("break..");
    } else {
        result[i] = {
            ...bayi,
            tip: "BULUNAMADI",
            yeniVergiNo: ""
        }
    }

    writeFile(result);
});

