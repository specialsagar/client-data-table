import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { catchError, finalize } from 'rxjs/operators';
import { DataServiceService } from './data-service.service';

@Injectable({
  providedIn: 'root'
})
export class ClientDataService  implements DataSource<any> {
    
  private listenerSubject = new BehaviorSubject<any[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();

  constructor(private dataService: DataServiceService) {}

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.listenerSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.listenerSubject.complete();
    this.loadingSubject.complete();
  }

  loadClients(_sort = "id", _order = "asc", _page = 0, _limit = 20, _search_filter = "", _status="") {

    this.loadingSubject.next(true);

    this.dataService
      .findClients(_sort, _order, _page, _limit, _search_filter, _status)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(
        clients => {this.listenerSubject.next(clients)});
  }

  removeClient(id, _sort, _order, _page, _limit, _search_filter, _status) {

    this.loadingSubject.next(true);
    this.dataService.removeClient(id).then(res => {
    this.dataService
      .findClients(_sort, _order, _page, _limit, _search_filter, _status)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(clients => this.listenerSubject.next(clients));
    })
  }


  modifyClient(data, _sort, _order, _page, _limit, _search_filter, _status) {
    this.loadingSubject.next(true);
    this.dataService.modifyClient(data.id, data).then(res => {
    this.dataService
      .findClients(_sort, _order, _page, _limit, _search_filter, _status)
      .pipe(
        catchError(() => of([])),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(clients => this.listenerSubject.next(clients));
    })
  }
}
