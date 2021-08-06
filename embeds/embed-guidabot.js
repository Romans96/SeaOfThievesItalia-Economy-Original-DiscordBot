Discord = require('discord.js');

module.exports = async (msg, fs, regole, moneta) => {
        
    const guida = fs.readFileSync("./txt_files/guida.txt", "utf-8");
    const guida1 = fs.readFileSync("./txt_files/guida1.txt", "utf-8");
    const guida2 = fs.readFileSync("./txt_files/guida2.txt", "utf-8");


    let regola =
        `Regole Talleri:
        1) I Talleri d\'oro sono di proprietà dei singoli pirati che devono farseli accreditare da un moderatore previa prova con screenshot. \
        2) Per utilizzare i talleri d\'oro per l\'ampliamento della ciurma privata, \
        essi vanno donati al Gestore Ciurma che chiederà il riscatto dell\'ampliamento all\'interno del Conclave, \
        utilizzando l\'apposito comando (SOLO Gestori Ciurma): $pagaserviziociurma (quantita\' di Talleri) (nome servizio/ampliamento)`;
    

    const guidaEmbed = new Discord.RichEmbed()
        .setColor('0x009933')
        .setAuthor(`<💲> Economy Guida <💲>`)
        .addField("⏬ Guida ⏬", guida)
        .addField("\u200B", guida1)
        .addField("\u200B", guida2)
        .setImage('https://i.imgur.com/UN6x2z5.gif')
        
        .setFooter(regola);

    msg.channel.send( guidaEmbed ) ;
}