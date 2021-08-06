const Discord = require('discord.js');

module.exports = (msg, fs, regole, moneta) => {
    
    const acq_ciurme = fs.readFileSync("./txt_files/acq_ciurme.txt", "utf-8");


    const listaAcquistiEmbed = new Discord.RichEmbed()
        .setColor('0x009933')
        .setAuthor(`<💲> Economy Lista Acquisti <💲>`)
        .addField("⏬ GameRewards ⏬", acq_ciurme)
        .addBlankField()
        .addField("⏬⚠ Rules ⚠⏬", regole + ` *\`$pagaserviziociurma (quantita' di ${moneta}) (nome servizio/ampliamento)\`***`);


        msg.channel.send(listaAcquistiEmbed);
}
        /* msg.channel.send(
            "\`\`\`" + 
            table ([
                { LivelloCiurma: 'Ciurma lvl 1', TalleriRichiesti: 5000,     maxm: 10, canali: 'chat:+3',                      opt: '✖', pers: '✖' },
                { LivelloCiurma: 'Ciurma lvl 2', TalleriRichiesti: 50000,    maxm: 20, canali: 'chat:+5',                      opt: '✖', pers: '✖' },
                { LivelloCiurma: 'Ciurma lvl 3', TalleriRichiesti: 350000,   maxm: 30, canali: 'chat ; lobby:+5',              opt: '✖', pers: '✖' },
                { LivelloCiurma: 'Ciurma lvl 4', TalleriRichiesti: 1000000,  maxm: 40, canali: 'chat:+2 ; lobby: +5',          opt: '✔', pers: '✖'},
                { LivelloCiurma: 'Ciurma lvl 5', TalleriRichiesti: 5000000,  maxm: 50, canali: 'bacheca ; chat:+2 ;\n lobby:+5', opt: '✔', pers: '✔' } 
            ])
            + "\`\`\`"
        ); 
        "\`\`\`"  + 
                table ([
                    { Livello: 'Ciurma L1', Talleri: 5000,     MaxM: 10, Canali: '3Chat',            opt: '✖', pers: '✖' },
                    { Livello: 'Ciurma L2', Talleri: 50000,    MaxM: 20, Canali: '5Chat',            opt: '✖', pers: '✖' },
                    { Livello: 'Ciurma L3', Talleri: 350000,   MaxM: 30, Canali: 'Chat➕5 Lobby',     opt: '✖', pers: '✖' },
                    { Livello: 'Ciurma L4', Talleri: 1000000,  MaxM: 40, Canali: '2Chat➕5Lobby',   opt: '✔', pers: '✖'},
                    { Livello: 'Ciurma L5', Talleri: 5000000,  MaxM: 50, Canali: 'Bacheca➕(lvl4)',  opt: '✔', pers: '✔' } 
                ])
            + "\`\`\`"
        
        */
