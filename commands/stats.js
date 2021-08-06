const lang = require('./engToITA-stats.js')

module.exports = {
	name: 'stats',
    description: 'Mostra statistiche Xbox di Sea of Thieves (Statistiche Hero)',
    async execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta) {
        
        if (args.length) {
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con \`$stats\``);
        }

        let user;
        try {
            user = await users.findOne( { where: { u_id: msg.author.id } } );
            if (!user) {
                return msg.reply("Non sei registrato, utilizza \`$portafoglio\` per registrarti!");
            }
            else if (user.banned) {
                return msg.reply(`Sei stato bannato dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
            }
        } catch(e) {
            return console.log("Errore findone in registraxgt: "+e);
        }

        let myxstats;
        try {
            myxstats = await xboxstatistics.findOne({
                where: {
                    u_id: msg.author.id
                }
            })
            if (!myxstats) {
                return msg.reply(`Non hai registrato un GamerTag Xbox, registrati con il comando \`$registragt GamerTag\` `)
            }
			// console.log("Trovato: ");
        } catch(e) {
            return msg.reply(`Non hai registrato un GamerTag Xbox, registrati con il comando \`$registragt GamerTag\` `)
        }

        const gt = myxstats.xboxgt.split(/ +/);
        const gt1 = gt.join(" ")
        
        const actual_stats = await checkStats(msg, gt );
        // console.log(actual_stats.groups)
        if (actual_stats.groups === undefined || actual_stats.groups[0].name.toLowerCase() !== "hero") return console.log("non trovato");
        const elems = actual_stats.groups[0].statlistscollection[0].stats;
        
        const embed = new Discord.RichEmbed()
			.setColor('0x009933')
			.setAuthor(`<⚓> SeaOfThieves Stats <⚓>`)
			.addField(`BARBANERA\nConoscerà sicuramente le luride azioni di un piratucolo come\n *-->* ${gt1} *<--*`,'\u200B')
			
        const statNotFsund = [
            `Impossibile Ottenere le tue Statistiche Xbox.`,
            `Verificare, al seguente link https://account.xbox.com/it-IT/Settings i seguenti campi.`,
            `Nella sezione *\'Altri possono\'*:`,
            `🔸 Vedi il tuo profilo Xbox -> Impostato su **Tutti**`,
            `🔸 Vedi la tua cronologia di giochi e app -> Impostato su **Tutti**`
        ]
        
		if (actual_stats.groups === undefined || actual_stats.groups[0].name.toLowerCase() !== "hero")
            return msg.reply("L\'utente richiesto non ha Statistiche riguardanti Sea of Thieves")
        else if (elems[0].value === undefined || elems[0].value === NaN) {
            return msg.reply(statNotFsund.map( i => i ))
        }
			
		elems.forEach( element => {
			// console.log(element.properties.DisplayName)
			
			embed.addField( lang( element.properties.DisplayName.toString() ), element.value)
		});

		msg.channel.send(embed)
    }
}