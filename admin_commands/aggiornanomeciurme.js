module.exports = {
	name: 'aggiornanomeciurme',
    description: 'Aggiorna nel Database eventuali modifiche dei nomi',
    async execute(msg, args, users, crews, codecolor) {

        let mycrews;
        try {
            mycrews = await crews.findAll();
        }
        catch (e) {
            return console.log("Errore aggiornamento nome ciurme: "+e)
        }
        let flag = 0;
        mycrews.map(async function(item) {
            const acrew = msg.guild.roles.get(item.c_id);
            if (acrew.name !== item.name) {
                try {
                    await crews.update({
                        name: acrew.name,
                    },
                    {
                        where: {
                            c_id: acrew.id
                        }
                    })
                    msg.channel.send(`Aggiornato nome della Ciurma: ${item.name}\nCon il nuovo nome: ${acrew.name}`, {code: 'HTTP'})
                } catch(e) {
                    console.log("Errore update nome ciurma: "+e)
                    
                }
            }
            else flag++;

        });
        if (flag === mycrews.length) {
            msg.reply(`Tutti i nomi delle Ciurme registrate nel Database, sono aggiornati!`)
        }

    }
}
        