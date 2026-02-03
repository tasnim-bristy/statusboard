import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Machine {
  constructor(private http:HttpClient){
  
  }
  getMachineList(){
    const url="http://shopfloor.test.local/odata/ProdOrderPosOperations?$select=id,name,start";
    return this.http.get<any>(url);
  }
}
