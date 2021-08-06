module.exports = {
	name: 'rimuovigt',
    description: 'Rimuove un GamerTag Xbox e tutti i dati salvati',
    async execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta) {


        const member = msg.mentions.members.first();
        if (!member || args.slice(1).length) 
            return msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$rimuovigt @utente\`");
        else if(!await users.findOne({where: {u_id: member.id}}))      
            return msg.reply("Utente non registrato nel Database")  
        
        const ms = await msg.channel.send("Rimuoverai Il GamerTag Xbox dell\'utente e tutte le statistiche salvate.\nConfermi il comando?");
        await ms.react('✔').then(() => ms.react('✖'));
        const filter = (reaction, xboxuser) => {
            return ['✔', '✖'].includes(reaction.emoji.name) && xboxuser.id === msg.author.id;
        };
        ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then( async collected => {
                const reaction = collected.first();

                if (reaction.emoji.name === '✔') {
                    msg.reply('Comando confermato!');
                    ms.delete();

                    const mid = member.id;
                    try {
                        const xboxuser = await xboxstatistics.destroy({
                            where: {
                                u_id: mid
                            }
                        });
                        if (!xboxuser) {
                            return msg.reply("L\'utente non ha registrato alcun GamerTag")
                        }
                        msg.reply('GamerTag Utente rimosso correttamente!');

                        // azione = "remxboxuser";
                        // msg.client.channels.get(LogsCh_ID).send( logs(msg, member, moneta, null, azione) );
                    }
                    catch (e) {
                        msg.reply('Errore nella rimozione del GamerTag dell\'Utente, controlla se ne ha effettivamente registrato uno');
                        console.log('REMXBOXGT: Something went wrong with removing an User. -> '+e);
                    }
                    
                } 
                else if (reaction.emoji.name === '✖') {
                    msg.reply('Comando Annullato!');
                    ms.delete();
                }
                else {
                    msg.reply('Reazione selezionata errata!');
                    ms.delete();
                }
            })
            .catch(collected => {
                msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                ms.delete();
            });

        

    }

}