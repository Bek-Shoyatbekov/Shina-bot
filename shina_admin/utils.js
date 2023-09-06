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
full_name: String,\n
price_usd: Number,\n
percent_3m: Number,\n
percent_6m: Number,\n
percent_9m: Number,\n
quantity: Number,\n
company: String,\n
percent_cash: Number,\n
diameter: String,\n
size: Number,\n
width: Number,\n`;

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

makeProductsToSave(`
full_name: String,

price_usd: Number,

percent_3m: Number,

percent_6m: Number,

percent_9m: Number,

quantity: Number,

company: String,

percent_cash: Number,

diameter: String,

size: Number,

width: Number
-
full_name: 2,

price_usd: Number,

percent_3m: Number,

percent_6m: Number,

percent_9m: Number,

quantity: Number,

company: String,

percent_cash: Number,

diameter: String,

size: Number,

width: Number`);

const requiredProductInfo = [
  "full_name",

  "price_usd",

  "percent_3m",

  "percent_6m",

  "percent_9m",

  "quantity",

  "company",

  "percent_cash",

  "diameter",

  "size",

  "width",
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
  if (offset > 0) {
    arr.push(keyboards.back);
  }
  if (next) {
    arr.push(keyboards.forward);
  }

  return Markup.keyboard([arr]).resize();
};
