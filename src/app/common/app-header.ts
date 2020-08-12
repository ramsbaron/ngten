import { Component, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { fromEvent, Subject } from 'rxjs';
import { distinctUntilChanged, map, pairwise, takeUntil, throttleTime } from 'rxjs/operators';
import { animate, state, style, transition, trigger } from '@angular/animations';

export enum VisibilityState {
  Visible = 'visible',
  Hidden = 'hidden'
}

export enum Direction {
  None = 'None',
  Up = 'Up',
  Down = 'Down'
}

/**
 * @title Basic toolbar
 */
@Component({
  selector: 'app-header',
  templateUrl: 'app-header.html',
  styleUrls: ['app-header.css'],
  animations: [
    trigger('scrollAnimation', [
      state(VisibilityState.Visible, style({
        transform: 'translateY(0)'
      })),
      state(VisibilityState.Hidden, style({
        transform: 'translateY(-64px)' // adjust this to the height of your header
      })),
      transition(`${VisibilityState.Visible} => ${VisibilityState.Hidden}`, animate('300ms')),
      transition(`${VisibilityState.Hidden} => ${VisibilityState.Visible}`, animate('300ms'))
    ])
  ]
})
export class AppHeader implements AfterViewInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  isHeader1Visible = VisibilityState.Visible;
  isHeader2Visible = VisibilityState.Hidden;
  slideHeader2InAtPosition = 50;

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngAfterViewInit() {
    // create an observable stream of scroll positions and map them to UP / DOWN directions
    const content = document.querySelector('.scrollWrapper');
    const scroll = fromEvent(window, 'scroll').pipe( // if the scroll events happen on your window you could use 'window' instead of 'content' here
      throttleTime(500),
      map(() => window.pageYOffset), // if you used 'window' above replace 'content.scrollTop' with 'window.pageYOffset'
      pairwise(),
      map(([y1, y2]): Direction => {
        //console.log(y1, y2);
        // if (y2 < y1) {
        //   if (y2 < this.slideHeader2InAtPosition) {
        //     return Direction.Up;
        //   } else {
        //     return Direction.None;
        //   }
        // } else {
        //   if (y2 > this.slideHeader2InAtPosition) {
        //     return Direction.Down;
        //   } else {
        //     return Direction.None;
        //   }
        // }
        return (y2 < y1 ? Direction.Up : (y2 > this.slideHeader2InAtPosition ? Direction.Down : Direction.None) );
        //return ( y2 < y1 ? Direction.Up : Direction.Down );
      }),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    // subscribe to the UP / DOWN scroll direction stream and set the header state accordingly
    scroll.subscribe(dir => {
      switch (dir) {
        case Direction.Down:
          console.log('scrolling down', window.pageYOffset);
          //if (window.pageYOffset < this.slideHeader2InAtPosition) {break;}
          this.isHeader1Visible = VisibilityState.Hidden;
          this.isHeader2Visible = VisibilityState.Visible;
          break;
        case Direction.Up:
          console.log('scrolling up', window.pageYOffset);
          //if (window.pageYOffset > this.slideHeader2InAtPosition) {break;}
          this.isHeader1Visible = VisibilityState.Visible;
          this.isHeader2Visible = VisibilityState.Hidden;
          break;
        default:
          console.log('Do Nothing', dir);
      }        
    });
  }

}


/**  Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */