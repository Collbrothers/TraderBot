import { MessageEmbed, GuildMember, MessageAttachment } from "discord.js";
import { client } from "../../Client/index";
import {CanvasRenderService} from "chartjs-node-canvas"
import { TradingViewAPI } from "tradingview-scraper";
const tv = new TradingViewAPI();
import alphaModule from "alphavantage"
const alpha = alphaModule({key: "8RYUNDYXPFA3JZZC"})
//@ts-ignore
Array.prototype.avg = function()  {
    let num = 0
    this.map(e => num += e)
    return num / this.length
}
function getDaysAgo(b: any){
    let a = new Date();
    a.setDate(a.getDate()-b);
    return a
  };
export class Tradembed extends MessageEmbed {
    public readonly member: GuildMember
    public readonly bot = client
    constructor(member: GuildMember) {
        super()
        this.member = member
        this.init()
    }
    private init() {
        this.setAuthor(
            this.member.user.username,
            this.member.user.displayAvatarURL({
              dynamic: true
            })
          )
            .setFooter(
              this.bot.user!.username,
              this.bot.user!.displayAvatarURL({
                dynamic: true
              })
            )
            .setTimestamp();
    }
    welcome() {
        this.setTitle("Hey. A new member joined!")
        this.setDescription(`Welcome <@${this.member.user.id}>`)
        this.setThumbnail(this.member.user.displayAvatarURL({dynamic: true})).setColor("GREEN")
        return this
    }
    leave() {
        this.setTitle("Oh a member left").setDescription(`Goodbye <@${this.member.user.id}>`).setColor("YELLOW").setThumbnail(this.member.user.displayAvatarURL({dynamic: true}))
        return this
    }
    async chart(stock: string, url?: string) {
        try {   
            const tvdata = await tv.getTicker(stock)
            
            let data = await alpha.data.daily(stock)
            let meta = data["Meta Data"]
            let newdata: any = Object.entries(data)[1]
            let arr: Array<any> = Object.entries(newdata[1])
            let filterd = arr.filter(e => new Date(e[0]) > getDaysAgo(60))
            //@ts-ignore
            let lowest = filterd.sort((a,b) => {
                return parseInt(a[1]["3. low"]) - parseInt(b[1]["3. low"])
            })
            //@ts-ignore
            let highest = filterd.sort((a,b) => {
                return parseInt(b[1]["2. high"]) - parseInt(a[1]["2. high"])
            })
            let highnum = parseInt(highest[0][1]["2. high"])
            let lownum = parseInt(lowest[0][1]["3. low"])
            highnum = highnum * 10
            highnum = Math.ceil(highnum/100) * 10
            lownum = lownum - lownum / 10
            lownum = Math.ceil(lownum/100) * 10
            const chartdata: any[] = []
            const chartlabels: any[] = []
            filterd.forEach(e => {
                chartdata.push(e[1]["4. close"])
                chartlabels.push(e[0])
            })
            if(filterd[filterd.length - 1]["close"] <= filterd[0]["close"]) {
                this.setColor("GREEN")
            }else {
                this.setColor("RED")    
            }
           // console.log(filterd)
            const render = new CanvasRenderService(600,250);
            const configuration = {
                type: 'line',
                data: {
                    labels: chartlabels,
                    datasets: [{
                        label: "Value",
                        data: chartdata,
                        borderWidth: 2,
                        borderColor: "#FFFFFF",
                        fill: false
                    }]
                },
                options: {
                    title: {    
                        display: true,
                        text: `Value of ${meta["2. Symbol"]}`
                      },

                    scales: {
                        gridLines: {
                            color: "#FFFFF"
                        },
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: (value: any) => '$' + value
                            }
                        }]
                    }
                }
            }
        this.attachFiles([new MessageAttachment(render.renderToStream(configuration), "s.png")])
        this.setImage("attachment://s.png")
        this.addField("Ticker", tvdata["short_name"], true)
        this.addField("Time zone",meta['5. Time Zone'],true)
        this.addField("Last refreshed",meta["3. Last Refreshed"],true)
        if(tvdata["industry"]) this.addField("Industry", tvdata["industry"], true)
        if(tvdata["description"]) this.setDescription(tvdata["description"])
        if(tvdata["earnings_per_share_basic_ttm"]) this.addField("EPS", tvdata["earnings_per_share_basic_ttm"], true)
        if(tvdata["market_cap_basic"]) this.addField("Market Cap", tvdata["market_cap_basic"],true)
        this.addField("Volume", filterd[0][1]["5. volume"], true)
        return this
        }catch(e) {
            console.error(e.message)
            return this.error("No Stock with that symbol found!")
        }
       
    }   
    error(message: string) {
        this.setColor("RED").setDescription(message)
        return this
    }
}   