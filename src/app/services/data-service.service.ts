import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { resolve } from 'url';

const clientsDataURL = "http://localhost:3000/clients";

@Injectable({
  providedIn: "root"
})
export class DataServiceService {
  constructor(private http: HttpClient) {}
  
  findClients(_sort = "id", _order = "ASC", _page = 0, _limit = 20, _search_filter = ""): Observable<any[]> {
    return this.http.get(clientsDataURL, {
        params: new HttpParams()
          .set("_sort", _sort)
          .set("_order", _order)
          .set("_page", _page.toString())
          .set("_limit", _limit.toString())
          .set("name", _search_filter)
      })
      // use the map() operator to return the data property of the response object
      // the operator enables us to map the response of the Observable stream
      // to the data value
      .pipe(map( res =>  res as any[]));
  }

  removeClient(id): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.delete(clientsDataURL + "/" + id).toPromise().then(res => {
        resolve();
      })
    })
  }

  modifyClient(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.patch(clientsDataURL, data).toPromise().then(res => {
        resolve();
      })
    })
  }
}
