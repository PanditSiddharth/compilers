import { SpawnOptions } from "child_process";
import { Scenes, Telegraf } from "telegraf";
export type TelegramBotToken = "string";
export type Chatid = string | number;
export type UserId = string | number;
export type Username = string;
export type Mode = "private" | "docker-private" | "public" | "api-mode";
export interface Config {
    telegram?: Partial<Telegraf.Options<Scenes.SceneContext<Scenes.SceneSessionData>>>;
    mode?: Mode;
    codeLogs?: Chatid;
    commands?: ["py", "js", "cc", "cpp", "jv", "ts", "go", "rs", "sh", "root"];
    chatLogs?: Chatid;
    errorLogs?: UserId;
    ttl?: number;
    ownerId?: UserId;
    admins?: UserId[];
    version?: string;
    startSymbol?: string;
    owner?: string;
    root?: {
        allowed: number[];
        command?: string;
        shell?: string;
    };
    group?: Username;
    channel?: Username;
    token?: string;
    python?: string;
    java?: string;
    javac?: string;
    go?: string;
    node?: string;
    config?: Config;
    spawnOptions?: SpawnOptions;
    configure?: (cnf: Config) => void;
    allowed?: string[] | number[];
    exes?: any;
    end?: Function | undefined;
}
//# sourceMappingURL=interfaces.d.ts.map