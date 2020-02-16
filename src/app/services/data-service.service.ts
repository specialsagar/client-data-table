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
    let paramObj = {
      _sort: _sort,
      _order: _order,
      _page: _page.toString(),
      _limit: _limit.toString()
    }
    if(_search_filter) {
      // dirty fix for json-server
      paramObj['name_like'] = _search_filter;
    }

    
    return this.http.get(clientsDataURL, {
        params: new HttpParams({fromObject: paramObj})
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

  modifyClient(id, data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.patch(clientsDataURL + "/" + id, data).toPromise().then(res => {
        resolve();
      })
    })
  }
}
