import { AfterViewInit, Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Repository } from '../../../dto/repository';
import {CollectionViewer, DataSource} from "@angular/cdk/collections";
import { BehaviorSubject, catchError, finalize, Observable, of, tap } from 'rxjs';
import { RepositoryService } from '../../../services/repository-service.service';

@Component({
  selector: 'app-private-repositories',
  templateUrl: './private-repositories.component.html',
  styleUrls: ['./private-repositories.component.css']
})
export class PrivateRepositoriesComponent {
  displayedColumns: string[] = ['name', 'type'];
  dataSource: PublicRepositoriesDataSource;

  constructor(private repositoryService: RepositoryService) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('input') input: ElementRef;

  ngOnInit(): void {
    this.dataSource = new PublicRepositoriesDataSource(this.repositoryService);
    this.dataSource.loadRepositoriesCount();
    this.dataSource.loadRepositories();
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        tap(() => this.loadRepositoriesPage())
      )
      .subscribe();
  }

  loadRepositoriesPage() {
    this.dataSource.loadRepositories(
      this.input.nativeElement.value,
      this.paginator.pageIndex,
      this.paginator.pageSize,
    );
  }
}

class PublicRepositoriesDataSource implements DataSource<Repository> {
  private repositoriesSubject = new BehaviorSubject<Repository[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private countRepositoriesSubject = new BehaviorSubject<number>(0);
  public countRepositories = 0;
  public loading$ = this.loadingSubject.asObservable();

  constructor(private repositoryService: RepositoryService) {}

  connect(collectionViewer: CollectionViewer): Observable<Repository[]> {
      return this.repositoriesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
      this.repositoriesSubject.complete();
      this.loadingSubject.complete();
      this.countRepositoriesSubject.complete();
  }

  loadRepositories(filter = '',page = 0, pageSize = 7) {

      this.loadingSubject.next(true);

      this.repositoryService.findPublicRepositories(filter, page, pageSize).pipe(
          catchError(() => of([])),
          finalize(() => this.loadingSubject.next(false))
      )
      .subscribe(repositories => this.repositoriesSubject.next(repositories));
  }
  
  loadRepositoriesCount(filter = '') {
    this.repositoryService.getCountOfPublicRepositories(filter)
      .subscribe(count => {
        this.countRepositoriesSubject.next(count);
        this.countRepositories = this.countRepositoriesSubject.value;
      });    
  }
}
