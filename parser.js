const rq = require("request-promise");
const cheerio = require("cheerio");
// const TOKENS = require("./tokens");

const DEFAULT_URL = "http://212.174.130.210/NewTapdk/ViewApp/sorgu.aspx";

const setPayload = (formParams = {
    TXT_SICIL: "%PT%",
    dd_tarih: 0,
    dd_islem: 0
}) => ({
    uri: DEFAULT_URL,
    method: "POST",
    // headers: {
    //     Connection: "keep-alive",
    //     "Accept-Encoding": "gzip, deflate, br",
    //     "Content-Type": "application/json"
    // },
    form: {},
    encoding: "latin1"
});

class Request {
    constructor(formParams) {
        this.options = setPayload(formParams);
        this.formParams = formParams || {};
        // this.result = this.request();
    }

	/**
	 *  Get external source and handle statusCode
	 */
    async request(vergiNo) {
        try {
            // Send request and get first enctryipted Base64 value's
            let { __EVENTVALIDATION, __VIEWSTATE } = await rq({
                resolveWithFullResponse: true,
                ...this.options,
                transform: this.getStates
            });

            // Put states to the request form
            this.options.form = Object.assign({}, this.options.form, {
                __VIEWSTATE: __VIEWSTATE,
                __EVENTVALIDATION: __EVENTVALIDATION,
                TXT_TCK : vergiNo,
                ...Object.assign({}, this.setForm(), this.formParams),
                DropDownList_CountViewGrid: 100
            });

            // Send request and get last enctryipted Base64 value's
            // ({ __VIEWSTATE, __EVENTVALIDATION } = await rq({
            // 	resolveWithFullResponse: true,
            // 	...this.options,
            // 	transform: this.getStates
            // }));

            // // Put states to the request form
            // this.options.form = {
            // 	__VIEWSTATE: __VIEWSTATE,
            // 	__EVENTVALIDATION: __EVENTVALIDATION,
            // 	DropDownList_CountViewGrid: 100,
            // 	__EVENTTARGET: "Button_Print"
            // };
            // this.options.encoding = null;
            // Send request and get file string
            return await rq({
                // resolveWithFullResponse: true,
                ...this.options,
                transform: function(body){
                    let $ = cheerio.load(body);
                    let ruhsatContainer = $("#GridView1").find("tbody").find("tr").find("span");
                    if(ruhsatContainer.length > 0) return ruhsatContainer.html();
                },
            });
        } catch (error) {
            // return this.handleError(error);
            return false;
        }
    }

    setForm() {
        return {
            TXT_SICIL: "%PT%",
            dd_tarih: 0,
            dd_islem: 0
        };
    }

	/**
	 *  Handle Error with statusCode
	 */
    handleError(error) {
        return {
            statusCode: error.statusCode,
            body: error
        };
    }

	/**
	 * Load DOM
	 * @param {string} contentString
	 */
    getStates(body) {
        let $ = cheerio.load(body);

        let __VIEWSTATE = $("#__VIEWSTATE").attr("value");
        let __EVENTVALIDATION = $("#__EVENTVALIDATION").attr("value");

        return { __VIEWSTATE, __EVENTVALIDATION };
    }
}

module.exports = Request;