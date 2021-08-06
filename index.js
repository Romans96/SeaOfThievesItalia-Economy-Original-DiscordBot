const Discord = require('discord.js');
const config = require("./config.json");
const Sequelize = require('sequelize');
const fs = require('fs');
const fetch = require ('node-fetch');

require('dotenv').config(); 
const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const admin_commandFIles = fs.readdirSync('./admin_commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
for (const file of admin_commandFIles) {
	const command = require(`./admin_commands/${file}`);
	client.commands.set(command.name, command);
}

const logs = require('./embeds/embed-logs.js');
const requests = require('./embeds/embed-request.js');
const services = require('./embeds/embed-services.js');
const help = require('./embeds/embed-help.js');
const listapremi = require('./embeds/embed-listapremi.js');
const listaacquisti = require('./embeds/embed-listaacquisti.js');
const guidabot = require('./embeds/embed-guidabot.js');
const info = require('./embeds/embed-info.js');

const regole = fs.readFileSync("./txt_files/regole.txt", "utf-8");

// ######DATABASE SETTINGS######
const Op = Sequelize.Op;

const sequelize = new Sequelize( {
	database: 'economy',
	username: 'sotitalia',
	password: 'psw',
	host: '127.0.0.1',
	dialect: 'postgres',
	protocol: 'postgres',
	/* dialectOptions: {
	ssl: true
	}, ONLY HOST*/
	logging: false,
	port: '5432' ,
    define: {
        charset: 'utf8',
        dialectOptions: {
          collate: 'utf8_general_ci'
        }
    },
    omitNull: true,
    // logging: console.log,
    pool: {
		max: 150,
		min: 0,
		idle: 500,
		acquire: 120000,
		evict: 1000
	}
});
sequelize.authenticate().then( () => {
		console.log("Connessione stabilita");
	}).catch(err => {
		console.error("Impossibile connettersi: "+err);
	});

const crews = sequelize.define('crews', {
    c_id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
		unique: true,
    },
    balance: {
        type: Sequelize.INTEGER,
    },
    banned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
});

const users = sequelize.define('users', {
    u_id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
		unique: true,
    },
    balance: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    date_j: {
        type: Sequelize.STRING,
        defaultValue: "",
    },
    banned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    rolelevel: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    piratetype: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    balance_dep: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    }
});

const eco_settings = sequelize.define('economy_settings', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    datas: {
        type: Sequelize.STRING,
        defaultValue: "~",
    }
},{
    timestamps: false,
});

const rolelevels = sequelize.define('rolelevels', {
    level: {
        type: Sequelize.INTEGER,
        unique: true,
        primaryKey: true,
    },
    rolename: {
        type: Sequelize.STRING,
        unique: true,
    },
    roleid: {
        type: Sequelize.STRING,
        defaultValue: "",
    },
    reward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    }
});

const piratetypes = sequelize.define('piratetype', {
    level: {
        type: Sequelize.INTEGER,
        unique: true,
        primaryKey: true,
    },
    rolename: {
        type: Sequelize.STRING,
        unique: true,
    },
    roleid: {
        type: Sequelize.STRING,
        defaultValue: "",
    },
    reward: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    }
});

const xboxstatistics = sequelize.define('xboxstatistics', {
    u_id: {
        type: Sequelize.STRING,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
		unique: true,
    },
    xboxgt: {
        type: Sequelize.STRING,
        unique: true,
    },
    xboxforzieri: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xboxdistanza: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xboxviaggi: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xboxteschi: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xboxmercante: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    xboxisole: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    maestro_arena: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    maestro_cacciatore: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
    
},{
    timestamps: false
});

const xboxStatsRewardMolt = sequelize.define('xboxstatsrewardmolt', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    data: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
    }
},{
    timestamps: false,
});


async function addUser(msg) {
    try {
        await users.create({
            u_id: msg.author.id,
            name: msg.author.username,
            balance: 0,
            date_j: 0,
            banned: false,
            rolelevel: 0,
            piratetype: 0,
            balance_dep: 0
        });
        msg.reply("Utente inserito correttamente, ora puoi utilizzare i vari comandi disponibili!");
    }
    catch (e) {
        console.log("Errore addUser: "+e);
        return;
    }
    
}

async function findOneUser(uid) {
    let findUser;
    try {
        findUser = await users.findOne( { where: { u_id: uid } } );
    } catch(e) {
        msg.reply("Utente non registrato nel Database")
        console.log("Errore findoneUser: "+e);
        return;
    }
    
    return Promise.resolve(findUser);
}

// ######FUNZIONI XBOXSTATS######
const xboxApiKeyList = [
    'b72b5a43366b3e60d76990f8967338d5854b0f6a', // Romans96 Account Key
	'16c3661f1f6593225d08694ffd3d7b70351f25f6', // Sea of thieves italia Account Key
	'12c8a3af7fe31a2ada267c8d13401f7964e5c68d', // Macr0ne Main Account Key
	'38172c89d58c01cadcb023000c74f5f43fcadd82', // Macrone 2nd Account Key
	'4fa4f00b10ac51f59a66c0582d5bf15b07d948e5', // Thorlozoppo Account Key
	'024a1e91d8eb56b007493c0e2607bbd3b76e43f0', // Mark Account Key
    '0e3726e01cf24493d8d894f2263f94bcab994f17', // Monkey Account Key
    '', // Douglas Account Key
    'c054ea78984141fb9df6752ffde64dad5d290f22', // Lorenzo
    '7b76029354b9a0b4984bc39a8003250fb4389308', // DefaultMatrix
    '', // Simo 22
    '707be5b1d2cd1eda651b088663f180ee0ff40ea4', // Kirito
    '' // Kevin
]

/* {
    "success": false,
    "error_code": 401,
    "error_message": "A fresh login is required to gain a new token from Microsoft"
} */

async function xboxid(gt, authkey) {
	let id = await fetch(`https://xboxapi.com/v2/xuid/${gt}`, {
		method: 'GET',
		headers: {
			'x-auth': authkey
		}
	})
	let text = await id.json();
	// console.log(text);
	return text;
}

async function xboxstats(id, authkey) {
	let stats = await fetch(`https://xboxapi.com/v2/${id}/game-stats/1717113201`, {
		method: 'GET',
		headers: {
			'x-auth': authkey
		}
	})
	let json = await stats.json();
	return json;
}

async function xboxach(id, authkey) {
    // console.log("achievements - 0 ")
	let stats = await fetch(`https://xboxapi.com/v2/${id}/achievements/1717113201`, {
		method: 'GET',
		headers: {
            'x-auth': authkey,
            'Accept-Language': 'it-IT'
		}
    })
    // console.log("achievements")
	let json = await stats.json();
	return json;
}

async function xboxApiRateLimit(authkey) {
	let stats = await fetch(`https://xboxapi.com/v2/profile`, {
		method: 'GET',
		headers: {
			'x-auth': authkey
		}
	})
	let text = await stats.json();
	return text;
}

async function checkStats(msg, args) {
    let xuid = null;
    let stat = null;
    let i = 0;
    do {
        try {
            // console.log(i + " "+xboxApiKeyList[i])
            xuid = await xboxid(args.join(' ').trim(), xboxApiKeyList[i]);
            // console.log(xuid.error_message)
            // console.log(args.join(' ').trim())
            if (xuid.error_message === 'XUID not found' || args.join(' ').trim() === undefined) {
                return msg.reply("GamerTag non trovato -> Verifica il gamertag!");
            }
            else if (xuid.error_message === 'A fresh login is required to gain a new token from Microsoft') {
                return msg.reply("Key Invalida -> Fresh login")
            }
            stat = await xboxstats(xuid, xboxApiKeyList[i]);
        } catch(e) {
            // console.error("Errore: "+e.name);
            error = e.name;
            i++;
            xuid = null;
        }

    } while(!xuid && i < xboxApiKeyList.length);

    // console.log(i + " "+xbox.length)
    if ( i >= xboxApiKeyList.length ) {
        let api_limit = await xboxApiRateLimit( xboxApiKeyList[(i-1)] );
        // console.log(i + " "+xboxApiRateLimit[i-1])
        if ( api_limit.error_message === 'API Rate Limit Exceeded' )
            return msg.reply(`Limite richieste orarie raggiunto -> Riprovare fra ${-(d.getMinutes()-60 )} minuti!`)
        else
            return msg.reply("GamerTag non trovato -> Verifica il gamertag!");
    }

    return Promise.resolve(stat);
}

async function checkAchievements(msg, args) {
    let xuid = null;
    let stat = null;
    let i = 0;
    do {
        try {
            // console.log(i + " "+xboxApiKeyList[i])
            xuid = await xboxid(args.join(' ').trim(), xboxApiKeyList[i]);
            // console.log(xuid.error_message)
            // console.log(args.join(' ').trim())
            if (xuid.error_message === 'XUID not found' || args.join(' ').trim() === undefined) {
                return msg.reply("GamerTag non trovato -> Verifica il gamertag!");
            }
            else if (xuid.error_message === 'A fresh login is required to gain a new token from Microsoft') {
                return msg.reply("Key Invalida -> Fresh login")
            }
            stat = await xboxach(xuid, xboxApiKeyList[i]);
            // console.log(stat)
        } catch(e) {
            console.error("Errore: "+e.name);
            error = e.name;
            i++;
            xuid = null;
        }

    } while(!xuid && i < xboxApiKeyList.length);

    // console.log(i + " "+xbox.length)
    if ( i >= xboxApiKeyList.length ) {
        let api_limit = await xboxApiRateLimit( xboxApiKeyList[(i-1)] );
        // console.log(i + " "+xboxApiRateLimit[i-1])
        if ( api_limit.error_message === 'API Rate Limit Exceeded' )
            return msg.reply(`Limite richieste orarie raggiunto -> Riprovare fra ${-(d.getMinutes()-60 )} minuti!`)
        else
            return msg.reply("GamerTag non trovato -> Verifica il gamertag!");
    }

    return Promise.resolve(stat);
}

const talkedRecently = new Set();
function wait(msg) {
    if (talkedRecently.has(msg.author.id)) {
        msg.channel.send("Attendi 10 secondi per scrivere un altro comando. - " + msg.author);
        return false;
    } else {
        // Adds the user to the set so that they can't talk for 10 seconds
        talkedRecently.add(msg.author.id);
        setTimeout(() => {
			// Removes the user from the set after 10 seconds
			talkedRecently.delete(msg.author.id);
        }, 10000);
        return true;
    }
}

client.once("ready", async () => {
    console.log("BOT Attivo -> Economy");
    client.user.setActivity('Usa $help');
    // table synchronizations
    crews.sync( /* {force:true} */ );
    users.sync( /* {force:true} */ );
    eco_settings.sync( /* {force:true} */ );
    rolelevels.sync(/* {force:true} */);
    piratetypes.sync();
    xboxstatistics.sync();
    xboxStatsRewardMolt.sync(/* {force:true} */);
    
    try { // Creo le Impostazioni
        await eco_settings.create( {name: "Moneta"}  );
        await eco_settings.create( {name: "Staff_ID"}  );
        await eco_settings.create( {name: "Gestore_ID"}  );
        await eco_settings.create( {name: "LogsCh_ID"}  );
        await eco_settings.create( {name: "RequestCh_ID"}  );
        await eco_settings.create( {name: "ServicesCh_ID"}  );
        await eco_settings.create( {name: "UserMinMoneta"} );
        await eco_settings.create( {name: "UserMaxMoneta"} );
        await eco_settings.create( {name: "CrewMinMoneta"} );
        await eco_settings.create( {name: "CrewMaxMoneta"} );
        await eco_settings.create( {name: "RuoloEconomy_ID"} );
        await eco_settings.create( {name: "SpostamiCh_ID"} );
        console.log("Settings creati!");
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log("Error creating Eco_Settings Records");
        }
    }

    try { // Creo i Ruoli di Reward
        await rolelevels.create( {level: 1, rolename: 'Cuoco', reward: 500 } );
        await rolelevels.create( {level: 2, rolename: 'Cannonaro', reward: 1500 } );
        await rolelevels.create( {level: 3, rolename: 'Nostromo', reward: 5000 } );
        await rolelevels.create( {level: 4, rolename: 'Timoniere', reward: 10000 } );
        await rolelevels.create( {level: 5, rolename: 'Cartografo', reward: 25000 } );
        await rolelevels.create( {level: 6, rolename: 'Ufficiale di Bordo', reward: 50000 } );
        await rolelevels.create( {level: 7, rolename: 'Quartiermastro', reward: 75000 } );
        await rolelevels.create( {level: 8, rolename: 'Capitano', reward: 100000 } );
		await rolelevels.create( {level: 9, rolename: '👑 Re dei Pirati', reward: 2500000 } );
        console.log("Ruoli creati!");
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log("Error creating RoleLevels_Settings Records");
        }
    }

    try { // Creo i Ruoli di Pirata Leggendario e Fantasma
        await piratetypes.create( {level: 1, rolename: 'Pirata Leggendario', reward: 250 } );
        await piratetypes.create( {level: 2, rolename: 'Pirata Fantasma', reward: 3000 } );

        console.log("Ruoli creati!");
        
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log("Error creating PyrateTypes_Settings Records");
        }
    }

    try { // Creo i vari Reward delle Statistiche per i moltiplicatori evento
        await xboxStatsRewardMolt.create( {name: "forzieri"} );
        await xboxStatsRewardMolt.create( {name: "distanza"} );
        await xboxStatsRewardMolt.create( {name: "viaggi"} );
        await xboxStatsRewardMolt.create( {name: "teschi"} );
        await xboxStatsRewardMolt.create( {name: "mercante"} );
        await xboxStatsRewardMolt.create( {name: "isole"} );

        await xboxStatsRewardMolt.create( {name: "flagevento", data: 0} );

        console.log("Xbox Stats Reward Moltiplicator Creati");
    }
    catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
            console.log("Error creating XboxStatsRewardMolt Records");
        }
    }


});

/* async function ruoli(msg) {
    let tot = await users.findOne( {where: {u_id: msg.author.id}}).get('balance');
    let roles = msg.member.roles.sort( function(a,b) { return a.position < b.position } );
    let rolesarray = roles.array();
    let i = 0;

    Promise.all(
        rolesarray.map(async (item, index ) => {
            let myrole = await rolelevels.findOne({
                where: {
                    roleid: item.id
                }
            });
            if (myrole) {
                console.log(myrole.rolename + " "+ myrole.reward);
                let myrolereward = myrole.get('reward')
                // console.log(tot + " "+myrolereward)
                tot += myrolereward;

                // console.log(tot);
                // console.log(i + " "+myrole.level)
                if (i === 0) {
                    console.log("fatto");
                    await users.update( {rolelevel: myrole.level}, { where: { u_id: msg.author.id}} ); 
                }
                ++i;
            }
        })
    ).then(async () => {

        await users.update( {balance: tot }, { where: { u_id: msg.author.id}} );
    });


} */


function resolveAfter() { // Funzione che crea un Delay, usata per le richieste al DB 
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 250);
    });
}

// Funcione per il check dei ruoli community ottenuti
async function checkruoli(msg, moneta, codecolor) {
    // Dà i ruoli attivi attuali
    
    let user = await users.findOne( {where: {u_id: msg.author.id}});
    let balancei = user.get('balance');
    const myroles = await rolelevels.findAll({
        where: {
            roleid: {
                [Op.in]: msg.member.roles.keyArray()
            }
        },
        order: [
            ['level', 'ASC']
        ]
    });

    if (user.rolelevel < myroles.length) {
        msg.channel.send(`${msg.author.username} -> Ottenuto/i nuovo/i Ruolo/i e relativi ${moneta}: `)
        for  (let i = user.rolelevel; i < myroles.length; ++i) {
            // console.log(myroles[i].rolename)

            // console.log(user.rolelevel + " "+ myroles.length)
            balancei += myroles[i].reward;
            await users.update( { balance: balancei }, { where: { u_id: msg.author.id}} );
            // console.log("fatto");
            msg.channel.send(`${msg.author.username} - Ruolo Conseguito: ${myroles[i].rolename} - Ottenuti: ${myroles[i].reward} talleri`, {code: codecolor});
        }
        await users.update( { rolelevel: myroles[myroles.length-1].level }, { where: { u_id: msg.author.id}} );
    }
    else {
        // msg.reply(` -> Hai attualmente recepito tutti i premi dei Ruoli del ramo Community che hai conseguito.`)
        // console.log("Errore nel checkruoli")
    }
}

// Funcione per il check dei ruoli Legend e Fantasma ottenuti
async function checkpirate(msg, moneta, codecolor) {
    let user = await users.findOne( {where: {u_id: msg.author.id}});
    let balancei = user.get('balance');
    const mytypes = await piratetypes.findAll({
        where: {
            roleid: {
                [Op.in]: msg.member.roles.keyArray()
            }
        },
        order: [
            ['level', 'ASC']
        ]
    });

    if (user.piratetype < mytypes.length) {
        msg.channel.send(`${msg.author.username} -> Ottenuto/i nuovo/i Ruolo/i e relativi ${moneta}: `)
        for  (let i = user.piratetype; i < mytypes.length; ++i) {
            // console.log(mytypes[i].rolename)

            // console.log(user.rolelevel + " "+ mytypes.length)
            balancei += mytypes[i].reward;
            await users.update( { balance: balancei }, { where: { u_id: msg.author.id}} );
            // console.log("fatto");
            msg.channel.send(`${msg.author.username} - Ruolo Conseguito: ${mytypes[i].rolename} - Ottenuti: ${mytypes[i].reward} talleri`, {code: codecolor});
        }
        await users.update( { piratetype: mytypes[mytypes.length-1].level }, { where: { u_id: msg.author.id}} );
    }
    else {
        // msg.reply(` -> Hai attualmente recepito tutti i premi dei Ruoli del ramo In-Game che hai conseguito.`)
        // console.log("Errore nel checkpirate")
    }
}

let flagDonateCrew = false; // flag per attivare/disattivare comando depositaallaciurma

client.on("message", async msg => {
    const args = msg.content.slice(config.prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();
    if (!msg.content.startsWith(config.prefix) || msg.author.bot ) return;
    if (msg.channel.type !== 'text') return msg.reply("Non è possibile utilizzare il BOT via Messaggio Privato (DM)!")
    // if (!client.commands.has(command)) return;
    

    // Creo gli Oggetti delle Impostazioni
    const moneta = await eco_settings.findOne( { where: { name: "Moneta"} } ).get('datas');
    const Staff_ID = await eco_settings.findOne( { where: { name: "Staff_ID"} } ).get('datas');
    const Gestore_ID = await eco_settings.findOne( { where: { name: "Gestore_ID"} } ).get('datas');
    const LogsCh_ID = await eco_settings.findOne( { where: { name: "LogsCh_ID"} } ).get('datas');
    const RequestCh_ID = await eco_settings.findOne( { where: { name: "RequestCh_ID"} } ).get('datas');
    const ServicesCh_ID = await eco_settings.findOne( { where: { name: "ServicesCh_ID"} } ).get('datas');
    const SpostamiCh_ID = await eco_settings.findOne( { where: { name: "SpostamiCh_ID"} } ).get('datas');
    const UserMaxMoneta = await eco_settings.findOne( { where: { name: "UserMaxMoneta"} } ).get('datas');
    const UserMinMoneta = await eco_settings.findOne( { where: { name: "UserMinMoneta"} } ).get('datas');
    const CrewMaxMoneta = await eco_settings.findOne( { where: { name: "CrewMaxMoneta"} } ).get('datas');
    const CrewMinMoneta = await eco_settings.findOne( { where: { name: "CrewMinMoneta"} } ).get('datas');
    const RuoloEconomy_ID = await eco_settings.findOne( { where: { name: "RuoloEconomy_ID"} } ).get('datas');
    const economyRole = msg.guild.roles.get(RuoloEconomy_ID);
    
    /* if (!msg.member.roles.has(Staff_ID)) 
        return msg.reply("Bot attualmente in Manutenzione, riprova fra pochi minuti!") */

    let azione = null;
    let codecolor = 'Elm';
    

    // if (!wait(msg)) return;

    // UTENTI
    if (command === "portafoglio") { // Visualizza Portafoglio Utente
        if (args.length) return msg.reply("ERRORE -> Hai inserito troppi argomenti nel comando, prova con \`$portafoglio\`");
        try {
            await users.create({
                u_id: msg.author.id,
                name: msg.author.username,
                balance: 0,
                date_j: 0,
                banned: false,
                rolelevel: 0,
                piratetype: 0,
                balance_dep: 0
            });
            msg.reply("Utente inserito correttamente, ora puoi utilizzare i vari comandi disponibili, che puoi trovare digitando \`$help utente\`!");
            
            // Aggiungo all'utente il Ruolo Economy
            msg.member.addRole(economyRole);
        }
        catch (e) {
            if (e.name === 'SequelizeConstraintError') {
                return console.log("Errore CREATEUSER: "+e);
            }
        }
        let user = await users.findOne( { where: { u_id: msg.author.id } } );
        if (user.banned) {
            msg.channel.send(`${msg.author.username} - Adesso hai un totale di ${user.balance} ${moneta}!\n Inoltre sei stato bannato dall'uso del BOT dallo <@&${Staff_ID}>`);
        }
        else {
            checkruoli(msg, moneta, codecolor);
            await resolveAfter();
            checkpirate(msg, moneta, codecolor);

            await resolveAfter();
            user = await users.findOne( { where: { u_id: msg.author.id } } );
            msg.channel.send(`${msg.author.username} - Adesso Hai Un Totale Di ${user.balance} talleri!`, {code: codecolor});
        }
        
    }

    else if (command === "portafogliociurma") { // Visualizza Portafoglio del proprio Clan o di un altro
        const role = msg.mentions.roles.first();
        if (!role && !args.slice(0).length) {
            try {
                // Own Crew
                const roles = await crews.findOne({
                    where: {
                        c_id: {
                            [Op.in]: msg.member.roles.keyArray()
                        }
                    }
                });
                // console.log(msg.member.roles.keyArray())
                msg.reply(`La tua ciurma *${roles.name}* ha un totale di *${roles.balance} ${moneta}*`)
            } catch (e) {
                msg.reply(`ERRORE -> Ciurma non registrata o non fai parte di una Ciurma registrata. Verifica il comando o richiedi allo staff l'aggiunta!`);
            }
        }
        else if (args.slice(1).length) {
            msg.reply("ERRORE -> Sintassi comando errata!");
        }
        else {
            try {
                // Tag Crew
                const rid = role.id;
                const find = await crews.findOne({ 
                    where: { 
                        c_id: rid 
                    }
                });
                msg.channel.send(`La ciurma *${find.name}* ha un totale di *${find.balance} ${moneta}* `);
            } catch (e) {
                msg.reply(`ERRORE -> Ciurma non registrata o non fai parte di una Ciurma registrata. Verifica il comando o richiedi allo staff l'aggiunta!`);
            }
        }
        
    }

    else if (command === "deposita") { // Dona un tot di Monete al Portafoglio del clan, se disponibili
        // return msg.reply("Comando attualmente in manutenzione");
        /* if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Comando Momentaneamente disattivo in Pre-Evento");
        } */
        const deposito_min = 1000;
        if (!args[0] || !Number.isInteger( parseInt(args[0]) ) ) {
            msg.reply(`ERRORE -> Inserisci un numero valido di *${moneta}* da donare alla tua ciurma!`);
        }
        else if (args.slice(1).length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$deposita (quantità di Talleri)\` `);
        }
        else if (args[0] < deposito_min) {
            msg.reply(`ERRORE -> Il minimo di ${moneta} che è possibile depositare è di ${deposito_min}`);
        }
        else {
            let mycrew;
            let myuser;

            try {
                mycrew = await crews.findOne({
                    where: {
                        c_id: {
                            [Op.in]: msg.member.roles.keyArray()
                        }
                    }
                });
                if (!mycrew) {
                    return msg.reply(`Ciurma non registrata (o non appartieni ad alcuna Ciurma registrata). Verifica il comando o richiedi allo staff l'aggiunta!`);
                }
                myuser = await findOneUser(msg.author.id);
                if (!myuser) {
                    return msg.reply("Non sei registrato, utilizza \`$portafoglio\` per registrarti!");
                }
                else if (myuser.banned) {
                    return msg.reply(`Sei stato bannato dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
                }
            } catch(e) {
                return msg.reply(`Ciurma non registrata (o non appartieni ad alcuna Ciurma registrata). Verifica il comando o richiedi allo staff l'aggiunta!`);
            }

            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === '✔') {
                        
                        msg.reply('Comando confermato!');
                        ms.delete();

                        const balance_user = myuser.get('balance');
                        const balance_depuser = myuser.get('balance_dep');

                        let numuser = parseInt(balance_user)-parseInt(args[0].trim());
                        let numdeposited = parseInt(balance_depuser)+parseInt(args[0].trim())

                        if (numuser<0) {
                            msg.reply(`Non hai abbastanza *${moneta}* da depositare, prova con un'altro valore!`);
                        }
                        else {
                            
                            const balance_crew = mycrew.get('balance');
                            let numcrew = parseInt(balance_crew)+parseInt(args[0].trim());
                            if (numcrew > CrewMaxMoneta) {
                                return msg.reply(`Monete massime del Clan superate (${CrewMaxMoneta}). Non è possibile salire sopra tale limite!`);
                            }
                            await users.update( { balance_dep: numdeposited }, { where: { u_id: myuser.u_id }} );
                            await users.update( { balance: numuser }, { where: { u_id: myuser.u_id }} );
                            await crews.update( { balance: numcrew }, { where: { c_id: mycrew.c_id }} );
                            msg.reply(`Depositati correttamente *${parseInt(args[0])} ${moneta}* al tuo clan *${mycrew.name}*`);
                            
                            azione = "donate";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, mycrew, azione) );
                        }
                    } 
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando Annullato!');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    console.log(collected)
                    ms.delete();
                });
        }
    }

    else if (command === "pagaservizio") { // Utente paga per un certo servizio per sè
        return msg.reply("Comando attualmente disattivato. Verrà attivato in seguito, con l'aggiunta di nuovi Servizi.")
        if (!args[0] || !args[1] || !Number.isInteger( parseInt(args[0]) ) ) {
            msg.reply(`ERRORE -> Inserisci un numero valido di *${moneta}* da pagare e un testo per il servizio! Riprova con \`$pagaservizio (quantita' di ${moneta}) (nome servizio) \` `);
        }
        else {
            const myuser = await findOneUser(msg.author.id);
            if (!myuser) {
                return msg.reply("Non sei registrato, utilizza \`$portafoglio\` per registrarti!");
            }
            else if (myuser.banned) {
                return msg.reply(`Sei stato bannato dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
            }

            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();
                    if (reaction.emoji.name === '✔') {
                        
                        msg.reply('Comando confermato!');
                        ms.delete();

                        const balance_user = myuser.get('balance');
                        let numuser = parseInt(balance_user)-parseInt(args[0].trim());
                        if (numuser < UserMinMoneta) {
                            return msg.reply(`Monete minime superate (${UserMinMoneta}). Non è possibile scendere sotto tale limite!`);
                        }
                        if (numuser<0) {
                            msg.reply(`Non hai abbastanza *${moneta}* per pagare!`);
                        }
                        else {
            
                            await users.update( { balance: numuser}, {where : { u_id: myuser.u_id }} );
                            const newargs = args.slice(1).join(" ").trim();
                            msg.reply(`Pagati correttamente *${args[0]} ${moneta}* (USER) per: **${newargs}**`);
                            
                            azione = "payservice";
                            msg.client.channels.get(ServicesCh_ID).send( services(msg, args, moneta, azione) );
                        }
                    } 
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando Annullato');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    ms.delete();
                });
            
        }
    }

    else if (command === "assistenza") {
        if (!args.length) {
            msg.reply(`ERRORE -> Comando errato. Scrivi un testo corretto per la richiesta! Riprova con \`$assistenza (testo)\` `);
            return;
        }
        const ms = await msg.channel.send("Confermi il comando?");
        await ms.react('✔').then(() => ms.react('✖'));
        const filter = (reaction, user) => {
            return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
        };
        ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then( async collected => {
                const reaction = collected.first();
                if (reaction.emoji.name === '✔') {
                    
                    msg.reply('Comando confermato!');
                    ms.delete();

                    const richiesta = args.join(" ").trim();

                    let image;
                    if (msg.attachments)
                        msg.attachments.map( t => image = t.url );
                    else
                        image = null;
                
                    msg.client.channels.get(RequestCh_ID).send( requests(msg, richiesta, image )  );
                    
                } 
                else if (reaction.emoji.name === '✖') {
                    msg.reply('Comando ANnullato');
                    ms.delete();
                }
                else {
                    msg.reply('Reazione selezionata errata!');
                    ms.delete();
                }
            })
            .catch(collected => {
                msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                ms.delete();
            });

    }


    // COMANDI XBOX STATS
    else if (command === "registragt") {
        client.commands.get('registragt').execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta);
    }
    else if (command === "incassa") {
        /* if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Comando Momentaneamente disattivo in Pre-Evento");
        } */
        client.commands.get('incassa').execute(msg, args, users, xboxstatistics, checkStats, checkAchievements, codecolor, moneta, xboxStatsRewardMolt);
    }
    else if (command === "stats") {
        client.commands.get('stats').execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta);
    }

    // COMANDI EVENTO

    else if (command === "mostraevento") {
        client.commands.get('mostraevento').execute(msg, args, codecolor, moneta, xboxStatsRewardMolt);
    }

    // GESTORE CIURMA
    else if (command === "depositaallaciurma") { // Dona soldi dal proprio Portafoglio di Ciurma, a quello di un'altra Ciurma
        if (msg.member.roles.has(Gestore_ID)) {
            if (!flagDonateCrew) {
                msg.reply("Comando attualmente disattivato");
                return;
            }
            const role = msg.mentions.roles.first();
            if (!role) {
                msg.reply(`ERRORE -> Inserimento ruolo Ciurma errato! Riprova con \`$depositaallaciurma @nomeciurma (quantita' di ${moneta})\``);
                return;
            }
            else if (!args[0] || !args[1] || !Number.isInteger(parseInt(args[1])) || args.slice(2).length) {
                msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$depositaallaciurma @crewname (quantita' di ${moneta})\` `);
                return;
            }
            const rid = role.id;
            let mycrew;
            let othercrew;

            try {
                mycrew = await crews.findOne({
                    where: {
                        c_id: {
                            [Op.in]: msg.member.roles.keyArray()
                        }
                    }
                });
                if (mycrew.banned) {
                    return msg.reply(`La tua Ciurma è stata bannata dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
                }
                othercrew = await crews.findOne({
                    where: {
                        c_id: rid
                    }
                });
                if (othercrew.banned) {
                    return msg.reply(`La Ciurma taggata è stata bannata dal BOT, non può usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
                }
            }
            catch (e) {
                msg.reply(`Ciurma non registrata (o non appartieni ad alcuna Ciurma registrata). Verifica il comando o richiedi allo staff l'aggiunta!`);
            }

            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✔') {
                        msg.reply('Comando confermato!');
                        ms.delete();
                            
                        const balance_crew = mycrew.get('balance');
                        let numcrew = parseInt(balance_crew)-parseInt(args[1].trim());
                        if (numcrew<0) {
                            msg.reply(`Non avete abbastanza *${moneta}* da depositare, prova con un'altro valore!`);
                        }
                        else {
                            const balance_other = othercrew.get('balance');
                            let numother = parseInt(balance_other)+parseInt(args[1].trim());
                            if (numother > CrewMaxMoneta) {
                                return msg.reply(`Monete massime della Ciurma (${othercrew.name}) superate (${CrewMaxMoneta}). Non è possibile salire sopra tale limite!`);
                            }
                            await crews.update( { balance: numcrew }, {where : { c_id: mycrew.c_id }} );
                            await crews.update( { balance: numother }, { where: { c_id: othercrew.c_id }} );
                            msg.reply(`Depositati correttamente *${parseInt(args[1])} ${moneta}* alla Ciurma *${othercrew.name}*`);
                            
                            azione = "donatecrew";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, othercrew, azione) );
                        }
                    }
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando Annullato!');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    ms.delete();
                });
        } else msg.reply("Non hai i permessi per farlo: GestoreCiurma");
    }
    
    else if (command === "pagaserviziociurma") { // Gestore paga per un certo servizio, per il Clan
        if (msg.member.roles.has(Gestore_ID) ) {
            if (!args[0] || !args[1] || !Number.isInteger( parseInt(args[0]) ) ) {
                msg.reply(`ERRORE -> Inserisci un numero valido di *${moneta}* da pagare e un testo per il servizio! Riprova con \`$pagaserviziociurma (quantita' di ${moneta}) (nome servizio)\` `);
                return;
            }
            let mycrew;
            try {
                mycrew = await crews.findOne({
                    where: {
                        c_id: {
                            [Op.in]: msg.member.roles.keyArray()
                        }
                    }
                });
                if (mycrew.banned) {
                    return msg.reply(`La tua Ciurma è stato bannata dal BOT, non puoi usare o guadagnare ${moneta}. Scrivi con \`$assistenza (testo)\` per chiedere ulteriori informazioni allo Staff. `);
                }

            }
            catch (e) {
                return msg.reply(`Ciurma non registrata (o non appartieni ad alcuna Ciurma registrata). Verifica il comando o richiedi allo staff l'aggiunta!`);
            }
            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();
                    
                    if (reaction.emoji.name === '✔') {
                        msg.reply('Comando confermato!');
                        ms.delete();
                            
                            const balance_crew = mycrew.get('balance');
                            let numcrew = parseInt(balance_crew)-parseInt(args[0].trim());
                            if (numcrew < CrewMinMoneta) {
                                return msg.reply(`Monete minime superate (${CrewMinMoneta}). Non è possibile scendere sotto tale limite!`);
                            }
                            if (numcrew<0) {
                                msg.reply(`Non avete abbastanza *${moneta}* per pagare, prova con un'altro valore!`);
                            }
                            else {
                                await crews.update( { balance: numcrew}, {where : { c_id: mycrew.c_id }} );
                                const newargs = args.slice(1).join(" ").trim();
                                
                                msg.reply(`Pagati correttamente *${args[0]} ${moneta}* (CREW) per: **${newargs}**`);
                                
                                azione = "paycrewservice";
                                msg.client.channels.get(ServicesCh_ID).send( services(msg, args, moneta, azione) );
                            }
                        
                    } 
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando ANnullato');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    ms.delete();
                });
        } else msg.reply("Non hai i permessi per farlo: GestoreCiurma");
    }

    // LEADERBOARDS
    else if (command === "classificaciurme") {
        
        const leaderEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor('<🔝> LeaderBoard Totale Ciurme <🔝>')
            
        const crewList = await crews.findAll({
            order: [
                ['balance', 'DESC']
            ]
        });
        // for (let i in crewList) {
        //     leaderEmbed.addField("-> "+crewList[i].name, crewList[i].balance + " " + moneta);
        // } oppure:

        let i;
        let chunk = 20;
        let slicedarray = [];
        for (i = 0; i < crewList.length ; i+=chunk) {
            let sliced = crewList.slice( i, i+chunk );
            slicedarray.push( sliced );
        }

        slicedarray[0].forEach( (value, index) => leaderEmbed.addField( (index+1)+"° -> "+value.name,"~	" +value.balance + " " + moneta));
        let finalIndex = slicedarray[0].length;

        // crewList.forEach( (value,index) => leaderEmbed.addField( (index+1)+"° -> "+value.name,"~	" +value.balance + " " + moneta));

        // Trovo il clan a cui appartiene l'autore del comando
        const clan = await crews.findOne({
            where: {
                c_id: {
                    [Op.in]: msg.member.roles.keyArray()
                }
            }
        });

        if (!clan && (slicedarray.length <= 1) ) {
            leaderEmbed.setFooter(msg.author.username+` non fai parte di alcuna Ciurma registrata!` );
            return msg.channel.send(leaderEmbed);
        } 
        let index = null;
        if (clan) {
            index = crewList.findIndex(crew => crew.c_id === clan.c_id);
        } 
        
        
        try {
            
            // console.log(finalIndex);
            // const userAuthor = await findOneUser(msg.author.id);
            if ( slicedarray.length <= 1 ) {
                leaderEmbed.setFooter(clan.name+`: Talleri => `+clan.balance+" , Pos: "+(index+1) );
                return msg.channel.send(leaderEmbed);
            }
            msg.channel.send(leaderEmbed)
        }
        catch (e) {
            console.log(e.message);
        }
            
        
        let newemb = new Array();
        let x = 0;
        for (x = 1;  x < slicedarray.length ; x++) {
            newemb[x] = new Discord.RichEmbed().setColor('0x009933')
            slicedarray[x].forEach( (value, index) => newemb[x].addField( (finalIndex + index + 1)+"° -> "+value.name,"~	" +value.balance + " " + moneta) );
            finalIndex = finalIndex + slicedarray[x].length;
            try {
                if (x === (slicedarray.length-1) ) {
                    if (clan)
                        newemb[x].setFooter(clan.name+`: Talleri => `+clan.balance+" , Pos: "+(index+1) );
                    else
                        newemb[x].setFooter(msg.author.username+` non fai parte di alcuna Ciurma registrata!`);
                }
                msg.channel.send(newemb[x]);
            }
            catch (e) {
                console.log(e.message);
            }
        }
    }

    else if (command === "classificautenti") {
        
        const leaderEmbed = new Discord.RichEmbed()
            .setColor('0x009933')
            .setAuthor('<🔝> LeaderBoard Totale Utenti (TOP 20 Per Talleri Depositati) <🔝>')
            
        const userList = await users.findAll({
            order: [
                ['balance_dep', 'DESC']
            ]
        });
        let N;
        let L = Object.keys(userList).length;
        if (L <= 20) N = L;
        else N = 20;
        for (let i = 0 ; i < N ; i++) {
            leaderEmbed.addField( (i+1)+"° -> "+userList[i].name, "~   "+ userList[i].balance_dep + " " + moneta + " depositati");
        }
        
        try {
            const index = userList.findIndex(user => user.u_id === msg.author.id);
            const userAuthor = await findOneUser(msg.author.id);
    
            leaderEmbed.setFooter(msg.author.username+`: Talleri Depositati => `+userAuthor.balance_dep+" , Pos: "+(index+1) );    
        } catch(e) {
            leaderEmbed.setFooter(msg.author.username+` Non sei registrato! Usa $portafoglio per registrarti nel DataBase! `); 
        }

        try {
            msg.channel.send(leaderEmbed);
        }
        catch (e) {
            console.log(e.message);
        }

    }

    else if (command === "classificainterna") {
        if (args.length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$classificainterna\` `);
            return;
        }
        const embedColor = '0x009933';
        const leaderEmbed = new Discord.RichEmbed()
            .setColor(embedColor)
            .setAuthor('<🔝> LeaderBoard Interna Clan <🔝>');
        
        // Cerco la Crew dell'autore del comando
        const roles = await crews.findOne({
            where: {
                c_id: {
                    [Op.in]: msg.member.roles.keyArray()
                }
            }
        });

        if (!roles) {
            msg.reply("ERRORE -> Non fai parte di alcuna Ciurma registrata!");
            return;
        }
        leaderEmbed.setDescription(`LeaderBoard __${roles.name}__`)
        
        // Cerco tutti gli utenti della ciurma trovata sopra
        const u_users = msg.guild.roles.get( roles.get('c_id') ).members.map(m => m.user.id);

        // Prendo tutti gli Utenti appartenenti a quella ciurma e li ordino per punti (DECR)
        const us = await users.findAll({
            attributes: ['u_id', 'name', 'balance_dep'],
            where: {
                u_id: {
                    [Op.in]: u_users
                }
            },
            order: [
                ['balance_dep', 'DESC']
            ]
        });

        // Aggiungo una riga dell'embed per ogni presente
        // us.forEach( (value, index) => leaderEmbed.addField( (index+1) +"" -> "+value.name,"~	"+ value.balance + " " + moneta));
        let i;
        let chunk = 20;
        let slicedarray = [];
        for (i = 0; i < us.length ; i+=chunk) {
            let sliced = us.slice( i, i+chunk );
            slicedarray.push( sliced );
        }
        // Stampo prima pagina LeaderBoard, dove ho titolo e Descrizione
        slicedarray[0].forEach( (value, index) => leaderEmbed.addField( (index+1) +"° -> "+value.name,"~	"+ value.balance_dep + " " + moneta + " depositati") );
        let finalIndex = slicedarray[0].length;

        // Trovo utente che ha scritto il messaggio per footer
        const userAuthor = await users.findOne({
            where: {
                u_id: msg.author.id
            }
        });
        const index = us.findIndex(user => user.u_id === msg.author.id);

        try {
            if ( slicedarray.length <= 1 )
                leaderEmbed.setFooter(msg.author.username+`: Talleri depositati => `+userAuthor.balance_dep+" , Pos: "+(index+1) );

            msg.channel.send(leaderEmbed);
        }
        catch (e) {
            console.log(e.message);
        }

        /* Mi croe un Array e per ogni indice, partendo da 1 (0 er ala prima pagina), creo
        un nuovo embed dove inserisco i relativi Utenti memorizzati.
        Inoltre uso il finalIndex, per tenere conto man mano della posizione.*/
        let newemb = new Array();
        let x =0;
        for (x = 1;  x < slicedarray.length ; x++) {
            newemb[x] = new Discord.RichEmbed().setColor(embedColor)
            slicedarray[x].forEach( (value, index) => newemb[x].addField( (finalIndex + index +1) +"° -> "+value.name, value.balance_dep + " " + moneta + " depositati") );
            finalIndex +=slicedarray[x].length;
            try {
                if (x === (slicedarray.length-1) ) {
                    if (userAuthor)
                        newemb[x].setFooter(msg.author.username+`: Talleri depositati => `+userAuthor.balance_dep+" , Pos: "+(index+1) );
                    else
                        newemb[x].setFooter(msg.author.username+` Non sei registrato! Usa $portafoglio per registrarti nel DataBase! `);
                }
                msg.channel.send(newemb[x]);
            }
            catch (e) {
                console.log(e.message);
            }
        }
    }

    // HELP
    else if (command === "help") {
        let scelta = args[0];
        if (!scelta || args.slice(1).length || (scelta.toLowerCase() !== "staff" && scelta.toLowerCase() !== "utente" && scelta.toLowerCase() !== "stats") ) {
            let testo = `Utilizzare come primo comando \`$portafoglio\` per poter iniziare ad usare il BOT!
Per una Guida delle basi del Bot, puoi utilizzare il comando \`$guidaeconomy\`
Per la lista completa dei comandi digitare successivamente \`$help utente\` `;
            let testo2 = `***Arhhh!*** Per utilizzare il _BOT_, questo comando comando devi usare **--->**\`$portafoglio\`**<---**
▶ Per una **Guida Base**, sui comandi del _BOT_, dovrai digitare il comando **--->**\`$guidaeconomy\`**<---**.
▶ Per la lista completa dei comandi digitare **--->**\`$help utente\`**<---**.
▶ Per la lista dei comandi riguardo alle statistiche Xbox di Sea of Thieves digitare **--->**\`$help stats\`**<---**.`;
            msg.channel.send(testo2);
            return;
        }
        scelta = args[0].toLowerCase();
        if (scelta === "staff" && !msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        
        help(msg, moneta, scelta, regole);
    }

    else if (command === "guidaeconomy") {
        if (args.length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$guidaeconomy\` `);
            return;
        }
        
        guidabot(msg, fs, regole, moneta) ;
    }

    else if (command === "listapremi") {
        if (args.length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$listapremi\` `);
            return;
        }
        
        listapremi(msg, fs, regole, moneta);
    }
    
    else if (command === "listaacquisti") {
        if (args.length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$listaacquisti\` `);
            return;
        }

        listaacquisti(msg, fs, regole, moneta);
    }

    else if (command === "info") {
        if (args.length) {
            msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con \`$listaacquisti\` `);
            return;
        }

        info(msg);

    }

    // ##### STAFF COMMANDS #####
    else if (command === "visualizzautente") { // Visualizza Portafoglio Utente
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const member = msg.mentions.members.first();
        if (!member || !args[0] || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$visualizzautente @user\`");
        else {
            
            let nome = member.user.username;
            let mid = member.id;
            // addUser(mid);
            const user = (await findOneUser(mid));
            if (!user) {
                return msg.reply("L'utente non e' presente nel DataBase");
            }

            let vUser =[
                `▶ Tag Utente: ${member.user.tag}`,
                `▶ Discord ID: ${mid}`,
                `▶ Portafoglio: ${user.balance} Talleri`,
                `▶ Bannato dal BOT: ${user.banned}`,
            ].join('\n');
            
            msg.channel.send(` \`\`\``+vUser+` \`\`\` `);
        }
    }

    else if (command === "visualizzaciurma") { // Visualizza Portafoglio Utente
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const role = msg.mentions.roles.first();
        if (!role || !args[0] || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$visualizzaciurma @ciurma\`");
        else {
            
            let nome = role.name;
            let rid = role.id;
            const crew = await crews.findOne( {where: { c_id: rid }} );
            if (!crew) {
                return msg.reply("La Ciurma non e' presente nel DataBase");
            }

            let vCrew =[
                `▶ Ciurma: ${nome}`,
                `▶ Discord ID: ${rid}`,
                `▶ Portafoglio: ${crew.balance} Talleri`,
                `▶ Bannato dal BOT: ${crew.banned}`,
            ].join('\n');
            
            msg.channel.send(` \`\`\``+vCrew+` \`\`\` `);
        }
    }

    else if (command === "aggiungiutente") { // Aggiunge un nuovo clan nel DataBase
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const member = msg.mentions.members.first();
        if (!member || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$aggiungiutente @utente\`");
        else {
            const nome = member.user.username;
            const mid = member.id;

            try {
                const user = await users.create({
                    u_id: mid,
                    name: nome,
                    balance: 0,
                    date_j: 0,
                    banned: false,
                    rolelevel: 0,
                    piratetype: 0,
                    balance_dep: 0
                });
                msg.reply('Utente aggiunto correttamente!');

                azione = "adduser";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, null, moneta, user, azione) );
            }
            catch (e) {
                msg.reply('Errore nell\'aggiunta dell\'utente, verifica che non sia già registrato!');
                console.log('ADDUSER: Something went wrong with adding an User.');
            }
        }
        
    }

    else if (command === "rimuoviutente") { // Rimuove un clan dal DataBase
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const member = msg.mentions.members.first();
        if (!member || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$rimuoviutente @utente\`");
        else {

            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✔') {
                        msg.reply('Comando confermato!');
                        ms.delete();

                        const mid = member.id;
                        try {
                            const user = await users.destroy({
                                where: {
                                    u_id: mid
                                }
                            });
                            if (!user) {
                                return msg.reply("Utente non registrato nel DataBase")
                            }
                            msg.reply('Utente rimosso correttamente!');

                            // RImuovo Ruolo Economy
                            member.removeRole(economyRole);

                            azione = "remuser";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, member, moneta, null, azione) );
                        }
                        catch (e) {
                            msg.reply('Errore nella rimozione dell\'Utente, controlla se è effettivamente registrato nel DataBase');
                            console.log('REMUSER: Something went wrong with removing an User. -> '+e);
                        }
                        
                    } 
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando Annullato!');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    ms.delete();
                });
        }
    }

    else if (command === "aggiungiciurma") { // Aggiunge un nuovo clan nel DataBase
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const role = msg.mentions.roles.first();
        if (!role || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$aggiungiciurma @ciurma\`");
        else {
            const nome = role.name;
            const rid = role.id;

            try {
                const crew = await crews.create({
                    c_id: rid,
                    name: nome,
                    balance: 0,
                });
                msg.reply('Ciurma aggiunta correttamente!');

                azione = "addcrew";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, null, moneta, crew, azione) );
            }
            catch (e) {
                msg.reply('Errore nell\'aggiunta della Ciurma, verifica che non sia già registrato!');
                console.log('ADDCREW: Something went wrong with adding a Crew.');
            }
        }
        
    }

    else if (command === "rimuoviciurma") { // Rimuove un clan dal DataBase
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const role = msg.mentions.roles.first();
        if (!role || args.slice(1).length) msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$rimuoviciurma @ciurma\`");
        else {

            const ms = await msg.channel.send("Confermi il comando?");
            await ms.react('✔').then(() => ms.react('✖'));
            const filter = (reaction, user) => {
                return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
            };
            ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then( async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '✔') {
                        msg.reply('Comando confermato!');
                        ms.delete();

                        const rid = role.id;
                        try {
                            const crew = await crews.destroy({
                                where: {
                                    c_id: rid
                                }
                            });
                            if (!crew) {
                                return msg.reply("Ciurma non registrata nel DataBase")
                            }
                            msg.reply('Ciurma rimossa correttamente!');
            
                            azione = "remcrew";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, role, moneta, null, azione) );
                        }
                        catch (e) {
                            msg.reply('Errore nella rimozione della Ciurma, controlla se è effettivamente registrata nel DataBase');
                            console.log('REMCREW: Something went wrong with removing a Crew. -> '+e);
                        }
                        
                    } 
                    else if (reaction.emoji.name === '✖') {
                        msg.reply('Comando Annullato!');
                        ms.delete();
                    }
                    else {
                        msg.reply('Reazione selezionata errata!');
                        ms.delete();
                    }
                })
                .catch(collected => {
                    msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                    ms.delete();
                });
        }
        
    }

    else if (command === "aggiungiutalleri") { // Aggiunge Moneta ad un Portafoglio Utente
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }            
        const member = msg.mentions.members.first();
        if (!member || !args[0] || !args[1] || !Number.isInteger(parseInt(args[1])) || args.slice(2).length) {
            msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$aggiungiutalleri @utente N\`");
            return;
        }

        let mid = member.id;
        let user = await findOneUser(mid);
        if (!user) {
            return msg.reply("L'utente non e' presente nel DataBase");
        }
        else if (user.banned) {
            return msg.reply(`l\'utente è bannato dal BOT, non può usare o guadagnare ${moneta}`)
        }
        let balancef = user.get('balance');
        let num = parseInt(balancef)+parseInt(args[1]);
        if (num > UserMaxMoneta) {
            return msg.reply(`Monete massime superate (${UserMaxMoneta}). Non è possibile superare tale limite!`);
        }
        try {
            let update = await users.update({balance: num }, {where: { u_id: mid   }});
            msg.reply(`Aggiunti correttamente *${parseInt(args[1])} ${moneta}* all'Utente __${member.user.username}__ (User ID: ${member.user.id})`);
            
            // LOG
            azione = "aggiungiutalleri";
            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, member, azione) );
        }
        catch (e) {
            msg.reply("Errore nella modifica dell'utente, riprova!");
            console.log("ADDUSERMONEY: Error => "+ e);
        }
    }

    else if (command === "rimuoviutalleri") { // Rimuove Moneta ad un Portafoglio Utente
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        const member = msg.mentions.members.first();
        if (!member || !args[0] || !args[1] || args.slice(2).length) {
            msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$rimuoviutalleri @utente N\`");
            return;
        }
        let mid = member.id;
        let user = await findOneUser(mid);
        if (!user) {
            return msg.reply("L'utente non e' presente nel DataBase");
        }
        else if (user.banned) {
            return msg.reply(`l\'utente è bannato dal BOT, non può usare o guadagnare ${moneta}`)
        }

        if (args[1].toLowerCase() === "all") {
            try {
                await users.update({balance: 0 }, {where: { u_id: mid }});
                args[1] = "Tutti i";
                msg.reply(`Rimossi correttamente *${args[1]} ${moneta}* dall'Utente __${member.user.username}__ (User ID: ${member.user.id})`);

                // LOG
                azione = "rimuoviutalleri";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, member, azione) );
                return;
            }
            catch (e) {
                msg.reply("Errore nela modifica dell'utente, riprova!");
                console.log("REMUSERMONEY: Error => "+ e);
            }
        }

        let balancef = user.get('balance');
        let num = parseInt(balancef)-parseInt(args[1]);
        if (num < UserMinMoneta) {
            return msg.reply(`Monete minime superate (${UserMinMoneta}). Non è possibile scendere sotto tale limite!`);
        }
        try {
            let update = await users.update({balance: num }, {where: { u_id: mid }});
            if (user.get('balance') < 0)
                update = await users.update({balance: 0 }, {where: { u_id: mid }});

            msg.reply(`Rimossi correttamente *${parseInt(args[1])} ${moneta}* dall'Utente __${member.user.username}__ (User ID: ${member.user.id})`);

            // LOG
            azione = "rimuoviutalleri";
            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, member, azione) );
        }
        catch (e) {
            msg.reply("Errore nela modifica dell'utente, riprova!");
            console.log("REMUSERMONEY: Error => "+ e);
        }
    }

    else if (command === "aggiungictalleri") { // Aggiunge Moneta ad un Portafoglio Clan
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }            
        const role = msg.mentions.roles.first();
        if (!role || !args[0] || !args[1] || !Number.isInteger(parseInt(args[1])) || args.slice(2).length) {
            msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$aggiungictalleri @ciurma N\`");
            return;
        }
        let nome = role.name;
        let rid = role.id;

        const crew = await crews.findOne({where: { c_id: rid }});
        if (!crew) {
            return msg.reply("La Ciurma non e' presente nel DataBase");
        }
        else if (crew.banned) {
            return msg.reply(`La Ciurma è stata bannata dal BOT, non può usare o guadagnare ${moneta}`)
        }

        let balancef = crew.get('balance');
        let num = parseInt(balancef)+parseInt(args[1]);
        if (num > CrewMaxMoneta) {
            return msg.reply(`Monete massime superate (${CrewMaxMoneta}). Non è possibile salire sopra tale limite!`);
        }
        try {
            let update = await crews.update({balance: num }, {where: { c_id: rid }});
            msg.reply(`Aggiunti correttamente *${parseInt(args[1])} ${moneta}* alla Ciurma __${nome}__ (Role ID: ${rid})`);

            azione = "aggiungictalleri";
            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, crew, azione) );
        }
        catch (e) {
            msg.reply('ERRORE modifica Portafoglio della Ciurma');
            console.log("aggiungictalleri -> Errore modifica portafoglio della Ciurma: "+e);
        }
    }

    else if (command === "rimuovictalleri") { // Rimuove Moneta ad un Portafoglio Clan
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }            
        const role = msg.mentions.roles.first();
        if (!role || !args[0] || !args[1] || !Number.isInteger(parseInt(args[1])) || args.slice(2).length) {
            msg.reply("ERRORE -> Hai inserito pochi o troppi argomenti nel comando! Riprova con \`$rimuovictalleri @ciurma N\`");
            return;
        }
        let nome = role.name;
        let rid = role.id;
            
        const crew = await crews.findOne({where: { c_id: rid }});
        if (!crew) {
            return msg.reply("La Ciurma non e' presente nel DataBase");
        }
        else if (crew.banned) {
            return msg.reply(`La Ciurma è stata bannata dal BOT, non può usare o guadagnare ${moneta}`)
        }

        let balancef = crew.get('balance');
        let num = parseInt(balancef)-parseInt(args[1]);
        if (num < CrewMinMoneta) {
            return msg.reply(`Monete minime superate (${CrewMinMoneta}). Non è possibile scendere sotto tale limite!`);
        }
        try {
            let update = await crews.update({balance: num }, {where: { c_id: rid }});
            if (crew.get('balance') < 0)
                update = await crews.update({balance: 0 }, {where: { c_id: rid }});
            msg.reply(`Rimossi correttamente *${parseInt(args[1])} ${moneta}* dalla Ciurma __${nome}__ (Role ID: ${rid})`);

            azione = "rimuovictalleri";
            msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, crew, azione) );
        }
        catch (e) {
            msg.reply('ERRORE modifica Portafoglio della Ciurma');
            console.log("rimuovictalleri -> Errore modifica portafoglio della Ciurma: "+e);
        }
    }

    else if (command === "ban") { // Banna un utente/Ciurma dal BOT
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        else if (!args[0])  return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban utente @utente\` o \`$ban ciurma @ciurma\`');

        let type = args[0].toLowerCase();
        let member, role;

        if (type === 'utente') {
            member = msg.mentions.members.first();
            if (!args[0] || !args[1] || !member || args.slice(2).length ) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban utente @utente\`');
                return;
            }
        }
        else if (type === 'ciurma') {
            role = msg.mentions.roles.first()
            if (!args[0] || !args[1] || !role || args.slice(2).length ) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban ciurma @ciurma\`');
                return;
            }
        }
        else {
            return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban utente @utente\` o \`$ban ciurma @ciurma\`');
        }

        const ms = await msg.channel.send("Confermi il comando?");
        await ms.react('✔').then(() => ms.react('✖'));
        const filter = (reaction, user) => {
            return ['✔', '✖'].includes(reaction.emoji.name) && user.id === msg.author.id;
        };
        ms.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
            .then( async collected => {
                const reaction = collected.first();
                if (reaction.emoji.name === '✔') {
                    
                    msg.reply('Comando confermato!');
                    ms.delete();
                    
                    if (type === 'utente') {
                        let mid = member.id;
                        let user = await findOneUser(mid);
                        if (!user) {
                            return msg.reply("L'utente non e' presente nel DataBase");
                        }
                        try {
                            await users.update({banned: true }, {where: { u_id: mid }});
                            msg.reply(`Utente ${member.user.username} bannato correttamente dal BOT!`)

                            azione = "banuser";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, member, moneta, null, azione) );
                        } catch(e) {
                            msg.reply("Errore nel BAN dell'utente, riprova!");
                            console.log("BAN USER: Error => "+ e);
                        }

                    }
                    else if (type === 'ciurma') {
                        let nome = role.name;
                        let rid = role.id;

                        const crew = await crews.findOne({where: { c_id: rid }});
                        if (!crew) {
                            return msg.reply("La Ciurma non e' presente nel DataBase");
                        }
                        try {
                            await crews.update({banned: true }, {where: { c_id: rid   }});
                            msg.reply(`Ciurma ${nome} bannato correttamente dal BOT!`)

                            azione = "bancrew";
                            msg.client.channels.get(LogsCh_ID).send( logs(msg, role, moneta, null, azione) );
                        } catch(e) {
                            msg.reply("Errore nel BAN della Ciurma, riprova!");
                            console.log("BAN Ciurma: Error => "+ e);
                        }
                    }
                    else {
                        return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban utente @utente\` o \`$ban ciurma @ciurma\`');
                    }
                }
                else if (reaction.emoji.name === '✖') {
                    msg.reply('Comando Annullato!');
                    ms.delete();
                }
                else {
                    msg.reply('Reazione selezionata errata!');
                    ms.delete();
                }
            })
            .catch(collected => {
                msg.reply('Non hai selezionato alcun opzione in tempo. Riprova!');
                ms.delete();
            });
    }

    else if (command === "unban") { // Rimuove il ban di un utente/ciurma dal BOT
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        else if (!args[0])  return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$unban utente @utente\` o \`$unban ciurma @ciurma\`');

        let type = args[0].toLowerCase();
        if (type === 'utente') {
            const member = msg.mentions.members.first();
            if (!args[0] || !args[1] || !member || args.slice(2).length ) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$unban utente @utente\``');
                return;
            }
            let mid = member.id;
            let user = await findOneUser(mid);
            if (!user) {
                return msg.reply("L'utente non e' presente nel DataBase");
            }
            try {
                await users.update({banned: false }, {where: { u_id: mid   }});
                msg.reply(`Utente ${member.user.username} unbannato correttamente dal BOT!`)

                azione = "unbanuser";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, member, moneta, null, azione) );
            } catch(e) {
                msg.reply("Errore nel BAN dell'utente, riprova!");
                console.log("BAN USER: Error => "+ e);
            }

        }
        else if (type === 'ciurma') {
            const role = msg.mentions.roles.first()
            if (!args[0] || !args[1] || !role || args.slice(2).length ) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$unban ciurma @ciurma\`');
                return;
            }
            let nome = role.name;
            let rid = role.id;

            const crew = await crews.findOne({where: { c_id: rid }});
            if (!crew) {
                return msg.reply("la Ciurma non e' presente nel DataBase");
            }
            try {
                await crews.update({banned: false }, {where: { c_id: rid   }});
                msg.reply(`Ciurma ${nome} unbannato correttamente dal BOT!`)

                azione = "unbancrew";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, role, moneta, null, azione) );
            } catch(e) {
                msg.reply("Errore nel BAN della Ciurma, riprova!");
                console.log("BAN Crew: Error => "+ e);
            }
            
        }
        else {
            return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$ban utente @utente\` o \`$ban ciurma @ciurma\`');
        }
    }

    else if (command === "msg") {
        if (!msg.member.roles.has(Staff_ID)) {
            msg.reply("Non hai i permessi per farlo: Staff_ID");
            return;
        }
        else if (!args)  return msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$msg (messaggio da parte del bot)\`');
        
        msg.channel.send(args.slice(0).join(" "))
        msg.delete(10)
            .catch(e => console.error("Errore $msg: "+e))
    }

    else if (command === "embedmsg") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('embedmsg').execute(client, msg, args);
    }


    else if (command === "aggiornanomeciurme") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('aggiornanomeciurme').execute(msg, args, users, crews, codecolor);
    }

    else if (command === "modificagt") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('modificagt').execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta);
    }

    else if (command === "rimuovigt") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('rimuovigt').execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta);
    }

    else if (command === "pagaquiz") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('pagaquiz').execute(msg, args, users, codecolor, moneta, UserMaxMoneta, ServicesCh_ID);
    }

    else if (command === "evento") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('evento').execute(msg, args, codecolor, moneta, xboxStatsRewardMolt);
    }

    else if (command === "incassaall") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        client.commands.get('incassaall').execute(msg, args, users, xboxstatistics, checkStats, codecolor, moneta, resolveAfter);
    }

    else if (command === "aggeconomyrole") {
        if (!msg.member.roles.has(Staff_ID)) {
            return msg.reply("Non hai i permessi per farlo: Staff_ID");
        }
        const myusers = await users.findAll();
        const economyRole = msg.guild.roles.get(RuoloEconomy_ID);

        myusers.map(async function(user) {
            let u;
            const myPromise = new Promise( (resolve, reject) => {
                u = msg.guild.fetchMember(user.u_id);
                setTimeout(function(){
                    resolve(u); // Yay! Everything went well!
                  }, 250);
            })

            myPromise.then( u => {
                if (u.roles.has(economyRole.id) ) return console.log(u.user.username+" ha già il RuoloEconomy_ID");
                u.addRole(economyRole)
                console.log("Aggiunto Ruolo Economy a: "+u.user.username)
            })
            resolveAfter();
        });

    }



    // ECONOMY SETTINGS
    else if (command === "moneta") { // Cambia nome della Moneta (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            if (!args[0] || args.slice(1).length) {
                msg.reply("ERRORE -> Sintassi del comando errata! Riprova con \`$moneta NOMEMONETA\`");
                return;
            }
            try {
                await eco_settings.update({datas: args[0].trim()}, {where: {name: "Moneta"}});
                msg.reply(`Moneta cambiata correttamente in: *${args[0].trim()}*`)

                azione = "moneta";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, args, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio della Moneta! Riprova.");
                console.log("Errore cambio della Moneta: "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "staffid") { // Cambia ruolo dello Staff per gestione (ServerOwner needed)
        if (msg.author.id === msg.guild.ownerID) {
            const role = msg.mentions.roles.first();
            if (!role || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$staffid @ruolostaff\`');
                return;
            }
            const roleid = role.id;
            try {
                await eco_settings.update( {datas: roleid}, {where: {name: "Staff_ID"} } );
                msg.reply(`Staff_ID cambiato correttamente in: *<@&${roleid}> (${roleid})*`)

                azione = "staffid";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, role, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio Ruolo Staff (del BOT)! Riprova.");
                console.log("Errore cambio Ruolo Staff (del BOT): "+e)
            }
            
            
        }else msg.reply("Non hai i permessi per farlo: ServerOwner");
    }

    else if (command === "gestoreid") { // Cambio ruolo del GestoreCiurma (Gestore_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const role = msg.mentions.roles.first();
            if (!role || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$gestoreid @ruologestore\`');
                return;
            }
            const roleid = role.id;
            try {
                await eco_settings.update({datas: roleid}, {where: {name: "Gestore_ID"}});
                msg.reply(`Gestore cambiato correttamente in: *<@&${roleid}> (${roleid})*`)

                azione = "gestoreid";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, role, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio Ruolo Gestore Ciurma (del BOT)! Riprova.");
                console.log("Errore cambio Ruolo Gestore Ciurma (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "economyid") { // Cambio ruolo del RUolo Economy (Gestore_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const role = msg.mentions.roles.first();
            if (!role || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$economy @ruoloeconomy\`');
                return;
            }
            const roleid = role.id;
            try {
                await eco_settings.update({datas: roleid}, {where: {name: "RuoloEconomy_ID"}});
                msg.reply(`Ruolo Economy cambiato correttamente in: *<@&${roleid}> (${roleid})*`)

                azione = "economyid";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, role, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio Ruolo Economy (del BOT)! Riprova.");
                console.log("Errore cambio Ruolo Economy (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "chlog") { // Cambio canale dei Logs (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const channel = msg.mentions.channels.first();
            if (!channel || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$chlogs #channel\`');
                return;
            }
            const chid = channel.id;
            try {
                await eco_settings.update({datas: chid}, {where: {name: "LogsCh_ID"}});
                msg.reply(`Canale di Logs cambiato correttamente in: *<#${chid}> (${chid})*`)

            }
            catch (e) {
                msg.reply("Errore cambio Canale di Log (del BOT)! Riprova.");
                console.log("Errore cambio Canale di Log (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "chassistenza") { // Cambio canale dei Request (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const channel = msg.mentions.channels.first();
            if (!channel || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$chrequest #channel\`');
                return;
            }
            const chid = channel.id;
            try {
                await eco_settings.update({datas: chid}, {where: {name: "RequestCh_ID"}});
                msg.reply(`Canale di Assistenza cambiato correttamente in: *<#${chid}> (${chid})*`)

                azione = "chrequest";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, channel, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio Canale di Assistenza (del BOT)! Riprova.");
                console.log("Errore cambio Canale di Assistenza (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "chfeedback") { // Cambio canale dei Request (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const channel = msg.mentions.channels.first();
            if (!channel || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$chfeedback #channel\`');
                return;
            }
            const chid = channel.id;
            try {
                await eco_settings.update({datas: chid}, {where: {name: "FeedbackCh_ID"}});
                msg.reply(`Canale di Feedback cambiato correttamente in: *<#${chid}> (${chid})*`)

                azione = "chfeedback";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, channel, null, null, azione) );
            }
            catch (e) {
                msg.reply("Errore cambio Canale di Feedback (del BOT)! Riprova.");
                console.log("Errore cambio Canale di Feedback (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "chservizi") { // Cambio canale dei Request (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            const channel = msg.mentions.channels.first();
            if (!channel || !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$chservices #channel\`');
                return;
            }
            const chid = channel.id;
            try {
                await eco_settings.update({datas: chid}, {where: {name: "ServicesCh_ID"}});
                msg.reply(`Canale dei Servizi cambiato correttamente in: *<#${chid}> (${chid})*`)
                
                azione = "chservices";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, channel, null, null, azione) ); 
            }
            catch (e) {
                msg.reply("Errore cambio Canale dei Servizi (del BOT)! Riprova.");
                console.log("Errore cambio Canale dei Servizi (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "chspostami") { // Cambio canale dei Logs (Saff_ID needed)
        if (msg.member.roles.has(Staff_ID)) {
            
            if ( !args[0] || args.slice(1).length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$chlogs #channel\`');
                return;
            }
            const chid = args[0];
            try {
                await eco_settings.update({datas: chid}, {where: {name: "SpostamiCh_ID"}});
                msg.reply(`Canale Vocale Spostami cambiato correttamente in: *<#${chid}> (${chid})*`)

            }
            catch (e) {
                msg.reply("Errore cambio Canale di Spostami (del BOT)! Riprova.");
                console.log("Errore cambio Canale di Spostami (del BOT): "+e)
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "limitemoneta") { // Cambio canale dei Request (Saff_ID needed)
        const limit_text = ' \`$limitemoneta utenti min N\`, \`$limitemoneta utenti max N\`, \`$limitemoneta ciurme min N\` oppure \`$limitemoneta ciurme max N\` '
        if (msg.member.roles.has(Staff_ID)) {
            if (!args[0] || !args[1] || !args[2] || args.slice(3).length || !Number.isInteger(parseInt(args[2]))) {
                msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${limit_text}`);
                return;
            }
            
            let type = args[0].toLowerCase();
            let max_min = args[1].toLowerCase();
            let amount = parseInt(args[2]);
            try {
                switch(type) {
                    case "utenti":
                        if (max_min.toLowerCase() === "min") {
                            await eco_settings.update({datas: amount}, {where: {name: "UserMinMoneta"}});
                            msg.reply(`Minimo di ${moneta} per portafoglio Utente cambiato correttamente in: *${args[2]}*`)

                            // Ricerco tutti gli utenti che hanno le monete superiori/inferiori al nuovo limite e le modifica
                            const findall = await users.findAll();
                            let flag = false;
                            for (let x in findall) {
                                if (findall[x].balance < amount) {
                                    flag = true;
                                    msg.client.channels.get(LogsCh_ID).send( " -> "+ findall[x].name + " (" + findall[x].u_id +") - Monete precedenti: "+findall[x].balance + ` ${moneta}`);
                                    await users.update( {balance: amount }, {where: { u_id: findall[x].u_id }} );
                                }
                                
                            }
                            if (flag)
                                msg.client.channels.get(LogsCh_ID).send("**I precedenti utenti avevano meno monete del nuovo limite configurato: **");
                            
                        }
                        else if (max_min.toLowerCase() === "max") {
                            await eco_settings.update({datas: amount}, {where: {name: "UserMaxMoneta"}});
                            msg.reply(`Massimo di ${moneta} per portafoglio Utente cambiato correttamente in: *${args[2]}*`)
                            
                            // Ricerco tutti gli utenti che hanno le monete superiori/inferiori al nuovo limite e le modifica
                            const findall = await users.findAll();
                            let flag = false;
                            for (let x in findall) {
                                if (findall[x].balance > amount) {
                                    flag = true;
                                    msg.client.channels.get(LogsCh_ID).send( " -> "+ findall[x].name + " (" + findall[x].u_id +") - Monete precedenti: "+findall[x].balance + ` ${moneta}`);
                                    await users.update( {balance: amount }, {where: { u_id: findall[x].u_id }} );
                                }
                                
                            }
                            if (flag)
                                msg.client.channels.get(LogsCh_ID).send("**I precedenti utenti avevano più monete del nuovo limite configurato: **");
                            
                        }
                        else {
                            return msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${limit_text}`);
                        }
                        break;

                    // CASE CREWS
                    case "ciurme":
                        if (max_min.toLowerCase() === "min") {
                            await eco_settings.update({datas: amount}, {where: {name: "CrewMinMoneta"}});
                            msg.reply(`Minimo di ${moneta} per portafoglio Ciurme cambiato correttamente in: *${args[2]}*`)

                            // Ricerco tutti i Clan che hanno le monete superiori/inferiori al nuovo limite e li modifica
                            const findall = await crews.findAll();
                            let flag = false;
                            for (let x in findall) {
                                if (findall[x].balance < amount) {
                                    flag = true;
                                    msg.client.channels.get(LogsCh_ID).send( " -> "+ findall[x].name + " (" + findall[x].c_id +") - Monete precedenti: "+findall[x].balance + ` ${moneta}`);
                                    await crews.update( {balance: amount }, {where: { c_id: findall[x].c_id }} );
                                }
                                
                            }
                            if (flag)
                                msg.client.channels.get(LogsCh_ID).send("**Le precedenti Ciurme avevano meno monete del nuovo limite configurato: **");
                            
                        }
                        else if (max_min.toLowerCase() === "max") {
                            await eco_settings.update({datas: amount}, {where: {name: "CrewMaxMoneta"}});
                            msg.reply(`Massimo di ${moneta} per portafoglio Ciurme cambiato correttamente in: *${args[2]}*`)

                            // Ricerco tutti i Clan che hanno le monete superiori/inferiori al nuovo limite e li modifica
                            const findall = await crews.findAll();
                            let flag = false;
                            for (let x in findall) {
                                if (findall[x].balance > amount) {
                                    flag = true;
                                    msg.client.channels.get(LogsCh_ID).send( " -> "+ findall[x].name + " (" + findall[x].c_id +") - Monete precedenti: "+findall[x].balance + ` ${moneta}`);
                                    await crews.update( {balance: amount }, {where: { c_id: findall[x].c_id }} );
                                }
                                
                            }
                            if (flag)
                                msg.client.channels.get(LogsCh_ID).send("**Le precedenti Ciurme avevano meno monete del nuovo limite configurato: **");
                            
                        }
                        else {
                            return msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${limit_text}`);
                        }
                        break;

                    default:
                        return msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${limit_text}`);
                        
                        break;
                }
               
                azione = "moneylimit";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, null, azione) );
            }
            catch (e) {
                msg.reply("Errore nella modifica dei limiti del portafoglio (del BOT)!");
                console.log("Errore modifica dei limiti del portafoglio (del BOT): "+e.name);
            }
        }else return msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "setruolo") {
        const role_text = ' \`$setruolo (nomeruolo-ES: cuoco) @ruolo\` ';
        if (msg.member.roles.has(Staff_ID)) {
            const role = msg.mentions.roles.first();
            if (!role || !args[0] || !args[1] || args.slice(2).length) {
                msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${role_text}`);
                return;
            }

            const rid = role.id;
            const nome_ruolo = args[0].toLowerCase();
            try {

                switch(nome_ruolo) {
                    case 'cuoco':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Cuoco" }} )
                        msg.channel.send(`Ruolo __Cuoco__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'cannonaro':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Cannonaro" }} )
                        msg.channel.send(`Ruolo __Cannonaro__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'nostromo':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Nostromo" }} )
                        msg.channel.send(`Ruolo __Nostromo__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'timoniere':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Timoniere" }} )
                        msg.channel.send(`Ruolo __Timoniere__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'cartografo':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Cartografo" }} )
                        msg.channel.send(`Ruolo __Cartografo__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'ufficiale':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Ufficiale di Bordo" }} )
                        msg.channel.send(`Ruolo __Ufficiale di Bordo__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'quartiermastro':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Quartiermastro" }} )
                        msg.channel.send(`Ruolo __Quartiermastro__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'capitano':
                        await rolelevels.update( {roleid: rid}, {where: { rolename: "Capitano" }} )
                        msg.channel.send(`Ruolo __Capitano__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;

                    case 'leggendario':
                        await piratetypes.update( {roleid: rid}, {where: { rolename: "Pirata Leggendario" }} )
                        msg.channel.send(`Ruolo __Capitano__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
                    case 'fantasma':
                        await piratetypes.update( {roleid: rid}, {where: { rolename: "Pirata Fantasma" }} )
                        msg.channel.send(`Ruolo __Capitano__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
					case 'redeipirati':
                        await piratetypes.update( {roleid: rid}, {where: { rolename: "Re dei Pirati" }} )
                        msg.channel.send(`Ruolo __Re dei pirati__ cambiato correttamente in: *${msg.guild.roles.get(rid)} (${rid})*`)
                        break;
					
                    
                    default:
                        return msg.reply(`ERRORE -> Sintassi del comando errata! Riprova con ${role_text}`);
                        break;
                }

                azione = "setruolo";
                msg.client.channels.get(LogsCh_ID).send( logs(msg, args, moneta, null, azione) );
            }
            catch (e) {
                msg.reply("Errore nella modifica di un ruolo del bot (del BOT): "+args[0]);
                console.log("Errore modifica di un ruolo del bot (del BOT): "+e.name);
            }
        }else return msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "mostraimpostazioni") {
        if (msg.member.roles.has(Staff_ID)) {
            if (args.length) {
                msg.reply('ERRORE -> Sintassi comando errata. Riprova con \`$mostraimpostazioni\`');
                return;
            }
            // try {
                const settingsEmbed = await new Discord.RichEmbed()
                .setColor('0x009933')
                .setAuthor(`<💲> Economy Impostazioni <💲>`)

                .addField("Moneta",`${moneta}` )
                .addField("Staff_ID", `${Staff_ID} (${msg.guild.roles.get(Staff_ID)})` )
                .addField("Gestore_ID", `${Gestore_ID} (${msg.guild.roles.get(Gestore_ID)})` )
                .addField("RuoloEconomy_ID", `${RuoloEconomy_ID} (${msg.guild.roles.get(RuoloEconomy_ID)})` )
                .addField("Logs Channel", `${LogsCh_ID} (${msg.guild.channels.get(LogsCh_ID)})` )
                .addField("Assistenza Channel", `${RequestCh_ID} (${msg.guild.channels.get(RequestCh_ID)})` )
                //.addField("Feedback Channel", `${FeedbackCh_ID} (${msg.guild.channels.get(FeedbackCh_ID)})` )
                .addField("Servizi Channel", `${ServicesCh_ID} (${msg.guild.channels.get(ServicesCh_ID)})` )
                .addField("Spostami Channel (Canale Vocale)", `${SpostamiCh_ID} (${msg.guild.channels.get(SpostamiCh_ID)})` )
                .addField("UserMinMoneta", `${UserMinMoneta}` )
                .addField("UserMaxMoneta", `${UserMaxMoneta}` )
                .addField("CrewMinMoneta", `${CrewMinMoneta}` )
                .addField("CrewMaxMoneta", `${CrewMaxMoneta}` )


                // const settings = await eco_settings.findAll();
                // settings.forEach(value => settingsEmbed.addField(value.name, `*${value.datas}*`) );
                
                msg.channel.send(settingsEmbed);
            /* } catch(e) {
                msg.reply("ERRORE -> Qualche settaggio non è stato compilato correttamente!");
            } */
            
        } else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "mostraruoli") {
        if (msg.member.roles.has(Staff_ID)) {
            if (args.length) {
                msg.reply('ERRORE -> Sintassi comando errata. Riprova con \`$mostraruoli\`');
                return;
            }
            try {
                const ruoliEmbed = await new Discord.RichEmbed()
                    .setColor('0x009933')
                    .setAuthor(`<💲> Economy Ruoli Reward <💲>`)

                const ruoli = await rolelevels.findAll();
                ruoliEmbed.addField("\u200B","⏬Ruoli Community⏬");
                ruoli.forEach(item => ruoliEmbed.addField("Lvl "+item.level + ": " + item.rolename, `${item.roleid} (${msg.guild.roles.get(item.roleid)})` ) )
                
                const pirates = await piratetypes.findAll();
                ruoliEmbed.addField("\u200B","⏬Ruoli In-Game⏬");
                pirates.forEach(item => ruoliEmbed.addField("Lvl "+item.level + ": " + item.rolename, `${item.roleid} (${msg.guild.roles.get(item.roleid)})` ) )

                msg.channel.send(ruoliEmbed);
            } catch(e) {
                msg.reply("ERRORE -> Qualche ruolo non è stato compilato correttamente!");
            }
            
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

    else if (command === "setdepositaciurma") {
        if (msg.member.roles.has(Staff_ID)) {
            if (args.length) {
                msg.reply('ERRORE -> Sintassi del comando errata! Riprova con \`$setdepositaciurma\`');
                return;
            }
            if (flagDonateCrew) {
                flagDonateCrew = false;
                msg.channel.send(`Comando \`$depositaallaciurma @noemciurma (quantita' di ${moneta})\` => DISATTIVATO`);
            }
            else if (!flagDonateCrew) {
                flagDonateCrew = true;
                msg.channel.send(`Comando \`$depositaallaciurma @nomeciurma (quantita' di ${moneta})\` => ATTIVATO`);
            }
        }else msg.reply("Non hai i permessi per farlo: Staff_ID");
    }

});

client.on('error', console.log);

client.login(process.env.TOKEN);