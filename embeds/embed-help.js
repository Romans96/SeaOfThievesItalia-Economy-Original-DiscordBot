const Discord = require('discord.js');

module.exports = (msg, moneta, scelta, regole) => {
        
        const helpEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor(`<💲> Economy Help <💲>`)
        
        if (scelta === "utente") {
            helpEmbed.addField(":arrow_down_small: :hash: Comandi UTENTI :hash: :arrow_down_small:", "\u200B")
            .addField("▶ $guidaeconomy", `🔹 Mostra una Guida delle Basi di questo BOT e di come allegare Screen al comando di \`$assistenza (richiesta)\` per la verifica degli obbiettivi raggiunti e ottenuti.`)
            .addField("▶ $portafoglio",`🔹 Mostra le tue monete (${moneta}) attuali. (***N.B.** Utilizzare come primo comando \`$portafoglio\` per poter iniziare ad usare il BOT!*). Inoltre usando questo comando verifichi di aver preso tutti i premi della Community, che puoi vedere con \`$listapremi\`. (I Ruoli dei Rewards ottenuti nel server, li vedi cliccando sul tuo nome) `)
            .addField("▶ $portafogliociurma @nomeciurma", "🔹 Mostra il portafoglio della tua o di un altra Ciurma **->** ( Esempio: \`$portafoglioclan @MyClan\` )")
            .addField(`▶ $deposita (quantita' di ${moneta}) `,`🔹 Deposita alla tua Ciurma una certa quantità di ${moneta} **->** ( Esempio: \`$deposita 10\` )`)
            // .addField(`▶ $pagaservizio (quantita\' di ${moneta}) (nome servizio)`,`🔹 Paga il relativo costo di ${moneta} e la descrizione/nome del servizio che si vuole ottenere **->** ( Esempio: \`$pagaservizio 5 Acquisto Ruolo da cinque monete\` )`)
            .addField("▶ $assistenza (richiesta)", `🔹 Emette una richiesta di assistenza. **Vedere su \`$guidaeconomy\` come inviare, insieme alla richiesta d\'assistenza, un'immagine come prova per completamento obbiettivo** **->** ( Esempio: \`$assistenza Richiesta aggiornamento saldo, pirata leggendario\` )`)
            .addField("▶ $feedback (feedback)",`🔹 Invia un feedback per il bot allo Staff.`)
            .addField("▶ $classificaciurme", "🔹 Mostra Classifica Totale delle Ciurme")
            .addField("▶ $classificautenti", "🔹 Mostra Classifica dei Top 20 Utenti per Talleri depositati alla propria Ciurma")
            .addField("▶ $classificainterna", "🔹 Mostra Classifica Interna della propria Ciurma per Talleri depositati")

            .addField("▶ $listapremi", `🔹 Mostra la lista degli obbiettivi che è possibile raggiungere, con i relativi premi in ${moneta}`)
            .addField("▶ $listaacquisti", `🔹 Mostra la lista dei servizi/aggiornamenti che possono essere attualmente acquistati, con i relativi costi`)
            .addField("▶ $help", `🔹 Mostra il comando iniziale di Aiuto per il BOT`)
            .addField("▶ $info", `🔹 Mostra le informazioni del BOT (Descrizione, Versione, Contatto di Supporto)`)
            
            .addBlankField()
            .addField(":arrow_down_small: :hash: Comandi GESTORI CIURMA :hash: :arrow_down_small:","\u200B")
            .addField(`▶ $depositaallaciurma @nomeciurma (quantita' di ${moneta}) **-> Momentaneamente Disabilitato**`, `🔹 Deposita una certa quantita' di ${moneta} nel portafoglio di un'altra Ciurma **->** ( Esempio: \`$depositaallaciurma @Ciurma1 10\` )`)
            .addField(`▶ $pagaserviziociurma (quantita' di ${moneta}) (nome servizio)`, `🔹 Paga il relativo costo di ${moneta} e la descrizione/nome del servizio che si vuole ottenere per la propria Ciurma **->** ( Esempio: \`$pagaserviziociurma 15 Aumento utenti massimi\` )`)
            .addBlankField()
            .addField("⏬⚠ Rules ⚠⏬", regole + ` *\`$pagaserviziociurma (quantita' di ${moneta}) (nome servizio/ampliamento)\`***`);
            
            helpEmbed.setTimestamp();
            msg.channel.send(helpEmbed)
        }
        else if(scelta === "stats") {
            const guadagni= [
                `1 Forziere Consegnato = 2 ${moneta}`,
                `750 Metri Percorsi = 1 ${moneta}`,
                `1 Viaggio Completato = 1 ${moneta}`,
                `1 Teschio Consegnato = 2 ${moneta}`,
                `1 Carico del Mercante Consegnato = 2 ${moneta}`,
                `1 Isola Visitata = 2 ${moneta}`,
            ];

            helpEmbed.addField(":arrow_down_small: :hash: Comandi STATS (Utenti) :hash: :arrow_down_small: ", "\u200B")
            .addField("**Partiamo ricordando a tutti che se nella Privacy dell\'account Xbox avete visualizzazione dei Giochi e del Profilo SOLO AMICI e non tutti, il BOT non potrà visualizzare le vostre statistiche!.**","\u200B")
            .addField("▶ $registragt GamerTagXbox", `🔹 Registri il tuo GamerTag Xbox collegandolo al tuo account, con le relative statistiche e guadagni i talleri a seconda dei punteggi totalizzati`)
            .addField("▶ $incassa", `🔹 Richiedi i ${moneta}, dati a seconda delle nuove statistiche guadagnate (dall'ultima digitazione del comando)`)
            .addField("▶ $stats", `🔹 Se hai un GamerTag registrato, mostra le tue statistiche attuali (direttamente da Xbox, non quelle salvate nel Database con \`$incassa\` `)
            .addField("▶ Lista dei Guadagni:", guadagni.map(item => "➖ "+ item ) )
            helpEmbed.addBlankField()
            .addField(":arrow_down_small: :hash: Comandi STATS (Staff) :hash: :arrow_down_small: ", "\u200B")
            .addField("▶ $modificagt @utente NuovoGamerTagXbox", `🔹 Modifica il GamerTag dell\'utente taggato`)
            .addField("▶ $rimuovigt @utente", `🔹 Rimuove Il GamerTag collegato a quell'utente taggato, e tutte le statistiche salvate`)
            
            helpEmbed.setTimestamp();
            msg.channel.send(helpEmbed);
        }
        else if (scelta === "staff") {
            helpEmbed.addField(":arrow_down_small: :hash: Comandi STAFF :hash: :arrow_down_small: ", "\u200B")
            .addField("**>>> I seguenti comandi necessitano del ruolo Staff_ID (aggiunto con il comando \`$staffid @ruolostaff\`, dal creatore del server) per essere utilizzati <<<**","\u200B")
            .addField("▶ $visualizzautente @utente", "🔹 Visualizza l'utente @utente")
            .addField("▶ $visualizzaciurma @utente", "🔹 Visualizza la Ciurma @ciurma")
            .addField("▶ $aggiuntiutente @utente", "🔹 Aggiunge un nuovo utente al database")
            .addField("▶ $rimuoviutente @utente", "🔹 Rimuove un utente dal database (e i relativi punti)")
            .addField("▶ $aggiungiciurma @nomeciurma", "🔹 Aggiunge un nuovo ruolo-ciurma al database")
            .addField("▶ $rimuoviciurma @nomeciurma", "🔹 Rimuove un ruolo-ciurma dal ddatabase (e relativi punti)")
            .addField("▶ $aggiungiutalleri @utente N", `🔹 Aggiunge N monete (${moneta}) all'utente @utente`)
            .addField("▶ $rimuoviutalleri @utente N", `🔹 Rimuove N monete (${moneta}) dall'utente @utente`)
            .addField("▶ $aggiungictalleri @nomeciurma N", `🔹 Aggiunge N monete (${moneta}) alla Ciurma @nomeciurma`)
            .addField("▶ $rimuovictalleri @nomeciurma N", `🔹 Rimuove N monete (${moneta}) dalla Ciurma @nomeciurma`)
            .addField("▶ $ban TIPO UTENTE_CIURMA", `🔹 Banna un utente nel BOT, togliendo la possibilità di usare o guadagnare ${moneta}. TIPO: utente o ciurma; UTENTE_CIURMA: @utente o @ciurma. (ES: $ban user @Romans96 -> Imposta il Ban all'utente taggato)`)
            .addField("▶ $unban TIPO UTENTE_CIURMA", `🔹 Unbanna un utente nel BOT, togliendo la possibilità di usare o guadagnare ${moneta}. TIPO: utente o ciurma; UTENTE_CIURMA: @utente o @ciurma. (ES: $unban user @Romans96 -> Rimuove il Ban dall'utente taggato)`)
            const helpEmbed2 = new Discord.RichEmbed()
                .setColor('0x009933')
            helpEmbed2.addField(":arrow_down_small: :hash: Settaggi ECONOMY :hash: :arrow_down_small:","\u200B")
            .addField("▶ $moneta NOME", "🔹 Modifica il nome della moneta in NOME (Può essere sia un testo che un Emoji)")
            .addField("▶ $staffid @ruolostaff", "🔹 Modifica il ruolo Staff in @ruolostaff (SOLO SERVER OWNER)")
            .addField("▶ $gestoreid @ruologestore", "🔹 Modifica il ruolo Gestore in @ruologestore")
            .addField("▶ $chlog #channel", "🔹 Modifica il canale di Logs del BOT in #channel")
            .addField("▶ $chassistenza #channel", "🔹 Modifica il canale delle richieste di Assistenza in #channel")
            .addField("▶ $chservizi #channel", "🔹 Modifica il canale dei pagamenti Servizi/Aggiornamenti in #channel")
            .addField("▶ $limitemoneta TIPO MAX_MIN N", "🔹 Modifica i vari limiti massimi dei portafoglio. TIPO: utenti/ciurme; MAX_MIN: max/min; N: limite a numero. (ES: $limitemoneta ciurme min 0 -> Setta il limite di monete minime dei Portafogli delle Ciurme a 0.")
            .addField("▶ $setruolo (nomeruolo-ES: cuoco) @ruolo", `🔹 Imposta il ruolo taggato nel database, per permettere il check dei ruoli utente attraverso \`$portafoglio\`, e l'aggiunta automatica di eventuali ${moneta} conseguiti`)
            .addField("▶ $mostraimpostazioni", "🔹 Visualizza tutti i settaggi impostati (E\' necessario che tutti siano stati compilati con i precedenti comandi!)")
            .addField("▶ $mostraruoli", `🔹 Mostra i ruoli dei Reward presenti nel DB e i ruoli associate del server`)
            .addField("▶ $setdepositaciurma", "🔹 Attiva/Disattiva il comando \'$depositaallaciurma @ciurma N\'")
            .addField("▶ $aggiornanomeciurme", "🔹 Se viene cambiato il nome di una ciurma (ruolo), con questo comando si aggiorna tale nome nel database");
            helpEmbed2.setTimestamp();
            msg.channel.send(helpEmbed)
            msg.channel.send(helpEmbed2)
        }
}