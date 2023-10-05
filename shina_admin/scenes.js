import { Telegraf, Markup, session, Scenes, Composer } from "telegraf";
import {
  createButtons,
  example,
  isValidProducts,
  makeProductsToSave,
} from "./utils.js";
import {
  addProducts,
  getAllProducts,
  getUSDRate,
  setUSDRate,
} from "./controllers.js";
import { concurrencyMenu } from "./keyboards.js";
import { keyboards } from "./commands.js";

// Gather product info
export const gatherProductWizard = new Scenes.WizardScene(
  "gather-product-info",
  async (ctx) => {
    ctx.wizard.state.data = {};
    return ctx.wizard.next();
  },
);


gatherProductWizard.hears(`${keyboards.back}`, async (ctx) => {
  await ctx.scene.leave();
  ctx.reply("Asosiy menu", {
    reply_markup: {
      remove_keyboard: true
    }
  })
})

gatherProductWizard.on("message", async (ctx) => {
  const msg = ctx.message.text.trim();
  if (msg.startsWith("/yangi_shina")) {
    await ctx.reply(
      `Mahsulotlar yoki mahsulot nomini shu ko'rinishda kiriting\n 1 tadan ko'p mahsulot qo'shish uchun - qo'yishni unutmang! \n ${example} `
      , Markup.keyboard([keyboards.back]).resize());
  }
  try {
    if (msg.startsWith("tuliq_nomi")) {
      const isValidProductInfo = isValidProducts(msg);
      while (true) {
        if (!isValidProductInfo || isValidProductInfo == "Invalid input") {
          await ctx.reply("Invalid product info");
        } else {
          break;
        }
      }
      const productsToSave = makeProductsToSave(msg);
      await addProducts(productsToSave);
      await ctx.reply("📔Mahsulotlar saqlandi", msg);
      await ctx.scene.leave();
    }
  } catch (err) {
    ctx.scene.leave();
    console.log(err);
  }

})


let products;

const stepHandler = new Composer();

stepHandler.action('prev', async ctx => {
  console.log("Previous ");
  // Decrease page number  
  ctx.session.page = Math.max(0, ctx.session.page - 1)

  // Recall items command handler
  return ctx.wizard.selectStep(0);
})

stepHandler.action('next', async ctx => {
  console.log("Next ");
  // Increase page number
  const maxPage = Math.ceil(products.length / limit) - 1
  ctx.session.page = Math.min(maxPage, ctx.session.page + 1)

  // Recall items command handler
  return ctx.wizard.selectStep(0);
})


// show products
const limit = 5;
export const showProductWizard = new Scenes.WizardScene(
  "show-products",
  async (ctx) => {
    try {
      // Initialize page if needed
      if (!ctx.session.page) {
        ctx.session.page = 0;
      }
      console.log("Session " + ctx.session.page);
      // Calculate indexes
      const startIndex = ctx.session.page * limit;
      const endIndex = startIndex + limit;

      products = await getAllProducts();
      let productsToShow = products.slice(startIndex, endIndex);
      // Send current page of items
      await ctx.replyWithHTML(productsToShow.map(product => `<b>${product.tuliq_nomi}</b>`).join('\n'));

      // Buttons for pagination
      const paginationKeyboards = createButtons(ctx.session.page, products.length, limit)
      await ctx.reply("<b>Mahsulotlar </b> ", {
        parse_mode: "HTML",
        ...paginationKeyboards
      })
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
      return;
    }
  },
  stepHandler
);

showProductWizard.hears(`${keyboards.menu}`, async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply("Bosh menu", {
    reply_markup: {
      remove_keyboard: true
    }
  })

})


// showProductWizard.action('prev', async ctx => {
//   console.log("Previous ");
//   // Decrease page number  
//   ctx.session.page = Math.max(0, ctx.session.page - 1)

//   await ctx.scene.leave();

//   // Recall items command handler
//   return ctx.scene.reenter("show-products")
// })


// showProductWizard.action('next', async ctx => {
//   console.log("Next ");
//   // Increase page number
//   const maxPage = Math.ceil(products.length / limit) - 1
//   ctx.session.page = Math.min(maxPage, ctx.session.page + 1)

//   await ctx.scene.leave();

//   // Recall items command handler
//   return ctx.scene.reenter("show-products")
// })


// change concurrency
export const concurrencyWizard = new Scenes.WizardScene(
  "concurrency",
  async (ctx) => {
    let action = ctx.message.text;
    ctx.sendChatAction("typing");
    const rate = await getUSDRate();
    await ctx.reply(`📊: ${rate.val}`, concurrencyMenu);
    switch (action) {
      case keyboards.edit: {
        await ctx.reply("📊Yangi kursni kiriting : ", concurrencyMenu);
        ctx.wizard.selectStep(0);
        break;
      }
      case keyboards.back: {
        await ctx.scene.leave();
        ctx.reply("Menu", {
          reply_markup: { remove_keyboard: true }
        });
        break;
      }
    }

    if (action.match(/[0-9]/)) {
      ctx.sendChatAction("typing");
      await setUSDRate(Number(action));
      await ctx.reply(`✅ ${action}`, concurrencyMenu);
    }
    return ctx.wizard.selectStep(0);
  }
);
