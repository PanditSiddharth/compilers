import { Scenes, Telegraf } from "telegraf";
import * as tp from "../src/interfaces";
type IOConfig = tp.Config;
export { IOConfig };
export declare function compiler(telegrafBotByUser: tp.TelegramBotToken | Telegraf<Scenes.SceneContext>): {
    bot: Telegraf<Scenes.SceneContext<Scenes.SceneSessionData>>;
    conf: tp.Config;
};
//# sourceMappingURL=index.d.ts.map