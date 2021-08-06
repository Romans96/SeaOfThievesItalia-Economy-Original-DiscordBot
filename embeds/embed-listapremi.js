const Discord = require('discord.js');

module.exports = (msg, fs, regole, moneta) => {
    
    const obb_game = fs.readFileSync("./txt_files/obb_game.txt", "utf-8");
    const obb_community = fs.readFileSync("./txt_files/obb_community.txt", "utf-8");
    const obb_eventi = fs.readFileSync("./txt_files/obb_eventi.txt", "utf-8");
    
    
    const listaPremiEmbed = new Discord.RichEmbed()
        .setColor('0x009933')
        .setAuthor(`<💲> Economy Lista Premi <💲>`)
        .addField("⏬ GameRewards ⏬", obb_game)
        .addField("⏬ CommunityRewards ⏬", obb_community)
        .addField("⏬ EventsRewards (p.p. = Per Partecipante) ⏬", obb_eventi)
        .addBlankField()
        .addField("⏬⚠ Rules ⚠⏬", regole + ` *\`$pagaserviziociurma (quantita' di ${moneta}) (nome servizio/ampliamento)\`***`);

        msg.channel.send(listaPremiEmbed);

}

/* fs.readFile("./txt_files/obb_community.txt", "utf-8", function(err, buf1)  {
        listaPremiEmbed.addField("CommunityRewards", buf1);
        msg.channel.send(listaPremiEmbed);
    }); */

/* fs.readFile("./embeds/temp.txt", "utf-8", function(err, buf) {
    msg.reply(buf.toString())
}); */