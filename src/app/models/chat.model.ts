
import { Account } from './account.model';

export class PrivateChat {
    constructor(
        public id: number,
        public title: string,
        public chatImage: string,
        public users: Account[],
    ) { }
}
