import { Scenes, Telegraf } from "telegraf";
import * as tp from "./interfaces";
export declare function compiler(token: tp.TelegramBotToken, conf?: tp.Config): {
    bot: Telegraf<Scenes.SceneContext<Scenes.SceneSessionData>>;
    config: tp.Config;
};
//# sourceMappingURL=index.d.ts.map