export {SendEmail};
import {GetMoreEmails} from "./getMoreEmails.js";

class SendEmail{
    credentials;
    emailsObj;
    onRefreshInboxSuccess;
    constructor(credentials, emailsObj){
        this.credentials = credentials;
        this.emailsObj = emailsObj;                                       
        this.onRefreshInboxSuccess = (new GetMoreEmails(credentials, emailsObj)).onRefreshInboxSuccess;
    }


    onSendEmailClicked(){
        let thisObj = this;
        $("#sendAnEmailDialog").html(
            "<form>" +
                "<input type='text' placeholder='Receiver' name='receiver' id='receiverInput'/>" +
                "<input type='text' placeholder='Subject' name='subject' id='subjectInput'>" +
                "<input type='file' id='fileInput' name='userFile'/>" +
                "<br/>" +
                "<textarea id='bodyInput' placeholder='Body' name='body'></textarea>" +
            "</form>"
        );
        $("#sendAnEmailDialog").dialog({
            title: "Send an Email",
            closeText: "",
            height: .9 * window.innerHeight,
            width: .8 * window.innerWidth,
            buttons:[{
                text: "Send",
                click: function(){
                    thisObj.sendTheEmail();
                }
            }]
        });
    }


    sendTheEmail() {
        let fd = new FormData(document.getElementsByTagName("form")[0]);
        
        /*Even if a bool is sent for the fileIsIncluded value, it will be
        read as a string, so i just send it as a string.*/
        let fileIsIncluded = $("#fileInput").val() == "" ? "false" : "true";

        fd.append("fileIsIncluded", fileIsIncluded);
        fd.append("sender", this.credentials.username);
        fd.append("password", this.credentials.password);
        fd.append("type", "web");
        fd.append("startEmailNum", this.emailsObj.emailNumOfNewestEmail);
        let thisObj = this;
        $.ajax({
            url : "/sendEmail/",
            method: "post",
            data: fd,
            enctype: "multipart/form-data",
            processData: false,
            contentType : false,
            cache: false,
            success: function(unparsedReturnedData){
                /*I have to parse the data from json into a js obj here
                but not in other server interactions in this website because
                in those cases I was sending and receiving json, so jquery
                automatically parsed it, but here i'm sending form data.*/
                let parsedData = JSON.parse(unparsedReturnedData);

                /*I don't just add the sent email to the article, but I refresh
                the inbox,because of the following case. If A logs into his
                account, and then B sends A an email, and then A sends
                out an email to someone. If I would just
                insert the sent email without refreshing then it would
                look like A didn't get any emails before they sent the email,
                which is inaccurate. By refreshing after the email is sent,
                A is sent B's email and A's sent email from the server.*/
                thisObj.onRefreshInboxSuccess(parsedData);
                $("#sendAnEmailDialog").dialog("close");
            },
            error: thisObj.onErr
        });
    }


    onErr(jqXhr){
        alert(jqXhr.status + " " + jqXhr.responseText);
    }
}   