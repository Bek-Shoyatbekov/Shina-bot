import { Markup } from "telegraf";
import { keyboards } from "./commands.js";

export const mainMenu = Markup.keyboard([
  [keyboards.money, keyboards.product],
]).resize();

export const dollarKursi = Markup.keyboard([
  [keyboards.edit, keyboards.back],
]).resize();

export const productsMenu = Markup.keyboard([
  [keyboards.add, keyboards.see],
  [keyboards.edit, keyboards.back],
]).resize();


