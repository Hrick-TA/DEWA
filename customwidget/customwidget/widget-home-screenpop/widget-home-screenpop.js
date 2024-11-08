angular.module('e1733e96-320b-4bf7-b675-c9f506bbdc1c', [
    'core.services.WidgetAPI'
]).directive('widgetHomeScreenpop', widgetComponent);

var widgetHostedURLHomeScreenpop = "https://10.15.132.210:8443/customwidget/";

$.getScript(widgetHostedURLHomeScreenpop + "widget-home-screenpop/libs/widget-home-screenpop-config.js", function () {
    console.log("%c WIDGET HOME SCREEN POP - widget-home-screenpop-config.js loaded successfully.", "color:green;font-weight: bold");
});

$.getScript(widgetHostedURLHomeScreenpop + "widget-home-screenpop/libs/widget-home-screenpop-custom.js", function () {
    console.log("%c WIDGET HOME SCREEN POP - widget-home-screenpop-custom.js loaded successfully.", " color:green;font-weight: bold");
});

function widgetComponent(WidgetAPI, $http, $window, $sce, $interval, $timeout) {

    function widgetContainer(scope, element, params) {

        // Create a new instance of the Widget API
        var api = new WidgetAPI(params);

        scope.WIDGET_NAME = "WIDGET HOME SCREEN POP";
        scope.widgetHostedURLHomeScreenpop = widgetHostedURLHomeScreenpop;
        scope.IS_CONSOLE_LOG_ENABLE = true;
        scope.configuration = api.getConfiguration();
        scope.agentID = scope.configuration.handle;
        scope.JsonList = new Map();
        scope.screenpopChannel = new BroadcastChannel('widget_home_screenpop');
        scope.localStorageKey = scope.agentID + "_" + "HOME_SCREENPOP_WIDGETURLS";
        scope.agentLastState = "";
        scope.closeKeyJson = "";
        scope.broadcast_voice_channel_receive = new BroadcastChannel('widget_agent_ready');
       
  

        console.log(scope.WIDGET_NAME + " : starts");

        InitLogHomeScreenpop(scope);
        LoadConfigurationHomeScreenpop(scope);
        InitMethodsInsideScopeHomeScreenPopup(scope);
      
       

        // Call Set Agent Details
        scope.setAgentDetails(scope, scope.configuration);

        //Broadcast Listener method
        console.log(scope.screenpopChannel);

        scope.createDefaultTab(scope, $window, $timeout);

        scope.screenpopChannel.addEventListener("message", broadcastMessageListener, false);
         
        function broadcastMessageListener(event) {
            scope.WriteLog(DEBUG, 'broadcastMessageListener -> Start');

            var json_data = event.data;
            scope.createNewTab(scope, json_data, $window,$timeout);

            scope.WriteLog(DEBUG, 'broadcastMessageListener -> End');
        }

        scope.broadcast_voice_channel_receive.addEventListener("message", broadcastAgentMessageListener, false);
         
        function broadcastAgentMessageListener(event) {
            console.log("WIDGET HOME ScreenPop : broadcastAgentMessageListener -> Start");
            scope.makeWidgetReadyNotReady(event, api);
            console.log("WIDGET HOME ScreenPop : broadcastAgentMessageListener -> End");
    
        }

        //Events from api 
        api.onDataEvent('onCardFocusedEvent', function (data) {

            scope.WriteLog(DEBUG, "onCardFocusedEvent --> Start" );
            scope.onCardFocusedEvent(scope, api, data);
        });

        api.onDataEvent('onAnyInteractionEvent', function (data) {

            scope.WriteLog(DEBUG, "onAnyInteractionEvent --> Srart ");
            scope.onAnyInteraction(scope, data);
        });

        api.onDataEvent('onAgentStateEvent', function (data) {
            scope.WriteLog(DEBUG, 'onAgentStateEvent -> Start');

            scope.WriteLog(DEBUG, 'onAgentStateEvent -> Data : ' + JSON.stringify(data));

            if (data.state == "READY") {
                if (scope.agentLastState == "READY") {
                    return;
                }
                scope.agentLastState = "READY";
                // Process all existing tabs in local storage  (Refresh Condition)   //need to handle when disconnect chat or call calling ready
                scope.processTabsFromLocalStorage(scope, scope.JsonList);
            }
            else if (data.state == "LOGGED_OUT") {
                //Close All tabs in Log out state
                scope.closeAllTabs(scope);
            }

            scope.WriteLog(DEBUG, 'onAgentStateEvent -> End');

        });

       

        //End button click
        $(document).on("click", '.widget-home-screenpop-tab-container .home-screenpop-end-btn', function () {

            scope.WriteLog(DEBUG, 'End button Click  -> Start');

            var button_id = $(this).attr('id');
            var IdArray = button_id.split("btnEnd_");
            var workRequestID = IdArray[1];
            var json_data = scope.JsonList[workRequestID];

            scope.closeKeyJson = json_data;
            scope.showMessagePopup("Warning", scope.msgClosePopupTitle, scope.msgClosePopupMessage); 

            scope.WriteLog(DEBUG, 'End button Click  -> End');
        });

        //Refresh button Click
        $(document).on("click", '.widget-home-screenpop-tab-container .home-screenpop-refresh-btn', function () {

            scope.WriteLog(DEBUG, 'Refresh button Click  -> Start');

            var button_id = $(this).attr('id');
            var IdArray = button_id.split("btnRefresh_");
            var workRequestID = IdArray[1];
            scope.refreshTab(scope, workRequestID);

            scope.WriteLog(DEBUG, 'Refresh button click  -> End');
        });

        //Close message notification click
        $(document).on("click", '.Popup-close-notification', function () {

            scope.WriteLog(DEBUG, "Close Notification Start");

            var thisnotificationID = $(this).closest('li').attr('id');
            $('#' + thisnotificationID + '.notification-information-list').removeClass("info-notification-active");
            setTimeout(function () {
                $('#' + thisnotificationID + '.notification-information-list').remove();
            }, 500);

            scope.WriteLog(DEBUG, "Close Notification End");
        });

        //Widget Tab 
        var previousActiveTabIndex = 0;

        $(document).on("click", '.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher', function (event) {

            $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");

            $(this).addClass("widget-tabhead-active");

            if ((event.type === "keypress" && event.which === 13) || event.type === "click") {

                var tabClicked = $(this).data("tab-index");

                if (tabClicked != previousActiveTabIndex) {
                    $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container').each(function () {

                        if ($(this).data("tab-index") == tabClicked) {

                            $('.widget-home-screenpop-tab-container .widget-home-screenpop-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");
                            $(this).addClass("widget-tabcontainer-active");
                            previousActiveTabIndex = $(this).data("tab-index");

                            return;
                        }
                    });
                }
            }
        });
        //Widget Tab

        //Widget Tab Navigator
        $(document).ready(function () {

            // Tab Header Width
            function TabHeaderSize() {

                var tabheaderOuterWidth = $('#tabheadcontent').outerWidth();
                var tabheaderScrollWidth = $('#tabheadcontent')[0].scrollWidth;
                if (tabheaderOuterWidth < tabheaderScrollWidth) {

                    $(".widget-home-screenpop-tab-header-container").addClass("tab-nav-active");
                } else {
                    $(".widget-home-screenpop-tab-header-container").removeClass("tab-nav-active");
                }
            }
            // Tab Header Width

            // Tab Header Scroll Position
            function TabScrollPosition() {

                var tabheaderOuterWidth = $('#tabheadcontent').outerWidth();
                var tabheaderScrollWidth = $('#tabheadcontent')[0].scrollWidth;
                var tabheaderScrollposition = tabheaderScrollWidth - tabheaderOuterWidth;
                var tabheaderScrollLeftposition = $('#tabheadcontent').scrollLeft();
                if (tabheaderScrollposition == tabheaderScrollLeftposition) {
                    $(".tab-nav-btn.tab-next-btn").addClass("tab-next-btn-disabled");
                    //console.log("right nav disabled")
                } else {
                    $(".tab-nav-btn.tab-next-btn").removeClass("tab-next-btn-disabled");
                    //console.log("right nav enabled")
                }
                if (tabheaderScrollLeftposition == 0) {
                    $(".tab-nav-btn.tab-prev-btn").addClass("tab-prev-btn-disabled");
                    //console.log("left nav disabled")
                } else {
                    $(".tab-nav-btn.tab-prev-btn").removeClass("tab-prev-btn-disabled");
                    //console.log("left nav enabled")
                }
            }

            $(window).resize(function () {
                TabHeaderSize();
                setTimeout(function () { TabScrollPosition(); }, 500);
            });

            $(document).click(function () {
                TabHeaderSize();
                setTimeout(function () { TabScrollPosition(); }, 500);
            });
            // Tab Header Scroll Position

            // Tab Header Scroll assign
            $(document).on("click", '.tab-nav-btn.tab-prev-btn', function () {
                event.preventDefault();
                $('#tabheadcontent').animate({
                    scrollLeft: "-=400px"
                }, "slow");
            });
            $(document).on("click", '.tab-nav-btn.tab-next-btn', function () {
                event.preventDefault();
                $('#tabheadcontent').animate({
                    scrollLeft: "+=400px"
                }, "slow");

            });
            // Tab Header Scroll assign
        });
        //Widget Tab Navigator

        //CRM Maximize
        scope.btnCRMMaximize = function () {
            $(".crm-min-max-btn .crm-minbtn").removeClass("hide");
            $(".crm-min-max-btn .crm-maxbtn").addClass("hide");
            $(".widget--widget-home-screenpop").addClass("activefullscreen");
        };

        //CRM Minimize  
        scope.btnCRMMinimize = function () {
            $(".crm-min-max-btn .crm-minbtn").addClass("hide");
            $(".crm-min-max-btn .crm-maxbtn").removeClass("hide");
            $(".widget--widget-home-screenpop").removeClass("activefullscreen");
        };

        scope.btnOkMessagePopup_click = function () {

            scope.okMessagePopup(scope);
        };

        scope.btnCancelMessagePopup_click = function () {

            scope.cancelMessagePopup(scope);
        };
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