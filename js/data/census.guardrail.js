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
    this.fine = '';                                 // Fine Tratto
    this.nomei='';                                  //nome inizio
    this.sequenzai='';                              //numero sequenza
    this.chiuso='';
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
        //console.log("SERIALIZE GUARDRAIL",entity);
        var data = {
            comune: entity.guardrail.comune,
            provincia: entity.guardrail.provincia,
            street: entity.guardrail.street,
            streetNumber: entity.guardrail.streetNumber,
            guardrailInfo: entity.guardrail.guardrailInfo
            //guards: entity.guardrail.guardInfo,
        };
        //console.log(".." + JSON.stringify(data));
        //console.log("FINE SERIALIZE GUARDRAIL",data);
        console.log(".." + JSON.stringify(data));
        return JSON.stringify(data);
    },
    
    // Return entity from a record
    deserialize: function(row) {
        //console.log("DESERIALIZE GUARDRAIL",row);
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
        census.guardrail.guardrailInfo= tmp.guardrailInfo;
        //console.log("FINE DESERIALIZE GUARDRAIL",census);
        return census;
    },

    shortDescription: function(entity) {
        return '';
    },
    
    // Prepare an entity to be formatted for sending on web server
    mapForService: function(entity) {
        //console.log("ENTITY",entity);
        var obj = {
            gr_censimento: {
                //questo arriva sul db, tabella gr_censimento
                comune: entity.guardrail.comune,
                provincia: entity.guardrail.provincia,
                strada: entity.guardrail.street,
                civico: entity.guardrail.streetNumber,
                latitudine: entity.position.latitude,
                longitudine: entity.position.longitude,
                data_inserimento: entity.dateAdded,
                //sys_user_id: 0,
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
                nome_inizio: entity.guardrail.guardrailInfo.nomei,
                chiuso: entity.guardrail.guardrailInfo.chiuso
            },
            //gr_censimento_info: [],
            pictures: {
                front: entity.pictures['front'],
                back: entity.pictures['back'],
                perspective: entity.pictures['perspective'],
                fotogr: entity.pictures['fotogr']
            }
            
        };
        //console.log("OGGETTO GUARDRAIL",obj);
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
        //console.log("TABLES");
        if(data._db == null) this.open();
        data._db.transaction(function(t) {
            if(params.grcen) {
                //console.log("ROW",row);
                // Update 
                for(var i in params.manufacturers) {
                    var row = params.manufacturers[i];
                    var q = "insert or replace into gr_censimento_guardrail (numero_nastri_smontaggio, numero_pali_smontaggio, gruppi_terminali_smontaggio, tipologia_barriera_smontaggio, numero_nastri_montaggio, numero_pali_montaggio, gruppi_terminali_montaggio, tipologia_barriera_montaggio,parent, fine, sequenza) values (?, ?,?, ?,?, ?,?,?, ?, ?, ?,?, ?,?, ?)";
                    t.executeSql(q, [row.guardrailInfo.nastri, row.guardrailInfo.pali, row.guardrailInfo.terminali,row.guardrailInfo.barriera, row.guardrailInfo.Mnastri,row.guardrailInfo.Mpali, row.guardrailInfo.Mterminali, row.guardrailInfo.Mbarriera,row.guardrailInfo.parent, row.guardrailInfo.fine, row.guardrailInfo.sequenzai ]);
                }
            }
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

    getNomi: function () {
      this.returnSQLArray('select * from census ', this.processPersonsResponse); 
    },
    
    returnSQLArray: function (str,callback) {
        if(data._db == null) data.open();
        var result = [];
        data._db.transaction(
                function (tx, results) {
                    tx.executeSql(str, [], function(tx, rs) { 
                        for(var i=0; i<rs.rows.length; i++) {
                            var row = rs.rows.item(i);
                            //console.log("ROW",row);
                            result[i] = {
                                //id: row['id'],
                                qr: row['qr_code'],
                                nomei : row['entity_value']
                            }
                        }callback(result); });                   
                });   
            },
    
    processPersonsResponse: function (response) {
      //console.log ("RESPONSE",response.length);
      $.each(response, function(key, value) {
        var name = value.nomei; //console.log('name',name);
        var sub = name.indexOf('no'); //console.log('sub',sub);
        var subSTR = name.substring(sub+8,value.nomei.length);
        var finale = subSTR.indexOf('","s'); //console.log ('finale',finale);
        var fine = subSTR.substring(0,finale); //console.log ('fine',fine);
        if (fine.length >0) {
            $('#nomiInizio')
                    .append($("<option></option>")
                    .attr("value",value.qr)
                    .text(fine)); }
      });}  
};