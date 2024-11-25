class MConsole {
    private attr: string[] = process.env.PROD === undefined?[]:process.env.PROD.split(",");
    private isDev: boolean = this.attr.includes("DEV");
    sqlinfo(...optionalParams: any[]): void {
        if (this.isDev || this.attr.includes("SQLINFO")) console.log(...optionalParams);
    }
    sqlq(sql: string, params: any[], ...optionalParams: any[]): void {
        if (this.isDev || this.attr.includes("SQLQ")) console.log(`Preparing request: sql = '${sql.trim().replace(/\n/gm, "").replace(/ {2,}/gm, " ")}'\nparams = ${params}`, ...optionalParams);
    }
    sqld(...optionalParams: any[]): void {
        if (this.isDev || this.attr.includes("SQLD")) console.log(...optionalParams);
    }
}
export function mConsoleInit() {
    mconsole = new MConsole();
}
export var mconsole: MConsole;
