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
    let params = new HttpParams();
    if(_search_filter) {
      // dirty fix for json-server
      params.set("name", _search_filter.toString());
    }
    params
    .set("_sort", _sort)
    .set("_order", _order)
    .set("_page", _page.toString())
    .set("_page_limit", _limit.toString());

    
    return this.http.get(clientsDataURL, {
        params: params
      })
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
