import { Directive, ViewContainerRef } from '@angular/core'

@Directive({
    selector : '[placeHolder]'
})
export class PlaceHolder {
    constructor( public viewContainerRef : ViewContainerRef ) {}

}