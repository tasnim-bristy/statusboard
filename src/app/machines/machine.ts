import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Machine {
  constructor(private http: HttpClient) {}

  // GET
  getMachineList() {
    // const url = 'http://shopfloor.test.local/odata/ProdOrderPosOperations?$select=id,name,start';
    // const url = 'http://shopfloor.test.local/odata/Machines';
    const url = 'http://shopfloor.test.local/odata/Tools';
    return this.http.get<any>(url);
  }

  // POST
  addMachine(payload: any) {
    const url = 'http://shopfloor.test.local/odata/Tools';
    return this.http.post(url, payload);
  }

  // UPDATE 
  updateMachine(id: number, machine: any) {
    const url = `http://shopfloor.test.local/odata/Tools(${id})`;
    return this.http.put(url, machine);
  }

  // DELETE 
  deleteMachine(id: number) {
    const url = `http://shopfloor.test.local/odata/Tools(${id})`;
    return this.http.delete(url);
  }
}
