Discord = require('discord.js');
const package = require('../package.json');

function space( content ) {
    return ( ' \`\`\` '+ content  +' \`\`\` ' );
}

module.exports = async (msg) => {

const noteVersioni = [
    "🔹 **1.0.0**: Lancio BOT Sul server.",
    `**1.1.0**: Modifica Classifiche Utenti e Interne per Talleri depositati alla propria ciurma, invece che per portafoglio: \`$classificautenti\` e \`$classificainterna\``,
    `**1.2.0**: Aggiunta dei guadagni attraverso le statistiche Xbox di Sea of Thieves. Digitare \`$help stats\` per ulteriori informazioni sui comandi disponibili`
];


    const infoEmbed = new Discord.RichEmbed()
        .setColor('0x009933')
        .setAuthor(`<💲> Economy Info-Crediti <💲>`)
        // .addBlankField()
        
        .addField("Creatore BOT", (package.author), true )
        .addField("Contatto Supporto BOT",  'Romans96#9381', true)
        .addField("Canale Feedback", msg.guild.channels.get('448416236007587845'), true)
        

        .addField("Versione BOT", (package.version), true )
        // .addBlankField()
        .addField("Descrizione BOT", (package.description))
        .addBlankField()
        .addField("\n🔽 Note versioni 🔽", 
            noteVersioni.join("\n🔹 ")
        )
        .setTimestamp();

    msg.channel.send( infoEmbed ) ;
}