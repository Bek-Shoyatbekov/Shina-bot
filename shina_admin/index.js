import { dollarKursi, mainMenu, productsMenu } from "./keyboards.js";
import { getUSDRate, setUSDRate } from "./controllers.js";
import { keyboards } from "./commands.js";
import { config } from "dotenv";
import { gatherProductWizard, showProductWizard } from "./scenes.js";
import { Telegraf, Scenes, session } from "telegraf";
import connectDb from "./connectDb.js";

config();
const token = process.env.TOKEN;


let stage = new Scenes.Stage([gatherProductWizard, showProductWizard]);

// set-up db connections
connectDb();

export const bot = new Telegraf(token);

bot.use(session());
bot.use(stage.middleware());

bot.context.db = {
  actions: new Map(),
  limit: 10,
  offset: 0,
};

bot.start((ctx) => {
  ctx.reply("Assalamu Alaykum", mainMenu);
  if (!bot.context.db.actions.get(ctx.chat.id)) {
    bot.context.db.actions.set(ctx.chat.id, "start");
  }
});

bot.use((ctx, next) => {
  console.log(bot.context.db.actions);
  next();
});

bot.hears(keyboards.money, async (ctx) => {
  bot.context.db.actions.set(ctx.chat.id, "kurs");
  ctx.sendChatAction("typing");
  let rate = await getUSDRate();
  ctx.reply(`Hozirgi kurs: ${rate.val}`, dollarKursi);
});

bot.hears(keyboards.edit, async (ctx) => {
  bot.context.db.actions.set(ctx.chat.id, "changeKurs");
  ctx.reply("Kursni kiriting: ");
});

bot.hears(/[0-9]/, async (ctx) => {
  ctx.sendChatAction("typing");
  if (bot.context.db.actions.get(ctx.chat.id) == "changeKurs") {
    await setUSDRate(Number(ctx.message.text));
    ctx.reply(`✅ ${ctx.message.text}`);
  }
});

bot.hears(keyboards.product, async (ctx) => {
  ctx.reply("📔", productsMenu);
});

// Products Menu
bot.hears(keyboards.add, (ctx) => {
  try {
    ctx.scene.enter("gather-product-info");
  } catch (err) {
    console.log(err);
  }
});

bot.hears(keyboards.see, (ctx) => {
  ctx.scene.enter("show-products");
});

bot.hears(keyboards.edit, (ctx) => {});

// General
bot.hears("◀️", async (ctx) => {
  ctx.reply("Asosiy menu", mainMenu);
  return;
});

bot.catch((err, ctx) => {
  console.log(err, ctx);
});

bot.use((ctx) => {
  ctx.reply("Command not found!", mainMenu);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
