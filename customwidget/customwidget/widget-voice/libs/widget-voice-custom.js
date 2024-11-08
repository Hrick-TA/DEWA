
/** * Declaration Start */
var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';
var WARNING = 'WARNING';
var IS_CONSOLE_LOG_ENABLE = true;
/** * Declaration END */

function InitVoiceMethodsInsideScopeDEWA(scope) {

    //Intraction load
    scope.newIntraction = function (scope, data) {
        scope.WriteLog(DEBUG, "newIntraction --> Start");

        if (scope.getInteraction(scope) == null) {
            scope.WriteLog(INFO, "newIntraction --> New Voice Interaction. IntractionID - " + scope.interactionID + ". State - " + data.state);

            scope.alertingTime = scope.getTime_yyyymmdd();
            scope.widgetRefId = scope.getGuid('');
            scope.setInteraction(scope);
        }
        else {
            scope.widgetRefId = scope.getInteraction(scope).REFID;
            scope.alertingTime = scope.getInteraction(scope).OFFER_TIME;

            if (scope.getInteraction(scope).ANSWER_TIME == '') {
                scope.setInteraction(scope);
            }
            else if (scope.objInteraction.state == 'ACW' && scope.getInteraction(scope).ACW_TIME == '') {
                scope.setInteraction(scope);
            }
            else if (scope.getInteraction(scope).NOTES_UPDATED == true) {

                scope.diableCallNotes(scope);
            }


            scope.answerTime = scope.getInteraction(scope).ANSWER_TIME;
        }

        scope.WriteLog(DEBUG, "newIntraction --> End");
    };

    scope.setInteraction = function (scope) {

        scope.WriteLog(DEBUG, "setInteraction --> Start. Interaction ID - " + scope.interactionID);

        var _interaction = {
            "INTERACTIONID": scope.interactionID,
            "WORKREQUESTID": scope.workRequestId,
            "REFID": scope.widgetRefId,
            "CHANNEL": scope.objInteraction.channel,
            "OFFER_TIME": scope.alertingTime,
            "ANSWER_TIME": scope.answerTime,
            "ACW_TIME": scope.acwTime,
            "NOTES_UPDATED": scope.notesSaved,
            "DISABLE_CONFERENCE_BUTTON": scope.disableConferenceButton
        }

        sessionStorage.setItem("INTERACTION_" + scope.interactionID, JSON.stringify(_interaction));

        scope.WriteLog(DEBUG, "setInteraction End. completed --> Interaction value - " + JSON.stringify(_interaction));
    }

    scope.getInteraction = function (scope) {


        scope.WriteLog(DEBUG, "getInteraction --> Start. IntractionID - " + scope.interactionID);

        var interactionJson = sessionStorage.getItem("INTERACTION_" + scope.interactionID)

        scope.WriteLog(DEBUG, "getInteraction --> End. completed --> Interaction value - " + interactionJson);

        return JSON.parse(interactionJson);
    }

    scope.removeInteraction = function (scope) {

        scope.WriteLog(DEBUG, "removeInteraction --> Start. InteractionID - " + scope.interactionID);

        sessionStorage.removeItem("INTERACTION_" + scope.interactionID);

        scope.WriteLog(DEBUG, "removeInteraction --> End. completed --> InteractionID - " + scope.interactionID);
    }

    //Load Initilize
    scope.initializeVoiceLayout = function (scope, data) {

        scope.WriteLog(DEBUG, "initializeVoiceLayout -->  Start.");

        //Default CRM Maximize or Minimize
        if (scope.defaultMinimizeCRM == true)
            scope.btnVoiceMinimizeCRM();
        else
            scope.btnVoiceMaximizeCRM();

        //Customer Details Maximize or Minimize
        if (scope.defaultMinimizeCustomPanel == true)
            scope.btnMinimizeCustomPanel(scope);
        else
            scope.btnMaximizeCustomPanel(scope);

        //scope.disableEnableTransferButton(scope, true);
        if (scope.getInteraction(scope).DISABLE_CONFERENCE_BUTTON == false)
            scope.enabledisableTransferButton(scope, true);

        scope.WriteLog(DEBUG, "initializeVoiceLayout -->  End.");
    };

    scope.loadWidgetData = function (scope, data) {

        scope.WriteLog(INFO, "loadWidgetData - Start");

       // if (scope.getInteraction(scope).DISABLE_CONFERENCE_BUTTON == true)
           // $(scope.htmlInteractionPrefix + " #DEWA-Conference-btn").prop('disabled', scope.getInteraction(scope).DISABLE_CONFERENCE_BUTTON);

        var transferButtonEnable = false;

        if (typeof showTransferButtonEnableText != "undefined" || typeof showConferenceButtonEnableText != "undefined")
            if (showTransferButtonEnableText == "SURVEY" || showConferenceButtonEnableText == "CONFERENCE")
                transferButtonEnable = true;

        scope.initilizeCategory(scope);
        scope.initilizeReason(scope);
        scope.initilizeOutcome(scope);
        scope.initilizeIVRNode(scope);

        scope.loadCSDetails(scope, data);

        if (scope.disableTransfer == false && (typeof transferButtonEnable == 'undefined' || transferButtonEnable == false) && scope.getInteraction(scope).DISABLE_CONFERENCE_BUTTON == false) {
            if (scope.TranferConferenceEnabledThreshold > 0) {
                document.getElementById("timerDiv").style.display = "block";
                display = document.querySelector('#time');
                display.innerText = scope.TranferConferenceEnabledThresohld;
                scope.startTimer(scope, scope.TranferConferenceEnabledThreshold, display);
            }
        }
        else {
            showTransferButtonEnableText = "";
            showConferenceButtonEnableText = "";
        }

        scope.WriteLog(DEBUG, "loadWidgetData - End");
    }

    scope.startTimer = function (scope, duration, display) {

        var timer = duration, seconds;
        var t = setInterval(function () {
            seconds = parseInt(timer % 60, 10);
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = scope.disableButtonNotification + seconds + " seconds!";

            if (seconds == 0) {

                document.getElementById("timerDiv").style.display = "none";
                scope.enabledisableTransferButton(scope, false);
                // transferButtonEnable=true; 
                clearInterval(t);
            }

            if (--timer < 0) {
                timer = duration;
            }
        }, 1000);
    }

    scope.loadWidgetDataContextStore = function (scope, data) {

        scope.WriteLog(INFO, "loadWidgetData - Start");
        scope.widgetCallType = (scope.objContextStore.data.CallType == undefined ? '' : scope.objContextStore.data.CallType);
        scope.accountNumber = '';

        if (scope.objContextStore.data.LastVerifiedUsedAcct != undefined && scope.objContextStore.data.LastVerifiedUsedAcct.length > 0) {
            scope.accountNumber = scope.objContextStore.data.LastVerifiedUsedAcct;
        }

        scope.recentLastVerifiedMobile = scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim();

        //scope.recentCLI = scope.recentLastVerifiedMobile.length > 0 ? '' : scope.getSIPNumber(scope.objInteraction.originatingAddress);

        scope.recentCLI = (scope.recentLastVerifiedMobile != undefined && scope.recentLastVerifiedMobile.length > 0) ? '' : scope.getSIPNumber(scope.objInteraction.originatingAddress);
        scope.agentTransferLanguage = (scope.objContextStore.data.SelectedLanguage == undefined) ? '' : scope.objContextStore.data.SelectedLanguage;

        scope.loadOperationLog(scope);
        scope.loadAccountUsed(scope);
        scope.loadIframe(scope);
        scope.bindCsNotificationPopup(scope);
        scope.loadRecentCallNotes(scope, data);

        scope.loadDispositionDetails(scope);
        scope.loadIVRNodeList(scope);

        scope.disable199IVR(scope);
        scope.bindCsCustomerDetails(scope);


        scope.WriteLog(DEBUG, "loadWidgetData - End");
    }

    scope.initilizeVoiceLabel = function (scope) {


    }

    scope.initilizeCategory = function (scope) {

        scope.WriteLog(DEBUG, 'initilizeCategory. Start');

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_category_dropdown');

        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cbo.html('');
        _cbo.html(_html);

        scope.WriteLog(DEBUG, 'initilizeCategory. End');
    };

    scope.initilizeReason = function (scope) {
        scope.WriteLog(DEBUG, 'initilizeReason. Start');

        scope.reasonValue = '';
        scope.reasonID = '';

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdown');
        var _cboText = $(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect .DEWA-input-single-select');

        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cboText.val("");
        _cbo.html('');
        _cbo.html(_html);

        scope.WriteLog(DEBUG, 'initilizeReason. Start');
    }

    scope.initilizeRecentCallNotesFilter = function (scope) {
        scope.WriteLog(DEBUG, 'initilizeRecentCallNotesFilter. Start');

        scope.recentreasonValue = '';
        scope.recentreasonID = '';
        var _cbo = $(scope.htmlInteractionPrefix + ' #recent_reasons_dropdown');
        var _cboText = $(scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect .DEWA-input-single-select');

        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cboText.val("");
        _cbo.html('');
        _cbo.html(_html);


        var _cbo1 = $(scope.htmlInteractionPrefix + ' #recent_outcome_dropdown');
        var _html1 = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";
        _cbo1.html('');
        _cbo1.html(_html1);

        scope.WriteLog(DEBUG, 'initilizeRecentCallNotesFilter. Start');
    }

    scope.initilizeOutcome = function (scope) {

        scope.WriteLog(DEBUG, 'initilizeOutcome. Start');

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdown');

        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cbo.html('');
        _cbo.html(_html);

        scope.WriteLog(DEBUG, 'initilizeOutcome. End');
    }

    scope.initilizeIVRNode = function (scope) {

        scope.WriteLog(DEBUG, 'initilizeIVRNode. Start');

        var _cbo = $(scope.htmlInteractionPrefix + ' #cboIVRNodeList');
        var _cboText = $(scope.htmlInteractionPrefix + ' #cboIVRNodeList .DEWA-input-single-select');
        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\"  autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cbo.html('');
        _cbo.html(_html);
        _cboText.val('');

        scope.WriteLog(DEBUG, 'initilizeIVRNode. End');
    }

    //Notification Bell popup
    scope.bindCsNotificationPopup = function (scope) {

        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> End.");

        var _jsonCSNotification = {};
        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> Response Data - " + scope.objContextStore);


        for (var i = 0; i < scope.notificationCS.notificationList.length; i++) {

            var _jsonValue = scope.getJsonValues(scope.objContextStore.data, scope.notificationCS.notificationList[i].Key);

            if (scope.notificationCS.notificationList[i].Key == 'ServiceType') {
                scope.serviceType = _jsonValue.length == 0 ? "DEFAULT" : _jsonValue;
            }

            if (_jsonValue != '') {

                var _value = _jsonValue[0];

                if (scope.notificationCS.notificationList[i].Key == "queuedTime") {
                    _value = scope.calcTimeDifference(_value, scope.getInteraction(scope).ANSWER_TIME);
                }

                _jsonCSNotification[scope.notificationCS.notificationList[i].Label] = _value;
            }
        }

        scope.objCsNotification = _jsonCSNotification;

        //_tbodyHeader.html(_html);
        //_tbodyFooter.html(_html);

        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> End.");
    }

    scope.bindCsCustomerDetails = function (scope) {

        scope.WriteLog(DEBUG, 'bindCsCustomerDetails. Start');

        var _jsonCustmerDetails = [];
        var _queuedTime = "00:00:00";//_jsonCustmerDetails.keys["queuedTime"]
        var _duration = "00:00:00";// _jsonCustmerDetails.keys["Duration"]

        for (var i = 0; i < scope.customerDetailsCS.customerList.length; i++) {

            var _jsonItem = {};
            var _value = '';
            var _jsonValue = scope.getJsonValues(scope.objContextStore.data, scope.customerDetailsCS.customerList[i].Key);
            var _highlighted = scope.customerDetailsCS.customerList[i].highlighted;

            if (_jsonValue != '') {
                _value = _jsonValue[0]

                if (scope.customerDetailsCS.customerList[i].Key == "Duration") {
                    _duration = _value = scope.convertTime(_value);
                }
                else if (scope.customerDetailsCS.customerList[i].Key == "queuedTime") {

                    _queuedTime = _value = scope.calcTimeDifference(_value, scope.getInteraction(scope).ANSWER_TIME);
                    var _maxQueuedTime = scope.convertTimeToSec(_value);

                    if (_maxQueuedTime > scope.maxQueuedTime) {

                        _highlighted = "RED";
                    }
                }


                _jsonItem["key"] = scope.customerDetailsCS.customerList[i].Label;
                _jsonItem["value"] = _value;
                _jsonItem["highlighted"] = _highlighted;
                _jsonCustmerDetails.push(_jsonItem);
            }
            else if (scope.customerDetailsCS.customerList[i].Key == "TimeBeforeAnswer") {


                var _TimeBeforeAnswerTime = scope.calcSecDifference(_queuedTime, _duration);

                _jsonItem["key"] = scope.customerDetailsCS.customerList[i].Label;
                _jsonItem["value"] = _TimeBeforeAnswerTime;
                _jsonItem["highlighted"] = scope.customerDetailsCS.customerList[i].highlighted;
                _jsonCustmerDetails.push(_jsonItem);

            }
        }

        scope.objCustomerDetails = _jsonCustmerDetails;

        scope.loading = false;

        scope.WriteLog(DEBUG, 'bindCsCustomerDetails. End');
    }

    scope.loadIVRNodeList = function (scope) {

        scope.WriteLog(DEBUG, 'loadIVRNodeList. Start');

        var reqJson = JSON.stringify({
            "node_category": scope.widgetCallType,
            "widget_language": scope.workspaceLanguage,
            "channel": scope.objInteraction.channel
        });

        scope.WriteLog(DEBUG, "loadIVRNodeList -->  Request Data - " + JSON.stringify(reqJson));

        var _url = scope.middlewareServiceUrl + '/DEWA/GetIVRNodeList';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_IVR_NODE_LIST");

        scope.WriteLog(DEBUG, 'loadIVRNodeList. End');
    }

    scope.bindIVRNode = function (scope) {

        scope.WriteLog(DEBUG, 'bindIVRNode. Start');

        var _html = '';
        var _cbo = $(scope.htmlInteractionPrefix + ' #cboIVRNodeList');
        var _cboText = $(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .DEWA-input-single-select');
        var i = 0;

        if ($(scope.htmlInteractionPrefix + ' #CallIVRTransfer').is(':checked') == true) {

            scope.lblTransfer = scope.lang[scope.widgetLanguage].LABELTransferIVR;

            for (i = 0; i < scope.objIVRNode.length; i++) {

                _html += "<li class=\"singlselect-list\"><data value='" + scope.objIVRNode[i].menu_id + "'>" + scope.objIVRNode[i].menu_name + "</data></li>";

            }
        }

        else if ($(scope.htmlInteractionPrefix + ' #CallSurveyTransfer').is(':checked') == true) {

            scope.lblTransfer = scope.lang[scope.widgetLanguage].LABELTransferSurvey;

            for (i = 0; i < scope.TransferNumber["SURVEY"].length; i++) {

                _html += "<li class=\"singlselect-list\"><data value='" + scope.TransferNumber["SURVEY"][i].key + "'>" + scope.TransferNumber["SURVEY"][i].value + "</data></li>";

            }
        }

        //_cbo.html('');
        _cboText.val('');
        _cbo.append(_html);

        scope.transferText = '';
        scope.transferVal = '';

        scope.WriteLog(DEBUG, 'bindIVRNode. End');
    }

    //Disposition
    scope.bindCategory = function (scope, _category) {

        scope.WriteLog(DEBUG, 'bindCategory. Start');

        if (scope.objCategory == undefined || scope.objCategory == null || scope.objCategory.length == 0) {
            scope.WriteLog(ERROR, 'bindReason -->  No Category list found');
            return;
        }


        var _html = '';
        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_category_dropdown');
        var j = 0;

        for (j = 0; j < scope.objCategory.length; j++) {
            if (scope.objCategory[j].category_id == _category) {
                _html += "<li class=\"singlselect-list\"><data value='" + scope.objCategory[j].category_id + "'>" + scope.objCategory[j].category_desc + "</data></li>";

                scope.categoryId = scope.objCategory[j].category_id;
                scope.categoryValue = scope.objCategory[j].category_desc;
                $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singleselectbtn").val(scope.categoryValue);

                scope.setSelectedDisposition(scope);
                break;
            }
        }

        _cbo.html('');
        _cbo.append(_html);

        scope.WriteLog(DEBUG, 'bindCategory. End');
    }

    scope.categoryDropdownselect_Change = function (scope, val) {

        scope.WriteLog(DEBUG, 'categoryDropdownselect_Change. Start');

        scope.categoryId = $(val).val();
        scope.categoryValue = $(val).text();


        $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singleselectbtn").val(scope.categoryValue);
        $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singleselectbtn").removeClass("required-field");

        $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect #inputsearch").val("");
        $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singlselect-dropdown li.singlselect-list").show();

        $(val).closest(".DEWA-singlselect").removeClass("open");

        scope.initilizeReason(scope);
        scope.bindReason(scope.categoryId);

        scope.WriteLog(DEBUG, 'categoryDropdownselect_Change. End');
    }

    scope.bindReason = function (categoryID) {

        scope.WriteLog(DEBUG, 'bindReason --> Start.');

        if (scope.objReason == undefined || scope.objReason == null || scope.objReason.length == 0) {
            scope.WriteLog(ERROR, 'bindReason -->  No Reason list found');
            return;
        }

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdown');
        var _html = '';

        if (scope.objReason.length > 0) {

            var j = 0;
            for (j = 0; j < scope.objReason.length; j++) {
                if (categoryID == scope.objReason[j].category_id) {

                    _html += "<li class=\"singlselect-list\"><data value='" + scope.objReason[j].reason_id + "'>" + scope.objReason[j].reason_desc + "</data></li>";

                }
            }
            _cbo.append(_html);

        }
    };

    scope.bindReasonAll = function () {
        
        scope.WriteLog(DEBUG, 'bindReason --> Start.');

        if (scope.objReason == undefined || scope.objReason == null || scope.objReason.length == 0) {
            scope.WriteLog(ERROR, 'bindReason -->  No Reason list found');
            return;
        }

        /*if (scope.widgetCallType == 'Expo') {

           // var strQery = `select b.reason_id,b.reason_desc from  ${[scope.objCategory]} a join ${[scope.objReason]} b on a.category_id=b.category_id`;
            var strQery = `select * from  ? where remarks='EXPO'`;
            scope.objReason = alasql(strQery,[scope.objReason]);
        }
        else if (scope.widgetCallType != 'Expo') {

           // var strQery = `select b.reason_id,b.reason_desc from  ${[scope.objCategory]} a join ${[scope.objReason]} b on a.category_id=b.category_id`;
            var strQery = `select * from  ? where remarks !='EXPO'`;
            scope.objReason = alasql(strQery,[scope.objReason]);
        }*/

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdown');
        var _html = '';

        if (scope.objReason.length > 0) {

            var j = 0;
            for (j = 0; j < scope.objReason.length; j++) {

                _html += "<li class=\"singlselect-list\"><data  data-catagroy-id='" + scope.objReason[j].category_id + "' value='" + scope.objReason[j].reason_id + "'>" + scope.objReason[j].reason_desc + "</data></li>";
            }
            _cbo.append(_html);

        }
    };

    scope.bindRecentCallNotesReasonFilters = function () {
        
        scope.WriteLog(DEBUG, 'bindRecentCallNotesReasonFilters --> Start.');

        //Reason Details
        if (scope.objReason == undefined || scope.objReason == null || scope.objReason.length == 0) {
            scope.WriteLog(ERROR, 'bindRecentCallNotesFilters -->  No Reason list found');
            return;
        }
        var _cbo = $(scope.htmlInteractionPrefix + ' #recent_reasons_dropdown')
        var _html = '';

        if (scope.objReason.length > 0) {

            var j = 0;
            for (j = 0; j < scope.objReason.length; j++) {

                _html += "<li class=\"singlselect-list\"><data  data-catagroy-id='" + scope.objReason[j].category_id + "' value='" + scope.objReason[j].reason_id + "'>" + scope.objReason[j].reason_desc + "</data></li>";
            }
            _cbo.append(_html);
        }
      
    }

    scope.bindRecentCallNotesOutcomeFilters = function () {
        
        scope.WriteLog(DEBUG, 'bindRecentCallNotesOutcomeFilters --> Start.');

        //OutCome Details
        if (scope.objOutcome == undefined || scope.objOutcome == null || scope.objOutcome.length == 0) {

            scope.WriteLog(WARNING, 'bindRecentCallNotesOutcomeFilters -->  No Outcome list found');
            return;
        }


        var _cbo = $(scope.htmlInteractionPrefix + ' #recent_outcome_dropdown');
        var _html = '';
        if (scope.objOutcome.length > 0) {

            var j = 0;
            for (j = 0; j < scope.objOutcome.length; j++) {

                _html += "<li class=\"singlselect-list\"><data value='" + scope.objOutcome[j].outcome_id + "'>" + scope.objOutcome[j].outcome_desc + "</data></li>";
            }
            _cbo.append(_html);

        }
    }

    scope.bindOutcome = function (scope) {
        
        scope.WriteLog(DEBUG, 'bindOutcome -->  Start.');

        if (scope.objOutcome == undefined || scope.objOutcome == null || scope.objOutcome.length == 0) {

            scope.WriteLog(WARNING, 'bindOutcome -->  No Outcome list found');
            return;
        }

        /*if (scope.widgetCallType == 'Expo') {

            var strQery = `select * from  ?  where search_type='EXPO'`;
            scope.objOutcome = alasql(strQery, [scope.objOutcome]);
        }
        else {

            var strQery = `select * from  ?  where search_type !='EXPO'`;
            scope.objOutcome = alasql(strQery, [scope.objOutcome]);
        }*/


        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdown');
        var _html = '';
        if (scope.objOutcome.length > 0) {

            var j = 0;
            for (j = 0; j < scope.objOutcome.length; j++) {

                _html += "<li class=\"singlselect-list\"><data value='" + scope.objOutcome[j].outcome_id + "'>" + scope.objOutcome[j].outcome_desc + "</data></li>";
            }
            _cbo.append(_html);

        }
    };

    scope.loadDispositionDetails = function (scope) {

        scope.WriteLog(DEBUG, "loadDispositionDetails -->  Start.");

        var reqJson = JSON.stringify({
            "call_type": scope.widgetCallType,
            "widget_language": scope.workspaceLanguage,
            "channel": scope.objInteraction.channel
        });

        //New Requirement customWidgetPostRequest InsertEmail
         var wsReqJson = JSON.stringify({
            "serviceName": "getdisposition",
            "requestData": reqJson
        });

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';



        scope.WriteLog(INFO, "loadDispositionDetails -->  Request Data - " + JSON.stringify(reqJson));

        //var _url = scope.middlewareServiceUrl + '/DEWA/getdisposition';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_DISPOSITION");
    };

    scope.loadOperationLog = function (scope) {

        scope.WriteLog(DEBUG, "loadOperationLog -->  Start ");

        var reqJson = JSON.stringify({
            "cli": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "account_number": scope.accountNumber,
            "context_id": scope.workRequestId
        });

        scope.WriteLog(INFO, "loadOperationLog -->  Request Data - " + JSON.stringify(reqJson));

        var _url = scope.middlewareServiceUrl + '/DEWA/GetOperationLog';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_CUSTOMER_ACTIVITY");

        scope.WriteLog(DEBUG, "loadOperationLog -->  End.");
    }

    scope.loadAccountUsed = function (scope) {

        scope.WriteLog(DEBUG, "loadAccountUsed -->  Start ");

        var reqJson = JSON.stringify({
            "cli": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "account_number": scope.accountNumber,
            "context_id": scope.workRequestId
        });

        scope.WriteLog(INFO, "loadAccountUsed -->  Request Data - " + JSON.stringify(reqJson));

        var _url = scope.middlewareServiceUrl + '/DEWA/GetAccountUsed';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_ACCOUNT_USED");

        scope.WriteLog(DEBUG, "loadAccountUsed -->  End.");
    }

    scope.loadIframe = function (scope) {

        scope.WriteLog(DEBUG, 'loadIframe --> Start');

        //scope.openCRMURLWindow(scope);
        scope.bindIfameEnableDisableSMSEmail(scope);
        scope.bindIfameVisitedIVRMenu(scope);

        scope.WriteLog(DEBUG, 'loadIframe --> End');
    }

    scope.openCRMURLWindow = function (scope) {

        scope.WriteLog(DEBUG, 'openCRMURLWindow --> Start');

        var _url = scope.crmUrl + scope.getCRMVQueryString(scope);

        scope.openScreenpopTab(scope, _url);

        // $(scope.htmlInteractionPrefix + ' #ifameCRMURL').attr('data', _url);

        scope.WriteLog(DEBUG, 'openCRMURLWindow --> End. URL :' + _url);
    }

    scope.bindCRMURLWindow = function (scope) {

        scope.WriteLog(DEBUG, 'bindCRMURLWindow --> Start');

        var _url = scope.crmUrl + scope.getCRMVQueryString(scope);

        scope.openVoiceScreenpopTab(scope, _url);

        scope.WriteLog(DEBUG, 'bindCRMURLWindow --> End. URL :' + _url);

    }

    scope.openVoiceScreenpopTab = function (scope, url) {

        if (scope.getInteraction(scope).CRM_OPENED != undefined && scope.getInteraction(scope).CRM_OPENED != "")
            return

        scope.crmOpend = "OPEN SUCCESS";
        scope.setInteraction(scope);
        scope.WriteLog(DEBUG, "openVoiceScreenpopTab - Start for broadcast");
        var json_obj = {
            "agent_id": scope.configuration.agentId,
            "agent_name": scope.configuration.displayName,
            "agent_handle": scope.configuration.handle,
            "cli": scope.objInteraction.originatingAddress,
            "work_request_id": scope.workRequestId,
            "account_number": "",
            "url": url,
            "title": (scope.emailTitle == null ? "OUTBOUND" : scope.emailTitle),
            "channel": scope.objInteraction.channel
        };
        scope.broadcast_voice_channel.postMessage(json_obj);
        scope.crmURLOpened = true;

        scope.WriteLog(DEBUG, "openVoiceScreenpopTab - End");
    };

    scope.bindIfameEnableDisableSMSEmail = function (scope) {

        scope.WriteLog(DEBUG, 'ifameEnableDisableSMSEmail --> Start');

        //
        var _url = scope.URLEnableDisableSMSEmail;

        var _qrStr = "?mobile_number=" + (scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim()) +
            "&calling_number=" + scope.getSIPNumber(scope.objInteraction.originatingAddress) +
            "&context_id=" + scope.workRequestId +
            "&lastupdated_agentid=" + scope.configuration.agentId +
            "&lastupdated_agentname=" + scope.configuration.displayName +
            "&agent_handle=" + scope.configuration.handle;
        _url = _url + _qrStr;

        $(scope.htmlInteractionPrefix + " #ifameSmsEmail").attr('src', _url);

        scope.WriteLog(DEBUG, 'ifameEnableDisableSMSEmail --> End. URL : ' + _url);
    }

    scope.bindIfameVisitedIVRMenu = function (scope) {

        scope.WriteLog(DEBUG, 'ifameVisitedIVRMenu --> Start');

        //http://IP/Widget_Search_Details/IVRTree.html?context_id=01234016421607512163

        var _url = scope.URLVisitedIVRMenu + "?context_id=" + scope.workRequestId;

        $(scope.htmlInteractionPrefix + " #ifameVisitedIVRMenu").attr('src', _url);

        scope.WriteLog(DEBUG, 'bindIfameVisitedIVRMenu --> End. URL : ' + _url);
    }

    scope.surveyActive = function (scope) {

        scope.WriteLog(DEBUG, 'surveyActive --> Start');

        $(scope.htmlInteractionPrefix + ' #CallIVRTransfer').removeAttr('checked');
        $(scope.htmlInteractionPrefix + ' #CallSurveyTransfer').prop('checked', 'checked');
        $(scope.htmlInteractionPrefix + ' #CallSurveyTransfer + label').addClass('survey-check-active');
        $(scope.htmlInteractionPrefix + ' #DEWA-Conference-btn').addClass('hide');

        scope.lblTransfer = scope.lang[scope.widgetLanguage].LABELTransferSurvey;
        scope.initilizeIVRNode(scope);
        scope.bindIVRNode(scope);

        var _cbo = $(scope.htmlInteractionPrefix + ' #cboIVRNodeList li:nth-of-type(2) data');

        for (var i in scope.TransferNumber["SURVEY"]) {

            var _callType = (scope.objContextStore.data.CallType == undefined ? '' : scope.objContextStore.data.CallType);
            if (scope.TransferNumber["SURVEY"][i].value == _callType) {
                scope.transferText = scope.TransferNumber["SURVEY"][i].value;
                scope.transferVal = scope.TransferNumber["SURVEY"][i].key;
                $(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect  .singleselectbtn').val(scope.transferText);
            }
        }
        //scope.disableEnableTransferButton(scope, false);

        scope.WriteLog(DEBUG, 'surveyActive --> End');

    }

    scope.onAlerting = function (scope, api, data) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');
        scope.WriteLog(DEBUG, "stateReason: " + data.stateReason);
        scope.WriteLog(DEBUG, "objInteraction service : " + scope.objInteraction.topic);
        scope.WriteLog(DEBUG, "objInteraction state : " + scope.objInteraction.state);

        //Allow auto answer only outside call. not allow to internal calls

        scope.setAutoAnswerCustomLog(scope, "Start alert Time: " + scope.getTime_yyyymmdd() + ", Interaction state:Alerting, Topic :" + scope.objInteraction.topic + ", State Reason :" + data.stateReason);

        if (scope.objInteraction.topic != null && (data.stateReason == "DEFAULT" || data.stateReason == "TRANSFER_TO_SERVICE")) {

            scope.getAutoAnsDuration(scope, api);
        //If call is conference and on next call.conference and transfer button to enable.
            showTransferButtonEnableText = null;
            showConferenceButtonEnableText = null;

        }
        scope.setAutoAnswerCustomLog(scope, ", Alert End Time :" + scope.getTime_yyyymmdd());

        scope.WriteLog(DEBUG, "manually accepting Interaction..");
        scope.alertingTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);

        scope.loadCSDetailsAlerting(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');

    }

    scope.onActive = function (scope, api, data) {
        scope.WriteLog(DEBUG, 'onActive --> Start');

        scope.setAutoAnswerCustomLog(scope, ", Interaction state: Active");

        scope.lastInteractionState = data.state;
        scope.answerTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);
        scope.initilizeVoiceLabel(scope);
        scope.initializeVoiceLayout(scope, data);
        scope.loadWidgetData(scope, data);

        scope.loadDispositionDetails(scope);

        scope.WriteLog(DEBUG, 'onActive --> End');
    }

    scope.onACW = function (scope, api, data) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');

        scope.acwTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');

    }

    scope.getAutoAnsDuration = function (scope, api) {
        scope.WriteLog(DEBUG, "getAutoAnsDuration -->  Start.");
   
        var reqJson = JSON.stringify({
            "service_name": scope.objInteraction.topic
        });

        var wsReqJson = JSON.stringify({
            "serviceName": "getAutoAnsDuration",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'getAutoAnsDuration -->  Get Data - ' + wsReqJson);

        var _url = scope.middlewareServiceUrl + '/DEWA/customDBPostRequest';


        scope.setAutoAnswerCustomLog(scope, ", Request Middleware Time :" + scope.getTime_yyyymmdd());

        scope.executeWebRequest(scope, '', _url, 'POST', wsReqJson, "REQ_WS_GET_AUTO_ANS_DURATION");

        scope.WriteLog(DEBUG, "getAutoAnsDuration -->  End.");

    }

    scope.makeCallTransferConference = function (scope, api) {
        

        scope.WriteLog(DEBUG, 'makeCallTransferConference -Start');

        var _number = ''
        var _cboText = $(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .DEWA-input-single-select');
        _cboText.removeClass("required-field");

        if (scope.transferVal == '') {

            _cboText.addClass("required-field");
            scope.WriteLog(INFO, 'makeCallTransferConference -Transfer value should not empty');
            return;
        }

        //Update Context store data
        scope.updateCsDetails(scope);

        // Default IVR Transfer Number
        var _number = scope.TransferNumber["IVRTRANSFER"][0].key;

        if (scope.callType == 'TRANSFER' && scope.transferType == 'IVR') {
            agentConferencedTransfered = 'TRANSFER';
            scope.callTransfer(scope, api, _number)
            $(scope.htmlInteractionPrefix + " #DEWA-Transfer-btn").prop('disabled', true);
            //scope.callSurveyTransfer(scope, api, _number, scope.objInteraction.userToUserInfo); //commented due to,  IVR needed UUI data in the transfer
            return;
        }
        else if (scope.callType == 'TRANSFER' && scope.transferType == 'SURVEY') {

            //Customer selected Call Type or agent selected Transfer Type
            agentConferencedTransfered = 'TRANSFER';
            _number = scope.transferVal
            scope.callSurveyTransfer(scope, api, _number, scope.objInteraction.userToUserInfo);
            $(scope.htmlInteractionPrefix + " #DEWA-Transfer-btn").prop('disabled', true);
            return;
        }
        if (scope.callType == 'CONFERENCE' && scope.updatecsdetailsforConference == true) {
            agentConferencedTransfered = 'TRANSFER';
            scope.callTransfer(scope, api, _number)
            $(scope.htmlInteractionPrefix + " #DEWA-Transfer-btn").prop('disabled', true);
            return;
        } else if (scope.callType == 'CONFERENCE' && scope.updatecsdetailsforConference == false) {
            agentConferencedTransfered = 'CONFERENCE';
            scope.callConference(scope, api, _number, scope.objInteraction.userToUserInfo);
        }

        scope.canConferenceComplete = '';

        //disable conference button when agent is already in conference call
        scope.disableConferenceButton = true;

        var interactionJson = sessionStorage.getItem("INTERACTION_" + scope.interactionID)
        var obj = JSON.parse(interactionJson);

        obj.DISABLE_CONFERENCE_BUTTON = scope.disableConferenceButton;
        sessionStorage.setItem("INTERACTION_" + scope.interactionID, JSON.stringify(obj));

       // $(scope.htmlInteractionPrefix + " #DEWA-Conference-btn").prop('disabled', scope.disableConferenceButton);

        scope.WriteLog(INFO, 'makeCallTransferConference - CALLTYPE : ' + scope.callType + '. TRANSFER TYPE : ' + scope.transferType + '. ' + scope.callType + ' NUMBER  : ' + _number);

        scope.WriteLog(DEBUG, 'makeCallTransferConference -End');
    }

    scope.validateConferenceDetails = function (scope, api) {
        

        scope.WriteLog(DEBUG, "validateConferenceDetails -->  Start.");
        var TpinVerificationRequired = false;

        for (i = 0; i < scope.objIVRNode.length; i++) {

            if (scope.transferVal == scope.objIVRNode[i].menu_id) {
                if (scope.objIVRNode[i].is_verification_required != null && scope.objIVRNode[i].is_verification_required != undefined && scope.objIVRNode[i].is_verification_required == 1) {
                    TpinVerificationRequired = true;
                    break;
                }

            }

        }

        if(scope.transferVal=="1010")
        { 
            scope.showMessagePopup("Status", scope.lang[scope.widgetLanguage].LABELConference, scope.lang[scope.widgetLanguage].LABELConferenceInvalid);
            $(scope.htmlInteractionPrefix + ' #btnCancelMessagePopup').show();
            return;
        }

        if (TpinVerificationRequired == true && scope.objContextStore.data.TPINVerified == true) {

            scope.makeCallTransferConference(scope, api);
        }
        else if (TpinVerificationRequired == true && scope.objContextStore.data.TPINVerified == false) {

            scope.showMessagePopup("Status", scope.lang[scope.widgetLanguage].LABELTPINValidation, scope.lang[scope.widgetLanguage].LABELTPINVerificationRequest);
            $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupYes').show();
            $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupNo').show();
            $(scope.htmlInteractionPrefix + ' #btnCancelMessagePopup').hide();

            //18-07-2023 If Account Number is present only the call will be transfered to the TPIN verification or else validation is error message popup will display. 
            // if (scope.objContextStore.data.SelectedAccount != null && scope.objContextStore.data.SelectedAccount != '' && scope.objContextStore.data.SelectedAccount != undefined) {

            //     scope.showMessagePopup("Status", scope.lang[scope.widgetLanguage].LABELTPINValidation, scope.lang[scope.widgetLanguage].LABELTPINVerificationRequest);
            //     $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupYes').show();
            //     $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupNo').show();
            //     $(scope.htmlInteractionPrefix + ' #btnCancelMessagePopup').hide();
            // } else {
            //     scope.showMessagePopup("Status", scope.lang[scope.widgetLanguage].LABELTPINValidation, scope.lang[scope.widgetLanguage].LABELConferenceNotAvailable);
            //     $(scope.htmlInteractionPrefix + ' #btnCancelMessagePopup').show();
            // }
            
        } else if (TpinVerificationRequired == false) {
            scope.makeCallTransferConference(scope, api);
        }


        scope.WriteLog(DEBUG, "validateConferenceDetails -->  End.");

    }


    scope.completeConfereneTransfer = function (scope, api, Capabilities) {

        scope.WriteLog(DEBUG, "completeConfereneTransfer -->  start.");

        scope.WriteLog(INFO, 'onCapabilitiesEvent- agentConferencedTransfered :' + agentConferencedTransfered);

        if (agentConferencedTransfered == 'TRANSFER' && scope.capabilities.interaction.canTransferComplete == true) {

            agentConferencedTransfered = 'TRANSFERED';
            api.completeTransfer();
            scope.WriteLog(INFO, 'onCapabilitiesEvent - Transfer Completed');

            return;
        }

        if (agentConferencedTransfered == 'CONFERENCE' && scope.capabilities.interaction.canConferenceComplete == true) {

            if (scope.canConferenceComplete != "") {
                scope.WriteLog(INFO, 'onCapabilitiesEvent - Repeted Conference Completed event. Skiping');
                return;
            }

            scope.canConferenceComplete = scope.capabilities.interaction.canConferenceComplete;

            agentConferencedTransfered = 'CONFERENCED'
            api.completeConference();
            scope.WriteLog(INFO, 'onCapabilitiesEvent - Conference Completed');

            return;
        }
        scope.WriteLog(DEBUG, "completeConfereneTransfer -->  end.");
    }

    //Button Eveont
    scope.callTransfer = function (scope, api, transferNumber) {

        scope.WriteLog(DEBUG, 'callTransfer --> Start call Transfer number ' + transferNumber + ' and UUI -' + scope.objInteraction.userToUserInfo);

        scope.callType = "TRANSFER";

        api.singleStepTransfer(transferNumber);

        if (scope.reasonID == "") {

            scope.WriteLog(INFO, 'callTransfer --> No reason selected');
            return;
        }

        api.setDispositionCode(scope.reasonID);

        scope.WriteLog(DEBUG, 'callTransfer --> End');
    }

    scope.callConference = function (scope, api, conferenceNumber, uui) {

        scope.WriteLog(DEBUG, 'callConference --> Start call conference number ' + conferenceNumber + ' and UUI -' + scope.objInteraction.userToUserInfo);

        scope.callType = "CONFERENCE";

        api.consult(conferenceNumber, uui);
    }

    scope.callSurveyTransfer = function (scope, api, number, uui) {

        scope.WriteLog(INFO, 'callSurveyTransfer --> Start call transfer number ' + number + ' and UUI -' + scope.objInteraction.userToUserInfo);

        api.consult(number, uui);

        scope.WriteLog(INFO, 'callSurveyTransfer -End');
    }

    scope.disable199IVR = function (scope) {

        scope.WriteLog(DEBUG, 'disable199IVR --> Start');

        scope.isIVR199 = false;
        //is 991 ivr
        if (scope.objContextStore.data.DialedHelpLine == '991') {
            scope.isIVR199 = true;
        }
        else if (scope.widgetCallType == 'Expo') {
            //is scope.objContextStore.data.CallType=Expo
            scope.isIVR199 = true;
        }

        if (scope.is199)
            $(scope.htmlInteractionPrefix + ' #dvDispositionBody').css('height', 'calc(100% - 88px)');
        else
            $(scope.htmlInteractionPrefix + ' #dvDispositionBody').css('height', 'calc(100% - 193px)');

        scope.WriteLog(DEBUG, 'disable199IVR --> End');
    }

    //CRM Maximize
    scope.btnVoiceMaximizeCRM = function () {

        $(".crm-min-max-btn .crm-minbtn").removeClass("hide");
        $(".crm-min-max-btn .crm-maxbtn").addClass("hide");
        $(".DEWA-widget-body-container").addClass("activefullscreen");

    };

    //CRM Minimize  
    scope.btnVoiceMinimizeCRM = function () {


        $(".crm-min-max-btn .crm-minbtn").addClass("hide");
        $(".crm-min-max-btn .crm-maxbtn").removeClass("hide");
        $(".DEWA-widget-body-container").removeClass("activefullscreen");


    };

    //Widget Minimize 
    scope.btnMinimizeCustomPanel = function (scope) {
        scope.WriteLog(DEBUG, 'btnMinimizeCustomPanel -> START');

        $(scope.htmlInteractionPrefix + ' .Dewa-widget-popup-report-container').removeClass("active-popup");
        $(scope.htmlInteractionPrefix + ' .Dewa-widget-minimize-report-container').addClass("active-minimize");
        scope.WriteLog(DEBUG, 'btnMinimizeCustomPanel -> END');

    };

    //Widget Maximize 
    scope.btnMaximizeCustomPanel = function (scope) {
        scope.WriteLog(DEBUG, 'btnMaximizeCustomPanel -> START');
        $(scope.htmlInteractionPrefix + ' .Dewa-widget-popup-report-container').addClass("active-popup");
        $(scope.htmlInteractionPrefix + ' .Dewa-widget-minimize-report-container').removeClass("active-minimize");

        scope.WriteLog(DEBUG, 'btnMaximizeCustomPanel -> END');

    };

    //Web service call
    scope.loadRecentCallNotes = function (scope, data) {

        scope.WriteLog(DEBUG, "recentCallNotes -->  Start.");


        var reqJson = JSON.stringify({
            "context_id": scope.workRequestId,
            "last_verified_account_number": '',
            "last_verified_mobile_number": scope.objContextStore.data == undefined ? '' : (scope.objContextStore.data.LastVerifiedMobile == undefined ? "" : scope.objContextStore.data.LastVerifiedMobile.trim()),//  LastVerifiedAssociatedMob
            "caller_number": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "channel": scope.objInteraction.channel
        });

         //New Requirement customWidgetPostRequest InsertEmail
         var wsReqJson = JSON.stringify({
            "serviceName": "getAgentNotes",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'get recent call notes from  service - ' + reqJson);

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "recentCallNotes -->  End.");
    };

    scope.saveRecentCallNotes = function (scope, event) {

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> Start");

        scope.WriteLog(DEBUG, "updatingJourney details ----> Start");

        scope.updateJourneyDetails(scope);

        $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').removeClass("required-field");
        var _cboTextDEWA_category_dropdownselect = $(scope.htmlInteractionPrefix + ' #DEWA_category_dropdownselect .DEWA-input-single-select');
        var _cboTextDEWA_reasons_dropdownselect = $(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect .DEWA-input-single-select');
        var _cboTextDEWA_outcome_dropdownselect = $(scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdownselect .DEWA-input-single-select');

        _cboTextDEWA_category_dropdownselect.removeClass("required-field");
        _cboTextDEWA_reasons_dropdownselect.removeClass("required-field");
        _cboTextDEWA_outcome_dropdownselect.removeClass("required-field");

        var _getInteraction = scope.getInteraction(scope);

        scope.txtRecentCallNotes = $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').val();

        if (_getInteraction.ANSWER_TIME.length <= 0) {
            //message box  
            scope.WriteLog(WARNING, 'saveRecentCallNotes -> Call not answered.Missed Call. skiping');
            return;
        }

        if (_getInteraction.NOTES_UPDATED == true) {
            //message box
            scope.WriteLog(WARNING, 'saveRecentCallNotes -> Notes already saved. skiping');
            return;
        }

        //onInteractionEndedEvent
        if (event == 'saveRecentCallNotes_Click') {

            //if (scope.categoryId == '') {
            //    _cboTextDEWA_category_dropdownselect.addClass("required-field");
            //    scope.WriteLog(DEBUG, "saveRecentCallNotes --> Category should not empty");
            //    return;
            //}

            if (scope.reasonID == '') {

                _cboTextDEWA_reasons_dropdownselect.addClass("required-field");
                scope.WriteLog(DEBUG, "saveRecentCallNotes --> Reason should not empty");
                return;
            }

            //if (scope.outcomeID == '') {
            //    _cboTextDEWA_outcome_dropdownselect.addClass("required-field");
            //    scope.WriteLog(DEBUG, "saveRecentCallNotes --> Outcome should not empty");
            //    return;
            //}

            //if (scope.txtRecentCallNotes.length <= 0) {
            //    //message box
            //    scope.WriteLog(WARNING, 'saveRecentCallNotes -> Call Nots should not empty');

            //    $(scope.htmlInteractionPrefix + ' #txtRecentCallNotes').addClass("required-field");
            //    return;

            //}
        }

        var reqJson = JSON.stringify({
            "ref_id": _getInteraction.REFID,
            "call_type": scope.widgetCallType,
            "last_verified_account_number": scope.accountNumber, // same as  "account_number": scope.objContextStore.data.LastVerifiedUsedAcct,           
            "channel": scope.objInteraction.channel,
            //"last_verified_mobile_number": scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim(),
            "last_verified_mobile_number": (scope.objContextStore == undefined || scope.objContextStore == '') ? '' : (scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim()),
            "contact_id": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "agent_id": scope.configuration.agentId,
            "agent_name": scope.configuration.displayName,
            "call_direction": scope.objInteraction.direction,
            "category_id": scope.categoryId == '' ? scope.defaultCategoryCode : scope.categoryId,
            "reason_id": scope.reasonID == '' ? scope.defaultReasonCode : scope.reasonID,
            "outcome_id": scope.outcomeID == '' ? scope.defaultOutcomeCode : scope.outcomeID,
            "call_notes": scope.txtRecentCallNotes,
            "work_request_id": scope.workRequestId,
            "timestamp": scope.getTime_yyyymmdd(),
            "remarks": "",
            "event": event

        });

         //New Requirement customWidgetPostRequest InsertEmail
         var wsReqJson = JSON.stringify({
            "serviceName": "SetCallNotes",
            "requestData": reqJson
        });

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SAVE_NOTES");

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> End");
    };

    scope.updateJourneyDetails = function (scope) {
        scope.WriteLog(INFO, " saveUpdateJourney-----> start ");
        
        var reqJson = JSON.stringify({
            "type": "voice",
            "agentNote": scope.txtRecentCallNotes,
            "reasonCode": scope.reasonValue + " - " + scope.outcomeValue,
        });
        scope.WriteLog(INFO, 'saveCallLog -->  Save update Journey Data - ' + reqJson);
        var _url = scope.journeyAPIUrl + scope.objInteraction.workRequestId;
        scope.executeWebRequest(scope, '', _url, 'PUT', reqJson, "REQUEST_UPDATE_JOURNEY_DETAILS");
    };

    scope.SearchRecentCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  Start.");

        //var _searchAcountNumber = $(scope.htmlInteractionPrefix + ' #recentAccountNumber');
        var _searchLastVerifiedMobile = $(scope.htmlInteractionPrefix + ' #recentLastVerifiedMobile');
        var _searchCLI = $(scope.htmlInteractionPrefix + ' #recentCLI');

        var _search_reasons_dropdownselect = $(scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect .DEWA-input-single-select');
        var _search_outcome_dropdownselect = $(scope.htmlInteractionPrefix + ' #recent_outcome_dropdownselect .DEWA-input-single-select');
        //   var _searchReason = $(scope.htmlInteractionPrefix + '#DEWA_reasons_dropdown');

        // _searchAcountNumber.removeClass("required-field");
        _searchLastVerifiedMobile.removeClass("required-field");
        _searchCLI.removeClass("required-field");

        _search_reasons_dropdownselect.removeClass("required-field");
        _search_outcome_dropdownselect.removeClass("required-field");
        // _searchReason.removeClass("required-field");


        if (_searchLastVerifiedMobile.val().length == 0 && _searchCLI.val().length == 0 && _search_reasons_dropdownselect.length == 0 && _search_outcome_dropdownselect.length == 0) {

            //_searchAcountNumber.addClass("required-field");
            _searchLastVerifiedMobile.addClass("required-field");
            _searchCLI.addClass("required-field");

            _search_reasons_dropdownselect.addClass("required-field");
            _search_outcome_dropdownselect.addClass("required-field");

            scope.WriteLog(WARNING, "Account Number,Last verified mobile,Reasons,OutCome and Cli are empty");

            return;
        }


        var reqJson = JSON.stringify({
            "email": "",
            "last_verified_account_number": '',
            "last_verified_number": _searchLastVerifiedMobile.val(),
            "reason_id": scope.recentreasonID == undefined ? '' : scope.recentreasonID,
            "outcome_id": scope.recentoutcomeID == undefined ? '' : scope.recentoutcomeID,
            // "out_come":_search_outcome_dropdownselect.val(),
            // "reason":_search_reasons_dropdownselect.val(),
            "callernumber": _searchCLI.val(),
            "channel": scope.objInteraction.channel
        });

         //New Requirement customWidgetPostRequest InsertEmail
         var wsReqJson = JSON.stringify({
            "serviceName": "SearchCallNotes",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'SearchRecentCallNotes -> get recent call notes from  service - ' + reqJson);

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SEARCH_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  End.");
    };

    scope.loadCSDetails = function (scope, data) {

        scope.WriteLog(DEBUG, "loadCSDetails - Start");


        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/context/' + scope.workRequestId;

        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'GET', '', "REQUEST_GET_CS_DETAILS");

        scope.WriteLog(DEBUG, "loadCSDetails - END");
    }

    scope.loadCSDetailsAlerting = function (scope, data) {

        scope.WriteLog(DEBUG, "loadCSDetails - Start");


        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/context/' + scope.workRequestId;

        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'GET', '', "REQUEST_GET_CS_DETAILS_ALERTING");

        scope.WriteLog(DEBUG, "loadCSDetails - END");
    }

    scope.updateCsDetails = function (scope) {
        

        scope.WriteLog(DEBUG, "updateCsDetails - Start");

        //var ws_data_to_ivr = 'https://FQDN/services/OceanaCoreDataService/oceana/data/update/locale/'; 
        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/update/locale/' + scope.workRequestId;

        var jsonKey = scope.ContextStoreUpdateKey;
        var jsonVal = scope.transferVal;
        var _surveyOpted = (scope.objContextStore.data.SurveyOpted == undefined ? '' : scope.objContextStore.data.SurveyOpted);
        var transferType = "";

        if (scope.transferType == 'SURVEY') {
            jsonVal = scope.getIVRTransferType(scope);
            _surveyOpted = ((scope.transferType == 'SURVEY' && _surveyOpted.toString().toUpperCase() == 'NO') ? "YES" : scope.objContextStore.data.SurveyOpted);
            transferType = "SURVEY";
        }
        else if (scope.callType == 'TRANSFER' && scope.transferType == 'IVR') {
            transferType = "IVRTRANSFER";
        }
        else if (scope.callType == 'CONFERENCE' && scope.updatecsdetailsforConference == true) {
            transferType = "IVRTRANSFER";
        }
        else {
            transferType = "IVRCONFERENCE";
        }

        scope.TransferNumber["IVRTRANSFER"][0].key
        if (scope.updatecsdetailsforConference == true) {
            var reqJson = JSON.stringify({
                "data": {
                    "AgentIVRTransferMenu": jsonVal,
                    "Language": scope.agentTransferLanguage,
                    "SurveyChannel": scope.objInteraction.channel,
                    "SurveyType": jsonVal,
                    "AgentID": scope.configuration.agentId,
                    "AgentExtension": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
                    "ContextID": scope.workRequestId + ',VO,N',
                    "SurveyOpted": _surveyOpted,
                    "TransferType": transferType,
                    "Widget_Request_for_verification": true,
                    "Last_Agent_ID": scope.configuration.handle
                },
                "Locale": "en_us"
            });
        } else {
            var reqJson = JSON.stringify({
                "data": {
                    "AgentIVRTransferMenu": jsonVal,
                    "Language": scope.agentTransferLanguage,
                    "SurveyChannel": scope.objInteraction.channel,
                    "SurveyType": jsonVal,
                    "AgentID": scope.configuration.agentId,
                    "AgentExtension": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
                    "ContextID": scope.workRequestId + ',VO,N',
                    "SurveyOpted": _surveyOpted,
                    "TransferType": transferType
                },
                "Locale": "en_us"
            });
        }


        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'PUT', reqJson, "REQUEST_UPDATE_CS_DETAILS");

        scope.WriteLog(DEBUG, "updateCsDetails - END");
    }

    scope.saveCallLog = function (scope) {

        scope.WriteLog(DEBUG, "saveCallLog --> Start");

        var _getInteraction = scope.getInteraction(scope);

        if (_getInteraction.NOTES_UPDATED == false) {

            //message box
            scope.WriteLog(WARNING, 'saveCallLog --> Notes already not saved.');

            scope.saveRecentCallNotes(scope, 'onInteractionEndedEvent');
        }

        var destinationAddress = scope.objInteraction.destinationAddress.replace("#", "");

        var autoAnswer = JSON.parse(sessionStorage.getItem("INTERACTION_AUTOANSWER_" + scope.interactionID));

        var reqJson = JSON.stringify({
            "ref_id": _getInteraction.REFID,
            "call_type": scope.widgetCallType,
            "last_verified_account_number": scope.accountNumber,
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
            "agent_name": scope.configuration.displayName,
            "agent_extn": (scope.configuration.stationId == undefined ? scope.configuration.agentId : scope.configuration.stationId),
            "interaction_id": scope.objInteraction.id,
            "work_request_id": scope.workRequestId,
            "call_direction": scope.objInteraction.direction,
            "cli": scope.getSIPNumber(scope.objInteraction.originatingAddress),
            "last_verified_mobile_number": (scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim()),
            "dnis": scope.getSIPNumber(destinationAddress),
            "offered_time": _getInteraction.OFFER_TIME,
            "answered_time": _getInteraction.ANSWER_TIME,
            "acw_time": _getInteraction.ACW_TIME,
            "disconnected_time": scope.getTime_yyyymmdd(),
            "call_action": scope.callType,//scope.objInteraction.interactionType,//Transfer or conference or survye
            "call_action_number": scope.transferVal, //Transfer or conference or survye number
            "cdn": scope.objInteraction.topicId,
            "skill_id": scope.objInteraction.skillId,
            "skill_name": scope.objInteraction.topic,
            "uui": scope.objInteraction.userToUserInfo,
            "ucid": scope.objInteraction.id,
            "widget_language": scope.workspaceLanguage,
            "remarks": (autoAnswer == null || autoAnswer == undefined) ? 'No data is available' : autoAnswer
        });

        //New Requirement customWidgetPostRequest InsertEmail
         var wsReqJson = JSON.stringify({
            "serviceName": "InsertVoice",
            "requestData": reqJson
        });

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';


        

        //var _url = scope.middlewareServiceUrl + '/DEWA/InsertVoice';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SAVE_CALL_LOG");

        //Remove local storage
        scope.removeCSandDisposition(scope);
        scope.removeInteraction(scope);
        scope.removeAutoAnswerInteractionLog(scope);

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> End");
    };

    scope.GetCardEventDetails = function (scope, data) {

        scope.WriteLog(DEBUG, "GetCardEventDetails --> Start");

        scope.setAutoAnswerCustomLog(scope, ", CallType : Card Event Used");

        scope.WriteLog(DEBUG, "GetCardEventDetails --> End");
    };

    scope.setACRTagging = function (callTagID) {

        scope.WriteLog(DEBUG, 'setACRTagging -> Start.  Call acr tagging web service.CRM  id -' + callTagID + 'call id : ' + scope.callid);

        if (callTagID == "NA" || callTagID == "na" || callTagID == "") {

            scope.WriteLog(INFO, "setACRTagging -> TAG ID is EMPTY");

            return;
        }

        scope.acrCallCount = scope.acrCallCount + 1;

        var _url = scope.ws_acr_taging_url + "cmd=tag&device=" + scope.agent_extension + "&scope=current&udfname" + scope.acrCallCount + "=CRMID" + "&udfvalue" + scope.acrCallCount + "=" + callTagID;

        scope.WriteLog(INFO, 'setACRTagging -> increment the ACR call count and call the act Web service - URL - ' + url);

        var UDFName = "udfname" + scope.acrCallCount + " = CRMID" + scope.acrCallCount;
        var UDFValue = "udfvalue" + scope.acrCallCount + "=" + callTagID;
        //scope.secret_key = "A6$%0_2n@!*$3gc@";
        //scope.acrUserId = "apiuser";
        //scope.acrPassword = "e0qBe6oojccEjpgyTZ48qQ==";
        var reqJson = "";
        //var reqJson = JSON.stringify({
        //    "workrequestId": scope.workRequestId,
        //    "crm_id": callTagID,
        //    "clientCode": callTagID,
        //    "agentId": scope.configuration.agentId,
        //    "udfName": UDFName,
        //    "udfValue": UDFValue,
        //    "URL": _url,
        //    "UserName": scope.acrUserId,
        //    "Password": scope.acrPassword,
        //    "callId": scope.objInteraction.contactId
        //});
        scope.WriteLog(INFO, 'ACR tagging web service call. start update to database');

        var _url = scope.middlewareServiceUrl + '/DEWA/SetAcrTagging';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_ACR_TAGGING");

    };


    scope.getCRMVQueryString = function (scope) {

        scope.WriteLog(DEBUG, "getCRMVoiceQueryString - Prepare Query string. Start");

        var _sapAccount = '', _sapMobile = '', _lastUsedAcct = '';

        var _lastUsedAcct = (scope.objContextStore.data == undefined ? '' : (scope.objContextStore.data.LastUsedAcct == undefined ? '' : scope.objContextStore.data.LastUsedAcct));

        var _lastVerifiedAccount = (scope.objContextStore.data == undefined ? '' : (scope.objContextStore.data.LastVerifiedUsedAcct == undefined ? '' : scope.objContextStore.data.LastVerifiedUsedAcct));

        _sapAccount = scope.accountNumber.trim();
        if (_lastVerifiedAccount.length > 0) {
            _sapAccount = _lastVerifiedAccount;
        }


        var _lastVerifiedMobile = scope.objContextStore.data == undefined ? '' : (scope.objContextStore.data.LastVerifiedMobile == undefined ? '' : scope.objContextStore.data.LastVerifiedMobile.trim());
        _sapMobile = scope.getSIPNumber(scope.objInteraction.originatingAddress);
        if (_lastVerifiedMobile.length > 0) {
            _sapMobile = _lastVerifiedMobile;
        }

        var queryString = "?sap-agent=" + scope.configuration.agentId //scope.configuration.handle
            + "&saprole=" + scope.QueryStrinSAPRole
            + "&sap-interaction_id=" + scope.objInteraction.id
            + "&sap-work_req_id=" + scope.workRequestId
            + "&sap-channel=" + scope.objInteraction.channel
            + "&sap-phone=" + _sapMobile.trim()
            + "&sap-buag_id=" + (_lastVerifiedMobile.length > 0 ? _sapAccount.trim() : _lastUsedAcct.trim());


        scope.WriteLog(DEBUG, "getCRMVoiceQueryString - End. Query String - " + queryString);
        return queryString;

    };



    scope.openScreenpopTab = function (scope, url) {

        scope.WriteLog(DEBUG, "openScreenpopTab - Start");

        if (Boolean(url)) {
            scope.WriteLog(INFO, "CRM POP URL - " + url);

            setTimeout(function () {
                //window.open(url);
            }, 1000); //simple async 
        }
        scope.WriteLog(DEBUG, "openScreenpopTab - End");
    }

    //Execute web service 
    scope.executeWebRequest = function (scope, token, requestUrl, httpMethodType, requestData, serviceType) {

        scope.WriteLog(DEBUG, 'executeWebRequest -> Start. Service type is  - ' + serviceType + ' HTTP method type - ' + httpMethodType + '. webservice URL - ' + requestUrl + '  \n Request Data - ' + JSON.stringify(requestData));

        if (requestUrl == "" && httpMethodType == "") {

            scope.WriteLog(INFO, 'executeWebRequest ->  webservice Request data Is Null or Empty ');
            return;
        }

        $.ajax({
            url: requestUrl,
            type: httpMethodType,
            data: requestData,
            cache: false,
            contentType: false,
            processData: false,
            headers:
            {
                "Authorization": "" + token,
                "Accept": "application/json",
                "Content-Type": 'application/json'
            },
            complete: function (xhr, textStatus, result) {

                if (xhr.status == 200 || xhr.status == 202) {
                    scope.WriteLog(INFO, 'executeWebRequest -> ' + serviceType + '  Successfully to execute web service - ' + xhr.responseText);

                    var _responseText = xhr.responseText;

                    if (serviceType == 'REQUEST_UPDATE_CS_DETAILS')
                        _responseText = "Success";

                    scope.redirectAction(_responseText, serviceType, requestData, scope);

                } else {

                    scope.WriteLog(INFO, 'executeWebRequest -> ' + serviceType + ' Web service execute fail - ' + xhr.responseText);

                    scope.redirectAction('', serviceType, requestData, scope);

                    return;
                }
                return;
            }
        });
        scope.WriteLog(DEBUG, 'executeWebRequest -> End.');
    }

    scope.redirectAction = function (response, serviceType, requestData, scope) {

        scope.WriteLog(DEBUG, 'redirectAction -> ' + serviceType + ' --> Web service execute successfully, Response : ' + JSON.stringify(response));

        if (serviceType == "REQ_WS_DISPOSITION")
            scope.respSetDisposition(scope, response, requestData);

        else if (serviceType == "REQ_WS_RECENT_CALL_NOTES")
            scope.respGetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_NOTES")
            scope.respSetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SEARCH_RECENT_CALL_NOTES")
            scope.respGetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_CALL_LOG")
            scope.respSetCallLog(scope, response, requestData);

        else if (serviceType == "REQ_WS_ACR_TAGGING")
            scope.respSetAcrTagging(scope, response, requestData);

        else if (serviceType == "REQUEST_GET_CS_DETAILS")
            scope.respProcessCSNotification(scope, response, requestData);

        else if (serviceType == "REQUEST_GET_CS_DETAILS_ALERTING")
            scope.respProcessCSNotificationAlerting(scope, response, requestData);

        else if (serviceType == "REQUEST_UPDATE_CS_DETAILS")
            scope.respUpdateCSIVRMenuDetails(scope, response, requestData);

        else if (serviceType == "REQ_WS_IVR_NODE_LIST")
            scope.respIVRNodeList(scope, response, requestData);

        else if (serviceType == "REQ_WS_CUSTOMER_ACTIVITY")
            scope.respOperationLog(scope, response, requestData);

        else if (serviceType == "REQ_WS_ACCOUNT_USED")
            scope.respAccountUsed(scope, response, requestData);

        else if (serviceType == "REQ_WS_GET_AUTO_ANS_DURATION")
            scope.respGetAutoAnsDuration(scope, response, requestData);
        else if (serviceType == "REQUEST_UPDATE_JOURNEY_DETAILS")
            scope.respUpdateJourneyDetails(scope, response, requestData);

        scope.WriteLog(DEBUG, 'redirectAction -> End');
    }

    //Web service response 
    scope.respSetDisposition = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respSetDisposition -> START.");


        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetDisposition -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respSetDisposition-> webservice return fail. description - ' + jsonResponse.description);
            return;
        }

        scope.WriteLog(INFO, 'respSetDisposition->  Data - ' + JSON.stringify(jsonResponse));

        scope.objCategory = scope.getJsonValues(jsonResponse, "category_list");
        scope.objReason = scope.getJsonValues(jsonResponse, "reason_list");
        scope.objOutcome = scope.getJsonValues(jsonResponse, "outcome_list");

        //scope.bindCategory(scope,'');
        scope.bindReasonAll(scope);
        scope.bindOutcome(scope);
        scope.initilizeRecentCallNotesFilter(scope);
        scope.bindRecentCallNotesReasonFilters(scope);
        scope.bindRecentCallNotesOutcomeFilters(scope);

        scope.WriteLog(DEBUG, 'respSetDisposition-> End');

    };

    scope.respGetRecentCallNotes = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respRecentCallNotes -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respRecentCallNotes -> Response is Null or Empty");

            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        $(scope.htmlInteractionPrefix + ' #tBodyCallNote').html('');

        scope.WriteLog(DEBUG, "respRecentCallNotes -> START : " + JSON.stringify(jsonResponse));

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respRecentCallNotes-> webservice return fail. description - ' + jsonResponse.status);
            return;
        }

        for (var i = 0; i < jsonResponse.details.length; i++) {

            var _category = "", _reason = "", _outcome = '', _notes = '', _html = '';

            _notes = jsonResponse.details[i];

            if (scope.workspaceLanguage == "EN") {

                _category = _notes.category_desc.toString();
                _reason = _notes.reason_desc.toString();
                _outcome = _notes.outcome_desc.toString();

            }
            else {

                _category = _notes.category_desc.toString();
                _reason = _notes.reason_desc.toString();
                _outcome = _notes.outcome_desc.toString();
            }


            _html = "<tr>";
            //Date Time
            _html += "<td><p style=' letter-spacing: -1px;'>" + _notes.timestamp + "</p>";
            _html += "<span class='tooltipcontent'>" + _notes.timestamp + "</span></td>";

            //Agent ID
            _html += "<td><p>" + _notes.agent_id + "</p>";
            _html += "<span class='tooltipcontent'>" + _notes.agent_id + "</span></td>";

            //Agent Name
            _html += "<td><p>" + (_notes.agent_name.length > 21 ? _notes.agent_name.substring(0, 20) + ".." : _notes.agent_name) + "</p>";
            _notes.agent_name.length > 0 && _notes.agent_name != '-' ? _html += "<span class='tooltipcontent'>" + _notes.agent_name + "</span></td>" : "";

            //Category
            _html += "<td><p>" + (_category > 21 ? _category_category + ".." : _category) + "</p>";
            _category.length > 0 && _category != '-' ? _html += "<span class='tooltipcontent'>" + _category + "</span></td>" : "";

            //Reason
            _html += "<td><p>" + (_reason > 21 ? _reason + ".." : _reason) + "</p>";
            _reason.length > 0 && _reason != '-' ? _html += "<span class='tooltipcontent'>" + _reason + "</span></td>" : "";

            //Outcome
            _html += "<td><p>" + (_outcome > 21 ? _outcome + ".." : _outcome) + "</p>";
            _outcome.length > 0 && _outcome != '-' ? _html += "<span class='tooltipcontent'>" + _outcome + "</span></td>" : "";

            //Notes
            _html += "<td><p>" + (_notes.call_notes.length > 21 ? _notes.call_notes.substring(0, 20) + ".." : _notes.call_notes) + "</p>";
            _notes.call_notes.length > 0 && _notes.call_notes != '-' ? _html += "<span class='tooltipcontent'>" + _notes.call_notes + "</span></td>" : "";


            _html += "<td  class=\"hide\" ><p>" + _notes.call_direction + "</p>";
            _html += "<span class='tooltipcontent'>" + _notes.call_direction + "</span></td>";

            _html += "<td class=\"hide\" ><p>" + _notes.account_number + "</p>";
            _html += "<span class='tooltipcontent'>" + _notes.account_number + "</span></td>";


            _html += "</tr>";

            $(scope.htmlInteractionPrefix + ' #tBodyCallNote').append(_html);


        }

        scope.WriteLog(DEBUG, "respRecentCallNotes -> End.");
    }

    scope.respSetRecentCallNotes = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respSetRecentCallNotes -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetRecentCallNotes -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);
        requestData = JSON.parse(requestData);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respSetRecentCallNotes-> webservice return fail. description - ' + jsonResponse.description);
            return;
        }

        if (requestData.event == 'saveRecentCallNotes_Click') {
            scope.notesSaved = true;
            scope.setInteraction(scope);
        }

        scope.showMessagePopup("SUCCESS", scope.lang[scope.widgetLanguage].MSGCallNoteSaveSuccessHeader, scope.lang[scope.widgetLanguage].MSGCallNoteSaveSuccessMessage);

        scope.diableCallNotes(scope);

        scope.WriteLog(DEBUG, 'respSetRecentCallNotes-> Notes saved success. Data - ' + JSON.stringify(jsonResponse));

        scope.WriteLog(DEBUG, 'respSetRecentCallNotes-> End');

    };

    scope.respSetCallLog = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetCallLog -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        scope.WriteLog(DEBUG, "respSetCallLog -> . Voice details Updated Successfully " + jsonResponse);
    };

    scope.respSetAcrTagging = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetAcrTagging -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        scope.WriteLog(DEBUG, "respSetAcrTagging -> . ACR tatging details Updated Successfully " + jsonResponse);
    }

    scope.respProcessCSNotification = function (scope, jsonResponse, requestData) {

        //Allow CRM Popup only for customer calls, not for internal calls
        if (scope.objInteraction.topic != null) {
            if (scope.crmURLOpened == false || scope.crmURLOpened == undefined) {
                //open sap crm popup post message call
                scope.bindCRMURLWindow(scope);
            }
        }

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respProcessCSNotification -> Response is Null or Empty");
            return;
        }

        scope.WriteLog(INFO, "respProcessCSNotification -> . Context store data : " + jsonResponse);

        jsonResponse = JSON.parse(jsonResponse);

        if (Object.keys(jsonResponse.data).length == 0) {

            scope.WriteLog(WARNING, "respProcessCSNotification -> Response is Null or Empty");
            return;
        }

        scope.objContextStore = jsonResponse;

        if (scope.objContextStore.data != undefined && scope.objContextStore.data != []) {

            var localCSDetails = sessionStorage.getItem("INTERACTION_CS_DETAILS_" + scope.interactionID)
            if (localCSDetails == null) {
                //this local storage value used to recording widget. to send custom parameter to WFM
                sessionStorage.setItem("INTERACTION_CS_DETAILS_" + scope.interactionID, JSON.stringify(scope.objContextStore.data));
            }
        }

        scope.loadWidgetDataContextStore(scope);

        scope.WriteLog(DEBUG, "respProcessCSNotification -> . End");
    }

    scope.respProcessCSNotificationAlerting = function (scope, jsonResponse, requestData) {


        if (scope.crmURLOpened == false) {
            //open sap crm popup post message call
            //scope.bindCRMURLWindow(scope);
        }

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respProcessCSNotification -> Response is Null or Empty");
            return;
        }

        scope.WriteLog(INFO, "respProcessCSNotification -> . Context store data : " + jsonResponse);

        jsonResponse = JSON.parse(jsonResponse);

        scope.objContextStore = jsonResponse;
        var _lastVerifiedAccount = (scope.objContextStore.data.LastVerifiedUsedAcct != undefined ? '' : scope.objContextStore.data.LastVerifiedUsedAcct);

        if (_lastVerifiedAccount.length > 0) {
            scope.accountNumber = _lastVerifiedAccount;
        }

        scope.WriteLog(DEBUG, "respProcessCSNotification -> . End");
    }

    scope.respUpdateCSIVRMenuDetails = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respUpdateCSIVRMenuDetails -> Response is Null or Empty");
            return;
        }

        scope.WriteLog(DEBUG, "respUpdateCSIVRMenuDetails -> . Context Store data Update Successfully " + jsonResponse);
    }

    scope.respIVRNodeList = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respIVRNodeList -> START.");


        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respIVRNodeList -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respIVRNodeList-> webservice return fail. description - ' + jsonResponse.description);
            return;
        }

        scope.WriteLog(INFO, 'respIVRNodeList->  Data - ' + JSON.stringify(jsonResponse));

        scope.objIVRNode = jsonResponse.IVRNode_details;

        scope.initilizeIVRNode(scope);
        scope.bindIVRNode(scope);

        var _surveyOpted = (scope.objContextStore.data.SurveyOpted == undefined ? '' : scope.objContextStore.data.SurveyOpted);

        if (_surveyOpted.length > 0 && _surveyOpted.toString().toUpperCase() == 'YES') {
            scope.surveyActive(scope);
            scope.disableButtonNotification = "Transfer and Conference button will be enabled in ";
        }
        scope.WriteLog(DEBUG, 'respIVRNodeList-> End');
    };

    scope.respOperationLog = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respOperationLog -> START.");


        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respOperationLog -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {

            scope.WriteLog(ERROR, 'respOperationLog-> webservice return fail. description - ' + jsonResponse.description);
            return;
        }

        scope.WriteLog(INFO, 'respOperationLog->  Data - ' + JSON.stringify(jsonResponse));

        scope.objOperationLog = jsonResponse.operation_log;


        var _tbody = $(scope.htmlInteractionPrefix + ' #tBodyOperationLog');
        _tbody.html('');

        for (var i = 0; i < jsonResponse.operation_log.length; i++) {

            var _data = '', _html = '';
            _data = jsonResponse.operation_log[i];

            _html = "<tr>";
            _html += "<td>" + _data.date_time + "</td>";
            _html += "<td>" + _data.cli + "</td>";
            _html += "<td>" + _data.account_number + "</td>";
            _html += "<td>" + _data.account_associated_number + "</td>";
            _html += "<td>" + _data.verified_account_number + "</td>";
            _html += "<td>" + _data.status_description + "</td>";
            _html += "<td>" + _data.operation_name + "</td>";
            _html += "<td>" + _data.operation_status + "</td>";
            _html += "</tr>";

            _tbody.append(_html);
        }

        scope.WriteLog(DEBUG, 'respOperationLog-> End');
    };

    scope.respUpdateJourneyDetails = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {
            scope.WriteLog(WARNING, "respUpdateJourneyDetails -> Response is Null or Empty");
            return;
        }
        scope.WriteLog(DEBUG, "respUpdateJourneyDetails -> . Journey details Updated Successfully " + jsonResponse);
    }

    scope.respAccountUsed = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respAccountUsed -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respAccountUsed -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {

            scope.WriteLog(ERROR, 'respAccountUsed -> webservice return fail. description - ' + jsonResponse.description);
            return;
        }

        scope.WriteLog(INFO, 'respAccountUsed ->  Data - ' + JSON.stringify(jsonResponse));

        scope.accountUsed = jsonResponse.accounts_list;

        var _tBody = $(scope.htmlInteractionPrefix + ' #tBodyAccountUsed');
        _tBody.html('');

        for (var i = 0; i < jsonResponse.accounts_list.length; i++) {

            var _data = '', _html = '';
            _data = jsonResponse.accounts_list[i];

            _html = "<tr>";
            _html += "<td>" + _data.account_number + "</td>";
            _html += "<td>" + _data.account_contact + "</td>";
            _html += "<td>" + _data.customer_calling_number + "</td>";
            _html += "<td>" + _data.tpin_verified_number + "</td>";
            _html += "<td>" + _data.tpin_verified + "</td>";
            _html += "<td>" + _data.updated_date + "</td>";
            _html += "</tr>";

            _tBody.append(_html);
        }

        scope.WriteLog(DEBUG, 'respAccountUsed -> End');
    };

    scope.respGetAutoAnsDuration = function (scope, jsonResponse, requestData) {
        scope.respGetAutStart = scope.getTime_yyyymmdd();
        scope.WriteLog(DEBUG, "respGetAutoAnsDuration -> START.");
        

        scope.setAutoAnswerCustomLog(scope, ", Received response Time :" + scope.respGetAutStart);

        if (jsonResponse != null && jsonResponse != undefined && jsonResponse != '')
            jsonResponse = JSON.parse(jsonResponse);

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {
            scope.WriteLog(WARNING, "respGetAutoAnsDuration -> Response is Null or Empty");
            scope.setAutoAnswerCustomLog(scope, ", No data from Midleware");
        }
        else {
            scope.autoAnsDuration = jsonResponse[0].auto_answer_duration;
            scope.autoAnsDisabled = jsonResponse[0].auto_answer_disabled;

            scope.setAutoAnswerCustomLog(scope, ", AutoAnsDuration :" + scope.autoAnsDuration + ", AutoAnsDisabled :" + scope.autoAnsDisabled + ", Interaction State :" + scope.objInteraction.state);

            scope.WriteLog(DEBUG, "AutoAnsDuration :" + scope.autoAnsDuration);
            scope.WriteLog(DEBUG, "AutoAnsDisabled :" + scope.autoAnsDisabled);
            scope.WriteLog(DEBUG, "Interaction State :" + scope.objInteraction.state);

            if (scope.autoAnsDisabled == false) {
                scope.WriteLog(DEBUG, "Auto Answer is Enabled");
                setTimeout(function () {
                    if (scope.objInteraction.state == 'ALERTING') {

                        scope.WriteLog(DEBUG, "auto accepting Interaction..");
                        scope.apiVariable.acceptInteraction();
                        scope.setAutoAnswerCustomLog(scope, ", CallType: Auto Answered, AutoAnsProcessTime :" + scope.getTime_yyyymmdd());
                    }
                }, (scope.autoAnsDuration * 1000));
            }
        }


        scope.setAutoAnswerCustomLog(scope, ", Response processed time:" + scope.getTime_yyyymmdd());

        scope.WriteLog(DEBUG, "respGetAutoAnsDuration -> END.");
    };

    scope.setSelectedDisposition = function (scope) {
        var reqJson = {
            'REASON_ID': scope.reasonID,
            'REASON_TEXT': scope.reasonValue,
            'CATEGORY_ID': scope.categoryId,
            'CATEGORY_TEXT': scope.categoryValue
        };

        //this local storage value used to recording widget. to send custom parameter to WFM
        sessionStorage.setItem("INTERACTION_DISPOSITION_DETAILS_" + scope.interactionID, JSON.stringify(reqJson));

    }

    scope.removeCSandDisposition = function (scope) {

        return;
        //below local storage values remove to widget-recording anyinteractionended event.
        sessionStorage.removeItem("INTERACTION_DISPOSITION_DETAILS_" + scope.interactionID);
        sessionStorage.removeItem("INTERACTION_CS_DETAILS_" + scope.interactionID);
    }

    scope.disableEnableTransferButton = function (scope, flg) {

        // Enable or Disable Transfer & fonference burron
        //flg == true then button are diabled

        scope.WriteLog(DEBUG, "disableEnableTransferButton -->  Start. Disable flag : " + flg);

        $(scope.htmlInteractionPrefix + " #btnTransfer").prop('disabled', flg);
        $(scope.htmlInteractionPrefix + " #btnconference").prop('disabled', flg);

        scope.WriteLog(DEBUG, "disableEnableTransferButton -->  End.");
    }

    scope.enabledisableTransferButton = function (scope, flg) {

        scope.WriteLog(DEBUG, "enabledisableTransferButton -->  Start. Disable flag : " + flg);

        $(scope.htmlInteractionPrefix + " #DEWA-Conference-btn").prop('disabled', flg);
        $(scope.htmlInteractionPrefix + " #DEWA-Transfer-btn").prop('disabled', flg);

        scope.WriteLog(DEBUG, "enabledisableTransferButton -->  End.");

    }

    scope.diableCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "diableCallNotes -> START.");

        $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect").addClass('disabled');
        $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").addClass('disabled');
        $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").addClass('disabled');
        $(scope.htmlInteractionPrefix + " #saveRecentCallNotes").prop('disabled', true);
        $(scope.htmlInteractionPrefix + " #txtRecentCallNotes").prop('disabled', true);


        //lblStatus
        scope.WriteLog(DEBUG, "diableCallNotes -> END.");

    }

    scope.StatusMessage = function (scope,) {

        $(scope.htmlInteractionPrefix + " #lbl_noData").css("display", "block");
        $(scope.htmlInteractionPrefix + " #lbl_noData").text("");
        scope.WriteLog(INFO, 'JF_SaveNotes->  Notes save success');

        $(scope.htmlInteractionPrefix + " #lbl_noData").css("color", "green");
        $(scope.htmlInteractionPrefix + " #lbl_noData").text(scope.rs_call_notes_success);
        $(scope.htmlInteractionPrefix + " #lbl_noData").css("display", "block");
    }

    //Common Functions
    scope.showMessagePopup = function (status, title, message) {

        scope.WriteLog(DEBUG, "showStatusPopup -> Start");

        $(scope.htmlInteractionPrefix + ' #message-popup-head').html(title);
        $(scope.htmlInteractionPrefix + ' #message-popup-content').html(message);
        $(scope.htmlInteractionPrefix + ' .message-popup-container').removeClass("hide");

        scope.WriteLog(DEBUG, "showStatusPopup -> End");
    }

    scope.hideMessagePopup = function (scope) {
        scope.WriteLog(DEBUG, 'hideMessagePopup -> START');

        $(scope.htmlInteractionPrefix + ' #message-popup-head').html("");
        $(scope.htmlInteractionPrefix + ' #message-popup-content').html("");
        $(scope.htmlInteractionPrefix + ' .message-popup-container').addClass("hide");

        scope.WriteLog(DEBUG, 'hideMessagePopup -> END');
    }



    scope.ProceedTPINVerification = function (scope, api) {
        
        scope.WriteLog(DEBUG, 'ProceedTPINVerification -> START');

        $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupYes').hide();
        $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupNo').hide();

        $(scope.htmlInteractionPrefix + ' #message-popup-head').html("");
        $(scope.htmlInteractionPrefix + ' #message-popup-content').html("");
        $(scope.htmlInteractionPrefix + ' .message-popup-container').addClass("hide");
        scope.updatecsdetailsforConference = true;

        scope.makeCallTransferConference(scope, api);

        //The category and reason id are inserted manually into the database for Tpin verification process .
        scope.categoryId = '4005'
        scope.reasonID = '44004'
        scope.outcomeID = '2001'
        scope.txtRecentCallNotes = ''


        setTimeout(function () {
            var json_not_ready_obj = {
                "agent_action": "NOT READY",
                "transfer_type": scope.transferText
            };
            scope.WriteLog(DEBUG, ' broadcast not ready');
            scope.broadcast_voice_channel_receive.postMessage(json_not_ready_obj, '*');

        }, 1000);

        setTimeout(function () {
            var json_ready_obj = {
                "agent_action": "READY",
                "transfer_type": scope.transferText

            };
            scope.broadcast_voice_channel_receive.postMessage(json_ready_obj, '*');
            scope.WriteLog(DEBUG, 'broadcast ready');

        }, (scope.ConferenceVerificationThreshold * 1000));

        scope.WriteLog(DEBUG, 'ProceedTPINVerification -> END');
    }

    scope.cancelTPINVerification = function (scope) {
        

        scope.WriteLog(DEBUG, 'cancelTPINVerification -> START');
        $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupYes').hide();
        $(scope.htmlInteractionPrefix + ' #btnConferenceMsgPopupNo').hide();

        $(scope.htmlInteractionPrefix + ' #message-popup-head').html("");
        $(scope.htmlInteractionPrefix + ' #message-popup-content').html("");
        $(scope.htmlInteractionPrefix + ' .message-popup-container').addClass("hide");

        scope.WriteLog(DEBUG, 'cancelTPINVerification -> END');
    }

    scope.getIVRTransferType = function (scope) {

        scope.WriteLog(DEBUG, 'getIVRTransferType -> START');

        for (var i in scope.TransferNumber.SURVEY) {
            if (scope.TransferNumber.SURVEY[i].value == scope.transferText) {
                var _tranval = scope.TransferNumber.SURVEY[i].OCDSvalue;
                return _tranval;
            }
        }
        return scope.transferText;
        scope.WriteLog(DEBUG, 'getIVRTransferType -> END');
    }

    scope.getJsonValues = function (obj, key) {

        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                if (i == key) {
                    return obj[i];
                }
                objects = objects.concat(scope.getJsonValues(obj[i], key));
            } else if (i == key) {
                objects.push(obj[i]);
            }
        }
        return objects;

    }

    scope.getGuid = function (t) {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }

        var g = _p8() + _p8(true) + _p8(true) + _p8();

        return t == '' ? g : t + "-" + g;
    }

    scope.getTime_yyyymmdd = function () {
        var currentdate = new Date();
        return currentdate.getFullYear() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getDate() + " " + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    }

    scope.getSIPNumber = function (SIP) {
        //this function used to trim phone number from SIP address --SIP:1300@tele-apps.com
        //tel:1400;phone-context=dialstring

        if (SIP == undefined)
            return;

        var sipNumber = SIP;
        var callType = SIP.substring(0, 3);

        if (callType == 'sip') {

            sipNumber = SIP.substring(SIP.lastIndexOf(":") + 1, SIP.lastIndexOf("@"));
        }
        else if (callType == 'tel') {
            sipNumber = SIP.substring(SIP.lastIndexOf(":") + 1, SIP.lastIndexOf(";"));
        }
        return sipNumber;
    };

    scope.convertTime = function (sec) {
        var hours = Math.floor(sec / 3600);
        (hours >= 1) ? sec = sec - (hours * 3600) : hours = '00';
        var min = Math.floor(sec / 60);
        (min >= 1) ? sec = sec - (min * 60) : min = '00';
        (sec < 1) ? sec = '00' : void 0;

        (min.toString().length == 1) ? min = '0' + min : void 0;
        (sec.toString().length == 1) ? sec = '0' + sec : void 0;

        return hours + ':' + min + ':' + sec;
    }

    scope.calcTimeDifference = function (d1, d2) {
        var _d1 = Date.parse(d1);
        var _d2 = Date.parse(d2);
        const _diffTime = Math.abs(_d2 - _d1);
        const _seconds = Math.floor(_diffTime / 1000);
        return scope.convertTime(_seconds);
    }

    scope.convertTimeToSec = function (t1) {

        var _arTime = t1.split(':'); // split it at the colons
        var seconds = (+_arTime[0]) * 60 * 60 + (+_arTime[1]) * 60 + (+_arTime[2]);
        return seconds;
    }

    scope.calcSecDifference = function (t1, t2) {

        var _time1 = scope.convertTimeToSec(t1);
        var _time2 = scope.convertTimeToSec(t2);

        var _diffTime = scope.convertTime(_time2 + _time1);

        return _diffTime;

    }

    scope.setAutoAnswerCustomLog = function (scope, AutoAnswerLog) {

        //this local storage value used to recording widget voice call log. to save into database.
        var localAutoAnsLog = sessionStorage.getItem("INTERACTION_AUTOANSWER_" + scope.interactionID)
        if (localAutoAnsLog == null) {
            sessionStorage.setItem("INTERACTION_AUTOANSWER_" + scope.interactionID, JSON.stringify(AutoAnswerLog));
        }
        else {
            var sessionAutoAnswerlog = sessionStorage.getItem("INTERACTION_AUTOANSWER_" + scope.interactionID)
            var obj = JSON.parse(sessionAutoAnswerlog);

            obj = obj + AutoAnswerLog;
            sessionStorage.setItem("INTERACTION_AUTOANSWER_" + scope.interactionID, JSON.stringify(obj));
        }

    }
    scope.removeAutoAnswerInteractionLog = function (scope) {

        scope.WriteLog(DEBUG, "removeAutoAnswerInteractionLog --> Start. InteractionID - " + scope.interactionID);

        sessionStorage.removeItem("INTERACTION_AUTOANSWER_" + scope.interactionID);

        scope.WriteLog(DEBUG, "removeAutoAnswerInteractionLog --> End. completed --> InteractionID - " + scope.interactionID);
    }
}

function InitVoiceLogDEWA(scope) {

    scope.WIDGET_NAME = "WIDGET VOICE"

    scope.get_time = function () {
        var currentdate = new Date();
        return currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    }

    scope.WriteLog = function (type, msg) {

        if (scope.IS_CONSOLE_LOG_ENABLE == false)
            return;

        var log = scope.WIDGET_NAME + " --> " + type + " --> " + scope.get_time() + " --> ";

        if (type == INFO) {
            console.log("%c" + log, "color:Green;font-weight: bold", msg, "");
        }

        else if (type == DEBUG) {
            console.log("%c" + log, "color:DodgerBlue;font-weight: bold", msg, "");
        }

        else if (type == ERROR) {
            console.log("%c" + log, "color:Red;font-weight: bold", msg, "");
        }

        else if (type == WARNING) {
            console.log("%c" + log, "color:Orange;font-weight: bold", msg, "");
        }
    };

}

