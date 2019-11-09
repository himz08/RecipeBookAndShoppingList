import { Component, ComponentFactoryResolver, ViewChild, OnDestroy } from '@angular/core';
import { NgForm, Form } from '@angular/forms';
import { AuthService, AuthResponseData } from './auth.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AlertComponent } from '../shared/alert/alert/alert.component';
import { PlaceHolder } from '../shared/placeholder.directive';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{

  constructor( private authService : AuthService, private route : Router, private componentFactoryResolver : ComponentFactoryResolver){}
  isLoginMode = true;
  isLoading = false;
  error : string = null;
  closeSub : Subscription;
  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

@ViewChild(PlaceHolder, {static : false}) alertHost;
  onSubmit(form: NgForm) {

    if(!form.valid){
      return;
    }
    const email = form.value.email;
    const pass = form.value.password;

    let obs : Observable<AuthResponseData>;

    if(this.isLoginMode){
      this.isLoading = true;
      obs = this.authService.login(email,pass);
    }
    else {
      this.isLoading = true;
      obs = this.authService.signup(email,pass);
    }

      obs.subscribe((data) => {
        this.route.navigate(['/recipes']);
        this.isLoading = false;
        console.log(data);
      },
      errorMsg => {
        this.isLoading = false;
        this.error = errorMsg;
        this.createAlertComp();
      })    

    console.log(form.value);
    form.reset();

  }

  createAlertComp(){
    const factoryResolver = this.componentFactoryResolver.resolveComponentFactory(AlertComponent);

    const hostRef = this.alertHost.viewContainerRef;

    hostRef.clear();

    const comRef = hostRef.createComponent(factoryResolver);
    comRef.instance.message = this.error;
    this.closeSub = comRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      hostRef.clear();
    })

  }

  closeAlert(){
    this.error = null;
  }

  ngOnDestroy(){
    if(this.closeSub){
      this.closeSub.unsubscribe();
    }
  }
}
