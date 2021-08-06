module.exports = (messaggio) => {

    if (messaggio === 'Gold Hoarder Chests Cashed In')
        return 'Forzieri dei Cacciatori d\'Oro incassati';
    else if (messaggio === 'Distance Sailed (Metres)')
        return 'Distanza percorsa (metri)';
    else if (messaggio === 'Voyages Completed')
        return 'Viaggi completati';
    else if (messaggio === 'Order of Souls Skulls Cashed In')
        return 'Teschi dell\'Ordine delle anime incassati';
    else if (messaggio === 'Merchant Alliance Cargo Delivered')
        return 'Carichi dell\'Alleanza del Mercante consegnati';
    else if (messaggio === 'Islands Visited')
        return 'Isole visitate';
    else 
        return messaggio.value;
}