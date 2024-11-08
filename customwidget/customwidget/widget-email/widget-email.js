angular.module('698b5f1c-1d45-457e-90de-805167fce90e', [
  'core.services.WidgetAPI'
]).directive('widgetEmail', widgetComponent);


var widgetHostedURLDEWA = "https://DEWASERV6762.dewa.gov.ae:8443/customwidget/";
//var widgetHostedURLDEWA = "http://192.168.1.128:8080/";

$.getScript(widgetHostedURLDEWA + "widget-email/libs/widget-email-config.js", function () {
    console.log("%c WIDGET EMAIL- widget-email-config.js loaded successfully.", "color:green;font-weight: bold");
});

$.getScript(widgetHostedURLDEWA + "widget-email/libs/widget-email-custom.js", function () {
    console.log("%c WIDGET EMAIL - widget-email-custom.js loaded successfully. ", " color:green;font-weight: bold");
});


function widgetComponent(WidgetAPI, $q, $cookies, store, $location, $http, $window, $timeout) {

    function widgetContainer(scope, element, params) {
        // Create a new instance of the Widget API
        var api = new WidgetAPI(params);
        scope.broadcast_email_channel = new BroadcastChannel('widget_home_screenpop');
        scope.crmURLOpened = false;
        InitWebEmailLogDEWA(scope);
        LoadWebEmailConfigurationDEWA(scope);
        InitWebEmailMethodsInsideScopeDEWA(scope);

        scope.WriteLog(INFO, "starts");
        scope.timeout = $timeout;
        scope.interactionData = api.getInteractionData();
        scope.configuration = api.getConfiguration();
        scope.interactionID = api.getInteractionId();
        scope.iframeName = "iframe_" + scope.interactionID;
        scope.workRequestId = '';
        scope.workspaceLanguage = api.getConfiguration().locale.id.toString() == "en-us" ? "EN" : "AR";
        scope.widgetLanguage = 'EN';
        scope.isSecure = document.location.protocol == 'https:' ? 'https://' : 'http://';
        scope.widgetHostedURLDEWA = widgetHostedURLDEWA;
        scope.htmlInteractionPrefix = '#email__' + scope.interactionID;
        scope.objInteraction = '';
        scope.objContextStore = ''; //pending
        scope.objCategory = '';
        scope.objReason = '';
        scope.objOutcome = '';
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
        scope.widgetCallType = '';  //Informational / Transactional / Electricity / Water
        scope.accountNumber = '';
        scope.loading = true;
        scope.participantName = '';
        scope.crmOpend = '';
        scope.emailtolist = '';
        scope.recentreasonValue = '';
        scope.recentreasonID = '';
        scope.recentoutcomeValue = '';
        scope.recentoutcomeID = '';



        api.onDataEvent('onCapabilitiesEvent', function (data) {

            scope.WriteLog(INFO, 'onCapabilitiesEvent - Intraction ID- ' + scope.interactionID + '. Data - ' + JSON.stringify(data));
            scope.capabilities = data.capabilities;
        });

        api.onDataEvent('onInteractionEvent', function (data) {

            scope.WriteLog(INFO, "onInteractionEvent START. State -" + data.state + ". Data" + JSON.stringify(data));

            scope.interactionID = data.id;
            scope.objInteraction = data;
            scope.workRequestId = data.workRequestId;
            scope.emailTitle = data.title;

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
                scope.onACW(scope, api, data, $timeout);
            }

            scope.WriteLog(INFO, "onInteractionEvent END. ");

        });

        api.onDataEvent('onContextDataEvent', function (data) {

            scope.WriteLog(INFO, "onContextDataEvent --> Data - " + data);
        });

        //interaction ended event fired when the interaction card has ended`
        api.onDataEvent('onInteractionEndedEvent', function (data) {

            scope.WriteLog(DEBUG, "onInteractionEndedEvent ->  Start - " + JSON.stringify(data));

            scope.saveCallLog(scope);

            scope.WriteLog(DEBUG, "onInteractionEndedEvent ->  END ");

        });

        api.onDataEvent('onMediaEvent', function (data) {

            scope.WriteLog(INFO, "onMediaEvent START. Data : " + JSON.stringify(data));

            _.forEach(data.participants, function (participant) {
                if (participant.participantType == 'CUSTOMER') {
                    scope.participantName = participant.participantName;
                }

            });

            scope.onMediaEvent(scope, data);

            scope.WriteLog(INFO, "onMediaEvent END.");
        });


        api.onDataEvent('onMediaMessageEvent', function (data) {

            scope.WriteLog(DEBUG, "onMediaMessageEvent - Start");

            scope.onMediaMessageEvent(scope, data);

            scope.WriteLog(DEBUG, "onMediaMessageEvent - End");
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

        scope.recentRefresh_Click = function () {
            scope.WriteLog(DEBUG, "recentRefresh_Click ->  Start ");

            scope.refreshRecentCallNotes(scope);

            scope.WriteLog(DEBUG, "recentRefresh_Click ->  END ");
        };


        scope.btnCancelMessagePopup_click = function () {

            scope.onBtnCancelMessagePopup(scope);
        };


        //Widget Tab 
        var previousActiveTabIndex = 0;

        $(document).on("click", '#WebEmailWidgetReportTab__' + scope.interactionID + ' .widget-tab-switcher', function (event) {

            $('#WebEmailWidgetReportTab__' + scope.interactionID + ' .widget-tab-switcher').removeClass("widget-tabhead-active");

            $(this).addClass("widget-tabhead-active");

            if ((event.type === "keypress" && event.which === 13) || event.type === "click") {

                var tabClicked = $(this).data("tab-index");

                if (tabClicked != previousActiveTabIndex) {
                    $('#ReportTabBody_' + scope.interactionID + ' .widget-tab-container').each(function () {

                        if ($(this).data("tab-index") == tabClicked) {

                            $('#WebEmailWidgetReportTab__' + scope.interactionID + ' .widget-tab-container').removeClass("widget-tabcontainer-active");
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

        //hide bell !
        $(document).on("mouseover", scope.htmlInteractionPrefix + " .widget-notfication-icon", function () {

            $(scope.htmlInteractionPrefix + " .widget-notfication-icon .widget-notfiy-icon-count").hide();

        });
        //hide bell!

        
        // //Recent Call Notes End DropDown!
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


            //scope.initilizeRecentCallNotesFilter(scope);
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

        // Called automatically when the widget is destroyed
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