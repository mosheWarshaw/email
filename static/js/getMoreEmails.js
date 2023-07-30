export {GetMoreEmails};

class GetMoreEmails{
    credentials;
    emailsObj;
    constructor(credentials, emailsObj){
        this.credentials = credentials;
        this.emailsObj = emailsObj;
    }

    
    /*Example: The group size is 25 and the user has emails 50 emails in
    their inbox, and the user has emails 26 through 50 from when they
    logged in. Calling this method will tell the server to send the
    user emails 1 through 25.*/
    getOldGroup(){
        let objToSend = {
            "username" : this.credentials.username,
            "password" : this.credentials.password,
            "type" : "web",
            "hasEndEmailNum" : true,
            "startEmailNum" : this.emailsObj.emailNumOfOldestEmail - this.emailsObj.getGroupSize() - 1,
            "endEmailNum" : this.emailsObj.emailNumOfOldestEmail - 1
        };
        let thisObj = this;
        $.ajax({
            url: "/getEmails",
            type: "POST",
            data: JSON.stringify(objToSend),
            contentType: "application/json",
            dataType: "json",
            success: function(returnedData){
                thisObj.onGetOldGroupSuccess(returnedData)
            },
            error: thisObj.onErr
        });
    }


    onGetOldGroupSuccess(returnedData){
        if(returnedData.hasMessage){
            alert(returnedData.message);
        }
        else{
            this.emailsObj.addAGroupOfEmails(returnedData.emails);
            let emailGroupNum = this.emailsObj.getNumOfEmailGroups() - 1;
            this.emailsObj.emailNumOfOldestEmail = returnedData.emails[0].emailNum;
            for(let i = returnedData.emails.length - 1; i > -1; i--){
                $("article").append(
                    "<div class='sender' id='se" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].sender + "</div>" +
                    "<div class='subject' id='su" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].subject + "</div>" +
                    "<div class='dt_tm' id='dt" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].dt_tm + "</div>"
                );
            }
        }
    }
    


    
    refreshInbox(){
        let objToSend = {
            "username" : this.credentials.username,
            "password" : this.credentials.password,
            "type" : "web",
            "startEmailNum" : this.emailsObj.emailNumOfNewestEmail,
            "hasEndEmailNum" : false
        };
        let thisObj = this;
        $.ajax({
            url: "/getEmails",
            type: "POST",
            data: JSON.stringify(objToSend),
            contentType: "application/json",
            dataType: "json",
            success: function(returnedData) {
                thisObj.onRefreshInboxSuccess(returnedData);
            },
            error: thisObj.onErr
        });
    }


    onRefreshInboxSuccess(returnedData){
        if(returnedData.hasMessage){
            alert(returnedData.message);
        }
        else{
            this.emailsObj.addAGroupOfEmails(returnedData.emails);
            this.emailsObj.emailNumOfNewestEmail = returnedData.emails[returnedData.emails.length - 1].emailNum;
            let emailGroupNum = this.emailsObj.getNumOfEmailGroups() - 1;
            for(let i = 0; i < returnedData.emails.length; i++){
                $("article").prepend(
                    "<div class='sender' id='se" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].sender + "</div>" +
                    "<div class='subject' id='su" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].subject + "</div>" +
                    "<div class='dt_tm' id='dt" + emailGroupNum + ";" + i + "'>" + returnedData.emails[i].dt_tm + "</div>"
                );
            }
        }
    }

 
    onErr(jqXhr){
        alert(jqXhr.status + " " + jqXhr.responseText);
    }
}