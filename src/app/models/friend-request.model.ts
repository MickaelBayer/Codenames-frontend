// tslint:disable: variable-name

import { Account } from './account.model';

export class FriendRequest {
    constructor(
        public id: number,
        public sender: Account,
    ) { }
}
