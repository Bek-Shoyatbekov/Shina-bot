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

bot.on("my_chatmember", async (ctx) => {
  console.log("Quitting " + ctx.chat.id);
  await ctx.leaveChat(ctx.message.chat.id);
  return;
});

bot.use(session());
bot.use(stage.middleware());

bot.context.db = {
  actions: new Map(),
  limit: 10,
  offset: 0,
};

bot.start(async (ctx) => {
  await ctx.reply("Assalamu Alaykum", mainMenu);
  if (!bot.context.db.actions.get(ctx.chat.id)) {
    bot.context.db.actions.set(ctx.chat.id, "start");
  }
});

bot.hears(keyboards.money, async (ctx) => {
  bot.context.db.actions.set(ctx.chat.id, "kurs");
  ctx.sendChatAction("typing");
  let rate = await getUSDRate();
  await ctx.reply(`Hozirgi kurs: ${rate.val}`, dollarKursi);
});

bot.hears(keyboards.edit, async (ctx) => {
  bot.context.db.actions.set(ctx.chat.id, "changeKurs");
  await ctx.reply("Kursni kiriting: ");
});

bot.hears(/[0-9]/, async (ctx) => {
  ctx.sendChatAction("typing");
  if (bot.context.db.actions.get(ctx.chat.id) == "changeKurs") {
    await setUSDRate(Number(ctx.message.text));
    await ctx.reply(`✅ ${ctx.message.text}`);
  }
});

bot.hears(keyboards.product, async (ctx) => {
  await ctx.reply("📔", productsMenu);
});

// Products Menu
bot.hears(keyboards.add, async (ctx) => {
  try {
    await ctx.scene.enter("gather-product-info");
  } catch (err) {
    console.log(err);
  }
});

bot.hears(keyboards.see, async (ctx) => {
  await ctx.scene.enter("show-products");
});

bot.hears(keyboards.edit, (ctx) => {});

// General
bot.hears("◀️", async (ctx) => {
  await ctx.reply("Asosiy menu", mainMenu);
  return;
});

bot.command("quit", async (ctx) => {
  await ctx.telegram.leaveChat();
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
