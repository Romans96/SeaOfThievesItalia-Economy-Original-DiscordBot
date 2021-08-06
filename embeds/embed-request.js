const Discord = require('discord.js');

module.exports = (msg, richiesta, image) => {
            
        const requestEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor(`<💲> Economy Assistenza-Richieste <💲>`)
            .addField(msg.author.username + " Ha richiesto:", "*"+richiesta+"*")
            .addField("Nel canale: ", msg.channel );
            
        if (image)
            requestEmbed.setImage(image)
        requestEmbed.setTimestamp();
        requestEmbed.setFooter("ID: "+msg.author.id, msg.author.avatarURL);
        return requestEmbed;
    
}