import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogFlowService } from '../../services/dialogflow.service';
import { AgentConfig } from '../../../../interfaces/agent.interface';
import Notiflix from 'notiflix';


@Component({
  selector: 'app-agent-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.css'],

})
export class AgentListComponent implements OnInit {
  agents: AgentConfig[] = [
  ];
  agentId: string = '';
  constructor(private router: Router, private dfService: DialogFlowService, private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.agentId = this.activatedRoute.snapshot.params['id'];
    Notiflix.Loading.circle('Loading Agents...');
    this.dfService.getAgents().subscribe(
      (data: any) => {
        this.agents.push(data);
        console.log('Agents:', this.agents);
        Notiflix.Loading.remove();
      }
    );
  }

  createAgent() {
    this.router.navigate(['/agents/create']);
  }

  openAgent() {
    this.router.navigate(['agent/details']);
  }


}