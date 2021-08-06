module.exports = {
	name: 'modificagt',
    description: 'Modifica il Gamertag di un utente',
    async execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta) {
        
        const member = msg.mentions.members.first();
        if (!member || !args.length) {
            return msg.reply(`ERRORE -> Sintassi del Comando errata. Riprova con \`$modificagt @nomeutente nuovogt\``);
        }
        const mid = member.id;

        let user;
        try {
            user = await users.findOne( { where: { u_id: mid } } );
            if (!user) {
                return msg.reply("L'utente non è registrato nel Database, utilizza \`$portafoglio\` per registrarti!");
            }
            
        } catch(e) {
            return console.log("Errore findone in registraxgt: "+e);
        }

        let myxstats;
        try {
            myxstats = await xboxstatistics.findOne({
                where: {
                    u_id: mid
                }
            })
            if (!myxstats) {
                return msg.reply(`Non è presente alcun GamerTag Xbox registrato per l'utente taggato`)
            }
			// console.log("Trovato: ");
        } catch(e) {
            return msg.reply(`Non è presente alcun GamerTag Xbox registrato per l'untente taggato`)
        }

        try {
            await xboxstatistics.update({
                xboxgt: args.slice(1).join(" ")
            },
            {
                where: {
                    u_id: mid
                }
            })
            return msg.reply(`GamerTag Xbox cambiato correttamente per __${member.user.username}__`)
        } catch (e) {
            console.log("Errore update GT: "+e)
            const registeredyet = await xboxstatistics.findOne({ where: { xboxgt: args.slice(1).join(" ") } })
            if (e.name = "SequelizeUniqueConstraintError")
                return msg.reply(`Questo GamerTag è stato già registrato dall\'utente: ${ msg.guild.members.get(registeredyet.u_id).user.tag } `);
        }


    }

}