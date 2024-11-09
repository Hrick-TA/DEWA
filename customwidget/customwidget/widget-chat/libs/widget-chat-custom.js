
/** * Declaration Start */
var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';
var WARNING = 'WARNING';
var IS_CONSOLE_LOG_ENABLE = true;
/** * Declaration END */

function InitWebChatMethodsInsideScopeDEWA(scope) {

    //Intraction load
    scope.newIntraction = function (scope, data) {
        scope.WriteLog(DEBUG, "newIntraction --> Start");

        if (scope.getInteraction(scope) == null) {
            scope.WriteLog(INFO, "newIntraction --> New WebChat Interaction. IntractionID - " + scope.interactionID + ". State - " + data.state);

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
            "CRM_OPENED": scope.crmOpend
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
    scope.initializeWebChatLayout = function (scope, data) {

        scope.WriteLog(DEBUG, "initializeWebChatLayout -->  Start.");

        //Default CRM Maximize or Minimize
        if (scope.defaultMinimizeCRM == true)
            scope.btnWebChatMinimizeCRM();
        else
            scope.btnWebChatMaximizeCRM();

        //Customer Details Maximize or Minimize
        if (scope.defaultMinimizeCustomPanel == true)
            scope.btnMinimizeCustomPanel(scope);
        else
            scope.btnMaximizeCustomPanel(scope);


        scope.WriteLog(DEBUG, "initializeWebChatLayout -->  End.");
    };

    scope.initilizeRecentCallNotesFilter = function (scope) {
        scope.WriteLog(DEBUG, 'initilizeRecentCallNotesFilter. Start');

        scope.reasonValue = '';
        scope.reasonID = '';
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

    scope.loadWidgetData = function (scope, data) {

        scope.WriteLog(INFO, "loadWidgetData - Start");

        scope.loadRecentCallNoteSearch(scope);
        scope.initilizeCategory(scope);
        scope.initilizeReason(scope);
        scope.initilizeOutcome(scope);

        scope.loadCSDetails(scope, data);

        scope.loadRecentCallNotes(scope, data);

        scope.WriteLog(DEBUG, "loadWidgetData - End");
    }

    scope.loadRecentCallNoteSearch = function (scope) {
        ;
        scope.WriteLog(DEBUG, 'loadRecentCallNoteSearch. Start');

        scope.cboRecentSearchSelected = scope.recentCallNoteSearch[scope.widgetLanguage][0].Key

        scope.WriteLog(DEBUG, 'loadRecentCallNoteSearch. End');
    }



    scope.loadWidgetDataContextStore = function (scope, data) {

        scope.WriteLog(INFO, "loadWidgetData - Start");
        scope.widgetCallType = scope.objContextStore.data.CallType == undefined ? "" : scope.objContextStore.data.CallType;
        scope.accountNumber = scope.objContextStore.data.LastVerifiedUsedAcct == undefined ? "" : scope.objContextStore.data.LastVerifiedUsedAcct;

        scope.loadIframe(scope);
        scope.bindCsNotificationPopup(scope);
        scope.loadDispositionDetails(scope);

        scope.WriteLog(DEBUG, "loadWidgetData - End");
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

    scope.initilizeOutcome = function (scope) {

        scope.WriteLog(DEBUG, 'initilizeOutcome. Start');

        var _cbo = $(scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdown');

        var _html = "<li class=\"input-search-container\"><input type=\"text\" class=\"input-search\" placeholder=" + scope.lang[scope.widgetLanguage].search + " id=\"inputsearch\" autocomplete=\"off\" /><i class=\"cleartypeinput\">X</i></li>";

        _cbo.html('');
        _cbo.html(_html);

        scope.WriteLog(DEBUG, 'initilizeOutcome. End');
    }

    //Notification Bell popup
    scope.bindCsNotificationPopup = function (scope) {

        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> End.");

        var _jsonCSNotification = {};
        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> Response Data - " + scope.objContextStore);

        //var _tbodyHeader = $(scope.htmlInteractionPrefix + ' #tbodyCsNotificationHeader');
        //var _tbodyFooter = $(scope.htmlInteractionPrefix + ' #tbodyCsNotificationFooter');

        for (var i = 0; i < scope.notificationCS.notificationList.length; i++) {

            var _jsonValue = scope.getJsonValues(scope.objContextStore.data, scope.notificationCS.notificationList[i].Key);

            if (scope.notificationCS.notificationList[i].Key == 'ServiceType') {
                scope.serviceType = _jsonValue.length == 0 ? "DEFAULT" : _jsonValue;
            }

            if (_jsonValue != null && _jsonValue.length > 0)
                _jsonCSNotification[scope.notificationCS.notificationList[i].Label] = _jsonValue[0];
        }

        scope.objCsNotification = _jsonCSNotification;

        //_tbodyHeader.html(_html);
        //_tbodyFooter.html(_html);

        scope.WriteLog(DEBUG, "bindCsNotificationPopup -> End.");
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

    scope.bindRecentCallNotesReasonFilters = function () {
        debugger
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
        debugger
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


    scope.bindOutcome = function () {

        scope.WriteLog(DEBUG, 'bindOutcome -->  Start.');

        if (scope.objOutcome == undefined || scope.objOutcome == null || scope.objOutcome.length == 0) {

            scope.WriteLog(WARNING, 'bindOutcome -->  No Outcome list found');
            return;
        }

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

        var wsReqJson = JSON.stringify({
            "serviceName": "getdisposition",
            "requestData": reqJson
        });


        scope.WriteLog(INFO, "loadDispositionDetails -->  Request Data - " + JSON.stringify(reqJson));

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_DISPOSITION");
    };

    scope.loadIframe = function (scope) {

        scope.WriteLog(DEBUG, 'loadIframe --> Start');


        scope.bindIframeContactSearch(scope);

        scope.WriteLog(DEBUG, 'loadIframe --> End');
    }


    scope.bindCRMURLWindow = function (scope) {

        scope.WriteLog(DEBUG, 'bindCRMURLWindow --> Start');

        var _url = scope.crmUrl + scope.getCRMVQueryString(scope);

        //   $(scope.htmlInteractionPrefix + ' #ifameCRMURL').attr('src', _url);

        scope.openChatScreenpopTab(scope, _url)
        scope.WriteLog(DEBUG, 'bindCRMURLWindow --> End. URL :' + _url);
    };

    scope.openChatScreenpopTab = function (scope, url) {

        if (scope.getInteraction(scope).CRM_OPENED != undefined && scope.getInteraction(scope).CRM_OPENED != "")
            return

        scope.crmOpend = "OPEN SUCCESS";
        scope.setInteraction(scope);

        scope.WriteLog(DEBUG, "openChatScreenpopTab - Start for broadcast");
        var json_obj = {
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
            "agent_name": scope.configuration.displayName,
            "customer_id": scope.objInteraction.originatingAddress,
            "work_request_id": scope.workRequestId,
            "account_number": "",
            "url": url,
            "title": scope.webChatTitle,
            "channel": scope.objInteraction.channel
        };
        scope.broadcast_webchat_channel.postMessage(json_obj);
        scope.crmURLOpened = true;

        scope.WriteLog(DEBUG, "openChatScreenpopTab - End");
    };

    scope.postCSDetailsToIframe = function (scope, iframeName) {

        scope.WriteLog(DEBUG, "postCSDetailsToIframe --> Message post to Iframe ID - " + iframeName);
       // ifr = document.getElementById(iframeName);
        ifr = $(iframeName)[0];
        cw = ifr.contentWindow;

        scope.WriteLog(DEBUG, "postCSDetailsToIframe --> sending message!!!. Iframe ID - " + iframeName);

        var reqJson = {
            "message": "AgentInfo",
            "iframe": iframeName,
            "handle": scope.configuration.handle,
            "token": scope.configuration.token
        };

        setTimeout(function () {
            cw.postMessage(reqJson, "*");
        }, 2000);

        // cw.postMessage(reqJson, "*");
        // cw.postMessage("saveCwcReasons", "*"); // send message �saveCwcReasons�

        scope.WriteLog(DEBUG, "postDetailsToIframe --> Jsin data - " + JSON.stringify(reqJson));

        scope.WriteLog(DEBUG, "postDetailsToIframe --> message sent!!!. Iframe ID - " + iframeName);
    }

    scope.bindIframeContactSearch = function (scope) {

        scope.WriteLog(DEBUG, 'bindIframeContactSearch --> Start');

        var _contactURL = scope.ContactSearchUrl;

        if (scope.objInteraction.direction == 'INCOMING')
            _contactURL += '?contactid=' + scope.objInteraction.originatingAddress;

        $(scope.htmlInteractionPrefix + ' #iframeContactSearch').attr('src', _contactURL);

        var ifrName = scope.htmlInteractionPrefix + ' #iframeContactSearch';
        scope.postCSDetailsToIframe(scope, ifrName);
        //scope.postCSDetailsToIframe(scope, 'cs_' + scope.iframeName);

        scope.WriteLog(DEBUG, 'bindIframeContactSearch --> End. URL :' + _contactURL);
    };

    scope.onAlerting = function (scope, api, data) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');
        if (scope.autoAnswer == true) {

            setTimeout(function () {
                if (scope.objInteraction.state == 'ALERTING') {
                    api.acceptInteraction();
                }
            }, (scope.autoAnswerSec * 1000));
        }

        scope.alertingTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);
        scope.loadCSDetailsAlerting(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');
    };

    scope.onActive = function (scope, api, data) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');

        scope.lastInteractionState = data.state;
        scope.answerTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);
        scope.initializeWebChatLayout(scope, data);
        scope.loadWidgetData(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');
    }

    scope.onACW = function (scope, api, data, $timeout) {

        scope.WriteLog(DEBUG, 'onAlerting --> Start');

        // $("#ow_open_Widget_Email").click();
        $timeout(function () {
            //angular.element(document.getElementById("ow_open_widget-chat")).trigger('click');
            angular.element(document.getElementById("ow_open_Custom_Webcast")).trigger('click');
        });

        scope.acwTime = scope.getTime_yyyymmdd();
        scope.newIntraction(scope, data);

        scope.WriteLog(DEBUG, 'onAlerting --> End');
    }

    //CRM Maximize
    scope.btnWebChatMaximizeCRM = function () {

        $(".crm-min-max-btn .crm-minbtn").removeClass("hide");
        $(".crm-min-max-btn .crm-maxbtn").addClass("hide");
        $(".DEWA-widget-body-container").addClass("activefullscreen");

    };

    //CRM Minimize  
    scope.btnWebChatMinimizeCRM = function () {

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
            "caller_number": scope.objInteraction.originatingAddress,
            "caller_number": scope.objInteraction.originatingAddress,
            "last_verified_account_number": '',
            "last_verified_mobile_number": '',
            "context_id": scope.workRequestId,
            "channel": scope.objInteraction.channel,
            "Type": 'LOAD'
        });
//New Requirement
        var wsReqJson = JSON.stringify({
            "serviceName": "getAgentNotes",
            "requestData": reqJson
        });

        scope.WriteLog(INFO, 'get recent call notes from  service - ' + reqJson);

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "recentCallNotes -->  End.");
    };


    scope.SearchRecentCallNotes = function (scope) {
        
        var _searchKey = '';
        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  Start.");

        var _recentSearchEmail = $(scope.htmlInteractionPrefix + ' #recentSearchEmail');
        _recentSearchEmail.removeClass("required-field");
        var _cboRecentSearch = $(scope.htmlInteractionPrefix + ' #cboRecentSearch');
        _cboRecentSearch.removeClass("required-field");

        _searchKey = scope.cboRecentSearchSelected

        if (_searchKey == scope.recentCallNoteSearch[scope.widgetLanguage][0]["Key"]) {
            _cboRecentSearch.addClass("required-field");
            scope.WriteLog(WARNING, "Select serrch value");
            return
        }

        if (_recentSearchEmail.val().length == 0) {

            _recentSearchEmail.addClass("required-field");
            scope.WriteLog(WARNING, "Account Number,Last verified mobile and Cli are empty");
            return;
        }

        var reqJson = JSON.stringify({
            "searchKey": _searchKey,
            "searchValue": _recentSearchEmail.val(),
            "channel": scope.objInteraction.channel,
            "Type": 'SEARCH',
            "reason_id": scope.recentreasonID == undefined ? '' : scope.recentreasonID,
            "outcome_id": scope.recentoutcomeID == undefined ? '' : scope.recentoutcomeID,
        });

        // testing for the git and github
        //New Requirement
        var wsReqJson = JSON.stringify({
            "serviceName": "SearchCallNotes_NonVoice_webchat'",
            "requestData": reqJson
        });


        scope.WriteLog(INFO, 'SearchRecentCallNotes -> get recent call notes from  service - ' + reqJson);

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SEARCH_RECENT_CALL_NOTES");

        scope.WriteLog(DEBUG, "SearchRecentCallNotes -->  End.");
    };
    scope.refreshRecentCallNotes = function (scope) {

        scope.WriteLog(DEBUG, "refreshRecentCallNotes -->  Start.");

        scope.recentSearchEmail = '';
        scope.cboRecentSearchSelected = "Select";

        scope.loadRecentCallNotes(scope, scope.objInteraction);

        scope.WriteLog(DEBUG, "refreshRecentCallNotes -->  End.");
    }
    scope.getDataType = function (obj) {


        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    return 'number';
                    break;
                case 'string':
                    return 'string';
                    break;
                case 'boolean':
                    return 'boolean';
                    break;
                case 'object':
                    return 'object';
                    break;
                default:
                    return 'NA';
                    break
            }
        }
        return bytes;
    };

    scope.loadCSDetails = function (scope, data) {

        scope.WriteLog(DEBUG, "loadCSDetails - Start");


        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/context/' + scope.workRequestId;

        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'GET', '', "REQUEST_GET_CS_DETAILS");

        scope.WriteLog(DEBUG, "loadCSDetails - END");
    };

    scope.loadCSDetailsAlerting = function (scope, data) {

        scope.WriteLog(DEBUG, "loadCSDetails - Start");


        var contextStoreURL = scope.isSecure + scope.configuration.settings.contextStoreClusterIP + '/services/OceanaCoreDataService/oceana/data/context/' + scope.workRequestId;

        scope.executeWebRequest(scope, scope.configuration.token, contextStoreURL, 'GET', '', "REQUEST_GET_CS_DETAILS_ALERTING");

        scope.WriteLog(DEBUG, "loadCSDetails - END");
    };



    scope.saveRecentCallNotes = function (scope, event) {

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> Start");

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
            "last_verified_account_number": scope.accountNumber,
            "channel": scope.objInteraction.channel,
            "contact_id": scope.objInteraction.originatingAddress,
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
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

        var wsReqJson = JSON.stringify({
            "serviceName": "SetCallNotes'",
            "requestData": reqJson
        });

        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SAVE_NOTES");

        scope.WriteLog(DEBUG, "saveRecentCallNotes --> End");
    };

    scope.saveCallLog = function (scope) {

        scope.WriteLog(DEBUG, "saveCallLog --> Start");

        var _getInteraction = scope.getInteraction(scope);

        if (_getInteraction.NOTES_UPDATED == false) {

            //message box
            scope.WriteLog(WARNING, 'saveCallLog --> Notes already not saved.');

            scope.saveRecentCallNotes(scope, 'onInteractionEndedEvent');
        }
        var _attrLanguage = scope.getJsonValues(scope.objContextStore.data, 'Language');

        if (_attrLanguage == undefined || _attrLanguage.length == 0)
            _attrLanguage = 'English';
        else
            _attrLanguage = _attrLanguage[0];

        var reqJson = JSON.stringify({
            "ref_id": _getInteraction.REFID,
            "agent_id": scope.configuration.agentId,
            "agent_handle": scope.configuration.handle,
            "agent_name": scope.configuration.displayName,
            "interaction_id": scope.objInteraction.id,
            "work_request_id": scope.workRequestId,
            "originator_address": scope.objInteraction.originatingAddress,
            "originator_name": scope.participantName,
            "offered_time": _getInteraction.OFFER_TIME,
            "answered_time": _getInteraction.ANSWER_TIME,
            "acw_time": _getInteraction.ACW_TIME,
            "disconnected_time": scope.getTime_yyyymmdd(),
            "skill_id": scope.objInteraction.skillId,
            "skill_name": scope.objInteraction.topic,
            "uui": scope.objInteraction.userToUserInfo,
            "widget_language": _attrLanguage,
            "remarks": ""
        });

        var wsReqJson = JSON.stringify({
            "serviceName": "InsertWebChat",
            "requestData": reqJson
        });


        
        var _url = scope.middlewareServiceUrl + '/DEWA/customWidgetPostRequest';

        scope.executeWebRequest(scope, '', _url, 'POST', reqJson, "REQ_WS_SAVE_CALL_LOG");

        //Remove local storage
        scope.removeInteraction(scope);
        scope.removeCSandDisposition(scope);
        scope.WriteLog(DEBUG, "saveRecentCallNotes --> End");
    };

    scope.updateJourneyDetails = function (scope) {
        scope.WriteLog(INFO, " updateJourneyDetails-----> start ");
        debugger
        var reqJson = JSON.stringify({
            "type": "voice",
            "agentNote": scope.txtRecentCallNotes,
            "reasonCode": scope.reasonValue + " - " + scope.outcomeValue,
        });
        scope.WriteLog(INFO, 'updateJourneyDetails -->  update Journey Data - ' + reqJson);
        var _url = scope.journeyAPIUrl + scope.objInteraction.workRequestId;
        scope.executeWebRequest(scope, '', _url, 'PUT', reqJson, "REQUEST_UPDATE_JOURNEY_DETAILS");
    };
    scope.getCRMVQueryString = function (scope) {

        scope.WriteLog(DEBUG, "getCRMWebChatQueryString - Prepare Query string. Start");

        // https://<<SAP_CRM_URL>>/?sap-agent=1234&sap-interaction_id=xxxxxxxxxxxx&sap-work_req_id =xxxxxxxxxxxxxxx&sap-channel=Chat&sap-email=gdevaraju@avaya.com&sap-buag_id=0000232323232


        var queryString =
            "?sap-agent=" + scope.configuration.handle
            + "&sap-interaction_id=" + scope.objInteraction.id
            + "&sap-work_req_id=" + scope.workRequestId
            + "&sap-channel=" + 'CHAT'//scope.objInteraction.channel
            + "&sap-email=" + scope.objInteraction.originatingAddress
            + "&saprole=" + scope.QueryStrinSAPRole
            + "&sap-buag_id=";

        scope.WriteLog(DEBUG, "getCRMWebChatQueryString - End. Query String - " + queryString);
        return queryString;

    };

    //Execute web service 
    scope.executeWebRequest = function (scope, token, requestUrl, httpMethodType, requestData, serviceType) {

        scope.WriteLog(DEBUG, 'executeWebRequest -> Start. Service type is  - ' + serviceType + ' HTTP method type - ' + httpMethodType + '. webservice URL - ' + requestUrl + '   \n Request Data - ' + JSON.stringify(requestData));

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

        else if (serviceType == "REQ_WS_SEARCH_RECENT_CALL_NOTES")
            scope.respGetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_NOTES")
            scope.respSetRecentCallNotes(scope, response, requestData);

        else if (serviceType == "REQ_WS_SAVE_CALL_LOG")
            scope.respSetCallLog(scope, response, requestData);

        else if (serviceType == "REQUEST_GET_CS_DETAILS")
            scope.respProcessCSNotification(scope, response, requestData);

        else if (serviceType == "REQUEST_GET_CS_DETAILS_ALERTING")
            scope.respProcessCSNotificationAlerting(scope, response, requestData);
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

        // scope.bindCategory(scope);
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
        requestData = JSON.parse(requestData);

        $(scope.htmlInteractionPrefix + ' #tBodyCallNote').html('');

        scope.WriteLog(DEBUG, "respRecentCallNotes -> START : " + JSON.stringify(jsonResponse));

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respRecentCallNotes-> webservice return fail. description - ' + jsonResponse.status);
            return;
        }

        else if (jsonResponse.details.length == 0 && requestData.Type == 'SEARCH') {
            scope.WriteLog(ERROR, 'respRecentCallNotes-> No recored Found. description - ' + jsonResponse.status);
            scope.showMessagePopup("FAIL", scope.lang[scope.widgetLanguage].MSGCallNoteSearchHeader, scope.lang[scope.widgetLanguage].MSGCallNoteSearchMessage);
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
            //_html += "<td><p>" + _notes.agent_id + "</p>";
            //_html += "<span class='tooltipcontent'>" + _notes.agent_id + "</span></td>";

            //_html += "<td><p>" + (_notes.agent_handle.length > 21 ? _notes.agent_handle.substring(0, 20) + ".." : _notes.agent_handle) + "</p>";
            //_notes.agent_handle.length > 0 && _notes.agent_handle != '-' ? _html += "<span class='tooltipcontent'>" + _notes.agent_handle + "</span></td>" : "";

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

    scope.respUpdateJourneyDetails = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {
            scope.WriteLog(WARNING, "respUpdateJourneyDetails -> Response is Null or Empty");
            return;
        }
        scope.WriteLog(DEBUG, "respUpdateJourneyDetails -> . Journey details Updated Successfully " + jsonResponse);
    }

    scope.respSetRecentCallNotes = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respSetRecentCallNotes -> START."); 
     
        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respSetRecentCallNotes -> Response is Null or Empty");  
            scope.focusNativeChatWidget(scope);

            return;
        }

        jsonResponse = JSON.parse(jsonResponse);
        requestData = JSON.parse(requestData);

        if (jsonResponse.status.toUpperCase() != 'SUCCESS') {
            scope.WriteLog(ERROR, 'respSetRecentCallNotes-> webservice return fail. description - ' + jsonResponse.description);
            scope.focusNativeChatWidget(scope);
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

        scope.WriteLog(DEBUG, "respSetCallLog -> . WebChat details Updated Successfully " + jsonResponse);
    };

    scope.respProcessCSNotification = function (scope, jsonResponse, requestData) {
debugger
        if (scope.crmURLOpened == false) {
            scope.bindCRMURLWindow(scope);
        }

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {
             scope.WriteLog(WARNING, "respProcessCSNotification -> Response is Null or Empty");             
            return;
        }

        scope.WriteLog(INFO, "respProcessCSNotification -> . Context store data : " + jsonResponse);

        jsonResponse = JSON.parse(jsonResponse); 

        scope.objContextStore = jsonResponse;
		
		if(scope.objContextStore.data !=undefined && scope.objContextStore.data !=[]){ 
            
            var localCSDetails = sessionStorage.getItem("INTERACTION_CS_DETAILS_" + scope.interactionID)
            if (localCSDetails == null) {
                 //this local storage value used to recording widget. to send custom parameter to WFM
                sessionStorage.setItem("INTERACTION_CS_DETAILS_" + scope.interactionID, JSON.stringify(scope.objContextStore.data));
            }
        }

        scope.loadWidgetDataContextStore(scope); 
      
        var _lastVerifiedAccount = (scope.objContextStore.data.LastVerifiedUsedAcct == undefined ? '' : scope.objContextStore.data.LastVerifiedUsedAcct);
        if (_lastVerifiedAccount.length > 0) {
            scope.accountNumber = _lastVerifiedAccount;
        }
 
        scope.WriteLog(DEBUG, "respProcessCSNotification -> . End");
    };

    scope.setSelectedDisposition = function (scope) {
        var reqJson = {
            'REASON_ID': scope.reasonID,
            'REASON_TEXT': scope.reasonValue,
            'CATEGORY_ID': scope.categoryId,
            'CATEGORY_TEXT': scope.categoryValue
        };
        sessionStorage.setItem("INTERACTION_DISPOSITION_DETAILS_" + scope.interactionID, JSON.stringify(reqJson));
    }

    scope.removeCSandDisposition = function (scope) {
        return;
        //below local storage values remove to widget-recording anyinteractionended event.
        sessionStorage.removeItem("INTERACTION_DISPOSITION_DETAILS_" + scope.interactionID);
        sessionStorage.removeItem("INTERACTION_CS_DETAILS_" + scope.interactionID);
    }

    scope.respProcessCSNotificationAlerting = function (scope, jsonResponse, requestData) {
        

        if (scope.crmURLOpened == false) {
           // scope.bindCRMURLWindow(scope);
        }

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respProcessCSNotification -> Response is Null or Empty");
            return;
        }

        scope.WriteLog(INFO, "respProcessCSNotification -> . Context store data : " + jsonResponse);

        jsonResponse = JSON.parse(jsonResponse);

         
        scope.objContextStore = jsonResponse;
        var _lastVerifiedAccount = (scope.objContextStore.data.LastVerifiedUsedAcct == undefined ? '' : scope.objContextStore.data.LastVerifiedUsedAcct);

        if (_lastVerifiedAccount.length > 0) {
            scope.accountNumber = _lastVerifiedAccount;
        }

        scope.WriteLog(DEBUG, "respProcessCSNotification -> . End");
    };

    scope.focusNativeChatWidget = function (scope) {

        scope.timeout(function () {
            angular.element(document.getElementById("ow_open_Chat")).trigger('click');
        });
    }

    scope.onBtnCancelMessagePopup = function (scope) {
        scope.hideMessagePopup(scope);
        scope.focusNativeChatWidget(scope);
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

}

function InitWebChatLogDEWA(scope) {

    scope.WIDGET_NAME = "WIDGET CHAT"

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
            console.log("%c" + log, "color:#FF00FF;font-weight: bold", msg, "");
        }

        else if (type == DEBUG) {
            console.log("%c" + log, "color:#FF00FF;font-weight: bold", msg, "");
        }

        else if (type == ERROR) {
            console.log("%c" + log, "color:Red;font-weight: bold", msg, "");
        }

        else if (type == WARNING) {
            console.log("%c" + log, "color:Orange;font-weight: bold", msg, "");
        }
    };

}

