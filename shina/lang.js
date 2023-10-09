import { regionsRU, regionsUZ } from './data/regions.js';
import { createUserHistory, getUserHistory, deleteUserHistory, updateAction, newData, updAndNewData, getByKey, getUserLang, getUserAction } from './useractions.js';
import { createDocument, allProducts, getByField, findDocument, updateDocument, deleteDocument, getUSDRate } from './mongo.js';
import axios from 'axios'
import { logger } from './utils.js';

class ChosenLanguage {
    constructor(lang) {
        this.language = lang || "uz";
        this.isUzbek = lang == "uz";
    }

    setLanguage(language) {
        this.language = language;
    }

    getLanguage() {
        return this.language;
    }
    greetingContactText(name) {
        if (this.isUzbek) {
            return `\nBotga xush kelibsiz, ${name}! \n\n Iltimos, raqamingizni kiriting:`;
        } else {
            return `\nДобро пожаловать в бот, ${name}! \n\n Пожалуйста, введите свой номер телефона:`;
        }
    }
    contactButtonText() {
        return this.isUzbek ? "📱 Telefon raqamni yuborish" : "📱 Отправить номер телефона";
    }
    regionText() {
        return this.isUzbek ? "Hududni tanlang:" : "Выберите регион:";
    }
    regions() {
        return this.isUzbek ? regionsUZ : regionsRU;
    }
    tireORaccessoriesText() {
        return this.isUzbek ? "Avtoshinalar yoki avtoaksessuarlar" : "Шины или автоаксессуары";
    }
    tireORaccessoriesButtons() {
        return this.isUzbek ? ["Avtoshinalar", "Avtoaksessuarlar"] : ["Шины", "Автоаксессуары"];
    }
    tireSeasonText() {
        return this.isUzbek ? "Iltimos, shina mavsumiy turi tanlang:" : "Пожалуйста, выберите сезонs:";
    }
    tireSeasonButtons() {
        return this.isUzbek ? ["Yozgi", "Qishgi", "Doimiy"] : ["Летние", "Зимние", "Всесезонные"];
    }
    companiesText() {
        return this.isUzbek ? "Iltimos, brendni tanlang:" : "Пожалуйста, выберите бренд:";
    }
    async companiesButtons() {
        let products = await allProducts();
        let companiesList = [];
        for (let i in products) {
            companiesList.push(products[i].company);
        }
        return this.divideArrayN(companiesList, 3);
    }
    diametersOfTiresText() {
        return this.isUzbek ? "Avtoshina shinasi diametrini tanlang:" : "Выберите диаметр шины:";
    }
    async diameterButtons(company) {
        let products = await allProducts();
        let diametersList = [];
        for (let i in products) {
            diametersList.push(products[i].diameter);
        }
        let availableDiameters = this.makeUnique(diametersList).sort();
        // console.log(availableDiameters);
        // let diameters = ["R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21", "R22"];
        return this.divideArray(availableDiameters);
    }
    sizesOfTiresText() {
        return this.isUzbek ? "Avtoshina o'lchamini tanlang:" : "Выберите размер шины:";
    }
    async sizesOfTiresButtons(diameter, id) {
        let company = getByKey(id, "company");
        let availableSizes = await findDocument({ diameter: diameter, company: company });
        // get all width and size values, make them unique and sort them "size/width"
        availableSizes = availableSizes.map(item => item.size + "/" + item.width).sort();
        let widths = [
            '175/70', '165/70',
            '185/70', '185/65',
            '205/70', '215/70',
            '195/60', '195/65',
            '205/65', '205/55',
            '205/45', '235/55',
            '225/60'
        ];

        return this.divideArrayN(availableSizes, 3);
    }
    tireBrandsText() {
        return this.isUzbek ? "Avtoshina brendini tanlang:" : "Выберите бренд шины:";
    }
    async resultsText(id) {
        let getUser = await getUserHistory(id)[0]
        let params = {
            diameter: getUser.diameter,
            size: getUser.width.split("/")[0],
            width: getUser.width.split("/")[1],
            company: getUser.company,
        }
        let res = await findDocument(params);
        newData(id, "chosenProduct", res[0]);
        return this.createPost(res[0], id);
    }
    paymentMethodsText() {
        return this.isUzbek ? "To'lov usulini tanlang:" : "Выберите способ оплаты:";
    }
    // a function that divides an array every 3 elements
    divideArray(array) {
        let dividedArray = [];
        for (let i = 0; i < array.length; i += 3) {
            dividedArray.push(array.slice(i, i + 3));
        }
        return dividedArray;
    }
    divideArrayN(array, n) {
        let dividedArray = [];
        for (let i = 0; i < array.length; i += n) {
            dividedArray.push(array.slice(i, i + n));
        }
        return dividedArray;
    }
    makeUnique(array) {
        return [...new Set(array)];
    }
    addPercentToPrice(price, percent) {
        return price + price * percent / 100;
    }
    // a function that gets numbers and returns a string with a space between them every 3 digits from the end, start from dot
    addSpaceToNumber(number) {
        let numberString = number.toString();
        let numberArray = numberString.split("");
        let dotIndex = numberArray.indexOf(".");
        let counter = 0;
        for (let i = dotIndex - 1; i >= 0; i--) {
            counter++;
            if (counter % 3 === 0) {
                numberArray.splice(i, 0, " ");
            }
        }
        return numberArray.join("");
    }
    async createPost(obj, userID) {
        const rateUSD = await getUSDRate();
        const season = getByKey(userID, "tireSeason");
        return {
            postText: `
            #${obj.id_product}
<b>${this.isUzbek ? "Brend" : "Бренд"}: </b> ${obj.full_model}
<b>${this.isUzbek ? "Mavsum" : "Сезон"}: </b> ${season}
<b>${this.isUzbek ? "O'lcham" : "Размер"}: </b>${obj.size}/${obj.width} ${obj.diameter}
<b>${this.isUzbek ? "Narxi" : "Цена"} </b> ${Math.round(this.addPercentToPrice(obj.price_usd, obj.percent_cash) * rateUSD)} UZS
            `,
            postPhoto: 'https://danthetireman.com/media/catalog/product/cache/81a0d5908f2df9b49a6f22c63d8da6df/2/0/2001405.jpg',
            postInlineKeyboard: [
                [
                    {
                        text: "📝 Buyurtma berish",
                        callback_data: "buy"
                    },
                    {
                        text: "Bo'lib to'lash",
                        callback_data: "pay_installment"
                    }
                ],
                [
                    {
                        text: "🔙 Boshga qaytish",
                        callback_data: "back"
                    }
                ]
            ]
        }
    }
    wannaBuy(id, paymentType) {
        this.sendGroup(id, paymentType)
        return this.isUzbek ? "Buyurtmangiz qabul qilindi. Siz bilan operatorlarimiz 10 daqiqa ichida aloqaga chiqishadi" : "Ваш заказ принят. Наши операторы свяжутся с Вами в течении 10 минут."
    }
    sendGroup(id, typePayment) {
        let user = getUserHistory(id)[0];
        let txt = `${user.chosenProduct.full_name} ${user.chosenProduct.id_product}` + "\n" + `
To'lov turi: ${typePayment}` + "\n" + `
Ism: ${user.name}` + "\n" + `
Nomer: +${user.phone}` + "\n" + `
Telegram: [${user.name}](tg://user?id=${user.userID})` + "\n" + `
Region: ${user.region}` + "\n" + `
Til: ${user.lang}
        `;
        let params = {
            params: {
                chat_id: -1001574980631,
                parse_mode: "Markdown",
                text: txt
            }
        }
        console.log("https://api.telegram.org/bot5829231004:AAFR8_FwJd7W4YQtnKFqa6AoT244q6H-s8g/sendMessage?chat_id=-1001574980631&parse_mode=Markdown&text=" + txt)
        axios.get("https://api.telegram.org/bot5829231004:AAFR8_FwJd7W4YQtnKFqa6AoT244q6H-s8g/sendMessage", params)
    }
    async creditOptionsText(id) {
        const rateUSD = await getUSDRate();
        let getUser = await getUserHistory(id)[0];
        let params = {
            diameter: getUser.diameter,
            ulcham: Number(getUser.width.split("/")[0]),
            eni: Number(getUser.width.split("/")[1]),
            kompaniyasi: getUser.company,
        }
        let res = await findDocument(params);
        let price_3 = (this.addPercentToPrice(res[0].narxi, res[0].foiz_3oy) * rateUSD);
        let price_6 = (this.addPercentToPrice(res[0].narxi, res[0].foiz_6oy) * rateUSD);
        let price_9 = (this.addPercentToPrice(res[0].narxi, res[0].foiz_9oy) * rateUSD);
        let price_3per = price_3 / 3;
        let price_6per = price_3 / 6;
        let price_9per = price_3 / 9;
        let txtuz = `
        Bo'lib to'lash narxlari:\n
3 oyga: <b>${price_3per}</b> so'm x 3 = <b>${price_3}</b>  so'm\n
6 oyga: <b>${price_6per}</b>  so'm x 6 = <b>${price_6}</b>  so'm\n
9 oyga: <b>${price_9per}</b>  so'm x 9 = <b>${price_9}</b>  so'm
        `;
        return txtuz;
    }
    creditButtons() {
        return [
            [
                {
                    text: "3 oy",
                    callback_data: "installment_3"
                },
                {
                    text: "6 oy",
                    callback_data: "installment_6"
                },
                {
                    text: "9 oy",
                    callback_data: "installment_9"
                }
            ]
        ]
    }
}

export default ChosenLanguage;