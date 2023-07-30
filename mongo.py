import pymongo
from bson.json_util import dumps
import json
import os

#The database's structure: There's a collection of accounts.
#Each doc in this collection has info about a user's account.
#This doc isn't where th euser's inbox is, rather
#each user has a collection that has the stored inbox,
#and each doc in it is an email. the name of the user's inbox
#collection is their username.

client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client.emailDb
accounts = db.accounts


#Python uses GIL, which means that only one part of a
#python program can run at a time, even if the program is
#multithreaded and there are mutiple availbale processors.
#However, when a thread blocks and leaves the processor then
#GIL won't prevent another thread from running.
#In flask, each request is handled by a separate thread, so one
#thread could ask the db if a username is used, the thread will block,
#another user will send a request trying to create an account with the
#same username, and the new thread will ask the db if the username was
#used, and the db will tell both of them that the username hasn't been
#used, and both threads will create an account with the same username.
#mongo allows duplicate keys in the same collection, so 2 docs with
#the same username key will be allowed.
#my solution was to run the following line of code when creating
#the accounts collection:
#db.accounts.create_index("username", unique = True)
#This makes it that a duplicate key error will be thrown if you try to add a doc
#that has the same username as a previously added doc. So,
#in the hypothetical described above, the database will tell the
#both threads that the username isn't taken, both threads will try to
#insert their acount with the same username, the database will insert one
#of them first and throw a key err for the second, and this second thread will
#tell the user to pick a different username.
def createAccount(username, password):
    nooneElseHasTheUsername = accounts.find_one({"username" : username}) == None
    if(nooneElseHasTheUsername):
        try:
            accounts.insert_one({
                "username" : username,
                "password" : password,
                "mostRecentEmailNum" : 0,
                "contacts" : []
            })
        except: #duplicate key err thrown.
            return False
        os.mkdir("C:\\mcon353\\emailFolders\\" + username)
        return True
    return False





def insertEmail(user, sender, subject, dt_tm, body, fileIsIncluded, fileName):
    emailColl = db[user]
    mostRecentEmailNum = accounts.find_one({"username" : user})["mostRecentEmailNum"]
    thisEmailsNum = mostRecentEmailNum + 1
    emailColl.insert_one({
        "emailNum" : thisEmailsNum,
        "sender" : sender,
        "subject" : subject,
        "dt_tm" : dt_tm,
        "body" : body,
        "fileIsIncluded" : fileIsIncluded,
        "fileName" : fileName
    })
    accounts.update_one(
        {"username" : user},
        {"$set": {"mostRecentEmailNum": thisEmailsNum}}
    )




def verifyContact(sender, receiver):
    if(sender == receiver):
        #A user is able to email themself without having to add themself
        #to their contact list.
        return True
    if accounts.find_one({"username" : receiver}) == None:
        return False
    contacts = accounts.find_one({"username" : receiver})["contacts"]
    if sender in contacts:
        return True
    return False




def addContact(username, newContact):
    contactsList = accounts.find_one({"username" : username})["contacts"]   
    contactsList.append(newContact)
    accounts.update_one(
        {"username" : username},
        {"$set" : {"contacts" : contactsList}}
    )




def getContacts(username):
    if accounts.find_one({"username" : username}) != None:
        return accounts.find_one({"username" : username})["contacts"]
    return []




def getEmails(username, startIndex, endIndex):
    #Note, there won't be an error if any of the indexes are out of
    #bounds, because these aren't really indexes, rather they're
    #just values that the emailNum value should be less than or
    #equals, or greater than, in order to be returned.
    cursorToGroupOfEmails = db[username].find({
        "$and" : [
            {"emailNum" : {"$gt" : startIndex}},
            {"emailNum" : {"$lte" : endIndex}}
        ]
    })

    #dumps converts bson to json, and json.loads converts it into
    #python. If i don't do parse it into a python arr then
    #then the client will have to do it after they parse
    #the data.
    emailsAsPythonArr = json.loads(dumps(cursorToGroupOfEmails))
    return emailsAsPythonArr




def verifyCredentials(username, password):
    usersAccount = accounts.find_one({"username" : username, "password" : password})
    if usersAccount == None:
        return False
    return True




def getMostRecentEmailNum(username):
    if username in db.list_collection_names():
        return int(accounts.find_one({"username" : username})["mostRecentEmailNum"])
    return -1