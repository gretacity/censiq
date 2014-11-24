var app = {
    
    STEP_0: 0,
    STEP_1: 1,
    STEP_2: 2,
    STEP_3: 3,

    census: new Census(CensusTypes.guardrail),
    
    localizationPageId: 'guardrailStep0Page',
    picturesPageId: 'guardrailStep1Page',
    picturesPageIdd: 'guardrailStep3Page',

    
    pageOffsetTop: 0,
    
    // Application Constructor
    initialize: function() {
        // Custom fields used for localization (street , no/km)
        var additionalContent = '<li role="listdivider">&nbsp;</li>' +
                                '<li>' +
                                    '<label for="comune">Comune</label>' +
                                    '<input id="comune" placeholder="Comune" />' +
                                '</li>' +
                                '<li>' +
                                    '<label for="provincia">Provincia</label>' +
                                    '<input id="provincia" placeholder="Provincia" />' +
                                '</li>' +
                                '<li>' +
                                    '<label for="street">Strada / Via</label>' +
                                    '<input id="street" placeholder="Strada o via" />' +
                                '</li>' +
                                '<li>' +
                                    '<label for="streetNumber">Km / Civico</label>' +
                                    '<input id="streetNumber" placeholder="Km o numero civico" />' +
                                '</li>';
        page.injector.injectPage('#guardrailStep0Page', 'localize', {title: 'Guard Rail', footerText: '1 di 4', additionalContent: additionalContent});
        page.injector.injectPage('#guardrailStep1Page', '3pictures', {title: 'Guard Rail', footerText: '2 di 4'});
        page.injector.injectPage('#summaryPage', 'summary', {continueLink: '#guardrailStep0Page'});
        page.injector.injectPage('#guardrailStep3Page', 'dinamica', {title: 'Guard Rail', footerText: '4 di 4'});
        
        var html = '<option>Tipologia</option>';
        var guardrailBarriera = data.guardrail.getGuardrailBarriere();
        for(var i in guardrailBarriera) {
            html += '<option>' + guardrailBarriera[i].name + '</option>';
        }
        $('#barriera').html(html);
        $('#Mbarriera').html(html);
        
        this.bindEvents();        
    },
    
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        
        document.addEventListener('deviceready', this.onDeviceReady, false);
        // Force onDeviceReady if it's a browser
        if(config.EMULATE_ON_BROWSER) this.onDeviceReady();
        $('.prev-step').on('click', this.previousStep);
        $('.next-step').on('click', this.stepCompleted);
        // Step 0
        $page0 = $('#guardrailStep0Page');
        $('#acquireQrCodeButton', $page0).on('click', this.acquireQrCode);
        $('#getCoordinatesPanel', $page0).on('click', this.acquireGeoCoordinates);
        $('#openMapPageButton', $page0).on('click', function() {
            //helper.maximizeContent();
            setTimeout(function() {
                var success = app.openMap();
                if(!success) return;
                $.mobile.changePage('#mapPage', {
                    transition: 'slide',
                    reverse: false,
                    changeHash: false
                });
            }, 100);
        });
        // Step1
        var $page1 = $('#guardrailStep1Page');
        //var id = $page1[0].id;
        //console.log('id', id);
        $('a[data-addview]', $page1).on('click', this.acquirePhoto);
        $('a[data-removeview]', $page1).on('click', this.removePhoto);
        //$('a[data-showview]', $page1).on('click', this.showPhotoDialog);
        $('#photoPage a').on('tap', this.hidePhotoDialog);
        //Step 3
        var $page3 = $('#guardrailStep3Page');
        $('a[data-addview]', $page3).on('click', this.acquirePhotoSola);
        $('a[data-removeview]', $page3).on('click', this.removePhotoSola);
        //$('a[data-showview]', $page1).on('click', this.showPhotoDialog);
        
        $('div[data-role="dialog"]').on('create', function() {
            app.pageOffsetTop = $(this).offset().top;
        });
        $('div[data-role="dialog"]').on('pagehide', function() {
            $.mobile.silentScroll(app.pageOffsetTop);
        });
    },
    
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        $('#qrCode').val(config.QR_CODE_TEST);
        // For Android devices
        document.addEventListener("backbutton", function(e) {
            e.preventDefault();
            //window.location.href = 'index.html';
        }, false);
        // Load external scripts only if the wifi connection is available
        if(helper.isOnline()) {
            if(typeof(google) == "undefined") {
                geoLocation.loadGoogleMapsScript('app.mapLoaded');
            }
        }
    },
    

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        if(parentElement) {
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');
            
            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
        }
        console.log('Received Event: ' + id);
    },
    

    validateStep: function(stepIndex, stepValidCallback, stepNotValidCallback) {
        var errors = [];
        if(stepIndex == app.STEP_0) {
            // Validate step 0
            if($.trim($('#qrCode').val()) == '') {
                errors.push('specificare il QR-code');
                stepNotValidCallback(errors);
            } else if($.trim($('#latLng').val()) == '') {
                helper.confirm('La posizione GPS non è stata specificata.\nVuoi procedere comunque?', function(buttonIndex) {
                    if(buttonIndex == 2) {
                        stepNotValidCallback();
                    } else {
                        stepValidCallback();
                    }
                }, 'Localizzazione GPS', ['Si', 'No']);
            } else {
                stepValidCallback();
            }
        } else if(stepIndex == app.STEP_1) {
            // Validate step 1
            stepValidCallback();
        } else if(stepIndex == app.STEP_2) {
            // Validate step 2
            stepValidCallback();
        } else if(stepIndex == app.STEP_3) {
            // Validate step 3
            stepValidCallback();
        }
    },
    
    
    stepStarted: function() {
        //
    },
    stepCompleted: function() {
        
        // Current step
        var step = $(this).attr('data-step');
        
        // Valitate step once completed
        app.validateStep(step, function() {
            // Success: move forward
            if(step == app.STEP_0) {
                $.mobile.changePage('#guardrailStep1Page');
            } else if(step == app.STEP_1) {
                $.mobile.changePage('#guardrailStep2Page');
            } else if(step == app.STEP_2) {
                $.mobile.changePage('#guardrailStep3Page');
            } else if(step == app.STEP_3) {
                app.save();
            }
        }, function(errors) {
            // Validation failed: display an error message if there is at least one
            if(Array.isArray(errors) && errors.length > 0) {
                helper.alert("Prima di procedere è necessario " + errors.join(' e '), null, "Avviso");
            }
        });
    },
    previousStep: function() {
        
        // Current step
        var step = $(this).attr('data-step');
        
        if(step == app.STEP_0) {
            //$.mobile.changePage('index.html#censusTypePage');
            $.mobile.back();
        } else if(step == app.STEP_1) {
            $.mobile.changePage('#guardrailStep0Page');
        } else if(step == app.STEP_2) {
            $.mobile.changePage('#guardrailStep1Page');
        } else if(step == app.STEP_3) {
            $.mobile.changePage('#guardrailStep2Page');
        }
    },
    
   
    
    save: function() {
        var supportTableData = {grcen: []};
        // Form is valid, proceed with saving.
        // Disable save button
        $('#saveButton').addClass('ui-disabled');
        
        // Update the Census entity...
        app.census.dateAdded = new Date();
        app.census.qrCode = $('#qrCode').val();
        //app.census.position.latitude = '';    // Already set
        //app.census.position.longitude = '';   // Already set
        //app.census.position.accuracy = '';    // Already set
        app.census.fixedOnMap = $('#positionIsCorrect').val();
        
        app.census.guardrail.comune = $ ('#comune').val();
        app.census.guardrail.provincia = $ ('#provincia').val();
        app.census.guardrail.street = $('#street').val();
        app.census.guardrail.streetNumber = $('#streetNumber').val();
        
        // Pictures related to the city asset
        var imageKeys = ['front', 'back', 'perspective'];
        for(var i in imageKeys) {
            var k = imageKeys[i];
            var imageSrc = $('#guardrailStep1Page a[data-viewtype="' + k + '"][data-showview] img').attr('src');
            if(imageSrc != '') {
                // Remove this from src attribute:
                // data:image/jpeg;base64,
                app.census.pictures[k] = imageSrc.substr(23);
            }
        }
        var imageGr=['fotogr'];
        var imageSrcGr=$('#guardrailStep3Page a[data-viewtype=fotogr][data-showview] img').attr('src');
        if(imageSrcGr != '') {
                // Remove this from src attribute:
                // data:image/jpeg;base64,
                app.census.pictures['fotogr'] = imageSrcGr.substr(23);
            }
        
        // informazioni guardrail
        var guardrailInfo = new guardrail.guardrailInfo();
        guardrailInfo.nastri = $('#nastri').val();                                    // Numero nastri Smontaggio
        guardrailInfo.pali = $('#pali').val();                                       // numero pali Smontaggio
        guardrailInfo.terminali = $('#terminali').val();                       // gruppi terminali Smontaggio
        guardrailInfo.barriera = $('#barriera').val();                               // tipologie barriere Smontaggio
        guardrailInfo.Mnastri = $('#Mnastri').val();                                 // Numero nastri Montaggio
        guardrailInfo.Mpali = $('#Mpali').val();                                     // numero pali Montaggio
        guardrailInfo.Mterminali = $('#Mterminali').val();                           // gruppi terminali Mntaggio
        guardrailInfo.Mbarriera = $('#Mbarriera').val();                              // tipologie barriere Montaggio
        
        guardrailInfo.parent = $('input[type="radio"].guardrail-mark:checked').val(); 
        guardrailInfo.fine = $('input[type="radio"].guardrail-mark2:checked').val();
        guardrailInfo.nomei = $('#nameIni').val();                                 // nome inizio
        guardrailInfo.sequenzai = $('#SeqIni').val();                              // numero sequenza iniziale

        //guardrailInfo.  = $('#nomeInizio').val();                              // nome inizio associato
        app.census.guardrail.guardrailInfo = guardrailInfo;
        //console.log("RAILINFO APPS",guardrailInfo);
        
        // informazioni tratto
      /*
        var guardInfo = new guardrail.guardInfo();
        
        console.log("GUARD APPS",guardInfo);
        
        app.census.guardrail.guards.push(guardInfo);
        // ...and save it
        // TODO Reenable
        //data.roadSign.updateSupportTables(supportTableData);
        */
        data.save(app.census);
        
        
        // Once saved the census, empty fields of all the steps
        var $page = $('#guardrailStep0Page');
        $('input[type="text"]', $page).val('');
        $('input[type="hidden"]', $page).val('');
        $('#geoStatusText', $page).html('Latitudine e longitudine');
        $('#geoStatusTitle', $page).html('Ottieni');
        $('#openMapPanel', $page).hide();
        var $page = $('#guardrailStep1Page');
        $('input[type="text"]', $page).val('');
        $('input[type="hidden"]', $page).val('');
        app.removePhoto('front');
        app.removePhoto('back');
        app.removePhoto('perspective');
        var $page = $('#guardrailStep2Page');
        $('input[type="text"]', $page).val('');
        $('input[type="number"]', $page).val('');
        $('input[type="hidden"]', $page).val('');
        $('select', $page).val(0);
        var $page = $('#guardrailStep3Page');
        $('input[type="text"]', $page).val('');
        $('input[type="number"]', $page).val('');
        $('input[type="hidden"]', $page).val('');
        $('textarea', $page).val('');
        $('select', $page).val(0);
        $('#saveButton', $page).removeClass('ui-disabled');
        $('#syncNowButton').removeClass('ui-disabled').html('Sincronizza subito');
        
        // Speed up development/testing
        $('#qrCode').val(config.QR_CODE_TEST);
        
        // Move to the last page of the wizard
        $.mobile.changePage('#summaryPage', {
            transition: 'slide'
        });
    }
}
    
    
    
    
    
    
  