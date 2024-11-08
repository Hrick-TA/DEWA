


function InitMethodsInsideScopeHomeScreenPopup(scope) {

    scope.setLocalStorage = function (scope, jsonListMapData) {
        scope.WriteLog(DEBUG, 'addLocalStorage : Start');

        scope.WriteLog(DEBUG, 'addLocalStorage : JsonMapData : ' + JSON.stringify(jsonListMapData));

        if (jsonListMapData == undefined) {
            scope.WriteLog(DEBUG, 'addLocalStorage : JsonMapData is undefined');
            return;
        }
        sessionStorage.setItem(scope.localStorageKey, JSON.stringify(jsonListMapData));

        scope.WriteLog(DEBUG, 'addLocalStorage : End');
    };

    scope.removeLocalStorage = function (scope) {
        scope.WriteLog(DEBUG, 'removeLocalStorage : Start');

        if (sessionStorage.getItem(scope.localStorageKey) != undefined) {
            sessionStorage.removeItem(scope.localStorageKey);
        }

        scope.WriteLog(DEBUG, 'removeLocalStorage : End');
    };

    scope.processTabsFromLocalStorage = function (scope) {
		
		if(scope.enableCRM == false){
		scope.WriteLog(DEBUG, 'createNewTab -> CRM Disabled');
		return  ;
	}
	
        scope.WriteLog(DEBUG, 'processTabsFromLocalStorage : Start');

        if (sessionStorage.getItem(scope.localStorageKey) != undefined) {

            scope.JsonList = JSON.parse(sessionStorage.getItem(scope.localStorageKey));

            Object.keys(scope.JsonList).forEach(function (i) {


                scope.WriteLog(DEBUG, 'processTabsFromLocalStorage : Tab Json  : ' + JSON.stringify(scope.JsonList[i]));

                scope.createTab(scope, scope.JsonList[i]);

            });

        }
        scope.WriteLog(DEBUG, 'processTabsFromLocalStorage : End');
    };

    //On Load
    //Close Tab
    scope.setAgentDetails = function (scope, dataConfiguration) {

        scope.WriteLog(DEBUG, 'setAgentDetails -> Start');

        var jsonRequest = JSON.stringify({
            "agent_handle": dataConfiguration.handle,
            "agent_id": dataConfiguration.agentId,
            "agent_name": dataConfiguration.displayName
        });
        scope.executeWebRequest(scope, scope.middlewareServiceUrl + "DEWA/updateAgentDetails", 'POST', jsonRequest, "REQ_SET_AGENT_DETAILS");

        scope.WriteLog(DEBUG, 'setAgentDetails -> End');
    };


    //Event
    scope.onCardFocusedEvent = function (scope, data) {

		if(scope.enableCRM == false){
		scope.WriteLog(DEBUG, 'createNewTab -> CRM Disabled');
		return false
		}
	
        scope.WriteLog(DEBUG, "onCardFocusedEvent --> " + JSON.stringify(data));
 
        //data.context.id
        //data.context.workRequestId 
		if(data.context ==undefined)
			return
        var workRequstId = data.context.workRequestId;
        scope.showActiveInteractionCRMTab(scope, workRequstId);
        scope.WriteLog(DEBUG, "onCardFocusedEvent --> End");
    }

    scope.showActiveInteractionCRMTab = function (scope, workRequestId) {

        scope.WriteLog(DEBUG, `showActiveInteractionCRMTab --> Start Fcocus to the crm tab - ${workRequestId}`);

        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");
        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");

        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher#tab_' + workRequestId).addClass("widget-tabhead-active");
        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container#tab_' + workRequestId).addClass("widget-tabcontainer-active");

        scope.WriteLog(DEBUG, "showActiveInteractionCRMTab --> End");
    }
    scope.onAnyInteraction = function (scope, data) {

        //scope.WriteLog(DEBUG, "onAnyInteraction --> " + JSON.stringify(data));

        if (data.state == 'ACW')
            if (scope.customWidgeFocusId.length > 0) {
                scope.WriteLog(DEBUG, "onAnyInteraction --> On ACW Event Widget Navigate to Custom Widget");
                $(`#${scope.customWidgeFocusId}`).click();
            }

        scope.WriteLog(DEBUG, "onAnyInteraction --> End");
    }

    scope.createDefaultTab = function (scope, window, timeout) {       
        
		var queryString = scope.crmUrl + "?sap-agent=" + scope.configuration.handle + "&saprole=" + scope.QueryStrinSAPRole;

        timeout(function () {
            window.open(queryString);
        }, 1);

        scope.WriteLog(DEBUG, "createDefaultTab --> Default tab open an agent login; Query string - " + queryString);

        return;

        var customData = {
            "channel": "DEFAULT", 
            "work_request_id": "0000-0000-0000-0000", 
            "title": "DEFAULT",
             "url": queryString
        };
	
        setTimeout(function () {
            scope.appendTabHeader(customData, 0);
            scope.appendTabBody(customData, 0);
        }, 500);
		
    }


    //create New Tab
    scope.createNewTab = function (scope, json_data,window,timeout) {
		
	if(scope.enableCRM == false){
	scope.WriteLog(DEBUG, 'createNewTab -> CRM Disabled');
		return false
	}
        scope.WriteLog(DEBUG, 'createNewTab -> Start');

        scope.WriteLog(DEBUG, 'createNewTab -> Work Request ID : ' + json_data.work_request_id);
         
        if (scope.JsonList.hasOwnProperty(json_data.work_request_id) == true) {
            scope.WriteLog(DEBUG, 'createNewTab -> tab already opened.Duplicate work request ID : ' + json_data.work_request_id);
            return;
        }
        timeout(function () {
            window.open(json_data.url);    
        }, 1);

       // window.open(json_data.url);     
        return;

        scope.JsonList[json_data.work_request_id] = json_data;
        scope.setLocalStorage(scope, scope.JsonList);

        scope.ProcessTabLimits(scope, json_data);
        scope.createTab(scope, json_data);

        scope.WriteLog(DEBUG, 'createNewTab -> End');
    };

    scope.createTab = function (scope, data) {
        scope.WriteLog(DEBUG, 'createTab -> Start');

        var tablilenght = $(".widget-home-screenpop-tab-header li").length + 1;

        scope.appendTabHeader(data, tablilenght);
        scope.appendTabBody(data, tablilenght);

        scope.WriteLog(DEBUG, 'createTab ->   Screenpop URL :- ' + data.url);
        scope.WriteLog(DEBUG, 'createTab ->  Updated Tabs : ' + JSON.stringify(scope.JsonList));
        scope.WriteLog(DEBUG, 'createTab -> End');
    };

    //check Max Tab Limit
    scope.ProcessTabLimits = function (scope, json_data) {

        scope.WriteLog(DEBUG, 'ProcessTabLimits -> Start');
        scope.closeKeyJson = "";
        var jsonListLength = Object.keys(scope.JsonList).length;
        if (jsonListLength > scope.alertOnNoOfTabsExceeded)
            scope.alertOnMaxTabs(scope, json_data);

        if (jsonListLength > scope.autoCloseOldestTabExceeded) {
            scope.alertOnTabsExceeded(scope, json_data);
            //var work_request_id = scope.JsonList.keys().next().value;
            var work_request_id = Object.keys(scope.JsonList)[0];
            var old_tab_json_data = scope.JsonList[work_request_id];

            scope.closeKeyJson = old_tab_json_data;
            scope.showMessagePopup("Warning", scope.msgClosePopupTitle, scope.msgClosePopupMessage);
            //scope.closeTab(scope, old_tab_json_data);
        }

        scope.WriteLog(DEBUG, 'ProcessTabLimits -> End');
    };

    scope.alertOnMaxTabs = function (scope, json_data) {

        scope.WriteLog(DEBUG, 'alertOnMaxTabs -> Start');
        scope.WriteLog(DEBUG, 'alertOnMaxTabs : tabs exceeds more than ' + scope.alertOnNoOfTabsExceeded);

        scope.showMessagePopup(scope, json_data.work_request_id, scope.alertOnTabsExceededMsg);
        scope.WriteLog(DEBUG, 'alertOnMaxTabs -> End');
    };

    scope.alertOnTabsExceeded = function (scope, json_data) {

        scope.WriteLog(DEBUG, 'alertOnTabsExceeded -> Start');
        scope.WriteLog(DEBUG, 'alertOnTabsExceeded : tabs exceeds more than ' + scope.alertOnNoOfTabsExceeded.toString());

        scope.showMessagePopup(scope, json_data.work_request_id, scope.autoCloseOldestTabExceededMsg);
        scope.WriteLog(DEBUG, 'alertOnTabsExceeded -> End');
    };

    //Close Tab
    scope.closeTab = function (scope, json_data) {

        scope.WriteLog(DEBUG, 'closeTab -> Start');

        $('li.widget-tab-switcher#tab_' + json_data.work_request_id).remove();
        $('div.widget-tab-container#tab_' + json_data.work_request_id).remove();

        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher:last-child').addClass("widget-tabhead-active");
        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container:last-child').addClass("widget-tabcontainer-active");

        delete scope.JsonList[json_data.work_request_id];

        scope.setLocalStorage(scope, scope.JsonList);
        scope.closeKeyJson = "";

        var jsonRequest = JSON.stringify({
            "agentid": json_data.agent_handle,
            "agentsessionid": json_data.work_request_id
        });
        scope.executeWebRequest(scope, scope.middlewareServiceUrl + "DEWA/UpdateCRMSession", 'POST', jsonRequest, "END_CRM");

        scope.WriteLog(DEBUG, 'closeTab -> End');
    };

    //Close all tabs
    scope.closeAllTabs = function (scope) {
		
			if(scope.enableCRM == false){
		scope.WriteLog(DEBUG, 'createNewTab -> CRM Disabled');
		return  ;
	}
	
        scope.WriteLog(DEBUG, 'closeAllTabs : Start');

        scope.closeKeyJson = "";
        Object.keys(scope.JsonList).forEach(function (i) {

            scope.WriteLog(DEBUG, 'closeAllTabs : Tab Json  : ' + JSON.stringify(scope.JsonList[i]));
            scope.closeKeyJson = scope.JsonList[i];
            //scope.closeTab(scope, scope.JsonList[i]);
            scope.showMessagePopup("Warning", scope.msgClosePopupTitle, scope.msgClosePopupMessage);
        });

        scope.WriteLog(DEBUG, 'closeAllTabs : End');
    }

    //Refresh Tab
    scope.refreshTab = function (scope, tab_id) {

        scope.WriteLog(DEBUG, 'refreshTab -> Start');

        var refreshJsonData = scope.JsonList[tab_id];
        var _url = refreshJsonData.url;

        $("#iframeHomeScreenpop_" + tab_id).attr('src', _url);

        scope.WriteLog(DEBUG, 'refreshTab -> End');

    };

    scope.showMessagePopup = function (scope, workRequestId, message) {
        scope.WriteLog(DEBUG, "showMessagePopup -> Start");

        scope.showNewMessagetNotificationPopup(scope, workRequestId, message);
        //$('#screen-popup-content').html(message);
        //$('#screen-popup-container').removeClass("hide");

        scope.WriteLog(DEBUG, "showMessagePopup -> End");
    }

    scope.showNewMessagetNotificationPopup = function (scope, workRequestId, msg) {

        scope.WriteLog(INFO, "showNewMessagetNotification - Start");

        scope.appendnotificationcontainerPopup(scope);

        $(".footer.active-notification-container .notification-information .notification-information-list-container").append("<li class='notification-information-list Popupnotification_" + workRequestId + "' id='Popupnotification__" + workRequestId + "'><div class='Popup-notification-container message-body-notification'  ><div class='hide' id='testabcd'><span>" + workRequestId + "</span></div><p class='Popup-notification-msg customer-name-info' ><span class='customer-message-info'>" + msg + "</span></p><i class='Popup-close-notification'>X</i></div></li>");
        var msgnotificationinfolistcount = $(".notification-information-list-container li.notification-information-list").length;

        setTimeout(function () {
            $('#Popupnotification__' + workRequestId + '.notification-information-list').addClass("info-notification-active");
        }, 200);

        setTimeout(function () {
            $('#Popupnotification__' + workRequestId + '.notification-information-list').removeClass("info-notification-active");
            setTimeout(function () {
                $('#Popupnotification__' + workRequestId + '.notification-information-list').remove();
            }, 1000);

            //Hide Notification Container
            if (msgnotificationinfolistcount > 0) {
                $(".notifaction-container").show();
                scope.WriteLog(INFO, "Show Notification Container");
            }
            else {
                $(".notifaction-container").hide();
                scope.WriteLog(INFO, "Hide Notification Container");
            }
            //Hide Notification Container
        }, (scope.showMessageTimeOut * 1000));

        scope.WriteLog(INFO, "showNewMessagetNotification - End");
    }

    scope.appendnotificationcontainerPopup = function (scope) {

        scope.WriteLog(INFO, "appendnotificationcontainer - Start");

        if ($(".footer").hasClass("active-notification-container")) {

            scope.WriteLog(INFO, "appendnotificationcontainer - notification container already exist");
        }
        else {
            scope.WriteLog(INFO, "appendnotificationcontainer - notificatin container added");
            $(".footer").addClass("active-notification-container");
            $(".footer.active-notification-container").append("<div class='notifaction-container'><div class='notification-information'><ul class='notification-information-list-container'></ul></div></div>");
        }
    };


    //Append Tab Header
    scope.appendTabHeader = function (data, tabIndex) {
        scope.WriteLog(DEBUG, 'appendTabHeader -> Start');

        var _channel = data.channel.toUpperCase();
        scope.WriteLog(DEBUG, 'appendTabHeader for ' + _channel + ' -> Start');
        var tab_header = $(".widget-home-screenpop-tab-header");
        //var tablilenght = $(".widget-home-screenpop-tab-header li").length + 1;
        var ul_count = tabIndex;
        var _tab = "";

        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");
        $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");

        if (_channel == 'VOICE') {
            _tab += "<li id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-switcher widget-tab-switcher-voice widget-tabhead-active\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "</li>";
        } else if (_channel == 'WEBCHAT') {
            _tab += "<li id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-switcher widget-tab-switcher-chat widget-tabhead-active\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "</li>";
        } else if (_channel == 'EMAIL') {
            _tab += "<li id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-switcher widget-tab-switcher-email widget-tabhead-active\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "</li>";
        }else if (_channel == 'DEFAULT') {
            _tab += "<li id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-switcher widget-tab-switcher-default widget-tabhead-active\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "</li>";
        }
        else {
            _tab += "<li id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-switcher widget-tab-switcher-chat widget-tabhead-active\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "</li>";
        }

        tab_header.append(_tab);

        scope.WriteLog(DEBUG, 'appendTabHeader -> End');
    };

    //Append Tab Body
    scope.appendTabBody = function (data, tabIndex) {

        scope.WriteLog(DEBUG, 'appendTabBody -> Start');

        //var tablilenght = $(".widget-home-screenpop-tab-header li").length + 1;
        var ul_count = tabIndex;
        var tab_body = $(".widget-home-screenpop-tab-body");
        var _tabFrame = "";
        _tabFrame += "<div id=\"tab_" + data.work_request_id + "\" class=\"widget-tab-container widget-tabcontainer-active\" data-tab-index=" + ul_count + ">";
        _tabFrame += "<div class=\"home-screenpop-btn-container\">";

        if (data.title != "DEFAULT") {
            _tabFrame += "<button id=\"btnEnd_" + data.work_request_id + "\" class=\"home-screenpop-input-btn home-screenpop-end-btn green-lite-btn pull-right\" >End</button>";
        }
        _tabFrame += "<button id=\"btnRefresh_" + data.work_request_id + "\" class=\"home-screenpop-input-btn home-screenpop-refresh-btn dark-blue-btn pull-right\" style=\"margin-right: 5px;\">Refresh</button>";
        _tabFrame += "</div>";
        _tabFrame += "<div class=\"home-screenpop-widget-iframe-container\">";
        _tabFrame += "<iframe class=\"home-screenpop-widget-iframe\" width=\"500\" height=\"200\" id=\"iframeHomeScreenpop_" + data.work_request_id + "\" name=\"iframeHomeScreenpop_" + data.work_request_id + "\" src=" + data.url + "></iframe>";
        _tabFrame += "</div></div>";
        tab_body.append(_tabFrame);

        scope.WriteLog(DEBUG, 'appendTabBody -> End');
    };

    scope.executeWebRequest = function (scope, requestUrl, httpMethodType, requestData, serviceType) {
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
                "Authorization": "",
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
    };

    scope.redirectAction = function (response, serviceType, requestData, scope) {

        scope.WriteLog(DEBUG, 'redirectAction -> ' + serviceType + ' --> Web service execute successfully, Response : ' + JSON.stringify(response));

        if (serviceType == "END_CRM")
            scope.respEndCRM(scope, response, requestData);
        else if (serviceType == "REQ_SET_AGENT_DETAILS")
            scope.respsetAgentDetails(scope, response, requestData);

        scope.WriteLog(DEBUG, 'redirectAction -> End');
    };

    scope.respEndCRM = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respEndCRM -> Response is Null or Empty");
            return;
        }

        jsonResponse = JSON.parse(jsonResponse);

        scope.WriteLog(DEBUG, "respEndCRM -> . CRM End details Updated Successfully " + jsonResponse);
    };


    scope.respsetAgentDetails = function (scope, jsonResponse, requestData) {

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respsetAgentDetails -> Response is Null or Empty");
            return;
        }
        scope.WriteLog(DEBUG, "respsetAgentDetails -> . Agent details Updated Successfully " + jsonResponse);
    };

    scope.okMessagePopup = function (scope) {

        scope.WriteLog(DEBUG, "okMessagePopup -> Start");

        scope.closeTab(scope, scope.closeKeyJson);
        $('#DEWA-home-message-popup').addClass("hide");
        scope.WriteLog(DEBUG, "okMessagePopup -> End");
    }

    scope.cancelMessagePopup = function (scope) {

        scope.WriteLog(DEBUG, "cancelMessagePopup -> Start");

        $('#DEWA-home-message-popup').addClass("hide");

        scope.WriteLog(DEBUG, "cancelMessagePopup -> End");
    }

    scope.showMessagePopup = function (status, title, message) {

        scope.WriteLog(DEBUG, "showStatusPopup -> Start");

        $('#DEWA-home-message-popup #message-popup-head').html(title);
        $('#DEWA-home-message-popup #message-popup-content').html(message);
        $('#DEWA-home-message-popup').removeClass("hide");

        scope.WriteLog(DEBUG, "showStatusPopup -> End");
    }

    scope.makeWidgetReadyNotReady = function(event,api){
      debugger;
        var json_data = event.data;
        console.log("WIDGET HOME SCREENPOP  : broadcastAgentMessageListener -> " + JSON.stringify(json_data));
        if (json_data.agent_action == "NOT READY") {
            api.setAgentNotReady('2501');
            console.log("WIDGET HOME SCREENPOP  : broadcastAgentMessageListener -> Agent Set to Not Ready");
        }
        else if (json_data.agent_action == "READY") {
            console.log("WIDGET HOME SCREENPOP  : broadcastAgentMessageListener -> Agent start to Set Ready");
            setTimeout(function () {
                console.log("WIDGET HOME SCREENPOP  : broadcastAgentMessageListener ->Calling Agent Ready");
                api.setAgentReady();
                console.log("WIDGET HOME SCREENPOP  : broadcastAgentMessageListener -> Agent Ready Completed");
            }, 500);
        }
     }


}

function InitLogHomeScreenpop(scope) {
    /** * Declaration Start */
    scope.DEBUG = 'DEBUG';
    scope.INFO = 'INFO';
    scope.ERROR = 'ERROR';
    scope.WARNING = 'WARNING';

    /** * Declaration END */

    scope.get_time = function () {
        var currentdate = new Date();
        return currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + " "
            + currentdate.getHours() + ":" + currentdate.getMinutes() + ":" + currentdate.getSeconds();
    }

    scope.WriteLog = function (type, msg) {

        if (scope.IS_CONSOLE_LOG_ENABLE == false)
            return;

        var log = scope.WIDGET_NAME + " --> " + type + " --> " + scope.get_time() + " --> ";

        if (type == scope.INFO) {
            console.log("%c" + log, "color:Green;font-weight: bold", msg, "");
        }

        else if (type == scope.DEBUG) {
            console.log("%c" + log, "color:DodgerBlue;font-weight: bold", msg, "");
        }

        else if (type == scope.ERROR) {
            console.log("%c" + log, "color:Red;font-weight: bold", msg, "");
        }

        else if (type == scope.WARNING) {
            console.log("%c" + log, "color:Orange;font-weight: bold", msg, "");
        }
    };

}