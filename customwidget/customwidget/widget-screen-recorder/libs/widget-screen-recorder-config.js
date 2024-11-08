function LoadScreenRecorderConfiguration(scope) {

    scope.WriteLog(INFO, "LoadScreenRecorderConfiguration ->  START");
   
    scope.recordingUrl = [
        "https://dewaserv6817.dewa.gov.ae:3020/servlet/eQC6?&interface=ISessionManagement&method=deliverevent"
        ,"http://dewaserv6818.dewa.gov.ae:3020/servlet/eQC6?&interface=ISessionManagement&method=deliverevent"
    ] 
	
	scope.taggingUrl = [
		"https://dewaserv6817.dewa.gov.ae:3020/servlet/eQC6?interface=IContactManagement&method=deliverevent"
		,"https://dewaserv6818.dewa.gov.ae:3020/servlet/eQC6?interface=IContactManagement&method=deliverevent"
    ] 
   
    scope.WriteLog(INFO, "LoadScreenRecorderConfiguration ->  END");

}

 