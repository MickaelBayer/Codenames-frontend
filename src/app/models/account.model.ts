// tslint:disable: variable-name

export class UnRegistredAccount {
    constructor(
        public email: string,
        public username: string,
        public password: string
    ) { }
}

export class UnAuthAccount {
    constructor(
        public email: string,
        public password: string
    ) { }
}

export class Account {
    constructor(
        public id: number,
        public email: string,
        public username: string,
        public profile_image: string,
        public is_active: boolean,
        public is_staff: boolean,
        public is_admin: boolean,
        public is_authenticated: boolean,
        public hide_email: boolean,
        public date_joined: Date,
        public last_login: Date,
        public is_self: boolean,
        public is_friend: boolean,
        public request_sent: number,
        public friend_requests: Account[],
        public friend_list: Account[],
        public pending_friend_request_id: number
    ) { }
}
