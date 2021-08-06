module.exports = {
	name: 'incassa',
    description: 'Incassa i Talleri a seconda delle statistiche conseguite dall\'ultima digitazione del comando',
    async execute(msg, args, users, xboxstatistics, checkStats, checkAchievements, codecolor, moneta, xboxStatsRewardMolt) {
        
        if (args[0]) return;
        else if (args.length) {
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con \`$incassa\``);
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

        let myxstats;
        try {
            myxstats = await xboxstatistics.findOne({
                where: {
                    u_id: msg.author.id
                }
            })
            if (!myxstats) {
                return msg.reply(`Non hai registrato un GamerTag Xbox, registrati con il comando \`$registragt GamerTag\` `)
            }
			// console.log("Trovato: ");
        } catch(e) {
            return msg.reply(`Non hai registrato un GamerTag Xbox, registrati con il comando \`$registragt GamerTag\` `)
        }

        const ruolo_arena = msg.guild.roles.get('587796309399044116');
        const ruolo_cacciatori = msg.guild.roles.get('589454386749767702');
        // console.log(ruolo_arena)

        
        const statNotFsund = [
			`Impossibile Ottenere le tue Statistiche Xbox.`,
			`Verificare, al seguente link https://account.xbox.com/it-IT/Settings i seguenti campi.`,
			`Nella sezione *\'Altri possono\'*:`,
			`🔸 Vedi il tuo profilo Xbox -> Impostato su **Tutti**`,
			`🔸 Vedi la tua cronologia di giochi e app -> Impostato su **Tutti**`
		]

        const gt = myxstats.xboxgt.trim().split(/ +/);
        const actual_stats = await checkStats(msg, gt );


        // console.log(actual_stats.groups)
        if (actual_stats.groups === undefined || actual_stats.groups[0].name.toLowerCase() !== "hero") return;
        const elems = actual_stats.groups[0].statlistscollection[0].stats;
        if (elems[0].value === undefined || elems[0].value === NaN) {
            return msg.reply(statNotFsund.map( i => i ))
        }

        let newbalance = 0, flagElse = 0;
        const allxboxstats = await xboxStatsRewardMolt.findAll({
            order: [
                ['id','ASC']
            ]
        });

        // 1) FORZIERI
        const nuoviForzieri = Math.floor( (parseInt(elems[0].value)-myxstats.xboxforzieri) *2) * allxboxstats[0].data;

        if (nuoviForzieri > 0) {
            flagElse = true;
            newbalance = newbalance + nuoviForzieri; // Forzieri
            msg.channel.send(`${msg.author.username} - Forzieri Incassati => Precedenti: ${myxstats.xboxforzieri} - Attuali: ${elems[0].value} -> Ottenuti: ${nuoviForzieri} talleri`, {code: codecolor})
        }

        // 2) DISTANZA
        const nuovaDistanza = Math.floor( (parseInt(elems[1].value)-myxstats.xboxdistanza) / 750) * allxboxstats[1].data;

        if (nuovaDistanza > 0) {
            flagElse = true;
            newbalance = newbalance + nuovaDistanza; // Distanza
            msg.channel.send(`${msg.author.username} - Distanza Percorsa (Metri) => Precedenti: ${myxstats.xboxdistanza} - Attuali: ${elems[1].value} -> Ottenuti: ${nuovaDistanza} talleri`, {code: codecolor})
        }

        // 3) VIAGGI
        const nuoviViaggi = Math.floor( (parseInt(elems[2].value)-myxstats.xboxviaggi) *2) * allxboxstats[2].data;
        if (nuoviViaggi > 0) {
            flagElse = true;
            newbalance = newbalance + nuoviViaggi; // Viaggi
            msg.channel.send(`${msg.author.username} - Viaggi Completati => Precedenti: ${myxstats.xboxviaggi} - Attuali: ${elems[2].value} -> Ottenuti: ${nuoviViaggi} talleri`, {code: codecolor})
        }

        // 4) TESCHI
        const nuoviTeschi = Math.floor( (parseInt(elems[3].value)-myxstats.xboxteschi) *2 ) * allxboxstats[3].data;
        if (nuoviTeschi > 0) {
            flagElse = true;
            newbalance = newbalance + nuoviTeschi; // Teschi
            msg.channel.send(`${msg.author.username} - Teschi Incassati => Precedenti: ${myxstats.xboxteschi} - Attuali: ${elems[3].value} -> Ottenuti: ${nuoviTeschi} talleri`, {code: codecolor})
        }

        // 5) MERCANTE
        const nuovoMercante = Math.floor( (parseInt(elems[4].value)-myxstats.xboxmercante) *2 ) * allxboxstats[4].data;
        if (nuovoMercante > 0) {
            flagElse = true;
            newbalance = newbalance + nuovoMercante; // Mercante
            msg.channel.send(`${msg.author.username} - Carichi Incassati => Precedenti: ${myxstats.xboxmercante} - Attuali: ${elems[4].value} -> Ottenuti: ${nuovoMercante} talleri`, {code: codecolor})
        }

        // 6) ISOLE
        const nuoveIsole = Math.floor( (parseInt(elems[5].value)-myxstats.xboxisole) *2 ) * allxboxstats[5].data;
        // console.log( (parseInt(elems[5].value))-myxstats.xboxisole   )
        if (nuoveIsole > 0) {
            flagElse = true;
            newbalance = newbalance + nuoveIsole ; // isole
            msg.channel.send(`${msg.author.username} - Isole Visitate => Precedenti: ${myxstats.xboxisole} - Attuali: ${elems[5].value} -> Ottenuti: ${nuoveIsole} talleri`, {code: codecolor})
        }


        const actual_achievements = await checkAchievements(msg, gt);
        actual_achievements.map( async elem => {
            // console.log(elem.id + " "+elem.name )
            if (elem.id === 74 && elem.progressState === "Achieved") { // Maestro dell\'arena
                if (myxstats.maestro_arena === false) {
                    flagElse = true;
                    newbalance = parseInt(newbalance) + 25000;
                    // console.log("Dentro maestro arena "+elem.progressState);
                    msg.channel.send(`${msg.author.username} - Ottenuto Achievement: ~ ${elem.name} ~! -> Ottenuti: 25000 talleri`, {code: codecolor})

                    // Assegnazione Ruolo
                    const member = msg.guild.member(msg.author);
                    member.addRole(ruolo_cacciatori.id).catch(console.error)
                    msg.channel.send(`${msg.author.username} - Ottenuto Ruolo: ~ ${ruolo_arena.name} ~!`, {code: codecolor})


                    await xboxstatistics.update({
                        maestro_arena: true,
                    },
                    {
                        where: {
                            u_id: msg.author.id
                        }
                    })

                }
            }

            if (elem.id === 86 && elem.progressState === "Achieved") { // Maestro dei cacciatori
                if (myxstats.maestro_cacciatore === false) {
                    flagElse = true;
                    newbalance = parseInt(newbalance) + 15000;
                    // console.log("Dentro maestro cacciatori "+elem.progressState);
                    msg.channel.send(`${msg.author.username} - Ottenuto Achievement: ~ ${elem.name} ~! -> Ottenuti: 15000 talleri`, {code: codecolor})

                    // Assegnazione ruolo
                    const member = msg.guild.member(msg.author);
                    member.addRole(ruolo_cacciatori.id).catch(console.error)
                    msg.channel.send(`${msg.author.username} - Ottenuto Ruolo: ~ ${ruolo_cacciatori.name} ~!`, {code: codecolor})


                    await xboxstatistics.update({
                        maestro_cacciatore: true,
                    },
                    {
                        where: {
                            u_id: msg.author.id
                        }
                    })
                }
            }
        })

        // console.log(actual_achievements[72])
        // console.log(actual_achievements[72].progressState)

        if (!flagElse) return msg.reply(`Hai incassato tutti i Talleri delle Stats/Achievements disponibili`)
        
        const old_balance = user.balance;
        const finalbalance = parseInt(newbalance)+parseInt(old_balance);

        await users.update({
            balance: finalbalance
        },
        {
            where: {
                u_id: msg.author.id
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
				u_id: msg.author.id
			}
		})
    }
}