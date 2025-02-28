export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    SILLY = 4
}

export class Logger {
    public static readonly LogLevel: typeof LogLevel = LogLevel;
    public level!: LogLevel;

    constructor(logLevel: LogLevel = LogLevel.INFO) {
        this.configure(logLevel);
    }

    public configure(logLevel: LogLevel): void {
        this.level = logLevel;
    }

    public log(level: LogLevel, ...args: Array<unknown>): void {
        if (level > this.level) {
            return;
        }

        args.forEach((arg: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (arg instanceof Error) {
                console.error(arg);  

                return;
            }

            let content = '';

             
            if (typeof arg?.toString === 'function') {
                 
                content = arg.toString();
            } else {
                content = JSON.stringify(arg);
            }

            console.log(`[${LogLevel[level]}] ${content}`);  
        });
    }

    public error(error: Error): void {
        this.log(LogLevel.ERROR, error);
    }

    public warn(...warnings: Array<unknown>): void {
        this.log(LogLevel.WARN, ...warnings);
    }

    public info(...info: Array<unknown>): void {
        this.log(LogLevel.INFO, ...info);
    }

    public debug(...info: Array<unknown>): void {
        this.log(LogLevel.DEBUG, ...info);
    }

    public silly(...info: Array<unknown>): void {
        this.log(LogLevel.SILLY, ...info);
    }
}
