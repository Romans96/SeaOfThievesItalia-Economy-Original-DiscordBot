const Discord = require('discord.js');

module.exports = (msg, feedback, image) => {
            
        const requestEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor(`<💲> Economy Feedback <💲>`)
            .addField(msg.author.username + " Ha inviato il Feedback:", "*"+feedback+"*")
            .addField("Nel canale: ", msg.channel );
            
        if (image)
            requestEmbed.setImage(image)
        requestEmbed.setTimestamp();
        requestEmbed.setFooter("ID: "+msg.author.id, msg.author.avatarURL);
        return requestEmbed;
}