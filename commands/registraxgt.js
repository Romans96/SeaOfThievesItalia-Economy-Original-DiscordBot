module.exports = {
	name: 'registragt',
	description: 'Registra un nuovo XboxGamerTag impostato, a chi digita il comando',
    async execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta) {
		
		

		const member = msg.mentions.members.first();
        if (!args.length || member) {
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con \`$registragt (xbox gamertag)\` (ES: \`$registragt Romans96\`) `);
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
		const myxboxtag = await xboxstatistics.findOne({where: {u_id: msg.author.id}})
		if (myxboxtag)
			return msg.reply(`Hai già registrato un GamerTag Xbox -> *${myxboxtag.xboxgt}*`)

		const ms1 = await msg.channel.send(`Stai per registrarti con il GamerTag Xbox --> ${args.slice(0).join(" ")} <--\nRicorda che se sbaglierai il GT potrà essere modificato solo dallo Staff e solo a decisione dello Staff\nInoltre se ti registri per ottenere le stats di un altro Utente, verrai bannato dall'uso del BOT per una settimana e il tuo portafoglio verrà resettato`, {code: 'HTTP'});
		const ms = await msg.channel.send(`Confermi il comando?`);
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
					ms1.delete();

					try {
						await xboxstatistics.create({
							u_id: msg.author.id,
							name: msg.author.username,
							xboxgt: args.slice(0).join(" "),
						})
						msg.reply(`Registrato con Xbox Gamertag: *${args.slice(0).join(" ")}*`);
					} catch(e) {
						const registeredyet = await xboxstatistics.findOne({ where: { xboxgt: args[0] } })
						if (e.name = "SequelizeUniqueConstraintError")
							return msg.reply(`Questo GamerTag è stato già registrato dall\'utente: ${ msg.guild.members.get(registeredyet.u_id).user.tag } `);
						
						return msg.reply(`Hai già registrato un GamerTag, richiedi allo Staff per un eventuale modifica per inserimento errato`)
						
					}

					const statNotFsund = [
						`Impossibile Ottenere le tue Statistiche Xbox.`,
						`Verificare, al seguente link https://account.xbox.com/it-IT/Settings i seguenti campi.`,
						`Nella sezione *\'Altri possono\'*:`,
						`🔸 Vedi il tuo profilo Xbox -> Impostato su **Tutti**`,
						`🔸 Vedi la tua cronologia di giochi e app -> Impostato su **Tutti**`
					]

					const actual_stats = await checkStats(msg, args);

					const elems = actual_stats.groups[0].statlistscollection[0].stats;
					// console.log(elems[5].value)
					if (elems[0].value === undefined || elems[0].value === NaN) {
						return msg.reply(statNotFsund.map( i => i ))
					}

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
							u_id: msg.author.id
						}
					})

					let newbalance = 0;
					msg.channel.send("Ottenuti i seguenti Talleri: ")
					
					if (elems[0].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[0].value) *2 ); // Forzieri
						msg.channel.send(`${msg.author.username} - Forzieri Incassati: ${elems[0].value} -> Ottenuti: ${Math.floor( parseInt(elems[0].value) *2 )} talleri`, {code: codecolor})
					}

					if (elems[1].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[1].value) / 750 ); // Distanza
						msg.channel.send(`${msg.author.username} - Distanza Percorsa (Metri): ${elems[1].value} -> Ottenuti: ${Math.floor( parseInt(elems[1].value) / 750 )} talleri`, {code: codecolor})
					}

					if (elems[2].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[2].value) *2 ); // Viaggi
						msg.channel.send(`${msg.author.username} - Viaggi COmpletati: ${elems[2].value} -> Ottenuti: ${Math.floor( parseInt(elems[2].value) *2 )} talleri`, {code: codecolor})
					}

					if (elems[3].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[3].value) *2 ); // Teschi
						msg.channel.send(`${msg.author.username} - Teschi Incassati: ${elems[3].value} -> Ottenuti: ${Math.floor( parseInt(elems[3].value) *2 )} talleri`, {code: codecolor})
					}

					if (elems[4].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[4].value) *2 ); // Mercante
						msg.channel.send(`${msg.author.username} - Carichi Incassati: ${elems[4].value} -> Ottenuti: ${Math.floor( parseInt(elems[4].value) *2 )} talleri`, {code: codecolor})
					}

					if (elems[5].value !== undefined) {
						newbalance += Math.floor( parseInt(elems[5].value) *2 ); // isole
						msg.channel.send(`${msg.author.username} - Isole Visitate: ${elems[5].value} -> Ottenuti: ${Math.floor( parseInt(elems[5].value) *2 )} talleri`, {code: codecolor})
					}

					user = await users.findOne({where: {u_id: msg.author.id}})

					users.update({
						balance: (parseInt(user.balance)+newbalance)
					},
					{
						where: {
							u_id: msg.author.id
						}
					});



				}
				else if (reaction.emoji.name === '✖') {
					msg.reply('Comando Annullato!');
					ms.delete();
					ms1.delete();
				}
				else {
					msg.reply('Reazione selezionata errata!');
					ms.delete();
					ms1.delete();
				}
			})
			.catch(collected => {
				msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
				ms.delete();
				ms1.delete();
			});
	},
};