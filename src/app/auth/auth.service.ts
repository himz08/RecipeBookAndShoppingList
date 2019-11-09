import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';

export interface AuthResponseData {

    idToken : string,
    email : string,
    refreshToken : string,
    expiresIn : string,
    localId : string,
    registered?: string;
}

@Injectable({
    providedIn : 'root'
})
export class AuthService {

    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer : any;

    constructor(private http : HttpClient, private route : Router){
    }

    signup(email : string, pass : string){
       return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDG3Pp4dugNF7FBjBwmxmJukhl5IVXRErs',{
            email : email,
            password : pass,
            returnSecureToken : true
        }).pipe(catchError(this.handleError))

    }

    login(email : string, pass : string) {
        return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDG3Pp4dugNF7FBjBwmxmJukhl5IVXRErs',{
            email : email,
            password : pass,
            returnSecureToken : true
        }).pipe(catchError(this.handleError) , tap(resData => {
            this.handleAuthentication(resData);
        }))
    }

    autoLogin() {
        const user : {
            email : string,
            id : string,
            _token : string,
            _tokenExpirationDate : string
        } = JSON.parse(localStorage.getItem('user'));
        if(!user){
            return;
        }
        const loadedUser = new User(user.email, user.id, user._token, new Date(user._tokenExpirationDate));
        this.user.next(loadedUser);
        const remainingExpirationTime = new Date(user._tokenExpirationDate).getTime() - (new Date().getTime())
        this.autoLogout(remainingExpirationTime);
    }

    private handleError(errorRes : HttpErrorResponse){
        let errMsg = 'An unknown error occured';
        if(!errorRes.error || !errorRes.error.error){
            return throwError(errMsg)
        }
        else {
            switch (errorRes.error.error.message){
                case "EMAIL_EXISTS" :
                errMsg = 'This email is already exists.'
                break;
                case 'EMAIL_NOT_FOUND' :
                    errMsg = 'Email is not registered'
                    break;
            }
            return throwError(errMsg)
        }
     }

     private handleAuthentication(resposneData : AuthResponseData){
         const expirationTime = new Date( new Date().getTime() + (+resposneData.expiresIn * 1000));
         const user = new User(resposneData.email , resposneData.localId , resposneData.idToken, expirationTime); 
         console.log(user);
         this.user.next(user);
         this.autoLogout(+resposneData.expiresIn * 1000)
         localStorage.setItem('user', JSON.stringify(user));
     }

     logout(){
         this.user.next(null);
         localStorage.clear();
         this.route.navigate(['/auth']);
         if(this.tokenExpirationTimer){
                clearTimeout(this.tokenExpirationTimer)       
            }
            this,this.tokenExpirationTimer = null;
                }
    

     autoLogout(expirationTime){
       this.tokenExpirationTimer =  setTimeout(() =>{
             this.logout();
         },expirationTime)
     }
}