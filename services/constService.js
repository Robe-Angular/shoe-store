const service ={
    messageError : (res,errorId,message) => {
        res.status(errorId).send({message:message})
    },
    regexLowerCase: (stringToRegex) => {
        let regex = new RegExp(`^${stringToRegex}$`, 'i');
        return regex;
    }
}
module.exports = service;