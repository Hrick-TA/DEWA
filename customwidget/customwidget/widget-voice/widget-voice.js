angular.module('bd912358-5ad4-4c0e-ab8d-20da57521ad5', [
    'core.services.WidgetAPI'
]).directive('widgetVoice', widgetComponent);


//UAT
//var widgetHostedURLDEWA = "https://10.15.132.210:8443/customwidget/";
var widgetHostedURLDEWA = localStorage.getItem('_cc.libraryUrl');


$.getScript(widgetHostedURLDEWA + "widget-voice/libs/widget-voice-config.js", function () {
    console.log("%c WIDGET VOICE- widget-voice-config.js loaded successfully.", "color:green;font-weight: bold");
});

$.getScript(widgetHostedURLDEWA + "widget-voice/libs/widget-voice-custom.js", function () {
    console.log("%c WIDGET VOICE - widget-voice-custom.js loaded successfully. ", " color:green;font-weight: bold");
});
$.getScript(widgetHostedURLDEWA + "widget-voice/libs/alasql.min.js", function () {
    console.log("%c WIDGET VOICE - alasql.min.js loaded successfully. ", " color:green;font-weight: bold");
});
function widgetComponent(WidgetAPI, $q, $cookies, store, $location, $http, $window) {

    function widgetContainer(scope, element, params) {
        // Create a new instance of the Widget API
        var api = new WidgetAPI(params);


        InitVoiceLogDEWA(scope);
        LoadVoiceConfigurationDEWA(scope);
        InitVoiceMethodsInsideScopeDEWA(scope);

        scope.WriteLog(INFO, "starts");
        scope.broadcast_voice_channel = new BroadcastChannel('widget_home_screenpop');
        scope.crmURLOpened = false;
        scope.interactionData = api.getInteractionData();
        scope.configuration = api.getConfiguration();
        scope.interactionID = api.getInteractionId();
        scope.workRequestId = '';
        scope.workspaceLanguage = api.getConfiguration().locale.id.toString() == "en-us" ? "EN" : "AR";
        scope.widgetLanguage = 'EN';
        scope.isSecure = document.location.protocol == 'https:' ? 'https://' : 'http://';
        scope.widgetHostedURLDEWA = widgetHostedURLDEWA;
        scope.htmlInteractionPrefix = '#voice__' + scope.interactionID;
        scope.objInteraction = '';
        scope.objOperationLog = '';
        scope.objContextStore = ''; //pending
        scope.objIVRNode = '';
        scope.objCategory = '';
        scope.objReason = '';
        scope.objOutcome = '';
        scope.objCustomerDetails = '';
        scope.objCsNotification = '';
        scope.capabilities = '';
        scope.lastInteractionState = '';
        scope.widgetRefId = '';
        scope.alertingTime = '';
        scope.answerTime = '';
        scope.acwTime = '';
        scope.categoryId = '';
        scope.categoryValue = '';
        scope.reasonValue = '';
        scope.reasonID = '';
        scope.outcomeValue = '';
        scope.outcomeID = '';
        scope.notesSaved = false;
        scope.callType = 'DEFAULT';        //Transfer or conference
        scope.transferType = '';        //IVR transfer or Survy Transfer
        scope.widgetCallType = '';  //Informational / Transactional / Electricity / Water
        scope.accountNumber = '';
        scope.canConferenceComplete = '';
        scope.lblTransfer = '';
        scope.transferText = '';
        scope.transferVal = '';
        scope.accountUsed = '';
        scope.isIVR199 = false;
        scope.loading = true;
        scope.disableButtonNotification = "Transfer and Conference button will be enabled in ";
        scope.agentTransferLanguage = true;
        scope.disableConferenceButton = false;
        scope.autoAnsDuration = "";
        scope.autoAnsDisabled = true;
        scope.apiVariable = api;
        scope.updatecsdetailsforConference = false;
        scope.broadcast_voice_channel_receive = new BroadcastChannel('widget_agent_ready');
        scope.recentreasonValue = '';
        scope.recentreasonID = '';
        scope.recentoutcomeValue = '';
        scope.recentoutcomeID = '';

        api.onDataEvent('onCapabilitiesEvent', function (data) {

            scope.WriteLog(INFO, 'onCapabilitiesEvent - Intraction ID- ' + scope.interactionID + '. Data - ' + JSON.stringify(data));
            scope.capabilities = data.capabilities;
            scope.completeConfereneTransfer(scope, api, data);
            //if (scope.capabilities.interaction.canTransferComplete == true) {

            //    api.completeTransfer();
            //    scope.WriteLog(INFO, 'onCapabilitiesEvent - Transfer Completed');

            //    return;
            //}

            //if (scope.capabilities.interaction.canConferenceComplete == true) {

            //    if (scope.canConferenceComplete != "") {
            //        scope.WriteLog(INFO, 'onCapabilitiesEvent - Repeted Conference Completed event. Skiping');
            //        return;
            //    }

            //    scope.canConferenceComplete = scope.capabilities.interaction.canConferenceComplete;

            //    api.completeConference();
            //    scope.WriteLog(INFO, 'onCapabilitiesEvent - Conference Completed');

            //    return;
            //} 
        });

        api.onDataEvent('onInteractionEvent', function (data) {

            scope.WriteLog(INFO, "onInteractionEvent START. State -" + data.state + ". Data" + JSON.stringify(data));

            scope.interactionID = data.id;
            scope.objInteraction = data;
            scope.workRequestId = data.workRequestId;

            if (scope.callType == 'TRANSFER' && scope.transferType == 'SURVEY' && scope.capabilities.interaction.canEnd == true && data.stateReason == "Default" && data.direction == "INCOMING" && data.interactionType == "CALLED" && data.state == "ACTIVE") {

                scope.WriteLog(INFO, 'onInteractionEvent - Intraction end on survey transfer event');
                api.endInteraction();
                return;
            }

            if (data.state == 'ALERTING' || data.state == 'INITIATED') {

                scope.onAlerting(scope, api, data);
            }

            else if (data.state == 'ACTIVE') {

                if (scope.lastInteractionState == 'ACTIVE') {

                    scope.WriteLog(DEBUG, "onInteractionEvent. Repeated Active event. Skipping..");
                    return;
                }
                scope.onActive(scope, api, data);

            }
            else if (data.state == 'ACW') {
                scope.onACW(scope, api, data);
            }

            scope.WriteLog(INFO, "onInteractionEvent END. ");

        });

        api.onDataEvent('onContextDataEvent', function (data) {

            scope.WriteLog(INFO, "onContextDataEvent --> Data - " + data);

            // scope.loadCSDetails(scope, data); 
        });

        //interaction ended event fired when the interaction card has ended`
        api.onDataEvent('onInteractionEndedEvent', function (data) {

            scope.WriteLog(DEBUG, "onInteractionEndedEvent ->  Start - " + JSON.stringify(data));

            scope.saveCallLog(scope);

            scope.WriteLog(DEBUG, "onInteractionEndedEvent ->  END ");

        });
        api.onDataEvent('onCardFocusedEvent', function (data) {
            // We can do something when an interaction is focused
            scope.WriteLog(DEBUG, "onCardFocusedEvent ->  Start - " + JSON.stringify(data));

            scope.GetCardEventDetails(scope, data);

            scope.WriteLog(DEBUG, "onCardFocusedEvent ->  END ");

        });


        scope.saveRecentCallNotes_Click = function () {
            scope.WriteLog(DEBUG, "saveRecentCallNotes_Click ->  Start ");

            scope.saveRecentCallNotes(scope, 'saveRecentCallNotes_Click');

            scope.WriteLog(DEBUG, "saveRecentCallNotes_Click ->  END ");
        };

        scope.recentSearch_Click = function () {
            scope.WriteLog(DEBUG, "recentSearch_Click ->  Start ");

            scope.SearchRecentCallNotes(scope);

            scope.WriteLog(DEBUG, "recentSearch_Click ->  END ");
        };

        scope.btnCancelMessagePopup_click = function () {

            scope.hideMessagePopup(scope);
        };

        scope.btnConferenceMsgPopupYes_click = function () {
            scope.WriteLog(DEBUG, "btnConferenceMsgPopupYes_click ->  Start ");

            scope.ProceedTPINVerification(scope, api);

            scope.WriteLog(DEBUG, "btnConferenceMsgPopupYes_click ->  Start ");
        };

        scope.btnValidateMultipleConference_click = function () {
            scope.WriteLog(DEBUG, "btnValidateMultipleConference_click ->  Start ");
            
            scope.hideMessagePopup(scope);

            $(scope.htmlInteractionPrefix + ' #btnValidateMultipleConference').hide();
           
            scope.validateConferenceDetails(scope, api);

            scope.WriteLog(DEBUG, "btnValidateMultipleConference_click ->  Start ");
        };

        scope.btnConferenceMsgPopupNo_click = function () {
            scope.WriteLog(DEBUG, "btnConferenceMsgPopupNo_click ->  Start ");

            scope.cancelTPINVerification(scope);

            scope.WriteLog(DEBUG, "btnConferenceMsgPopupNo_click ->  Start ");
        };

        scope.chkTransferLanguageSelect = function (val) {

            scope.WriteLog(INFO, 'chkTransferLanguageSelect -Start.');

            scope.agentTransferLanguage = val;

            scope.WriteLog(INFO, 'chkTransferLanguageSelect -End');
        }

        scope.chkTransferDetails = function (val) {

            scope.WriteLog(INFO, 'chkTransferDetails -Start.  checked value : ' + val);

            $(scope.htmlInteractionPrefix + ' #CallSurveyTransfer + label').removeClass('survey-check-active');
            scope.transferType = val;
            scope.initilizeIVRNode(scope);
            scope.bindIVRNode(scope);

            if (scope.transferType == "SURVEY") {
                scope.WriteLog(INFO, 'chkTransferDetails  checked value : ' + val);
                $(scope.htmlInteractionPrefix + ' #DEWA-Conference-btn').addClass('hide');
            }
            else {
                $(scope.htmlInteractionPrefix + ' #DEWA-Conference-btn').removeClass('hide');
            }
            var _cboText = $(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .DEWA-input-single-select');
            _cboText.removeClass("required-field");
            scope.WriteLog(INFO, 'chkTransferDetails -End');
        }

        scope.btnTransferClick = function (val) {

            scope.WriteLog(INFO, 'btnTransferClick -Start. Call Type ' + val);

            if ($(scope.htmlInteractionPrefix + ' #CallIVRTransfer').is(':checked') == true)
                scope.transferType = 'IVR';
            else if ($(scope.htmlInteractionPrefix + ' #CallSurveyTransfer').is(':checked') == true)
                scope.transferType = 'SURVEY';

            scope.callType = val; //CONFERENCE or TRANSFER

            if ((typeof showTransferButtonEnableText == 'undefined') || (typeof showTransferButtonEnableText != 'undefined'))
                showTransferButtonEnableText = scope.transferType;

            if ((typeof showConferenceButtonEnableText == 'undefined') || (typeof showConferenceButtonEnableText != 'undefined'))
                showConferenceButtonEnableText = val;


            if (scope.callType == "CONFERENCE") {
                if (scope.getInteraction(scope).DISABLE_CONFERENCE_BUTTON == true) {
                    scope.showMessagePopup("Status", scope.lang[scope.widgetLanguage].LABELConference, scope.lang[scope.widgetLanguage].LABELMultipleConference);
                    $(scope.htmlInteractionPrefix + ' #btnValidateMultipleConference').show();
                    $(scope.htmlInteractionPrefix + ' #btnCancelMessagePopup').show();
                    return;
                }
                else {
                    scope.validateConferenceDetails(scope, api);
                }

            }
            else {
                scope.makeCallTransferConference(scope, api);
            }

            scope.WriteLog(INFO, 'btnTransferClick -End');
        }


        //Widget Tab 
        var previousActiveTabIndex = 0;

        console.log("tab active scope.interactionID : " + scope.interactionID);
        console.log('#VoiceWidgetReportTab__' + scope.interactionID);
        $(document).on("click", '#VoiceWidgetReportTab__' + scope.interactionID + ' .widget-tab-switcher', function (event) {
            console.log("tab active");
            $('#VoiceWidgetReportTab__' + scope.interactionID + ' .widget-tab-switcher').removeClass("widget-tabhead-active");

            $(this).addClass("widget-tabhead-active");

            if ((event.type === "keypress" && event.which === 13) || event.type === "click") {

                var tabClicked = $(this).data("tab-index");

                if (tabClicked != previousActiveTabIndex) {
                    $('#ReportTabBody_' + scope.interactionID + ' .widget-tab-container').each(function () {

                        if ($(this).data("tab-index") == tabClicked) {

                            $('#VoiceWidgetReportTab__' + scope.interactionID + ' .widget-tab-container').removeClass("widget-tabcontainer-active");
                            $(this).addClass("widget-tabcontainer-active");
                            previousActiveTabIndex = $(this).data("tab-index");

                            return;
                        }
                    });
                }
            }
        });
        //Widget Tab

        //For Single Select Dropdown 
        //Category Dropdown
        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singleselectbtn", function (p) {

            scope.WriteLog(INFO, 'DEWA_category_dropdownselect - CLICK ');

            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect.DEWA-singlselect").removeClass("open");
            $(this).closest(".DEWA-singlselect").toggleClass("open");

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");


            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            p.stopPropagation()
        });

        $(document).on("click", function (p) {

            var categorytarget = $(p.target).is(scope.htmlInteractionPrefix + ' #DEWA_category_dropdownselect,' + scope.htmlInteractionPrefix + ' #DEWA_category_dropdownselect .input-search-container,' + scope.htmlInteractionPrefix + ' #DEWA_category_dropdownselect #inputsearch,' + scope.htmlInteractionPrefix + ' #DEWA_category_dropdownselect .cleartypeinput ');

            if (categorytarget == false) {
                $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect.DEWA-singlselect").removeClass("open");
            }
        });

        $(document).on("keyup", scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect #inputsearch", function () {

            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdown li").each(function (index) {
                if (!index)
                    return;

                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });
        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singlselect-dropdown li.singlselect-list data", function () {

            scope.categoryDropdownselect_Change(scope, this);
        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .cleartypeinput", function () {

            scope.WriteLog(INFO, 'DEWA_category_dropdownselect - Clear Input');
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect .singlselect-dropdown li.singlselect-list").show();


            scope.categoryId = '';
            scope.categoryValue = '';
            scope.initilizeReason(scope);

        });
        //Category Dropdown
        //For Single Select Dropdown 

        //disposition dropdown single select

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singleselectbtn", function (h) {

            scope.WriteLog(INFO, 'DEWA_reasons_dropdownselect - Click');

            $(scope.htmlInteractionPrefix + " #cbodisposition.singlseect").removeClass("open");
            $(this).closest(".DEWA-singlselect").toggleClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            h.stopPropagation()
        });

        $(document).on("click", function (h) {

            var dispositiontarget = $(h.target).is(scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect,' + scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect .input-search-container,' + scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect #inputsearch,' + scope.htmlInteractionPrefix + ' #DEWA_reasons_dropdownselect  .cleartypeinput');

            if (dispositiontarget == false) {
                $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").removeClass("open");
            }
        });

        $(document).on("keyup", '#DEWA_reasons_dropdownselect #inputsearch', function () {

            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdown li").each(function (index) {
                if (!index)
                    return;
                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });
        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singlselect-dropdown li.singlselect-list data", function () {

            scope.WriteLog(INFO, 'DEWA_reasons_dropdownselect - Select');

            scope.reasonValue = $(this).text();
            scope.reasonID = $(this).val();
            scope.categoryId = $(this).data().catagroyId
            scope.bindCategory(scope, scope.categoryId);

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singleselectbtn").val(scope.reasonValue);
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singleselectbtn").removeClass("required-field");

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            $(this).closest(".DEWA-singlselect").removeClass("open");
        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .clearinput", function () {

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singleselectbtn").val("");
            scope.reasonID = '';
            scope.reasonValue = '';

        });


        $(document).on("click", scope.htmlInteractionPrefix + " #cbodisposition .cleartypeinput", function () {

            scope.WriteLog(INFO, 'DEWA_reasons_dropdownselect - Clear');

            $(scope.htmlInteractionPrefix + " #cbodisposition .input-search").val("");

        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .cleartypeinput", function () {

            scope.WriteLog(INFO, 'DEWA_reasons_dropdownselect - Clear');

            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();
        });

        //For Outcome Select Dropdown

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singleselectbtn", function (j) {

            scope.WriteLog(INFO, 'DEWA_outcome_dropdownselect - Click');
            $(this).closest(".DEWA-singlselect").toggleClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");

            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            j.stopPropagation()
        });

        $(document).on("click", function (j) {

            var categorytarget = $(j.target).is(scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdownselect,' + scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdownselect .input-search-container,' + scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdownselect #inputsearch,' + scope.htmlInteractionPrefix + ' #DEWA_outcome_dropdownselect .cleartypeinput ');

            if (categorytarget == false) {
                $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").removeClass("open");
            }
        });

        $(document).on("keyup", scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect #inputsearch", function () {

            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdown li").each(function (index) {
                if (!index)
                    return;

                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singlselect-dropdown li.singlselect-list data", function () {

            scope.WriteLog(INFO, 'DEWA_outcome_dropdownselect - Select');

            scope.outcomeValue = $(this).text();
            scope.outcomeID = $(this).val();

            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singleselectbtn").val(scope.outcomeValue);
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singleselectbtn").removeClass("required-field");

            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();

            $(this).closest(".DEWA-singlselect").removeClass("open");


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .cleartypeinput", function () {

            scope.WriteLog(INFO, 'DEWA_outcome_dropdownselect - Clear');

            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            scope.outcomeID = '';
            scope.outcomeValue = '';
        });



        //For IVR Node Select Dropdown

        $(document).on("click", scope.htmlInteractionPrefix + " #cboIVRNodeSelect .singleselectbtn", function (k) {

            scope.WriteLog(INFO, 'cboIVRNodeSelect - Click');
            $(this).closest(".DEWA-singlselect").toggleClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").removeClass("open");

            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect .singlselect-dropdown li.singlselect-list").show();
            k.stopPropagation()
        });

        $(document).on("click", function (k) {

            var categorytarget = $(k.target).is(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect,' + scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .input-search-container,' + scope.htmlInteractionPrefix + ' #cboIVRNodeSelect #inputsearch,' + scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .cleartypeinput');

            if (categorytarget == false) {
                $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");
            }
        });

        $(document).on("keyup", scope.htmlInteractionPrefix + " #cboIVRNodeSelect #inputsearch", function () {

            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #cboIVRNodeList li").each(function (index) {
                if (!index)
                    return;

                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #cboIVRNodeSelect .singlselect-dropdown li.singlselect-list data", function () {

            scope.WriteLog(INFO, 'cboIVRNodeSelect - Select');

            scope.transferText = $(this).text();
            scope.transferVal = $(this).val();

            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect .singleselectbtn").val(scope.transferText);
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect .singlselect-dropdown li.singlselect-list").show();

            $(scope.htmlInteractionPrefix + ' #cboIVRNodeSelect .DEWA-input-single-select').removeClass("required-field");

            $(this).closest(".DEWA-singlselect").removeClass("open");


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #cboIVRNodeList .cleartypeinput", function () {

            scope.WriteLog(INFO, 'cboIVRNodeSelect - Clear');

            $(scope.htmlInteractionPrefix + " #cboIVRNodeList #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeList li.singlselect-list").show();
            scope.outcomeID = '';
            scope.outcomeValue = '';
        });
        // End for single select  dropdown

        //Active log report
        $(document).on("click", scope.htmlInteractionPrefix + " .active-logs-btn", function (w) {

            scope.WriteLog(INFO, 'activelogreport - Click');
            $(scope.htmlInteractionPrefix + " .active-logs-report").toggleClass("hide");
            $(scope.htmlInteractionPrefix + " #DEWA_category_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_reasons_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #DEWA_outcome_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");

            w.stopPropagation()
        });
        $(document).on("click", function (w) {
            var activelogtarget = $(w.target).is(scope.htmlInteractionPrefix + ' .active-logs-report,' + scope.htmlInteractionPrefix + ' .active-logs-report .widget-report-table-container,' + scope.htmlInteractionPrefix + ' .active-logs-report .widget-report-table-container th,' + scope.htmlInteractionPrefix + ' .active-logs-report .widget-report-table-container td,' + scope.htmlInteractionPrefix + ' .active-logs-report .panel-tab-header,' + scope.htmlInteractionPrefix + ' .active-logs-report .panel-tab-header .panel-tab-switcher,' + scope.htmlInteractionPrefix + ' .active-logs-report .panel-tab-body-container');
            if (activelogtarget == false) {
                $(scope.htmlInteractionPrefix + " .active-logs-report").addClass("hide");
            }
        });
        //Active log report

        //Panel Tab
        $(document).on("click", scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-header > .panel-tab-switcher#IVROperationLogsSwitecher", function () {

            $(this).addClass("panel-tab-switcher-active");
            $(scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-body-container > .panel-tab-body#IVROperationLogsBody").addClass("panel-tab-body-active");

            $(scope.htmlInteractionPrefix + " .panel-tab-container >.panel-tab-header >.panel-tab-switcher#AccountUsedIVRSwitecher").removeClass("panel-tab-switcher-active");
            $(scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-body-container > .panel-tab-body#AccountUsedIVRBody").removeClass("panel-tab-body-active");
        });


        $(document).on("click", scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-header > .panel-tab-switcher#AccountUsedIVRSwitecher", function () {

            $(this).addClass("panel-tab-switcher-active");
            $(scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-body-container > .panel-tab-body#AccountUsedIVRBody").addClass("panel-tab-body-active");

            $(scope.htmlInteractionPrefix + " .panel-tab-container >.panel-tab-header >.panel-tab-switcher#IVROperationLogsSwitecher").removeClass("panel-tab-switcher-active");
            $(scope.htmlInteractionPrefix + " .panel-tab-container > .panel-tab-body-container > .panel-tab-body#IVROperationLogsBody").removeClass("panel-tab-body-active");
        });
        //Panel Tab

        //hide bell !
        $(document).on("mouseover", scope.htmlInteractionPrefix + " .widget-notfication-icon", function () {

            $(scope.htmlInteractionPrefix + " .widget-notfication-icon .widget-notfiy-icon-count").hide();

        });
        //hide bell!     


        ////Recent Call Notes End DropDown!
        //For Reason Select Dropdown
        $(document).on("click", scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singleselectbtn", function (h) {

            scope.WriteLog(INFO, 'recent_reasons_dropdownselect - Click');

            $(scope.htmlInteractionPrefix + " #cbodisposition.singlseect").removeClass("open");
            $(this).closest(".DEWA-singlselect").toggleClass("open");

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");

            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            h.stopPropagation()
        });

        $(document).on("click", function (h) {

            var dispositiontarget = $(h.target).is(scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect,' + scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect .input-search-container,' + scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect #inputsearch,' + scope.htmlInteractionPrefix + ' #recent_reasons_dropdownselect  .cleartypeinput');

            if (dispositiontarget == false) {
                $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect").removeClass("open");
            }
        });

        $(document).on("keyup", ' #recent_reasons_dropdownselect #inputsearch', function () {


            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdown li").each(function (index) {
                if (!index)
                    return;
                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });
        });

        $(document).on("click", scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singlselect-dropdown li.singlselect-list data", function () {

            scope.WriteLog(INFO, 'recent_reasons_dropdownselect - Select');

            scope.recentreasonValue = $(this).text();
            scope.recentreasonID = $(this).val();



            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singleselectbtn").val(scope.recentreasonValue);
            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singleselectbtn").removeClass("required-field");

            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            $(this).closest(".DEWA-singlselect").removeClass("open");

        });

        $(document).on("click", scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .clearinput", function () {

            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singleselectbtn").val("");
            scope.recentreasonValue = '';
            scope.recentreasonID = '';

        });


        $(document).on("click", scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .cleartypeinput", function () {

            scope.WriteLog(INFO, 'recent_reasons_dropdownselect - Clear');

            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect .singlselect-dropdown li.singlselect-list").show();

        });

        //For Outcome Select Dropdown

        $(document).on("click", scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singleselectbtn", function (j) {

            scope.WriteLog(INFO, 'recent_outcome_dropdownselect - Click');
            $(this).closest(".DEWA-singlselect").toggleClass("open");

            $(scope.htmlInteractionPrefix + " #recent_reasons_dropdownselect").removeClass("open");
            $(scope.htmlInteractionPrefix + " #cboIVRNodeSelect").removeClass("open");

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            j.stopPropagation()
        });

        $(document).on("click", function (j) {

            var categorytarget = $(j.target).is(scope.htmlInteractionPrefix + ' #recent_outcome_dropdownselect,' + scope.htmlInteractionPrefix + ' #recent_outcome_dropdownselect .input-search-container,' + scope.htmlInteractionPrefix + ' #recent_outcome_dropdownselect #inputsearch,' + scope.htmlInteractionPrefix + ' #recent_outcome_dropdownselect .cleartypeinput ');

            if (categorytarget == false) {
                $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect").removeClass("open");
            }
        });

        $(document).on("keyup", scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect #inputsearch", function () {

            var value = this.value.toLowerCase().trim();
            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdown li").each(function (index) {
                if (!index)
                    return;

                $(this).find("data").each(function () {
                    var id = $(this).text().toLowerCase().trim();
                    var not_found = (id.indexOf(value) == -1);
                    $(this).closest('li').toggle(!not_found);
                    return not_found;
                });
            });


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singlselect-dropdown li.singlselect-list data", function () {

            scope.WriteLog(INFO, 'recent_outcome_dropdownselect - Select');

            scope.recentoutcomeValue = $(this).text();
            scope.recentoutcomeID = $(this).val();

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singleselectbtn").val(scope.recentoutcomeValue);
            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singleselectbtn").removeClass("required-field");

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();

            $(this).closest(".DEWA-singlselect").removeClass("open");


        });

        $(document).on("click", scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .clearinput", function () {

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singleselectbtn").val("");
            scope.recentoutcomeValue = '';
            scope.recentoutcomeID = '';
        });


        $(document).on("click", scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .cleartypeinput", function () {

            scope.WriteLog(INFO, 'recent_outcome_dropdownselect - Clear');

            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect #inputsearch").val("");
            $(scope.htmlInteractionPrefix + " #recent_outcome_dropdownselect .singlselect-dropdown li.singlselect-list").show();
            scope.recentoutcomeID = '';
            scope.recentoutcomeValue = '';
        });
        //Recent Call Notes End DropDown

        // Called   matically when the widget is destroyed
        element.on('$destroy', function () {
            api.unregister();
        });
    }

    return {
        scope: {},
        replace: true,
        template: template,
        link: widgetContainer
    };
}