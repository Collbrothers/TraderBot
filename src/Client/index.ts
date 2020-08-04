import { TraderClient } from "../lib/Structures/Client";
import { Tradembed } from "../lib/Structures/Tradembed";
import { MessageEmbed } from "discord.js";  
export const client = new TraderClient("NjE3MzE1NjM4MTI1NTI3MDUw.XWpV_Q.KY6qsUtckFrLhpfCVY6_94PQ6pg")
client.on("guildMemberAdd", member => {
    //@ts-ignore
    return client.channels.cache.get("737658454927212614").send(new Tradembed(member).welcome())
})
client.on("guildMemberRemove", member => {
    //@ts-ignore
    return client.channels.cache.get("737658454927212614").send(new Tradembed(member).leave())
})
client.on("message", async message => {
    if(message.author.bot || !message.content.startsWith(client.prefix)) return
    const args = message.content
      .trim()
      .slice(client.prefix.length)
      .split(/ +/g);
      let c = args.shift()?.toUpperCase()
      if(c === "CLEAR") {
          let am = parseInt(args[0])
          if(!message.member?.permissions.has("MANAGE_MESSAGES")) return
          message.channel.bulkDelete(am)
      }
      if(c === "DDG") {
          //@ts-ignore
          client.emit("guildMemberAdd", message.member)
      }
      if(c === "DDL") {
          //@ts-ignore
          client.emit("guildMemberRemove", message.member)
      }
      if(c === "STOCK") {
         //@ts-ignore
          if(!args[0]) return message.channel.send(new Tradembed(message.member).error("Please follow the format: `.Stock <Symbol>`"))
          //@ts-ignore
          message.channel.send(await new Tradembed(message.member).chart(args[0]))
      }
})

client.start()