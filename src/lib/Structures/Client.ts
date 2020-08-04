import {Client} from "discord.js"
export class TraderClient extends Client {
    public readonly prefix = "."
    constructor(token: string) {
        super()
        this.token = token
    }
    start(): void {
        //@ts-ignore
        super.login(this.token)
    }
}