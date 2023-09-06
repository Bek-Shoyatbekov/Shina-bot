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
    const keyboards = paginationProducts(offset, products.length - offset > 0);

    if (action == "▶️") {
      offset += limit - 1;
      count += limit;

      await ctx.wizard.selectStep(0);
    }
    if (action == "◀️") {
      offset -= limit - 1;
      count -= limit;

      await ctx.wizard.selectStep(0);
    }
    if (action == "Bosh menuga qaytish") {
      return ctx.scene.leave();
    }
    await ctx.reply(result, keyboards);
    return ctx.wizard.selectStep(0);
  }
  //   ,
  //   (ctx) => {}
);
