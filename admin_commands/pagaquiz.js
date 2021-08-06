const Discord = require('discord.js');
module.exports = {
	name: 'pagaquiz',
	description: 'Paga un certo tot di Talleri a chi ha vinto il Quiz',
    async execute(msg, args, users, codecolor, moneta, UserMaxMoneta, ServicesCh_ID) {
        
        const ch = msg.mentions.channels.first();
        if (!ch || !args[0] || !args[1] || !args[2] || !Number.isInteger(parseInt(args[2])) || args.slice(3).length) {
            return msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$pagaquiz #canale idmessaggio quantità_talleri\`");
        }
        const msgid = args[1].trim();
        const reward = args[2].trim();
        let mid;
        let num;
        let balancef;

        const premiazione = await msg.channel.send(`Premiati con *${reward} ${moneta}* i seguenti utenti per vincita Quiz Giornaliero:`);
        msg.guild.channels.get(ch.id).fetchMessage(msgid).then( mex =>{
            mex.mentions.members.map(async element => {

                // console.log(element.user.username);
                // console.log(mid);
                // msg.channel.send(`Dati ${reward} a ${element.user.username}`)

                let user = await users.findOne({ where: { u_id: element.user.id }} ); 
                if (!user) {
                    return msg.reply("L'utente non e' presente nel DataBase");
                }
                else if (user.banned) {
                    return msg.reply(`l\'utente è bannato dal BOT, non può usare o guadagnare ${moneta}`)
                }
                balancef = user.get('balance');
                // console.log(balancef)
                num = parseInt(balancef)+parseInt(reward);
                if (num > UserMaxMoneta) {
                    return msg.reply(`Monete massime superate (${UserMaxMoneta}). Non è possibile superare tale limite!`);
                }
                try {
                    await users.update({balance: num }, {where: { u_id: element.user.id }});
                    // user = await users.findOne({ where: { u_id: element.user.id }} ); 
                    // console.log(user.name +" "+user.balance)
                    msg.channel.send(`${element.user} (User TAG: ${element.user.tag})`);
                }
                catch (e) {
                    msg.reply("Errore nella modifica dell'utente, riprova!");
                    console.log("ADDUSERMONEY-pagaquiz: Error => "+ e);
                }
            });
            
            // LOG
            msg.client.channels.get(ServicesCh_ID).send( 
                new Discord.RichEmbed()
                    .setAuthor('<$> Quiz pagato! <$>')
                    .addField(`Somma di ${moneta} pagata`, `${reward} ${moneta}`)
                    .addField(`Link Messaggio vincitori da pagare`, `[Vai al Messaggio](https://discordapp.com/channels/404295489010532372/${ch.id}/${msgid})`)
                    .addField(`Link Messaggio pagamento vincitori`, `[Vai al Messaggio](https://discordapp.com/channels/404295489010532372/${premiazione.channel.id}/${premiazione.id})`)
                    .addField(`Membro Staff che ha eseguito il pagamento`, msg.author.tag)
                    .setFooter(`ID Staffer pagante: ${msg.author.id}`, msg.author.avatarURL)
                    .setTimestamp()
            );
        }).catch(err => {
            console.log("PAGAQUIZ: Errore ricerca messaggio in canale - "+err)
            msg.reply(`Nessun Messaggio trovato nel canale ${ch} con quell'id!`)
        })
        
    }
}