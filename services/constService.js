const service ={
    messageError : (res,errorId,message) => {
        res.status(errorId).send({message:message})
    },

    ensureAdmin : (req,res,callback) => {
        const userAdmin = 'ROLE_ADMIN'
        var userRole = req.user.role;
        if(userRole == userAdmin){            
            return callback();
        }else{            
            return res.status(300).send({
                message: 'No credentials :('
            }); 
        }
    }
}
module.exports = service;