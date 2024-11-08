angular.module('47ec6ddf-2581-43c1-b2d4-7bf993188939', [
  'core.services.WidgetAPI'
]).directive('widgetHomeDashboard', widgetComponent);

//var widgetHostedURLHomeDashboard = "https://DEWASERV6573.dewa.gov.ae:8443/customwidget/"; 

var widgetHostedURLHomeDashboard = "https://10.15.132.210:8443/customwidget/";
//var widgetHostedURLHomeDashboard = "https://192.168.1.128:8443/";

$.getScript(widgetHostedURLHomeDashboard + "widget-home-dashboard/libs/widget-home-dashboard-config.js", function () {
    console.log("%c WIDGET-HOME-DASHBOARD - widget-home-dashboard-config.js loaded successfully.", "color:green;font-weight: bold");
});

$.getScript(widgetHostedURLHomeDashboard + "widget-home-dashboard/libs/widget-home-dashboard-custom.js", function () {
    console.log("%c WIDGET-HOME-DASHBOARD - widget-home-dashboard-custom.js loaded successfully.", " color:green;font-weight: bold");
});

function widgetComponent(WidgetAPI, $timeout) {


  function widgetContainer(scope, element, params) {
    // Create a new instance of the Widget API
      var api = new WidgetAPI(params);

      scope.widgetHostedURLHomeDashboard = widgetHostedURLHomeDashboard;
      scope.IS_CONSOLE_LOG_ENABLE = true;
      scope.configuration = api.getConfiguration();
      scope.agentID = scope.configuration.handle;
      scope.timeout = $timeout;
      console.log("WIDGET-HOME-DASHBOARD : starts");
       
      InitLogHomeDashboard(scope);
      LoadConfigurationHomeDashboard(scope);
      InitMethodsInsideScopeHomeDashboard(scope);

      scope.createDefaultTab(scope, $timeout);

      api.onDataEvent('onNavigationEvent', function (data) {
        scope.navigationEvent(scope,data)
      });

      api.onDataEvent('onMessengerTabChange', function (data) {
        scope.messengerTabChange(scope,data)
      });


      var previousActiveTabIndex = 0;

      $(document).on("click", '.widget-home-dashboard-tab-container .widget-home-dashboard-tab-header .widget-tab-switcher', function (event) {

          $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");

          $(this).addClass("widget-tabhead-active");

          if ((event.type === "keypress" && event.which === 13) || event.type === "click") {

              var tabClicked = $(this).data("tab-index");

              if (tabClicked != previousActiveTabIndex) {
                  $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-body .widget-tab-container').each(function () {

                      if ($(this).data("tab-index") == tabClicked) {

                          $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");
                          $(this).addClass("widget-tabcontainer-active");
                          previousActiveTabIndex = $(this).data("tab-index");

                          return;
                      }
                  });
              }
          }
      });

      //Refresh button Click
      $(document).on("click", '.widget-home-dashboard-tab-container .home-screenpop-refresh-btn', function () {

          scope.WriteLog(DEBUG, 'Refresh button Click  -> Start');


          var btn_URL = $(this).attr('data-url')
          var btn_tabId = $(this).attr('data-tabId')
          scope.refreshTab(scope, btn_tabId,btn_URL);

          scope.WriteLog(DEBUG, 'Refresh button click  -> End');
      });


      $(document).ready(function () {

          function TabHeaderSize() {
              var tabheaderOuterWidth = $('#tabheadcontent').outerWidth();
              var tabheaderScrollWidth = $('#tabheadcontent')[0].scrollWidth;
              if (tabheaderOuterWidth < tabheaderScrollWidth) {

                  $(".widget-home-dashboard-tab-header-container").addClass("tab-nav-active");
              } else {
                  $(".widget-home-dashboard-tab-header-container").removeClass("tab-nav-active");
              }
          }

          function TabScrollPosition() {

              var tabheaderOuterWidth = $('#tabheadcontent').outerWidth();
              var tabheaderScrollWidth = $('#tabheadcontent')[0].scrollWidth;
              var tabheaderScrollposition = tabheaderScrollWidth - tabheaderOuterWidth;
              var tabheaderScrollLeftposition = $('#tabheadcontent').scrollLeft();
              if (tabheaderScrollposition == tabheaderScrollLeftposition) {
                  $(".tab-nav-btn.tab-next-btn").addClass("tab-next-btn-disabled");
              } else {
                  $(".tab-nav-btn.tab-next-btn").removeClass("tab-next-btn-disabled");
              }
              if (tabheaderScrollLeftposition == 0) {
                  $(".tab-nav-btn.tab-prev-btn").addClass("tab-prev-btn-disabled");
              } else {
                  $(".tab-nav-btn.tab-prev-btn").removeClass("tab-prev-btn-disabled");
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

      });

     

      //CRM Maximize
      scope.btnCRMMaximize = function () {
          $(".crm-min-max-btn .crm-minbtn").removeClass("hide");
          $(".crm-min-max-btn .crm-maxbtn").addClass("hide");
          $(".widget-home-dashboard").addClass("activefullscreen");
      };

      //CRM Minimize  
      scope.btnCRMMinimize = function () {
          $(".crm-min-max-btn .crm-minbtn").addClass("hide");
          $(".crm-min-max-btn .crm-maxbtn").removeClass("hide");
          $(".widget-home-dashboard").removeClass("activefullscreen");
      };

    // Called automatically when the widget is destroyed
    element.on('$destroy', function() {
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