class MsgObject {
    constructor(user, msg) {
        this.msg = msg;
        this.user = user;
        this.date = new Date();
    }
    deleteMsg() {
        delete this;
    }
    editMsg(newMsg){
        this.msg = newMsg;
    }
}

