/** * Declaration Start */
var DEBUG = 'DEBUG';
var INFO = 'INFO';
var ERROR = 'ERROR';
var WARNING = 'WARNING';

var IS_CONSOLE_LOG_ENABLE = true;
/** * Declaration END */

function InitScreenRecorderMethodsInsideScope(scope) {

    scope.setInteraction = function (scope, objCardFocuse) {

        scope.WriteLog(DEBUG, "setInteraction --> Start ");

        scope.JsonList[objCardFocuse.context.id] = objCardFocuse;

        scope.WriteLog(DEBUG, "setInteraction --> End. Data - " + JSON.stringify(scope.JsonList));
    }

    scope.setRecordingInteraction = function (scope, activeInteractionId, activeWorkrequestId, recordingState, recordingChannel, recordingANI, recordingEmail) {

        scope.WriteLog(DEBUG, "setRecordingInteraction --> Start ");
        //workRequestId
        var _interaction = {
            "RECORDING_INTERACTIONID": activeInteractionId,
            "RECORDING_WORKREQUESTID": activeWorkrequestId,
            "RECORDING_STATE": recordingState,
            "RECORDING_CHANNEL": recordingChannel,
            "RECORDING_ANI": recordingANI,
            "RECORDING_CUSTOMER_EMAIL": recordingEmail
        }

        sessionStorage.setItem("ACTIVE_RECORDING_INTERACTION", JSON.stringify(_interaction));

        scope.recordingInteractionID = activeInteractionId;
        scope.recordingWorkrequestId = activeWorkrequestId;
        scope.recordingState = recordingState;
        scope.recordingChannel = recordingChannel;
        scope.recordingANI = recordingANI;
        scope.recordingEmail = recordingEmail;

        scope.WriteLog(DEBUG, "setRecordingInteraction --> End.");
    }

    scope.getRecordingInteraction = function (scope) {


        var activeRecordingInteractionJson = sessionStorage.getItem("ACTIVE_RECORDING_INTERACTION")

        if (activeRecordingInteractionJson == undefined || activeRecordingInteractionJson == null) {

            scope.WriteLog(DEBUG, "getRecordingInteraction --> No active recording intraction found in local session storage ");

            scope.recordingInteractionID = '';
            scope.recordingWorkrequestId = '';
            scope.recordingState = false;
            scope.recordingChannel = '';
            scope.recordingANI = '';
            scope.recordingEmail = '';
            return;
        }
        activeRecordingInteractionJson = JSON.parse(activeRecordingInteractionJson);


        scope.recordingInteractionID = activeRecordingInteractionJson.RECORDING_INTERACTIONID;
        scope.recordingWorkrequestId = activeRecordingInteractionJson.RECORDING_WORKREQUESTID;
        scope.recordingState = activeRecordingInteractionJson.RECORDING_STATE;
        scope.recordingChannel = activeRecordingInteractionJson.RECORDING_CHANNEL;
        scope.recordingANI = activeRecordingInteractionJson.RECORDING_ANI;
        scope.recordingEmail = activeRecordingInteractionJson.RECORDING_CUSTOMER_EMAIL;

        scope.WriteLog(DEBUG, "getRecordingInteraction --> End.");
    }

    scope.onCardFocused = function (scope, api, data) {

        scope.WriteLog(DEBUG, "onCardFocused --> Start ");

        scope.objCardFocusedEvent = data;
        scope.setInteraction(scope, data);

        //read from local storeage
        //No record voice
        if (data.context.channel == "VOICE") {
            //scope.stopRecording(scope, scope.recordingInteractionID, scope.recordingWorkrequestId, scope.recordingChannel, scope.recordingANI, scope.recordingEmail);

            scope.WriteLog(DEBUG, "onCardFocused --> Voice channel. Skiping ");
            return
        }

        scope.voiceWidgetFocus = false;
        scope.getRecordingInteraction(scope);

        //Stopping the recoroding if previous recording already started for other interactions
        if (scope.recordingInteractionID != data.context.id && scope.recordingState == true) {

            scope.stopRecording(scope, scope.recordingInteractionID, scope.recordingWorkrequestId, scope.recordingChannel, scope.recordingANI, scope.recordingEmail);
        }

        //Skiping the recoroding if previous interaction alredy in recording state and current interaction id same as last interaction
        if (scope.recordingInteractionID == data.context.id && scope.recordingState == true) {
            scope.WriteLog(DEBUG, "Recording alredy inprogress. Skiping.");
            return
        }

        //Check if any voice interaction handled by an Agent.

        if (scope.checkVoiceInteraction(scope, api) == true) {
            scope.WriteLog(DEBUG, "Voice Interaction found. Skiping to start the recording");
            return
        }

        scope.startRecording(scope, data.context.id, data.context.workRequestId, data.context.channel, data.context.title, data.context.title);

        scope.WriteLog(DEBUG, "onCardFocused --> End ");
    }

    scope.startRecording = function (scope, _intractionId, _workrequestId, _channel, _ani, _customerEmail) {

        scope.WriteLog(DEBUG, "startRecording --> Start ");

        scope.setRecordingInteraction(scope, _intractionId, _workrequestId, true, _channel, _ani, _customerEmail);

        var _wsUrl = scope.getQueryString(scope, "START", _intractionId, _workrequestId, _channel, _ani, _customerEmail);
        //start recording configured WFM urls
        for (i = 0; i < scope.recordingUrl.length; i++) {
            var arWsURL = scope.recordingUrl[i];
            arWsURL = arWsURL + _wsUrl;
            var staus = scope.executeWebRequest(scope, '', arWsURL, 'GET', '', "REQUEST_START_RECORDING", _channel, _intractionId, _workrequestId, _ani, _customerEmail);
            debugger
            if (staus != false) {
                break;
            }

        }

        scope.WriteLog(DEBUG, "startRecording --> End");
    }

    scope.stopRecording = function (scope, _intractionId, _workrequestId, _channel, _ani, _customerEmail) {

        scope.WriteLog(DEBUG, "stopRecording --> Start ");

        scope.setRecordingInteraction(scope, _intractionId, _workrequestId, false, _channel, _ani, _customerEmail);

        var _wsUrl = scope.getQueryString(scope, "STOP", _intractionId, _workrequestId, _channel, _ani, _customerEmail);
        //Stop recording configured WFM urls
        for (i = 0; i < scope.recordingUrl.length; i++) {
            var arWsURL = scope.recordingUrl[i];
            arWsURL = arWsURL + _wsUrl;

            var staus = scope.executeWebRequest(scope, '', arWsURL, 'GET', '', "REQUEST_STOP_RECORDING", _channel, _intractionId, _workrequestId, _ani, _customerEmail);
            debugger
            if (staus != false) {
                break;
            }
        }
        scope.WriteLog(DEBUG, "stopRecording --> End");
    }

    scope.tagRecording = function (scope, _intractionId, _workrequestId, _channel, _ani, _customerEmail) {

        scope.WriteLog(DEBUG, "tagRecording --> Start ");

        scope.setRecordingInteraction(scope, _intractionId, _workrequestId, false, _channel, _ani, _customerEmail);

        var _wsUrl = scope.getQueryString(scope, "TAGGING", _intractionId, _workrequestId, _channel, _ani, _customerEmail);
        //Voice tagging configured WFM urls
        for (i = 0; i < scope.taggingUrl.length; i++) {

            var arWsURL = scope.taggingUrl[i];
            arWsURL = arWsURL + _wsUrl;

            var staus = scope.executeWebRequest(scope, '', arWsURL, 'GET', '', "REQUEST_TAG_RECORDING", _channel, _intractionId, _workrequestId, _ani, _customerEmail);
            debugger
            if (staus != false) {
                break;
            }
        }

        scope.WriteLog(DEBUG, "tagRecording --> End");
    }


    scope.onAnyInteraction = function (scope, api, data) {

        scope.WriteLog(DEBUG, "onAnyInteraction --> Start ");

        if (data.channel != 'VOICE') {
            return;
        }

        scope.getRecordingInteraction(scope);
        //stop any non voice recording alredy in progress
        if (scope.recordingState == true)
            scope.stopRecording(scope, scope.recordingInteractionID, scope.recordingWorkrequestId, scope.recordingChannel, scope.recordingANI, scope.recordingEmail);

        scope.WriteLog(DEBUG, "onAnyInteraction --> End ");
    }

    scope.onAnyInteractionEnded = function (scope, api, data) {

        scope.WriteLog(DEBUG, "onEndIntraction --> Start ");

        scope.getRecordingInteraction(scope);

        var activeRecording = scope.JsonList[scope.recordingInteractionID];
        debugger
        if (data.channel == 'VOICE') {

            //tag only voice record is ending
            scope.tagRecording(scope, data.id, data.workRequestId, data.channel, data.title, data.title);

        }
        if (data.channel == 'VOICE' && scope.objCardFocusedEvent.context.id == scope.recordingInteractionID) {
            if (activeRecording != undefined && scope.recordingState == false) {

                scope.startRecording(scope, activeRecording.context.id, activeRecording.context.channel, activeRecording.context.title, activeRecording.context.title);
            }
            else if (scope.recordingState == true) {
                scope.setFocusInteraction(scope, api);
            }

            scope.removeLocalStorage(scope, data.id);
            delete scope.JsonList[data.id];
            return;
        }

        //Stopping the recoroding if previous recording already started for other interactions
        if (scope.recordingInteractionID != data.id) {

            scope.WriteLog(DEBUG, "onEndIntraction --> " + data.id + " is not in recording state");
            scope.setFocusInteraction(scope, api);
            scope.removeLocalStorage(scope, data.id);
            delete scope.JsonList[data.id];
            return;
        }

        if (scope.recordingState == true)
            scope.stopRecording(scope, data.id, data.workRequestId, data.channel, data.title, data.title);

        scope.setFocusInteraction(scope, api);
        //remove from local storage
        scope.removeLocalStorage(scope, data.id);
        delete scope.JsonList[data.id];

        scope.WriteLog(DEBUG, "onEndIntraction --> End ");
    }

    scope.setFocusInteraction = function (scope, api) {
        var interactions = api.getAllInteractions();
        if (interactions != undefined && interactions.length > 0) {

            api.setFocus(interactions[0].id);
        }
    }
    scope.removeLocalStorage = function (scope, intractionId) {

        //below local storage values remove to widget-recording anyinteractionended event.
        sessionStorage.removeItem("INTERACTION_DISPOSITION_DETAILS_" + intractionId);
        sessionStorage.removeItem("INTERACTION_CS_DETAILS_" + intractionId);
    }

    scope.getQueryString = function (scope, type, _activeInteractionID, _activeWorkrequestId, _channel, _ani, _customerEmail) {

        //var _activeInteraction = scope.JsonList[_activeInteractionID];
        var localCSDetails = sessionStorage.getItem("INTERACTION_CS_DETAILS_" + _activeInteractionID)
        if (localCSDetails == null || localCSDetails == undefined) {
            localCSDetails = "";
        }
        else
            localCSDetails = JSON.parse(localCSDetails);

        var localDispoitionDetails = sessionStorage.getItem("INTERACTION_DISPOSITION_DETAILS_" + _activeInteractionID)
        if (localDispoitionDetails == null || localDispoitionDetails == undefined) {
            localDispoitionDetails = "";
            // 'REASON_ID': scope.reasonID,
            // 'REASON_TEXT': scope.reasonValue,
            // 'CATEGORY_ID': scope.categoryId,
            // 'CATEGORY_TEXT': scope.categoryValue

        }
        else
            localDispoitionDetails = JSON.parse(localDispoitionDetails);


        var intractionData = scope.JsonList[_activeInteractionID];
        if (intractionData == null || intractionData == undefined) {
            intractionData = "";
        }

        scope.WriteLog(DEBUG, "getQueryString --> Start. InteractionID - " + _activeInteractionID + " , WORKREQUEST ID - " + _activeWorkrequestId + " ,CHANNEL - " + _channel + " .TYPE - " + type + " .ANI - " + _ani + " . CUSTOMEREMAIL - " + _customerEmail);

        var _querySTR = "";

        if (type == "START")
            _querySTR += "&sessionevent=Connected";
        else if (type == "STOP")
            _querySTR += "&sessionevent=Disconnected";
        else if (type == "TAGGING")
            _querySTR += "&contactevent=DataEventLastCall";

        _querySTR += "&agent.agent=" + scope.configuration.handle

        _querySTR += "&attribute.key=workRequestId"
        _querySTR += "&attribute.value=" + _activeWorkrequestId

        _querySTR += "&attribute.key=mediaType"
        _querySTR += "&attribute.value=" + _channel

        if (_channel == 'VOICE') {

            _querySTR += "&attribute.key=ANI"
            _querySTR += "&attribute.value=" + _ani

            // serviceName (Normal, Emergency) NA
            _querySTR += "&attribute.key=serviceName"
            _querySTR += "&attribute.value=" + (intractionData == "" ? "" : intractionData.context.skill);

            // serviceType (Water, Elictricity) NA
            _querySTR += "&attribute.key=serviceType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.CallType)

            _querySTR += "&attribute.key=oCallType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.CallType)
            // lastIvrNode
            _querySTR += "&attribute.key=lastIvrNode"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.LastIVRNode)
            // selectedAccountOnIvr NA
            _querySTR += "&attribute.key=selectedAccountOnIvr"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.SelectedAccount)
            // customerType
            _querySTR += "&attribute.key=customerType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.CustomerType)
            // lastVerifiedUsedAcct
            _querySTR += "&attribute.key=lastVerifiedUsedAcct"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.LastVerifiedUsedAcct)
            // lastUsedAcct
            _querySTR += "&attribute.key=lastUsedAcct"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.LastUsedAcct)
            // lastAssociatedMobile NA
            _querySTR += "&attribute.key=lastAssociatedMobile"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : "NA")
            // language
			
			var voiceCallLanguage = "";
			if(localCSDetails != undefined && localCSDetails != "") {
				
				if(localCSDetails.Language != undefined && localCSDetails.Language != "") {
					voiceCallLanguage = localCSDetails.Language;
				}
				else if(localCSDetails.SelectedLanguage != undefined && localCSDetails.SelectedLanguage != "") {
					voiceCallLanguage = localCSDetails.SelectedLanguage;
				}				
			}
			
            _querySTR += "&attribute.key=language"
			// _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.Language)
			_querySTR += "&attribute.value=" + voiceCallLanguage		
            
			
            // callDisposition
            _querySTR += "&attribute.key=callDisposition"
            _querySTR += "&attribute.value=" + (localDispoitionDetails == "" ? "" : encodeURIComponent(localDispoitionDetails.REASON_TEXT))
            // agentGroup
            _querySTR += "&attribute.key=agentGroup"
            _querySTR += "&attribute.value=" + (intractionData == "" ? "" : intractionData.context.topic);
            //_querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.queuedAttributes["AgentGroup"])
        }
        else if (_channel == 'WEBCHAT') {

            _querySTR += "&attribute.key=CustomerEmail"
            _querySTR += "&attribute.value=" + _customerEmail

            _querySTR += "&attribute.key=serviceType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.ServiceType)

            _querySTR += "&attribute.key=language"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.Language)

            _querySTR += "&attribute.key=mobileNumber"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.MobileNumber)

            _querySTR += "&attribute.key=originType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.OriginType)

            _querySTR += "&attribute.key=fullName"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.FullName)

            _querySTR += "&attribute.key=emailAddress"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : localCSDetails.EmailAddress)

            _querySTR += "&attribute.key=accountNumber"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : (localCSDetails.AccountNumber == null ? "" : localCSDetails.AccountNumber))

            _querySTR += "&attribute.key=callDisposition"
            _querySTR += "&attribute.value=" + (localDispoitionDetails == "" ? "" : encodeURIComponent(localDispoitionDetails.REASON_TEXT));

            _querySTR += "&attribute.key=agentGroup"
            _querySTR += "&attribute.value=" + (intractionData == "" ? "" : intractionData.context.topic);
        }
        else if (_channel == 'EMAIL') {            
		
			_querySTR += "&attribute.key=CustomerEmail"
            _querySTR += "&attribute.value=" + _customerEmail
			
            _querySTR += "&attribute.key=emailAddress"
            _querySTR += "&attribute.value=" + _customerEmail

            _querySTR += "&attribute.key=serviceType"
            _querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : ((localCSDetails.attributes == undefined || localCSDetails.attributes == "") ? (localCSDetails.Service == undefined ? "" : localCSDetails.Service[0]) : localCSDetails.attributes.Service[0]))

			var _language = "";
			if(localCSDetails != undefined && localCSDetails != "") {
				
				if(localCSDetails.EmailLanguage != undefined && localCSDetails.EmailLanguage[0] !="") {
					_language = localCSDetails.EmailLanguage[0];
				}
				else if(localCSDetails.Language != undefined && localCSDetails.Language[0] !="") {
					_language = localCSDetails.Language[0];
				}
				else if(localCSDetails.attributes.EmailLanguage != undefined && localCSDetails.attributes.EmailLanguage[0] !="") {
					_language = localCSDetails.attributes.EmailLanguage[0];
				}
				else if(localCSDetails.attributes.Language != undefined && localCSDetails.attributes.Language[0] !="") {
					_language = localCSDetails.attributes.Language[0];
				}
			}
            _querySTR += "&attribute.key=language"
            //_querySTR += "&attribute.value=" + (localCSDetails == "" ? "" : (localCSDetails.attributes.EmailLanguage == undefined || localCSDetails.attributes.EmailLanguage == "" ? (localCSDetails.attributes.Language == undefined || localCSDetails.attributes.Language == "" ? "" : localCSDetails.attributes.Language[0]) : localCSDetails.attributes.EmailLanguage[0]))
			_querySTR += "&attribute.value=" + _language
			
			_querySTR += "&attribute.key=callDisposition"
            _querySTR += "&attribute.value=" + (localDispoitionDetails == "" ? "" : encodeURIComponent(localDispoitionDetails.REASON_TEXT));

            _querySTR += "&attribute.key=agentGroup"
            _querySTR += "&attribute.value=" + (intractionData == "" ? "" : intractionData.context.topic);
        }


        _querySTR += "&responseType=XML"

        scope.WriteLog(DEBUG, "getQueryString --> Stop. Type - " + type);
        return _querySTR;
    }


    scope.checkVoiceInteraction = function (scope, api) {

        scope.WriteLog(DEBUG, "checkVoiceInteraction --> Start ");

        var interactions = api.getAllInteractions();

        for (i in interactions) {

            if (interactions[i].channel == 'VOICE') {
                return true;
            }
        }

        return false;
        scope.WriteLog(DEBUG, "checkVoiceInteraction --> End ");
    }

    //Execute web service 
    scope.executeWebRequest = function (scope, token, requestUrl, httpMethodType, requestData, serviceType, chanel, intractionId, workrequestId, ani, customerEmail) {

        scope.WriteLog(INFO, 'screen-recorder executeWebRequest Request ->  Start \n WS REQUEST \n SERVICE TYPE - ' + serviceType + '\n CHANNEL - ' + chanel + '\n  RECORDING WORKREQUEST ID - ' + workrequestId + '\n  RECORDING INTERACTION ID - ' + intractionId + '\n ANI - ' + ani + '\n CUSTOMER EMAIL - ' + customerEmail + '\n REQUEST URL - ' + requestUrl);

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
            async: false,

            success: function (xhr, textStatus, result) {

                if (result.status == 200 || result.status == 202) {
                    scope.WriteLog(DEBUG, 'screen-recorder executeWebRequest Response ->  Successfully to execute \n WS RESPONSE \n SERVICE TYPE - ' + serviceType + '\n CHANNEL - ' + chanel + '\n  RECORDING WORKREQUEST ID - ' + workrequestId + '\n  RECORDING INTERACTION ID - ' + intractionId + '\n ANI - ' + ani + '\n CUSTOMER EMAIL - ' + customerEmail + '\n REQUEST URL - ' + requestUrl + '\n WEB SERVICE RESPONSE - ' + result.responseText);

                    var _responseText = result.responseText;
                    returnStatus = scope.redirectAction(_responseText, serviceType, requestData, scope);
                } else {
                    scope.WriteLog(INFO, 'executeWebRequest -> ' + serviceType + ' Web service execute fail - ' + result.responseText);
                    returnStatus = "fail";
                }
                return returnStatus;
            },
            error: function (err) {
                returnStatus = false;
            }
        });
        scope.WriteLog(DEBUG, 'executeWebRequest -> End.');
        debugger
        return returnStatus;
    }


    scope.redirectAction = function (response, serviceType, requestData, scope) {

        scope.WriteLog(DEBUG, 'redirectAction -> Start ');

        if (serviceType == "REQUEST_START_RECORDING")
            return scope.respStartRecording(scope, response, requestData);

        else if (serviceType == "REQUEST_STOP_RECORDING")
            return scope.respStopRecording(scope, response, requestData);

        scope.WriteLog(DEBUG, 'redirectAction -> End');
    }

    //Web service response 
    scope.respStartRecording = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respStartRecording -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respStartRecording -> Response is Null or Empty");
            return "";
        }

        //jsonResponse = JSON.parse(jsonResponse);

        //scope.WriteLog(INFO, "respStartRecording -> Response status - " + jsonResponse.status);

        scope.WriteLog(DEBUG, 'respStartRecording-> Success. End');
        return true;
    };

    scope.respStopRecording = function (scope, jsonResponse, requestData) {

        scope.WriteLog(DEBUG, "respStopRecording -> START.");

        if (jsonResponse == null || jsonResponse == undefined || jsonResponse == '') {

            scope.WriteLog(WARNING, "respStopRecording -> Response is Null or Empty");
            return "";
        }

        //jsonResponse = JSON.parse(jsonResponse);

        //scope.WriteLog(INFO, "respStopRecording -> Response status - " + jsonResponse.status);

        scope.WriteLog(DEBUG, 'respStopRecording-> Success. End');
        return true;

    };

}

function InitScreenRecorderLog(scope) {

    scope.WIDGET_NAME = "SCREEN RECORDER";

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
            console.log("%c" + log, "color:#1a8cff;font-weight: bold", msg, "");
        }

        else if (type == DEBUG) {
            console.log("%c" + log, "color:#ff00ff;font-weight: bold", msg, "");
        }

        else if (type == ERROR) {
            console.log("%c" + log, "color:Red;font-weight: bold", msg, "");
        }

        else if (type == WARNING) {
            console.log("%c" + log, "color:Orange;font-weight: bold", msg, "");
        }
    };

}
