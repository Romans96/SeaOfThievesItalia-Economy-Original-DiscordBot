const Discord = require('discord.js');
module.exports = {
	name: 'evento',
    description: 'Incassa i Talleri a seconda delle statistiche conseguite dall\'ultima digitazione del comando',
    async execute(msg, args, codecolor, moneta, xboxStatsRewardMolt) {

        const esempi = [
            `\`\`\``,
            `$evento start 10 forzieri teschi isole viaggi`,
            `$evento start 10 forzieri`,
            `\`\`\``
        ]

        const start_stop = args[0];
        const molt = parseInt(args[1]);
        const type = args.slice(2);


        let allstats = await xboxStatsRewardMolt.findAll();
        const N = Object.keys(allstats).length;
        const flagevento = await xboxStatsRewardMolt.findOne({
            where: {
                name: 'flagevento'
            }
        }).get('data');

        if (type.length > N-1) {
            return msg.reply(`ERRORE -> Hai inserito troppe statistiche. Massimo ${N-1} statistiche`)
        }
        else if (!start_stop ) {
            msg.reply(`ERRORE -> Sintassi del comando errata. RIprova con \`$evento start (moltiplicatore) (lista statistiche)\`  `)
            return msg.channel.send(`${esempi[0]}Esempi: \n${esempi[1]}\n${esempi[2]}\n${esempi[3]}`)
        }

        // console.log(type)

        const embedEvent = new Discord.RichEmbed()
            .setColor('0x36393f')
        

        if (start_stop.toLowerCase() === "stop") {
            
            if (flagevento === 0)
                return msg.reply("Nessun evento attualmente attivo!")

            for (let i = 0; i < N-1; i++) {
                await xboxStatsRewardMolt.update(
                    {
                        data: 1
                    },{
                        where: {
                            name: allstats[i].name
                        }
                    })
            }
            await xboxStatsRewardMolt.update({
                data: 0,
            },{
                where: {
                    name: "flagevento"
                }
            })
            
            embedEvent.setTitle(`⏱ Evento Concluso!`)
                .setDescription(`Moltiplicatore guadagno Statistiche Xbox ripristinato a **1x**!`)

        }

        else if (start_stop.toLowerCase() === "start") {
            if ( !molt || !Number.isInteger(molt) || !type.length ) {
                msg.reply(`ERRORE -> Sintassi del comando errata. RIprova con \`$evento start (moltiplicatore) (lista statistiche)\`  `)
                return msg.channel.send(`Esempi: \n${esempi[0]} \n${esempi[1]}`)
            }
            if (flagevento === 1) 
                return msg.reply("Un evento è già attivo, stopparlo prima di avviarne un altro!")

            if (type.length === 1 && type[0] === "all") {
                await xboxStatsRewardMolt.update({
                    data: molt,
                },{
                    where: {}
                })
                // console.log(molt)
            }
            else {
                for (let i = 0; i < type.length; i++) {
                    await xboxStatsRewardMolt.update({
                        data: molt,
                    },{
                        where: {
                            name: type[i]
                        }
                    })
                }
            }
            
            await xboxStatsRewardMolt.update({
                data: 1,
            },{
                where: {
                    name: "flagevento"
                }
            })

            embedEvent.setTitle(`☑ Evento Avviato!`)
                .addField('Con i seguenti Guadagni e Moltiplicatori:', type.map( (elem) => "▶ "+elem + " -> **"+ molt + "x**" ))
            
        }
        else {
            msg.reply(`ERRORE -> Sintassi del comando errata. RIprova con \`$evento start (moltiplicatore) (lista statistiche)\`  `)
            return msg.channel.send(`${esempi[0]}Esempi: \n${esempi[1]}\n${esempi[2]}\n${esempi[3]}`)
        }

        msg.channel.send(embedEvent)
    }
}