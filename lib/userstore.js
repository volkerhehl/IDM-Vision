'use strict'

const User = include('lib/user')



class UserStore {
    constructor() {
        this.users = []
    }

    addUser(params) {
        const user = new User(params)
        this.users.push(user)
        return user
    }

    find(name) {
        return this.users.find(u => u.name === name)
    }
}



module.exports = new UserStore()
