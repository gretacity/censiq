// Specific classes used by guardrail
guardrail = function() {},
guardrail.guardrailInfo = function() {
    // Front
    this.nastri = 0;                                 //numero Nastri Smontaggio
    this.pali = 0;                                   // numero pali Smontaggio
    this.terminali = '';                            // gruppo terminali Smontaggio
    this.barriera = '';                              // tipologie barriere Smontaggio
    this.Mnastri = 0;                               // numero Nastri Montaggio
    this.Mpali = 0;                                 // numero Pali Montaggio
    this.Mterminali = '';                           // gruppo terminali Montaggio
    this.Mbarriera = '';                            // Tipologie Barriere Montaggio
    this.parent ='';                               // Inizio Tratto
    this.fine = '';                             // Fine Tratto
    this.nomei='';                                  //nome inizio
    this.sequenzai='';                              //numero sequenza
    //this.nomea='';                                 //nome associato inizio
};
/*guardrail.guardInfo = function() {
    this.marking ='';                               // Inizio Tratto
    this.marking2 = '';                             // Fine Tratto
    this.nomei='';                                  //nome inizio
    this.sequenzai='';                              //numero sequenza
    this.nomea='';                                 //nome associato inizio
};*/

// Extends Census class
Census.prototype.guardrail = function() {},
Census.prototype.guardrail.comune = '';
Census.prototype.guardrail.provincia = '';
Census.prototype.guardrail.street = '';
Census.prototype.guardrail.streetNumber = '';
Census.prototype.guardrail.guardrailInfo = new guardrail.guardrailInfo();
//Census.prototype.guardrail.guards = [];       // Array of guardrail.guardInfo objects



data.guardrail = {    
    
    // Return the serialized entity string
    serialize: function(entity) {
        console.log("SERIALIZE GUARDRAIL",entity);
        var data = {
            comune: entity.guardrail.comune,
            provincia: entity.guardrail.provincia,
            street: entity.guardrail.street,
            streetNumber: entity.guardrail.streetNumber,
            guardrailInfo: entity.guardrail.guardrailInfo
            //guards: entity.guardrail.guardInfo,
        };
        //console.log(".." + JSON.stringify(data));
        console.log("FINE SERIALIZE GUARDRAIL",data);
        console.log(".." + JSON.stringify(data));
        return JSON.stringify(data);
    },
    
    // Return entity from a record
    deserialize: function(row) {
        console.log("DESERIALIZE GUARDRAIL",row);
        var census = new Census();
        census.id = row.id;
        census.dateAdded = row.date_added;
        census.status = row.status;
        census.entityType = row.entity_type;
        census.qrCode = row.qr_code;
        census.position.latitude = row.lat;
        census.position.longitude = row.lng;
        census.position.accuracy = row.accuracy;
        census.fixedOnMap = row.fixed_on_map;
        var tmp = JSON.parse(row.entity_value);
        census.guardrail.comune = tmp.comune;
        census.guardrail.provincia= tmp.provincia;
        census.guardrail.street = tmp.street;
        census.guardrail.streetNumber= tmp.streetNumber;
        //census.guardrail.guardInfo=tmp.guards;
        census.guardrail.guardrailInfo= tmp.guardrailInfo;
        console.log("FINE DESERIALIZE GUARDRAIL",census);
        return census;
    },

    shortDescription: function(entity) {
        return '';
    },
    
    // Prepare an entity to be formatted for sending on web server
    mapForService: function(entity) {
        var obj = {
            gr_censimento: {
                latitudine: entity.position.latitude,
                longitudine: entity.position.longitude,
                data_inserimento: entity.dateAdded,
                sys_user_id: 0,
                r_qr_code_id: entity.qrCode,
                numero_nastri_smontaggio: entity.guardrail.guardrailInfo.nastri,
                numero_pali_smontaggio: entity.guardrail.guardrailInfo.pali,
                gruppi_terminali_smontaggio: entity.guardrail.guardrailInfo.terminali,
                tipologia_barriera_smontaggio: entity.guardrail.guardrailInfo.barriera,
                numero_nastri_montaggio: entity.guardrail.guardrailInfo.Mnastri,
                numero_pali_montaggio: entity.guardrail.guardrailInfo.Mpali,
                gruppi_terminali_montaggio: entity.guardrail.guardrailInfo.Mterminali,
                tipologia_barriera_montaggio: entity.guardrail.guardrailInfo.Mbarriera,
                parent: entity.guardrail.guardrailInfo.parent,
                fine: entity.guardrail.guardrailInfo.fine,
                sequenza: entity.guardrail.guardrailInfo.sequenzai,
                nome_inizio: entity.guardrail.guardrailInfo.nomei
                //nome_assegnato: entity.guardrail.guardrailInfo.nomea,
                
            },
            //gr_censimento_info: [],

            pictures: {
                front: entity.pictures['front'],
                back: entity.pictures['back'],
                perspective: entity.pictures['perspective'],
                fotogr: entity.pictures['fotogr']
            }
            
        };
           /* var entry = {
                parent: guards.marking,
                chiuso: guards.marking2,
                sequenza: guards.sequenzai,
                nome_inizio: guards.nomei,
                nome_assegnato: guards.nomea,
                fine: guards.marking2
            };
            obj.gr_censimento_info.push(entry);
            console.log("OGGETTO GUARDRAIL",obj);*/
        return obj;
    },
    
   
    
    /***
     *  Insert or replace data in the support tables
     *  params: {
     *      manufacturers: [{name: '', authNo: ''}],
     *      installers: [{name: ''}],
     *      owners: [{name: ''}],
     *  }
     */
    updateSupportTables: function(params) {
        console.log("TABLES");
        if(data._db == null) this.open();
        
        data._db.transaction(function(t) {
            
            if(params.grcen) {
                console.log("ROW",row);
                // Update 
                for(var i in params.manufacturers) {
                    var row = params.manufacturers[i];
                    var q = "insert or replace into gr_censimento_guardrail (numero_nastri_smontaggio, numero_pali_smontaggio, gruppi_terminali_smontaggio, tipologia_barriera_smontaggio, numero_nastri_montaggio, numero_pali_montaggio, gruppi_terminali_montaggio, tipologia_barriera_montaggio,parent, fine, sequenza, nome_inizio) values (?, ?,?, ?,?, ?,?,?, ?, ?, ?,?, ?,?, ?,?)";
                    t.executeSql(q, [row.guardrailInfo.nastri, row.guardrailInfo.pali, row.guardrailInfo.terminali,row.guardrailInfo.barriera, row.guardrailInfo.Mnastri,row.guardrailInfo.Mpali, row.guardrailInfo.Mterminali, row.guardrailInfo.Mbarriera,row.guardrailInfo.parent, row.guardrailInfo.fine, row.guardrailInfo.sequenzai, row.guardrailInfo.nomei ]);
                }
            }
/*
            if(params.grinf) {
                // Update installers
                for(var i in params.installers) {
                    var row = params.installers[i];
                    var q = "insert or replace into gr_censimento_info (parent, chiuso, sequenza, nome_inizio, nome_assegnato, fine) values (?, ?,?, ?,?, ?,?)";
                    t.executeSql(q, [row.guardInfo.marking, row.guardInfo.marking2, row.guardInfo.sequenzai, row.guardInfo.nomei, row.guardInfo.nomea, row.guardInfo.marking2 ]);
                }
            }*/
        });
    },

    getGuardrailBarriere: function() {
        return [
            {name: 'N2BL'},
            {name: 'H1BL'},
            {name: 'H1ST'},
            {name: 'H2BL'},
            {name: 'H2ST'},
            {name: 'H2BP'},
            {name: 'H3BL'},
            {name: 'H3ST'},
            {name: 'H3BP'},
            {name: 'H4BL'},
            {name: 'H4BP'},
            {name: 'Barriera Fono Assorbente'},
            {name: 'Altro'}
        ];
    },
    
       getNameIniziali: function() {
        if(data._db == null) data.open();
        
        data._db.transaction(function(tx) {
            
            var q = "select * from 'census' ";
            tx.executeSql(q, [], function(tx, result) {
                // success 
                var itemCount = result.rows.length;
                for(var i = 0; i < itemCount; i++) {
                    var row = result.rows.item(i);
                }
                return row
            }, function(tx, error) {
                console.log(error);
            });
        });
    }
};