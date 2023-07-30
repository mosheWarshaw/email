export {DisplayHomePage};

class DisplayHomePage{
    emailsObj;
    constructor(emailsObj){
        this.emailsObj = emailsObj;
    }

    
    displayHomePage(data){
        $("body").html(data.html);
        
        //If an empty arr was sent then it's read as an empty string.
        if(data.emails != "") {
            this.emailsObj.addAGroupOfEmails(data.emails);
            this.emailsObj.emailNumOfOldestEmail = data.emails[0].emailNum;
            this.emailsObj.emailNumOfNewestEmail = data.emails[data.emails.length - 1].emailNum;

            let emailGroupNum = 0;
            /*In each group of emails, the first is the oldest email
            in the group, and the last is th newest of the group.
            So iterating through the group backwards sets up the
            email previews so that the top email preview in the
            artcile is the newest email of the inbox.*/
            for(let i = data.emails.length - 1; i > -1; i--){
                /*I seaprate the sender, subject, and dt_tm into separate
                divs so they can have separate css done to them.
                The 3 of these are the email preview for
                a certain email. Clicking on one of them will
                have the body (and provide a link to download the file
                attached to the body) of this email displayed.*/
                $("article").append(
                    "<div class='sender' id='se" + emailGroupNum + ";" + i + "'>" + data.emails[i].sender + "</div>" +
                    "<div class='subject' id='su" + emailGroupNum + ";" + i + "'>" + data.emails[i].subject + "</div>" +
                    "<div class='dt_tm' id='dt" + emailGroupNum + ";" + i + "'>" + data.emails[i].dt_tm + "</div>"
                );
            }
        }
    }
}