/*The structure of the javascript in this program:
There isn't one method for each action the user can take
(there isn't one method to handle the user wanting to send
an email, for example). Rather each action is
its own class, and the class is given the data they will need to
do these actions. I'm explaining this because I want to explain why
these classes have the data as global fields instead of passed into
the methods as parameters (a method is more reusable if it has data
passed in rather than accessing the data as globals). The reason is because
the individual methods of an action aren't likely to be indivually
reused; if something would be reused it would be the collection of methods
in a class that do an action. So instead of passing the data from method to
method within a class, I make them global fields, because the reusability
of the code isn't affected.*/

/*Explanation of why you'll see the keyword "this"
be stored in a variable called "thisObj", and
using "thisObj" to access the object's fields and methods
(note, the focus of what i'm saying is about click event
callbacks, but it's also true for the ajax callbacks):
When you are in a click event handler's function "this"
refers to the clicked element, not the instance of the
class you're in. So to access the fields and methods
you would have to store the reference to the instance
in thisObj before you entered the click handler's function.
Note, "this" only refers to the clicked elem in the handler's
function. If the hadnler's function calls another function, that function's
"this" will refer to teh instance, not the clicked elem.

the following throws an err because he clicked elem
doesn't have a method called myMethod
...on("click", this.myMethod)

the following doesn't throw na error, but be aware
that "this" in myFunction will refer to the clicked elem
...on("click", thisObj.myMethod)

if you don't want the above to happen then do
...on("click", function(){
    thisObj.myMethod();
})
*/

import {Emails} from "./emails.js";
import {DisplayHomePage} from "./displayHomePage.js";
import {SetHomePageListeners} from "./setHomePageListeners.js";
import {LoginAndCreateAccount} from "./loginAndCreateAccount.js";
import {AddContact} from "./addContact.js";
import {onEmailPreviewClicked} from "./onEmailPreviewClicked.js";
import {SendEmail} from "./sendEmail.js";
import {GetMoreEmails} from "./getMoreEmails.js";


/*A benefit of the credentials being stored in an object is that I don't
have to worry about stale data. I can pass in this object to an object
before the credntials were set if I know that the object will access
the credentails only after they've been set.*/
let credentials = {username : "", password : ""};

let emailsObj = new Emails(25);
let displayHomePageObj = new DisplayHomePage(emailsObj);
let addContactObj = new AddContact(credentials);
let sendEmailObj = new SendEmail(credentials, emailsObj);
let getMoreEmailsObj = new GetMoreEmails(credentials, emailsObj);
let setHomePageListenersObj = new SetHomePageListeners(addContactObj, onEmailPreviewClicked, emailsObj, sendEmailObj, getMoreEmailsObj, credentials);
let loginAndCreateAccountObj = new LoginAndCreateAccount(credentials, "loginButton", "createAccountButton", "usernameInput", "passwordInput", "/login", "/createAccount", displayHomePageObj, setHomePageListenersObj);

loginAndCreateAccountObj.setCredentialsListeners(loginAndCreateAccountObj);