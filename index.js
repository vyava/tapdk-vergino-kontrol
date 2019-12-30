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


result.map(async (bayi, i) => {
    if (i < 1) {
        let { vergiNo, ruhsatNo } = bayi;


        // let req = iterator(vergiNo);

        let i = 9;
        let data = await new Promise((resolve, reject) => {
            while (i != 0) {
                let testVergiNo = `${vergiNo}${i}`;
                parser.request(testVergiNo)
                    .then(res => {
                        if(res){
                            resolve({
                                vergiNo : testVergiNo,
                                ruhsatNo : res
                            });
                        }
                    })
                i--;
            }
        });

        console.log(data)

        if (data) {
            if (data.ruhsatNo == ruhsatNo) {
                result[i] = { ...bayi, tip: "Şahıs", vergiNo : data.vergiNo}
            } else {
                result[i]['tip'] = "HATALI RUHSAT NO"
            };
            console.log("break..");
        } else {
            result[i]['tip'] = "Tüzel";
            console.log("Bulunamadı");
        }
    };
    writeFile(result);
});