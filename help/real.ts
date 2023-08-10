import { Telegraf, Context } from "telegraf";
import config from "../config";
import Hlp from "../helpers";
const h = new Hlp();

function cmdd(ctx: any) {
  ctx.message.text = ctx.message.text.replace(
    new RegExp(`^\\${config.startSymbol}[a-zA-Z0-9]{2,9}@${ctx.botInfo.username}`, "i"),
    (match: any) => match.replace(`@${ctx.botInfo.username}`, "")
  );
}

function reply(ctx: any, mss: any, tim: any = 10) {
  return new Promise(async (resolve, reject) => {
    try {
      const mi = await ctx.reply(mss);
      h.sleep(tim * 1000)
        .then(() => {
          ctx.deleteMessage(mi.message_id).catch((err: any) => { });
          resolve(mi);
        })
        .catch((err: any) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}

function real(bot: Telegraf) {
  const sreg = new RegExp(`^\\${config.startSymbol}(rcc|rpy|rjs|rjv|rcpp|rgo|rts)`, "i");

  bot.hears(sreg, async (ctx: Context) => {
    try {
      cmdd(ctx as any);
      let code = "";
      const msg: any = ctx.message;
      const reg = new RegExp(`^\\${config.startSymbol}\\w*`, "i");
      let cmp: any = msg.text.match(reg);

      if (msg.text.length < 6) {
        if (msg.reply_to_message) {
          code = msg.reply_to_message.text;
        }
      } else {
        code = msg.text.replace(reg, "");
      }

      cmp = cmp[0].toLowerCase().trim().substr(1);

      if (cmp === "rcc") {
        code = code.replace(/"start"/gi, "#include <stdio.h>\nint main(){")
          .replace(/"end"/gi, "\treturn 0;\n}")
          .replace(/^(\s*)(pt)(.*)/gim, "$1printf($3);");
      } else if (cmp === "rpy") {
        code = code.replace(/^(\s*)(pt)(.*)/gim, '$1print($3);');
      } else if (cmp === "rjs" || cmp === "rts") {
        code = code.replace(/^(\s*)(pt)(.*)/gim, '$1console.log($3);');
      } else if (cmp === "rcpp") {
        code = code.replace(/"start"/gi, "#include <iostream>\nusing namespace std;\nint main(){")
          .replace(/"end"/gi, "return 0;\n}")
          .replace(/^(\s*)(pt)(.*)/gim, "$1cout<<$3;");

      } else if (cmp === "rjv") {
        code = code.replace(/"start"/gi, 'public class Main{\n\tpublic static void main(String[] args){')
          .replace(/"end"/gi, '\t}\n}')
          .replace(/^(\s*)(pt)(.*)/gim, "$1System.out.println($3);");
      }

      reply(ctx, code, 70).catch((err: any) => { })
      reply(ctx, "You can run this code anywhere\nmsg will delete in 70 seconds", 10).catch((err: any) => { })
    } catch (err: any) { }
  });
}

export default real;
