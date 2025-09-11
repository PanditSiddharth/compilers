// 2 global dependencies
import { Context, Scenes, Telegraf } from "telegraf";
import starter from './starter'
import conf from "./config"
import Hlp from './helpers';

const h = new Hlp();

/**
 * Cleans up bot commands by removing the bot's username from the command text.
 * @param ctx - The Telegraf context.
 */
function cleanCommand(ctx: Context<any>) {
    ctx.message.text &&= ctx.message.text.replace(
        new RegExp(`^\\${conf.startSymbol}[a-zA-Z0-9]{2,9}@${ctx.botInfo.username}`, "i"),
        (match: string) => match.replace(`@${ctx.botInfo.username}`, "")
    );
}

// This function checks that if any compiler command change then it changes session; Example : js to py
function startcheck(ctx: any, y: any, json: any = {}) {
    try {

        if (!ctx.message.text.startsWith(conf.startSymbol))
            return false

        let cmd = ctx.message.text.match(new RegExp("^\\" + conf.startSymbol + "[a-zA-Z0-9]{2,9}", 'i'))
        if (!cmd) return false;

        let cst = cmd[0].replace(conf.startSymbol, "").toLowerCase()
 
        if (y.includes(cst)) {
            return false
        } 

        if (conf.commands?.includes(cst)) {
            ctx.scene.enter(cst)
            return true
        }
        
        return false
    } catch (error) {
        return false
    }
}

const createScene = (sceneName: string) => {
    const scene = new Scenes.BaseScene<Scenes.SceneContext>(sceneName);
    scene.enter(async (ctx: any) => {
        if (startcheck(ctx, sceneName)) return;
        await starter(ctx, { cmp: sceneName, exe: conf.exes?.[sceneName] });
    });

    scene.on("message", async (ctx: any) => {
        if (startcheck(ctx, sceneName)) return;
        await starter(ctx, { cmp: sceneName, exe: conf.exes?.[sceneName] });
    });

    return scene;
};



/**
 * Generates an array of scenes based on configured commands.
 */
export const scenes = conf.commands?.map(createScene) || [];