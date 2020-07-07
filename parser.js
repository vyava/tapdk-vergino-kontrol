const rq = require("request-promise");
const cheerio = require("cheerio");
// const TOKENS = require("./tokens");

const DEFAULT_URL = "http://212.174.130.210/NewTapdk/ViewApp/sorgu.aspx";

class Request {
    constructor() {}

	/**
	 *  Get external source and handle statusCode
	 */
    async request(vergiNo) {
        try {

            let options = {
                uri: DEFAULT_URL,
                method: "POST",
                form: {},
                encoding: "latin1"
            }

            // Send request and get first enctryipted Base64 value's
            let { __EVENTVALIDATION, __VIEWSTATE } = await rq({
                resolveWithFullResponse: true,
                ...options,
                transform: this.getStates
            });

            // Put states to the request form
            options.form = Object.assign({}, options.form, {
                __VIEWSTATE: __VIEWSTATE,
                __EVENTVALIDATION: __EVENTVALIDATION,
                TXT_TCK: vergiNo,
                TXT_SICIL: "%PT%",
                dd_islem : 0,
                DropDownList_CountViewGrid: 100
            });

            // Send request and get file string
            return await rq({
                // resolveWithFullResponse: true,
                ...options,
                transform: function (body) {
                    let $ = cheerio.load(body);
                    let ruhsatContainer = $("#GridView1").find("tbody").find("tr").find("span");
                    if (ruhsatContainer.length > 0) return ruhsatContainer.html();
                },
            });
        } catch (error) {
            // return this.handleError(error);
            return false;
        }
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