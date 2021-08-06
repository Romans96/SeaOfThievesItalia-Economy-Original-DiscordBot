const Discord = require('discord.js');

module.exports = (msg, args, moneta, azione) => {
        
        const logEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor(`<💲> Economy Servizi <💲>`)

        switch(azione) {
            case "payservice":
                logEmbed.addField(msg.author.username, `Ha pagato ${args[0]} ${moneta} `);
                logEmbed.addField("Servizio Pagato (UTENTE):",`${args.slice(1).join(" ").trim()}`)
                break;
                
            case "paycrewservice":
                logEmbed.addField(msg.author.username + ` (Gestore)`, `Ha pagato ${args[0]} ${moneta} `);
                logEmbed.addField("Servizio Pagato (CLAN):",`${args.slice(1).join(" ").trim()}`)
                break;
        }

        logEmbed.addField("Azione eseguita nel canale:", msg.channel);

        logEmbed.setTimestamp();
        logEmbed.setFooter("ID: "+msg.author.id, msg.author.avatarURL);
        return logEmbed;
    
}