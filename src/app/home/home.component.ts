import { Component } from '@angular/core';

import { Account } from '@app/_models';
import { AccountService } from '@app/_services';

@Component({ templateUrl: 'home.component.html' })
export class HomeComponent {
    account: Account;

    constructor(private accountService: AccountService) {
        this.account = this.accountService.userValue;
    }
}