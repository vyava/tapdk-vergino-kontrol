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
    if (i < 5) {
        let { vergiNo, ruhsatNo } = bayi;

        for(let lastNumber = 0;i<10;i++){
            let testVergiNo = vergiNo + lastNumber.toString();

            let _ruhsatNo = await parser.request(testVergiNo.trim());
            if (_ruhsatNo) {
                if (_ruhsatNo == ruhsatNo) {
                    result[i] = { ...bayi, tip: "Şahıs" }
                    console.log("Doğru")
                } else {
                    result[i]['tip'] = "HATALI RUHSAT NO"
                    console.log("Yanlış")
                }
            } else {
                result[i]['tip'] = "Tüzel"
                console.log("Sonuç bulunamadı")
            }
        }
    }
    
    writeFile(result);
})




// (async function(){
//     let res = await parser.request("2571469552");
//     console.log(res)
// })()
