const Discord = require('discord.js');
module.exports = {
	name: 'incassaall',
    description: 'Incassa i Talleri a seconda delle statistiche conseguite da tutti gli Utenti registrati',
    async execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta, resolveAfter) {
        
        if (args[0]) return;
        else if (args.length) {
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con \`$incassa\``);
        }

        let myxstats;
        try {
            myxstats = await xboxstatistics.findAll();
			// console.log("Trovato: ");
        } catch(e) {
            return msg.reply(`Non hai registrato un GamerTag Xbox, registrati con il comando \`$registragt GamerTag\` `)
        }
        
        
        const statNotFsund = [
			`Impossibile Ottenere le tue Statistiche Xbox.`,
			`Verificare, al seguente link https://account.xbox.com/it-IT/Settings i seguenti campi.`,
			`Nella sezione *\'Altri possono\'*:`,
			`🔸 Vedi il tuo profilo Xbox -> Impostato su **Tutti**`,
			`🔸 Vedi la tua cronologia di giochi e app -> Impostato su **Tutti**`
        ]
        
        // const ms = await msg.channel.send("Incasso totale talleri in corso...");;

        let embedLoading = new Discord.RichEmbed()
            .setColor('0x36393f')
            .setAuthor('Attendi ...','https://images-ext-1.discordapp.net/external/lWj3uW4qvfFB9t0QgGsDJ8vLvh5bSObQ-wwUxYFH4wo/https/images-ext-1.discordapp.net/external/AzWR8HxPJ4t4rPA1DagxJkZsOCOMp4OTgwxL3QAjF4U/https/cdn.discordapp.com/emojis/424900448663633920.gif')
            .setDescription("Incasso Talleri in Corso...")

        const ms = await msg.channel.send(embedLoading)

        for (let index = 0; index < myxstats.length; ++index) {
            const gt = myxstats[index]/* .xboxgt.trim().split(/ +/) */;
            const gtname = gt.xboxgt.trim().split(/ +/);
            const gtuid = gt.u_id;
            console.log(gtname+" "+gtuid+" "+index)
            let user;
            try {
                user = await users.findOne( { where: { u_id: gtuid } } );
                if (!user) {
                    return msg.reply("Non sei registrato, utilizza \`$portafoglio\` per registrarti!");
                }
                else if (user.banned) {
                    return msg.reply(`Sei stato bannato dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
                }
            } catch(e) {
                return console.log("Errore findone in registraxgt: "+e);
            }

            const actual_stats = await checkStats(msg, gtname );
            let elems = null;
            // console.log(actual_stats.groups)
            if (actual_stats.groups !== undefined) {
                elems = actual_stats.groups[0].statlistscollection[0].stats;
                if (elems[0].value !== undefined || elems[0].value !== NaN) {
                    
                    let newbalance = 0, flagElse = 0;
                    
                    // 1) FORZIERI
                    const nuoviForzieri = Math.floor( (parseInt(elems[0].value)-myxstats[index].xboxforzieri) *2);

                    if (nuoviForzieri > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuoviForzieri; // Forzieri
                        // msg.channel.send(`${gtname} - Forzieri Incassati => Precedenti: ${myxstats[index].xboxforzieri} - Attuali: ${elems[0].value} -> Ottenuti: ${nuoviForzieri} talleri`, {code: codecolor})
                        console.log(`Forzieri utente ${gtname}  - Forzieri Incassati => Precedenti: ${myxstats[index].xboxforzieri} - Attuali: ${elems[0].value} -> Ottenuti: ${nuoviForzieri} talleri`)
                    }

                    // 2) DISTANZA
                    const nuovaDistanza = Math.floor( (parseInt(elems[1].value)-myxstats[index].xboxdistanza) / 750);

                    if (nuovaDistanza > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuovaDistanza; // Distanza
                        // msg.channel.send(`${gtname} - Distanza Percorsa (Metri) => Precedenti: ${myxstats[index].xboxdistanza} - Attuali: ${elems[1].value} -> Ottenuti: ${nuovaDistanza} talleri`, {code: codecolor})
                    }

                    // 3) VIAGGI
                    const nuoviViaggi = Math.floor( (parseInt(elems[2].value)-myxstats[index].xboxviaggi) *2);
                    if (nuoviViaggi > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuoviViaggi; // Viaggi
                        // msg.channel.send(`${gtname} - Viaggi Completati => Precedenti: ${myxstats[index].xboxviaggi} - Attuali: ${elems[2].value} -> Ottenuti: ${nuoviViaggi} talleri`, {code: codecolor})
                    }

                    // 4) TESCHI
                    const nuoviTeschi = Math.floor( (parseInt(elems[3].value)-myxstats[index].xboxteschi) *2 );
                    if (nuoviTeschi > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuoviTeschi; // Teschi
                        // msg.channel.send(`${gtname} - Teschi Incassati => Precedenti: ${myxstats[index].xboxteschi} - Attuali: ${elems[3].value} -> Ottenuti: ${nuoviTeschi} talleri`, {code: codecolor})
                    }

                    // 5) MERCANTE
                    const nuovoMercante = Math.floor( (parseInt(elems[4].value)-myxstats[index].xboxmercante) *2 );
                    if (nuovoMercante > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuovoMercante; // Mercante
                        // msg.channel.send(`${gtname} - Carichi Incassati => Precedenti: ${myxstats[index].xboxmercante} - Attuali: ${elems[4].value} -> Ottenuti: ${nuovoMercante} talleri`, {code: codecolor})
                    }

                    // 6) ISOLE
                    const nuoveIsole = Math.floor( (parseInt(elems[5].value)-myxstats[index].xboxisole) *2 );
                    if (nuoveIsole > 0) {
                        flagElse = true;
                        newbalance = newbalance + nuoveIsole ; // isole
                        // msg.channel.send(`${gtname} - Isole Visitate => Precedenti: ${myxstats[index].xboxisole} - Attuali: ${elems[5].value} -> Ottenuti: ${nuoveIsole} talleri`, {code: codecolor})
                    }

                    // if (!flagElse) msg.channel.send(`${gtname} - Hai incassato tutti i Talleri delle Stats disponibili`, {code: codecolor})
                    
                    const old_balance = user.balance;
                    const finalbalance = parseInt(newbalance)+parseInt(old_balance);

                    resolveAfter();
                    await users.update({
                        balance: finalbalance
                    },
                    {
                        where: {
                            u_id: gtuid
                        }
                    })

                    await xboxstatistics.update({
                        xboxforzieri: elems[0].value,
                        xboxdistanza: elems[1].value,
                        xboxviaggi: elems[2].value,
                        xboxteschi: elems[3].value,
                        xboxmercante: elems[4].value,
                        xboxisole: elems[5].value,
                    },
                    {
                        where: {
                            u_id: gtuid
                        }
                    })
                }
            }
            else {
                console.log("Non trovato")
            }
            
        }

        embedLoading.setAuthor('✅ Finito!')
            .setDescription('Tutti i Talleri Globali incassati Correttamente!')

        ms.edit(embedLoading)
        
    }
}