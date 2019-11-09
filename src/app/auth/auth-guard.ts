
import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router'
import { AuthService } from './auth.service'
import { Observable } from 'rxjs'
import { take, map } from 'rxjs/operators'
@Injectable({
    providedIn : 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService : AuthService, private route : Router )   {}
    canActivate(route : ActivatedRouteSnapshot , state : RouterStateSnapshot) : boolean | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
        
       return this.authService.user.pipe(map (user => {
            const isAuth = !!user;
            if(isAuth){
                return true;
            }
            else {
                return this.route.createUrlTree(['/auth']);
            }
        }))


    }
}