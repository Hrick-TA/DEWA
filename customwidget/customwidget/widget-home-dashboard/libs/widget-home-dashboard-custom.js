function InitMethodsInsideScopeHomeDashboard(scope) {

    var tabId = "";
	var stopAutorefresh=false;
    console.log(scope.configuration);

    scope.createDefaultTab = function (scope, timeout) {

        setTimeout(function () {
            scope.createHomeTab(scope)
        }, 3000);

    } 

    scope.navigationEvent=function(scope,data){
		
        scope.WriteLog(WARNING, "navigationEvent --> "+ JSON.stringify(data));
	
		if(scope.widgetTabid == data.tab){
			//start  auto refresh
			stopAutorefresh=false;
			
			$('#tabheadcontent li').each(function (i) { 
			
				var _tabName = $(this).text(); 
				var _tabIndex=$(this).data('tab-index');
				var _tabautorefresh=$(this).data('autorefresh');
				 
				 if(_tabautorefresh == true)
					scope.updaeRefreshQeryString(scope,_tabName,_tabIndex,'start');  
			});
		} 
		else{
		//stop auto refresh
		if(stopAutorefresh == false){
			stopAutorefresh=true;
			  $('#tabheadcontent li').each(function (i) { 
				
					 var _tabName = $(this).text(); 
					 var _tabIndex=$(this).data('tab-index');
					 var _tabautorefresh=$(this).data('autorefresh');
					
					if(_tabautorefresh == true)
						scope.updaeRefreshQeryString(scope,_tabName,_tabIndex,'stop');  
				});
			}
		}
		
    }
	scope.updaeRefreshQeryString=function(scope,tabName,index,autoRefresh){

	  for (var j = 0; j < scope.dashboardTab.dahsboardList.length; j++) {
						 
			  if(tabName==scope.dashboardTab.dahsboardList[j].TabName && scope.dashboardTab.dahsboardList[j].AutoRefresh == true){ 
			 
				 var _url = scope.prepareQueryString(scope,scope.dashboardTab.dahsboardList[j],autoRefresh);
				 $("#iframeHomeScreenpop_000" +index.toString()).attr('src', _url);
				 $("#btnRefresh_000" +index.toString()).attr('data-url',_url)
			 }	 
		}
					 
	}

    scope.messengerTabChange=function(scope,data){
        scope.WriteLog(WARNING, "messengerTabChange --> "+ JSON.stringify(data));
    }

    scope.createHomeTab = function (scope) {

        var enableAgent = false;
        var enableSupervisor = false;
        var agentJson = scope.parseJwt(scope.configuration.token);

        enableAgent = scope.getrole(agentJson, "AGENT");
        enableSupervisor = scope.getrole(agentJson, "SUPERVISOR");

        if (scope.dashboardTab.dahsboardList == undefined || scope.dashboardTab.dahsboardList == null || scope.dashboardTab.dahsboardList.length == 0) {
            scope.WriteLog(WARNING, "createHomeTab --> Please configure tab details");
            return;
        }


        for (var i = 0; i < scope.dashboardTab.dahsboardList.length; i++) {

            var reqJson=scope.dashboardTab.dahsboardList[i];
             
            if (reqJson.Role == "ALL") {
                scope.initiateIframeTab(scope,reqJson, i);
                continue;
            }

            if (enableAgent == false && reqJson.Role == "AGENT") {
                continue;
            }

            if (enableSupervisor == false && reqJson.Role == "SUPERVISOR") {
                continue;
            } 
            scope.initiateIframeTab(scope,reqJson, i);
        } 
        scope.showDefaultDashboardTab(scope, tabId);
    }

    scope.initiateIframeTab=function  (scope,reqJson, index){

        var _url = scope.prepareQueryString(scope,reqJson,'');

        var JSONTabItem = {

            "title": reqJson.TabName, "tabId": "000" + index.toString(), "url": _url, "RefreshButtonEnable": reqJson.RefreshButtonEnable, "autorefresh": reqJson.AutoRefresh
        };

        if (tabId == "")
            tabId = JSONTabItem.tabId;

        scope.appendTabHeader(JSONTabItem, index);
        scope.appendTabBody(JSONTabItem, index);
    }

    scope.showDefaultDashboardTab = function (scope, tabId) {

        scope.WriteLog(DEBUG, `showDefaultDashboardTab --> Start Fcocus to the crm tab - ${tabId}`);

        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");
        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");

        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-header .widget-tab-switcher#tab_' + tabId).addClass("widget-tabhead-active");
        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-body .widget-tab-container#tab_' + tabId).addClass("widget-tabcontainer-active");

        scope.WriteLog(DEBUG, "showDefaultDashboardTab --> End");
    }


    //Append Tab Header
    scope.appendTabHeader = function (data, tabIndex) {
        scope.WriteLog(DEBUG, 'appendTabHeader -> Start');

        var tab_header = $(".widget-home-dashboard-tab-header");
        var ul_count = tabIndex;

        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-header .widget-tab-switcher').removeClass("widget-tabhead-active");
        $('.widget-home-dashboard-tab-container .widget-home-dashboard-tab-body .widget-tab-container').removeClass("widget-tabcontainer-active");
        //data.RefreshButtonEnable ==true
        
        
        var _tab = "<li id=\"tab_" + data.tabId + "\" class=\"widget-tab-switcher widget-tab-switcher-default widget-tabhead-active\" data-autorefresh=\"" + data.autorefresh + "\" data-tab-index=" + ul_count + " tabindex=\"0\">" + data.title + "";
        if (data.RefreshButtonEnable == true)
            _tab += "<button  id=\"btnRefresh_" + data.tabId + "\" data-tabId=\"" + data.tabId + "\" data-autorefresh=\"" + data.autorefresh + "\" data-url=\"" + data.url + "\"class=\"widget-refreshBtn home-screenpop-refresh-btn \"></button>"

        _tab += "</li>";

        tab_header.append(_tab);
        scope.WriteLog(DEBUG, 'appendTabHeader -> End');
    };

    //Append Tab Body
    scope.appendTabBody = function (data, tabIndex) {

        scope.WriteLog(DEBUG, 'appendTabBody -> Start');

        var ul_count = tabIndex;
        var tab_body = $(".widget-home-dashboard-tab-body");
        var _tabFrame = "";

        _tabFrame += "<div id=\"tab_" + data.tabId + "\" class=\"widget-tab-container widget-tabcontainer-active\" data-tab-index=" + ul_count + ">";
       
        _tabFrame += "<div class=\"home-screenpop-widget-iframe-container\">";
        _tabFrame += "<iframe class=\"home-screenpop-widget-iframe\" width=\"500\" height=\"200\" id=\"iframeHomeScreenpop_" + data.tabId + "\" name=\"iframeHomeScreenpop_" + data.tabId + "\" src=" + data.url + "></iframe>";
        _tabFrame += "</div></div>";
        tab_body.append(_tabFrame);

        scope.WriteLog(DEBUG, 'appendTabBody -> End');
    };

    scope.refreshTab = function (scope, tab_id, URL) {

        scope.WriteLog(DEBUG, 'refreshTab -> Start');

        $("#iframeHomeScreenpop_" + tab_id).attr('src', URL);

        scope.WriteLog(DEBUG, 'refreshTab -> End');

    };

    //Decode AWT token
    scope.parseJwt = function (token) {
         ;
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

         
        return JSON.parse(jsonPayload);
    };

    scope.getrole = function (JsonAgent, role) {
         

        if (JsonAgent == undefined) {
            return false;
        }
        for (var i = 0; i < JsonAgent.userScopeList.length; i++) {

            if (JsonAgent.userScopeList[i].featureName == "ccUserRole") {

                for (var j = 0; j < JsonAgent.userScopeList[i].featureValues.length; j++) {

                    if (JsonAgent.userScopeList[i].featureValues[j] == role) {
                        return true
                    }
                }
                return false;
            }
        }
    }

    scope.prepareQueryString = function (scope, reqJson,enableRefresh) {

        var config = scope.configuration;
        var url=reqJson.URL;

        url = url.replace("#AGENTID#", config.agentId)
        url = url.replace("#STATIONID#", config.stationId)
        url = url.replace("#DISPLAYNAME#", config.displayName)
        url = url.replace("#HANDLE#", config.handle)
        url = url.replace("#REFRESH#",enableRefresh) 

        return url;
    }
} 
 

function InitLogHomeDashboard(scope) {
    /** * Declaration Start */
    scope.DEBUG = 'DEBUG';
    scope.INFO = 'INFO';
    scope.ERROR = 'ERROR';
    scope.WARNING = 'WARNING';
    scope.WIDGET_NAME = 'WIDGET-HOME-DASHBOARD';


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