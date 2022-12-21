import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';
import { map, Observable } from 'rxjs';
import { DeleteRepositoryComponent } from '../components/repository/delete-repository/delete-repository.component';
import { APPLICATION_DOMAIN } from '../config';
import { Repository, RepositoryServerData } from '../dto/repository';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

  constructor(private http: HttpClient) { }

  findPublicRepositories(filter: string, page: number, pageSize: number): Observable<Repository[]> {
    return this.http.get<RepositoryServerData[]>(APPLICATION_DOMAIN + '/repositories/public/all', {
      params: new HttpParams()
            .set('filter', filter)
            .set('page', page.toString())
            .set('take', pageSize.toString())
    }).pipe(
      map(repos => repos.map(value => { return { id: value.id, name: `${value.user.nick}/${value.name}`, type: value.type } as Repository }))
    );
  }

  getCountOfPublicRepositories(filter = ''): Observable<number> {
    return this.http.get<{count: number}>(APPLICATION_DOMAIN + '/repositories/public/count', {
      params: new HttpParams()
              .set('filter', filter)
    })
    .pipe(
      map(res => res.count)
    );
  }

  getCountOfUserRepositories(filter = ''): Observable<number> {
    return this.http.get<{count: number}>(APPLICATION_DOMAIN + '/repositories/user-repositories/count', {
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      },
      params: new HttpParams()
              .set('filter', filter)
    })
    .pipe(
      map(res => res.count)
    );
  }

  findUserRepositories(filter: string, page: number, pageSize: number): Observable<Repository[]> {
    return this.http.get<RepositoryServerData[]>(APPLICATION_DOMAIN + '/repositories/user-repositories', {
      params: new HttpParams()
            .set('filter', filter)
            .set('page', page.toString())
            .set('take', pageSize.toString()),
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    }).pipe(
      map(repos => repos.map(value => { return { id: value.id, name: `${value.user.nick}/${value.name}`, type: value.type } as Repository }))
    );
  }

  createRepository(repositoryData: { name: string, type: string }) {
    return this.http.post(APPLICATION_DOMAIN + '/repositories', repositoryData, {
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    });
  }

  deleteRepository(repositoryId: string) {
    return this.http.delete(APPLICATION_DOMAIN + '/repositories/' + repositoryId, {
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    })
  }

  updateRepositoryName(repositoryId: string, repositoryData: {name: string}) {
    return this.http.put(APPLICATION_DOMAIN +  '/repositories/' + repositoryId, repositoryData, {
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    });
  }

  getRepositoryById(repositoryId: string) {
    return this.http.get(APPLICATION_DOMAIN +  '/repositories/' + repositoryId,{
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    });
  }

  shareRepository(repositoryId: string, user: {nick: string}) {
    return this.http.post(APPLICATION_DOMAIN + '/repositories/' + repositoryId + '/share', user, {
      headers: {
        'app-auth': `${localStorage.getItem('token')}`
      }
    });
  }
}
