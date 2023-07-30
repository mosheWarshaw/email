export {Emails};

class Emails{
    /*When a group of emails is received it's pushed onto this arr.
    This arr is going to be a 2d arr, because each group of emails
    pushed onto it is in an arr. Note, the second group of emails
    could be emails that are older or newer than the 1st group (depending on
    if you refreshed yor inbox (in which case the 2nd group could be newer
    emails) or got a  group of old emails (in which case the
    2nd group would be older emails.)).*/
    #emailGroups = [];

    #GROUP_SIZE;
    emailNumOfOldestEmail = -1;
    emailNumOfNewestEmail = -1;
    constructor(groupSizePar){
        this.#GROUP_SIZE = groupSizePar;
    }

    getNumOfEmailGroups(){
        return this.#emailGroups.length;
    }

    getBody(groupIndex, emailIndex){
        return this.#emailGroups[groupIndex][emailIndex].body;
    }

    getFileIsIncluded(groupIndex, emailIndex){
        return this.#emailGroups[groupIndex][emailIndex].fileIsIncluded;
    }

    getSender(groupIndex, emailIndex){
        return this.#emailGroups[groupIndex][emailIndex].sender;
    }

    getFileName(groupIndex, emailIndex){
        return this.#emailGroups[groupIndex][emailIndex].fileName;
    }

    addAGroupOfEmails(groupOfEmails){
        this.#emailGroups.push(groupOfEmails);
    }

    getGroupSize(){
        return this.#GROUP_SIZE;
    }
}