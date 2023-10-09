import { Telegraf } from "telegraf";
import { config } from "dotenv";
import { Markup } from "telegraf";
import {
  createUserHistory,
  updAndNewData,
  getByKey,
  getUserLang,
  getUserAction,
} from "./useractions.js";
import ChosenLanguage from "./lang.js";

config();

const token = process.env.TOKEN || new Error(`Token is invalid`);

const uzlang = new ChosenLanguage("uz");
const rulang = new ChosenLanguage("ru");

const bot = new Telegraf(token);
bot.command("quit", async (ctx) => {
  // Explicit usage
  await ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  await ctx.leaveChat();
});
bot.start((ctx) =>
  ctx.reply(
    `Assalomu aleykum! Keling, avvaliga xizmat ko’rsatish tilini tanlab olaylik.

Здравствуйте! Давайте для начала выберем язык обслуживания!
`,
    Markup.inlineKeyboard([
      Markup.button.callback("🇺🇿 O'zbekcha", "uz"),
      Markup.button.callback("🇷🇺 Русский", "ru"),
    ])
  )
);
bot.command("back", async (ctx) => {
  let answer = getLang(ctx.message.from.id);
  updAndNewData(
    ctx.message.from.id,
    "askTireOrAccessories",
    "region",
    ctx.message.text
  );
  ctx.reply(
    answer.tireORaccessoriesText(),
    Markup.keyboard([answer.tireORaccessoriesButtons()]).resize()
  );
});

bot.on("callback_query", async (ctx) => {
  if (ctx.callbackQuery.data === "back") {
    let answer = getLang(ctx.callbackQuery.from.id);
    updAndNewData(
      ctx.callbackQuery.from.id,
      "askTireOrAccessories",
      "region",
      ctx.callbackQuery.text
    );
    ctx.reply(
      answer.tireORaccessoriesText(),
      Markup.keyboard([answer.tireORaccessoriesButtons()]).resize()
    );
  } else if (ctx.callbackQuery.data === "buy") {
    let ans = getLang(ctx.callbackQuery.from.id);
    updAndNewData(
      ctx.callbackQuery.from.id,
      "wannaBuy",
      "username",
      ctx.callbackQuery.from.username
    );
    ctx.reply(ans.wannaBuy(ctx.callbackQuery.from.id, "Naqd"));
  } else if (ctx.callbackQuery.data === "pay_installment") {
    let ans = getLang(ctx.callbackQuery.from.id);
    updAndNewData(
      ctx.callbackQuery.from.id,
      "installments",
      "username",
      ctx.callbackQuery.from.username
    );
    ctx.reply(await ans.creditOptionsText(ctx.callbackQuery.from.id), {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: ans.creditButtons(),
        resize_keyboard: true,
      },
    });
  } else if (
    ctx.callbackQuery.data === "installment_3" ||
    ctx.callbackQuery.data === "installment_6" ||
    ctx.callbackQuery.data === "installment_9"
  ) {
    let timeLimit = ctx.callbackQuery.data.split("_")[1];
    let ans = getLang(ctx.callbackQuery.from.id);
    updAndNewData(
      ctx.callbackQuery.from.id,
      "wannaBuy",
      "username",
      ctx.callbackQuery.from.username
    );

    ctx.reply(
      ans.wannaBuy(ctx.callbackQuery.from.id, `${timeLimit} oylik kredit`)
    );
  } else {
    // keep this down(me)
    let userData = {
      id: ctx.callbackQuery.from.id,
      name: ctx.callbackQuery.from.first_name,
      language: ctx.callbackQuery.data,
      username: ctx.callbackQuery.from.username,
    };
    createUserHistory(
      userData.id,
      userData.username,
      userData.name,
      userData.language,
      "askContact"
    );
    let answer = getLang(ctx.callbackQuery.from.id)
    // ctx.deleteMessage();
    ctx.reply(
      answer.greetingContactText(ctx.callbackQuery.from.first_name),
      Markup.keyboard([
        // phoneKeyboard
        Markup.button.contactRequest(answer.contactButtonText()),
        // locationKeyboard
      ]).resize()
    );
    ctx.answerCbQuery();
  }
});

// get user phone number
bot.on("contact", async (ctx) => {
  updAndNewData(
    ctx.message.from.id,
    "askRegion",
    "phone",
    ctx.message.contact.phone_number
  );
  ctx.reply(
    getLang(ctx.message.from.id).regionText(),
    Markup.keyboard(getLang(ctx.message.from.id).regions()).resize()
  );
});

bot.on("message", async (ctx) => {
  let answer = getLang(ctx.message.from.id);
  if (getUserAction(ctx.message.from.id) == "askRegion") {
    updAndNewData(
      ctx.message.from.id,
      "askTireOrAccessories",
      "region",
      ctx.message.text
    );
    ctx.reply(
      answer.tireORaccessoriesText(),
      Markup.keyboard([answer.tireORaccessoriesButtons()]).resize()
    );
  } else if (getUserAction(ctx.message.from.id) == "askTireOrAccessories") {
    updAndNewData(
      ctx.message.from.id,
      "askCompany",
      "tireOrAccessories",
      ctx.message.text
    );
    ctx.reply(
      answer.tireSeasonText(),
      Markup.keyboard([answer.tireSeasonButtons()]).resize()
    );
  } else if (getUserAction(ctx.message.from.id) == "askCompany") {
    updAndNewData(
      ctx.message.from.id,
      "askTireSeason",
      "tireSeason",
      ctx.message.text
    );
    ctx.reply(
      answer.companiesText(),
      Markup.keyboard(answer.companiesButtons()).resize()
    );
  } else if (getUserAction(ctx.message.from.id) == "askTireSeason") {
    // typing action
    ctx.sendChatAction("typing");
    updAndNewData(
      ctx.message.from.id,
      "askDiameter",
      "company",
      ctx.message.text
    );
    ctx.reply(
      answer.diametersOfTiresText(),
      Markup.keyboard(await answer.diameterButtons(ctx.message.text)).resize()
    );
  } else if (getUserAction(ctx.message.from.id) == "askDiameter") {
    ctx.sendChatAction("typing");
    updAndNewData(
      ctx.message.from.id,
      "askWidth",
      "diameter",
      ctx.message.text
    );
    ctx.reply(
      answer.sizesOfTiresText(),
      Markup.keyboard(
        await answer.sizesOfTiresButtons(ctx.message.text, ctx.message.from.id)
      ).resize()
    );
  } else if (getUserAction(ctx.message.from.id) == "askWidth") {
    ctx.sendChatAction("upload_photo");
    updAndNewData(
      ctx.message.from.id,
      "showResults",
      "width",
      ctx.message.text
    );
    let res = await answer.resultsText(ctx.message.from.id);
    const options = {
      reply_markup: {
        inline_keyboard: res.postInlineKeyboard,
        resize_keyboard: true,
      },
      parse_mode: "HTML",
      reply_to_message_id: ctx.message.message_id + 1,
    };
    await ctx.replyWithPhoto(res.postPhoto);
    await ctx.reply(res.postText, options);
  }
});

bot.on("inline_query", async (ctx) => {
  const result = [];
  // Explicit usage
  await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

  // Using context shortcut
  await ctx.answerInlineQuery(result);
});

bot.launch();

// create a function that gets user id and returns its language and choose either uzlang or rulang
function getLang(id) {
  let userLang = getUserLang(id);
  if (userLang == "uz") {
    return uzlang;
  } else {
    return rulang;
  }
}

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
