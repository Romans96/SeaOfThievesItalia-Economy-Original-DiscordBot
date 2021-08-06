module.exports = {
	name: 'embedmsg',
	description: 'Invia un embed personalizzato per Colore, Titolo e Testo',
    async execute(client, msg, args) {
        
        const comando = [
            ` \`$embedmsg #canale colore(es: 36393f) {"titolo":"Titolo dell\'embed","testo":"Testo dell\'Embed" }\` `,
            ` \`$embedmsg #canale colore(es: 36393f) {"titolo":"Titolo dell\'embed","testo":"Testo dell\'Embed","tags":" @Tallero " }\` `,
            ` \`$embedmsg #canale colore(es: 36393f) {"titolo":"Titolo dell\'embed","testo":"Testo dell\'Embed","tags":" @Tallero, @News, @ruolo " }\` `
        ]

        const logo = new Discord.Attachment('./LOGO/barbanera.jpg');

        const ch = msg.mentions.channels.first();
        const color = args[1];
        const text = args.slice(2).join(" ");
        
        // console.log(jsonText.title);
        // console.log(text);
        
        let jsonText = null;
        try {
            jsonText = JSON.parse(text);
        }
        catch(e) {
            console.log("Errore Parse jsonText: "+e)
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con: \n${comando[0]} \noppure \n${comando[1]} \noppure \n${comando[2]}`);

        }

        let tags = null;
        try {
            tags = jsonText.tags.split(",");
        } catch(e) {
            console.log("Errore Messaggio Embed (tags): "+e)
        }
         

        // console.log(tags)

        const embedMsg = new Discord.RichEmbed()
            .attachFile(logo)
            .setColor('0x'+color)
            .setAuthor(jsonText.titolo, 'attachment://barbanera.jpg')
            .setTimestamp()

        if (jsonText.testo) {
            embedMsg.setDescription(jsonText.testo)
        }
        
        const channel = client.channels.get(ch.id);
        
        try {
            if (!tags) {
            
            }
            else if (tags.length > 1) {
                channel.send( tags.map(elem => elem.trim() ) )
            }
            else if (tags.length === 1) {
                channel.send( tags )
            }
            
            channel.send(embedMsg)
            msg.reply(`Messaggio Embed inviato correttamente nel canale ${ch}!`)
        } catch (e) {
            msg.reply(`Errore nell\'invio del Messaggio Embed`);
            console.log("Errore Messaggio Embed: "+e)
        }
        
        
    }
}