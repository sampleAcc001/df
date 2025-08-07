import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Entity } from '../../../../interfaces/entity.interface';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';


@Component({
  selector: 'app-entities',
  templateUrl: './entities-page.html',
  styleUrl: './entities-page.css',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink]
})
export class EntitiesPage implements OnInit {
  entities: Entity[] = [];

  selectedEntityIndex: number | null = null;
  selectedEntity: any = null;

  constructor(private router: Router, private dfService: DialogFlowService) { }
  ngOnInit(): void {
    Notiflix.Loading.circle('Loading Entities...');
    this.dfService.getEntities().subscribe({
      next: (data) => {
        this.entities = data;
        Notiflix.Loading.remove();
      },
      error: (error) => {
        Notiflix.Loading.remove();
        console.error('Error fetching entities:', error);
        Notiflix.Notify.failure('Failed to fetch entities. Please try again.');
      }

    })
  }

  selectEntity(index: number) {

  }

  addEntity() {
    // Add logic here
    this.router.navigate(['/entity/add']);
  }

  editEntity(entity: any) {
    // Add logic here
    this.router.navigate([`/entity/details/${entity.id}`]);
  }

  deleteEntity(id: string) {
    // Add logic here
  }
}

