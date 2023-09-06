import { Markup, Scenes } from "telegraf";
import {
  example,
  isValidProducts,
  makeProductsToSave,
  productsToShow,
  paginationProducts,
} from "./utils.js";
import { addProducts, getProducts } from "./controllers.js";
import { productsMenu } from "./keyboards.js";
import { keyboards } from "./commands.js";

// Gather product info
export const gatherProductWizard = new Scenes.WizardScene(
  "gather-product-info",
  async (ctx) => {
    await ctx.reply(
      `Mahsulotlar yoki mahsulot nomini shu ko'rinishda kiriting\n 1 tadan ko'p mahsulot qo'shish uchun - qo'yishni unutmang! \n ${example} `
    );
    ctx.wizard.state.data = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    let action = ctx.message.text;
    if (action == keyboards.back) {
      await ctx.scene.leave();
      return ctx.reply("Menu", productsMenu);
    }
    const isValidProductInfo = isValidProducts(ctx.message.text);
    if (!isValidProductInfo || isValidProductInfo == "Invalid input") {
      await ctx.reply("Invalid product info");
      ctx.wizard.selectStep(0);
      return;
    }
    ctx.wizard.state.data.products = ctx.message.text;
    await ctx.reply(
      "Mahsulotlarni to'g'ri kiritganingizni tasdiqlang!",
      Markup.keyboard(["Ha", "Yo'q"]).resize()
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (ctx.message.text == "Ha") {
      const productsToSave = makeProductsToSave(ctx.wizard.state.data.products);
      await addProducts(productsToSave);
      await ctx.reply("📔Mahsulotlar saqlandi", ctx.wizard.state.data.products);
    } else {
      return await ctx.scene.leave();
    }
    await ctx.reply(ctx.wizard.state.data.products);
    await ctx.reply("Menu", productsMenu);
    return ctx.scene.leave();
  }
);

// show products
let limit = 2,
  offset = 0,
  count = 1;
export const showProductWizard = new Scenes.WizardScene(
  "show-products",
  async (ctx) => {
    let action = ctx.message.text;
    ctx.sendChatAction("typing");
    const products = await getProducts(offset, limit);
    const result = productsToShow(products, count);
    const resKeyboards = paginationProducts(
      offset,
      products.length - offset > 0
    );

    if (action == keyboards.forward) {
      offset += limit - 1;
      count += limit;
      ctx.wizard.selectStep(0);
    }
    if (action == keyboards.back) {
      offset -= limit - 1;
      count -= limit;
      ctx.wizard.selectStep(0);
    }
    if (action == keyboards.menu) {
      await ctx.scene.leave();
      return ctx.reply("Menu", productsMenu);
    }
    await ctx.reply(result, resKeyboards);
    return ctx.wizard.selectStep(0);
  }
);
