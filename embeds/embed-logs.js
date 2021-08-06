const Discord = require('discord.js');

module.exports = (msg, args, moneta, crew, azione) => {
        
        const logEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor(`<💲> Economy Logs <💲>`)

        switch(azione) {
            case "donate":
                logEmbed.addField(msg.author.username, `Ha depositato ${parseInt(args[0])} ${moneta} alla Ciurma ${crew.name}`);
                break;

            case "donatecrew":
                logEmbed.addField(msg.author.username + ` (Gestore)`, `Ha depositato ${parseInt(args[1])} ${moneta} (di Ciurma), alla Ciurma ${crew.name}`);
                break;
            
            // ##STAFF LOGS##
            case "adduser":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha aggiunto l'utente __${crew.name}__`);
                break;
            case "remuser":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso l'utente __${args.user.username}__`);
                break;
            
            case "addcrew":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha aggiunto la Ciurma __${crew.name}__`);
                break;
                
            case "remcrew":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso la Ciurma __${args.name}__`);
                break;

            case "aggiungiutalleri":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha aggiunto *${parseInt(args[1])} ${moneta}* a ${crew.user.tag}`);
                break;
            
            case "rimuoviutalleri":
                if (!Number.isInteger(args[1])) {
                    logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso *${args[1]} ${moneta}* da ${crew.user.tag}`);
                }
                else {
                    logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso *${parseInt(args[1])} ${moneta}* da ${crew.user.tag}`);
                }
                
                break;

            case "aggiungictalleri":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha aggiunto *${parseInt(args[1])} ${moneta}* alla Ciurma ${crew.name}`);
                break;

            case "rimuovictalleri":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso *${parseInt(args[1])} ${moneta}* dalla Ciurma ${crew.name}`);
                break;

            case "banuser":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha bannato dal BOT l'utente *${args.user.username} (ID: ${args.id})*`)
                break;
            case "bancrew":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha bannato dal BOT la Ciurma *${args.name} (ID: ${args.id})*`)
                break;
            case "unbanuser":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso il ban dal BOT dall'utente *${args.user.username} (ID: ${args.id})*`)
                break;
            case "unbancrew":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha rimosso il ban dal BOT dalla Ciurma *${args.name} (ID: ${args.id})*`)
                break;

            // ##SETTAGGI ECONOMY LOGS##
            case "moneta":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato la moneta in ${args[0].trim()}`);
                break;

            case "staffid":
                logEmbed.addField(msg.author.username + " (Server Owner)", `Ha cambiato lo Staff_ID in <@&${args.id}>`);
                break;

            case "gestoreid":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il Gestore_ID in <@&${args.id}>`);
                break;

            case "economyid":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il Ruolo Economy in <@&${args.id}>`);
                break;

            case "chrequest":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il canale di Assistenza/Richieste in <#${args.id}>`);
                break;
                
            case "chfeedback":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il canale di Feedback in <#${args.id}>`);
                break;

            case "chservices":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il canale dei Servizi/Aggiornamenti in <#${args.id}>`);
                break;

            case "moneylimit":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il *__${args[1]}__ (option MAX_MIN)* del Portafoglio *__${args[0]}__ (option TIPO)* con il seguente limite: *__${args[2]}__ (option N)* ${moneta}`);
                break;

            case "setruolo":
                logEmbed.addField(msg.author.username + " (Staff)", `Ha cambiato il ruolo __${args[0]}__ del DataBase in *${args[1]}*`);
                break;

        }

        logEmbed.addField("Azione eseguita nel canale:", msg.channel);

        logEmbed.setTimestamp();
        logEmbed.setFooter("ID dell'autore del Comando: "+msg.author.id, msg.author.avatarURL);
        return logEmbed;
    
}