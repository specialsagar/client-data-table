import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { DataServiceService } from './services/data-service.service';
import { ClientDataService } from './services/client-data.service';
import { tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'client-datatables';
  dataSource: ClientDataService;  //client datasource
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  data: any[] = [];
  clone: any;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild('name', { static: true }) sortName: MatSort;
  @ViewChild('organization', { static: true }) sortOrg: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  constructor(
    private dataService: DataServiceService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource = new ClientDataService(this.dataService);
    this.dataSource.loadClients();
  }

  loadClients() {
    this.dataService.findClients.apply(null, ...this.getParams());
  }

  ngAfterViewInit() {
    this.sortName.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.sortOrg.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    this.paginator.page.pipe(tap(() => this.loadClients())).subscribe();


    fromEvent(this.filter.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 1;
          this.loadClients();
        })
      ).subscribe();

    merge(this.sortOrg.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadClients())
      )
      .subscribe();
      
    merge(this.sortName.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadClients())
      )
      .subscribe();
  }

  edit(element) {
    this.clone = { ...element };
    element.isEdit = true;
  }

  delete(element): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to delete this row?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let params = this.getParams();
        params.unshift(element);
        this.dataSource.removeClient.apply(this, ...params);
      }
    });
  }

  discardChanges(element) {
    element = { ...this.clone };
  }

  save(element): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to save the changes?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let params = this.getParams();
        delete element.isEdit;
        params.unshift(element);
        this.dataSource.modifyClient.apply(this, ...params);
      }
    });
  }

  getParams(): Array<any> {
    if (this.sortOrg.active) {
      return ['organization', this.sortName.direction, (this.paginator.pageIndex + 1), this.paginator.pageSize, this.filter.nativeElement.value]
    } else {
      return ['name', this.sortName.direction, (this.paginator.pageIndex + 1), this.paginator.pageSize, this.filter.nativeElement.value]
    }
  }
}
