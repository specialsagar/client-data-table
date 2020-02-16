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
  displayedColumns: string[] = ['name', 'contact', 'organization', 'candidates', 'meetings', 'status', 'actions'];
  data: any[] = [];
  clone: any;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('filter', { static: true }) filter: ElementRef;

  constructor(
    private dataService: DataServiceService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource = new ClientDataService(this.dataService);
    this.dataSource.loadClients('id', 'asc', 1, 20, '');
  }

  loadClients() {
    this.dataSource.loadClients(this.sort.active, this.sort.direction, (this.paginator.pageIndex + 1), this.paginator.pageSize, this.filter.nativeElement.value);
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
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

    merge(this.sort.sortChange, this.paginator.page)
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
        this.dataSource.removeClient(element.id,this.sort.active, this.sort.direction, (this.paginator.pageIndex + 1), this.paginator.pageSize, this.filter.nativeElement.value);
      }
    });
  }

  discardChanges(element) {
    delete element.isEdit;
    element.name = this.clone.name;
    element.contact = this.clone.contact;
    element.organization = this.clone.organization;
    element.candidates = this.clone.candidates;
    element.meetings = this.clone.meetings;
    element.status = this.clone.status
  }

  save(element): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: { message: 'Are you sure you want to save the changes?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        delete element.isEdit;
        this.dataSource.modifyClient(element, this.sort.active, this.sort.direction, (this.paginator.pageIndex + 1), this.paginator.pageSize, this.filter.nativeElement.value);
      }
    });
  }
}
