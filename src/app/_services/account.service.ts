import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/_models';

@Injectable({ providedIn: 'root' })
export class AccountService {
    private userSubject: BehaviorSubject<Account>;
    public Account: Observable<Account>;

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.userSubject = new BehaviorSubject<Account>(JSON.parse(localStorage.getItem('Account')));
        this.Account = this.userSubject.asObservable();
    }

    public get userValue(): Account {
        return this.userSubject.value;
    }

    login(username, password) {
        return this.http.post<Account>(`${environment.apiUrl}/users/authenticate`, { username, password })
            .pipe(map(Account => {
                // store Account details and jwt token in local storage to keep Account logged in between page refreshes
                localStorage.setItem('Account', JSON.stringify(Account));
                this.userSubject.next(Account);
                return Account;
            }));
    }

    logout() {
        // remove Account from local storage and set current Account to null
        localStorage.removeItem('Account');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    register(Account: Account) {
        return this.http.post(`${environment.apiUrl}/Accounts/register`, Account);
    }

    getAll() {
        return this.http.get<Account[]>(`${environment.apiUrl}/Accounts`);
    }

    getById(id: string) {
        return this.http.get<Account>(`${environment.apiUrl}/Accounts/${id}`);
    }

    update(id, params) {
        return this.http.put(`${environment.apiUrl}/Accounts/${id}`, params)
            .pipe(map(x => {
                // update stored Account if the logged in Account updated their own record
                if (id == this.userValue.id) {
                    // update local storage
                    const Account = { ...this.userValue, ...params };
                    localStorage.setItem('Account', JSON.stringify(Account));

                    // publish updated Account to subscribers
                    this.userSubject.next(Account);
                }
                return x;
            }));
    }

    delete(id: string) {
        return this.http.delete(`${environment.apiUrl}/users/${id}`)
            .pipe(map(x => {
                // auto logout if the logged in Account deleted their own record
                if (id == this.userValue.id) {
                    this.logout();
                }
                return x;
            }));
    }
}