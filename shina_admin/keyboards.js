import { Markup } from "telegraf";
import { keyboards } from "./commands.js";

export const mainMenu = Markup.keyboard([
  [keyboards.money, keyboards.product],
]).resize();

export const concurrencyMenu = Markup.keyboard([
  [keyboards.edit, keyboards.back],
]).resize();

export const productsMenu = Markup.inlineKeyboard([
  [
    Markup.button.callback(keyboards.add, keyboards.add),
    Markup.button.callback(keyboards.see, keyboards.see),
    // Markup.button.callback(keyboards.edit, keyboards.edit)
  ]
])
