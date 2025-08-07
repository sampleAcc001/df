import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogFlowService {


  private baseUrl = 'http://localhost:5000/api';
  projectDetails: any;
  constructor(private http: HttpClient) { }

  getConcatenatedIntentId(intentId: string): string {
    const projectId = this.projectDetails[0]?.projectId || 'default-project';
    return `projects/${projectId}/agent/intents/${intentId}`;
  }
  getParentIntentId(intentId: string): string {
    const projectId = this.projectDetails[0]?.projectId || 'default-project';
    return `projects/${projectId}/locations/global/agent/intents/${intentId}`;
  }
  getAgents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agent`);
  }
  getProjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}/projects`);
  }
  getIntents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/intents`);
  }
  updateIntent(intentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/update-intent`, intentData);
  }

  getIntentById(intentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/intents/${intentId}`);
  }
  sendMessageToAgent(message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/detect-intents`, { message: message });
  }


  createIntent(intentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-intent`, intentData);
  }

  // need to be change ti delete method instead f post
  deleteIntent(intentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/delete-intent`, { intentId: intentId });
  }

  createEntity(entityData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-entity`, entityData);
  }

  getEntities(): Observable<any> {
    return this.http.get(`${this.baseUrl}/entities`);
  }
  getEntityById(entityId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/entities/${entityId}`);
  }
  updateEntity(entityData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/entities${entityData.id}`, entityData);
  }

  deleteEntity(entityId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/entities/${entityId}`);
  }
  addFollowUpIntent(category: string, intentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/add-followup`, {
      "parentIntentId": this.getParentIntentId(intentData.id),
      "category": category
    });
  }

}


