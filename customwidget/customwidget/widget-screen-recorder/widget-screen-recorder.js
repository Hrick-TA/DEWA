angular.module('e0503d56-8179-4125-9426-aa74464e12ac', [
    'core.services.WidgetAPI'
]).directive('widgetScreenRecorder', widgetComponent);


//var widgetEmailURL = "https://DEWASERV6573.dewa.gov.ae:8443/customwidget/";
var widgetEmailURL = "https://10.15.132.210:8443/customwidget/";

$.getScript(widgetEmailURL + "widget-screen-recorder/libs/widget-screen-recorder-config.js", function () {
    console.log("%c WIDGET SCREEN RECORDER- widget-screen-recorder-config.js loaded successfully.", "color:#ff00ff;font-weight: bold");
});

$.getScript(widgetEmailURL + "widget-screen-recorder/libs/widget-screen-recorder-custom.js", function () {
    console.log("%c WIDGET SCREEN RECORDER - widget-screen-recorder-custom.js loaded successfully. ", " color:#ff00ff;font-weight: bold");
});

function widgetComponent(WidgetAPI, $q, $cookies, store, $location, $http, $window, $sce, $interval, $timeout) {

    function widgetContainer(scope, element, params) {

        // Create a new instance of the Widget API
        var api = new WidgetAPI(params); 

        InitScreenRecorderLog(scope);
        LoadScreenRecorderConfiguration(scope);
        InitScreenRecorderMethodsInsideScope(scope);

        scope.configuration = api.getConfiguration();
        scope.widgetLanguage = api.getConfiguration().locale.id.toString() == "en-us" ? "EN" : "AR";
        scope.isSecure = document.location.protocol == 'https:' ? 'https://' : 'http://';
        scope.agentHandle = scope.configuration.handle;

        scope.objCardFocusedEvent = '';
        scope.JsonList = new Map(); 
        scope.recordingInteractionID = ''; 
        scope.recordingWorkrequestId= '';
        scope.recordingState = false;
        scope.recordingChannel = '';
        scope.recordingANI = '';
        scope.recordingEmail = '';
        scope.foucsedInteractionId = false;

        scope.WriteLog(DEBUG, "Configuration - " + JSON.stringify(scope.configuration));


        // Insert your widget code here
        api.onDataEvent('onCardFocusedEvent', function (data) {

            scope.WriteLog(DEBUG, "onCardFocusedEvent --> " + JSON.stringify(data)); 
            scope.onCardFocused(scope,api, data);
            
        });

        //api.onDataEvent('onNavigationEvent', function (data) { 

        //    scope.WriteLog(DEBUG, "onNavigationEvent --> " + JSON.stringify(data));

        //}); 
       

        api.onDataEvent('onAnyInteractionEvent', function (data) {

            scope.WriteLog(DEBUG, "onAnyInteractionEvent --> " + JSON.stringify(data));

            scope.onAnyInteraction(scope,api, data); 
        });

        api.onDataEvent('onAnyInteractionEndedEvent', function (data) {

            scope.WriteLog(DEBUG, "onAnyInteractionEndedEvent --> " + JSON.stringify(data));  
            scope.onAnyInteractionEnded(scope,api,data)
        });

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