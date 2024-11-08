
function LoadWebChatConfigurationDEWA(scope) {

    scope.WriteLog(INFO, "LoadEmailConfiguration ->  START");
    //Live
    //scope.middlewareServiceUrl = "https://DEWASERV6573.dewa.gov.ae:8443";
    
    //UAT
    scope.middlewareServiceUrl = "https://dewaserv6890.dewa.gov.ae:8443";
    //scope.middlewareServiceUrl = "https://10.15.132.210:8443";
    scope.crmUrl = "https://myportal.dewa.gov.ae:7900/sap/bc/bsp/sap/crm_ui_start/default.htm";
	
	//https://myportal.dewa.gov.ae:7900/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-client=200&sap-sessioncmd=open
    scope.ContactSearchUrl = scope.middlewareServiceUrl + "/DEWAContactSearch/ContactSearch.html";
    scope.journeyAPIUrl = ' https://dewaserv6638.dewa.gov.ae/services/CustomerJourneyService/rest/customer/element/';
    
    scope.defaultMinimizeCRM = true;
    scope.defaultMinimizeCustomPanel = false;
  
    scope.defaultCategoryCode = '200';
    scope.defaultReasonCode = '200';
    scope.defaultOutcomeCode = '200';
    scope.QueryStrinSAPRole = 'ZUT_DEWA_CIS';

    scope.autoAnswer = false;
    scope.autoAnswerSec = 3;
     
    scope.lang = {
        "EN": {
            "select": "Select",
            "search": "search",  
            "LABELRecentCallNotes": "Recent Chat Notes",
            "LABELContactSearch": "Contact Search",
            "MSGCallNoteSaveSuccessHeader": "Save Chat Notes",
            "MSGCallNoteSaveSuccessMessage": "Notes Saved successfully", 
            "LABELNotes": "Notes", 
            "LABELCallAction": "Chat Action", 
            "LABELDisposition": "Disposition",
            "LABELCategory": "Category",
            "LABELOutcome": "Outcome",
            "LABELReasons": "Reasons",
            "LABELCSNotificationKey": "TYPE",
            "LABELCSNotificationValue": "VALUE",
            "LABELCRecentSearchType": "Type",
            "LABELCRecentSearchValue": "Value",
            "BUTTONRecentSearch": "Search",
            "BUTTONRecentRefresh": "Reload",
            "MSGCallNoteSearchHeader": "Search Notes",
            "MSGCallNoteSearchMessage": "No Record Found", 
        }
    } 

    scope.recentCallNoteSearch = {
        "EN": [
            { "Key": "Select", "Label": "Select" },
            { "Key": "Email", "Label": "Email" },
            { "Key": "Phone", "Label": "Phone" },
            //{ "Key": "LastVerifiedUsedAcct", "Label": "Last Verified Account" }, 
        ]
    }
     
	 scope.notificationCS = {
        "notificationList": [
            { "Key": "ServiceType", "Label": "ServiceType" },
            { "Key": "Language", "Label": "Language" },
            { "Key": "MobileNumber", "Label": "MobileNumber" },
            { "Key": "OriginType", "Label": "OriginType" },
            { "Key": "ChatbotRequired", "Label": "ChatbotRequired" },
            { "Key": "FullName", "Label": "FullName" }, 
            { "Key": "EmailAddress", "Label": "EmailAddress" },
			{ "Key": "AccountNumber", "Label": "AccountNumber" },
        ]
    };
   

    scope.WriteLog(INFO, "LoadEmailConfiguration ->  END");

};