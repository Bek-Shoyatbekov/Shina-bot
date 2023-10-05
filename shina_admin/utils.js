import { Markup } from "telegraf";
import { keyboards } from "./commands.js";

export const makeListProducts = (products) => {
  let stringProducts = "";
  for (let i = 0; i < products.length; i++) {
    stringProducts += ` ${i} : ${products[i].company}, ${products[i].full_name} \n`;
  }
  return stringProducts;
};

// giving new product info example
export const example = `
tuliq_nomi: String,\n
narxi : Number,\n
foiz_3oy: Number,\n
foiz_6oy: Number,\n
foiz_9oy: Number,\n
soni: Number,\n
kompaniyasi: String,\n
naqtga: Number,\n
diameter: String,\n
ulcham: Number,\n
eni: Number,\n`;

export function makeProductsToSave(products) {
  let arr = [];
  products = products.split("-");
  for (let i of products) {
    let product = i.replaceAll("\n", "").split(",");
    let obj = {};
    for (let j in product) {
      obj[product[j].split(":")[0]] = product[j].split(":")[1];
      if (!obj[product[j].split(":")[0]]) {
        delete obj[product[j].split(":")[0]];
      }
    }
    arr.push(obj);
  }
  return arr;
}

// makeProductsToSave(`
// full_name: String,

// price_usd: Number,

// percent_3m: Number,

// percent_6m: Number,

// percent_9m: Number,

// quantity: Number,

// company: String,

// percent_cash: Number,

// diameter: String,

// size: Number,

// width: Number
// -
// full_name: 2,

// price_usd: Number,

// percent_3m: Number,

// percent_6m: Number,

// percent_9m: Number,

// quantity: Number,

// company: String,

// percent_cash: Number,

// diameter: String,

// size: Number,

// width: Number`);

const requiredProductInfo = [
  "tuliq_nomi",

  "narxi",

  "foiz_3oy",

  "foiz_6oy",

  "foiz_9oy",

  "soni",

  "kompaniyasi",

  "naqtga",

  "diameter",

  "ulcham",

  "eni",
];
export function isValidProducts(products) {
  if (products.length == 0) {
    return "Invalid input";
  }
  for (let i of requiredProductInfo) {
    if (!products.includes(i)) {
      return false;
    }
  }
  return true;
}

export function productsToShow(products, count) {
  let str = "";
  for (let i = 0; i < products.length; i++) {
    str += `${count}. Full Name :${products[i].full_name}
    Narxi: ${products[i].price_usd}
    3 oy uchun:${products[i].percent_3m},
    6 oy uchun:${products[i].percent_6m},
    9 oy uchun:${products[i].percent_9m},
    Soni:${products[i].quantity}
    Kompaniyasi:${products[i].company}
    diametr:${products[i].diameter}
    o'lchami:${products[i].size}\n\n`;
    count++;
  }
  return str;
}

export function makeProductsKeyboard(from, to) {
  let keyboard = [],
    arr = [],
    count = 0;
  for (let i = Number(from); i <= to; i++) {
    if (count < 4) {
      arr.push(`${i}`);
      count++;
    } else {
      keyboard.push(arr);
      arr = [];
      count = 0;
    }
  }
  return keyboard;
}

export const paginationProducts = (offset, next) => {
  let arr = [keyboards.menu];
  if (offset > 1) {
    arr.push(keyboards.back);
  }
  if (next) {
    arr.push(keyboards.forward);
  }

  return Markup.keyboard([arr]).resize();
};

export function getPagination(current, maxpage) {
  var keys = [];
  if (current > 1) keys.push({ text: `«1`, callback_data: "1" });
  if (current > 2)
    keys.push({
      text: `‹${current - 1}`,
      callback_data: (current - 1).toString(),
    });
  keys.push({ text: `-${current}-`, callback_data: current.toString() });
  if (current < maxpage - 1)
    keys.push({
      text: `${current + 1}›`,
      callback_data: (current + 1).toString(),
    });
  if (current < maxpage)
    keys.push({ text: `${maxpage}»`, callback_data: maxpage.toString() });

  return {
    reply_markup: JSON.stringify({
      inline_keyboard: [keys],
    }),
  };
}

export const makeButtons = (choiceButtons) => {
  return Markup.inlineKeyboard([
    ...choiceButtons,
    [
      Markup.button.callback("Prev", "prev"),
      Markup.button.callback("Next", "next"),
    ],
  ]);
};


export function createButtons(page, totalItems, limit) {

  const isFirstPage = page === 0
  const isLastPage = page === Math.ceil(totalItems / limit) - 1

  return Markup.inlineKeyboard([
    Markup.button.callback(!isFirstPage ? '<<' : ' ', 'prev'),
    Markup.button.callback(!isLastPage ? '>>' : ' ', 'next')
  ])

}

export function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) })
    .fill(0)
    .map(() => arr.splice(0, size));
}
