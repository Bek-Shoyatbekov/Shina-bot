import { mainMenu, productsMenu } from "./keyboards.js";
import { keyboards } from "./commands.js";
import { config } from "dotenv";
import {
  concurrencyWizard,
  gatherProductWizard,
  showProductWizard
} from "./scenes.js";
import { Telegraf, Scenes, session } from "telegraf";
import connectDb from "./connectDb.js";


config();
const token = process.env.TOKEN;


let stage = new Scenes.Stage([
  gatherProductWizard,
  showProductWizard,
  concurrencyWizard
]);

// set-up db connections
connectDb();

export const bot = new Telegraf(token);

// Catch Telegraf errors

bot.use(session()).use((ctx, next) => {
  ctx.session ??= {}; // set session if no exists
  return next();
});
bot.use(stage.middleware());

bot.context.db = {
  actions: new Map(),
  limit: 10,
  offset: 0,
  
};

bot.start(async (ctx) => {
  await ctx.reply("Assalamu Alaykum", {
    reply_markup: {
      remove_keyboard: true
    }
  });
  if (!bot.context.db.actions.get(ctx.chat.id)) {
    bot.context.db.actions.set(ctx.chat.id, "start");
  }
});

bot.command("kurs", async (ctx) => {
  await ctx.scene.enter("concurrency");
});



// Products Menu
bot.command("yangi_shina", async (ctx) => {
  try {
    await ctx.scene.enter("gather-product-info");
  } catch (err) {
    console.log(err);
  }
});

bot.command("shinalar", async (ctx) => {
  await ctx.scene.enter("show-products");
})


bot.action(keyboards.edit, (ctx) => { });

// General
bot.hears(keyboards.back, async (ctx) => {
  await ctx.scene.leave();
  await ctx.reply("Asosiy menu");
  return;
});

bot.catch(async (err, ctx) => {
  if (err) {
    console.log(err, ctx);
    await ctx.leaveChat();
    return;
  }
});

bot.use(async (ctx, err) => {
  try {
    if (!err) await ctx.reply("Command not found!", mainMenu);
    return;
  } catch (err) {
    console.error("Error:", err);
    return;
  }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
