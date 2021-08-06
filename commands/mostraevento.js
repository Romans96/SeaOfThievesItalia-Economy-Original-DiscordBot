const Discord = require('discord.js');
module.exports = {
	name: 'mostraevento',
    description: 'Incassa i Talleri a seconda delle statistiche conseguite dall\'ultima digitazione del comando',
    async execute(msg, args, codecolor, moneta, xboxStatsRewardMolt) {

        if (args.length) {
            return msg.reply("ERRORE -> Sintassi del comando errata. Riprova con \`$mostraevento\` ")
        }
        const allstats = await xboxStatsRewardMolt.findAll({
            order: [
                ['id','ASC']
            ]
        });
        const N = Object.keys(allstats).length;
        const embedEvento = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor('<💲> Economy-Evento Talleri Statistiche XBox <💲>')

        for (let i = 0; i< N-1; i++) {
            embedEvento.addField(`🔹 **${allstats[i].name}**`,`Moltiplicatore guadagno attuale: **${allstats[i].data}x** `)
        }

        if (allstats[N-1].data === 0)
            embedEvento.setFooter(" ----> Evento NON ATTIVO")
        else if (allstats[N-1].data === 1)
            embedEvento.setFooter(" ----> Evento ATTIVO", 'https://images-ext-1.discordapp.net/external/lWj3uW4qvfFB9t0QgGsDJ8vLvh5bSObQ-wwUxYFH4wo/https/images-ext-1.discordapp.net/external/AzWR8HxPJ4t4rPA1DagxJkZsOCOMp4OTgwxL3QAjF4U/https/cdn.discordapp.com/emojis/424900448663633920.gif')

        msg.channel.send(embedEvento);
    }
}