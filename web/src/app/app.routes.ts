import { Routes } from '@angular/router';
import { AgentListComponent } from './pages/agent-list/agent-list.component';
import { CreateAgentComponent } from './pages/create-agent/create-agent.component';
import { AgentDashboardComponent } from './pages/agent-dashboard/agent-dashboard.component';
import { IntentsListPageComponent } from './pages/intents/intents';
import { CreateIntentPageComponent } from './pages/create-intent/create-intent';
import { EntitiesPage } from './pages/entities-page/entities-page';
import { IntentDetails } from './pages/intents/intent-details/intent-details';
import { Login } from './pages/login/login';
import { EntityAddComponent } from './pages/entities-page/entity-add/entity-add';
import { EntityDetailsComponent } from './pages/entities-page/entity-details/entity-details';
import { VisualFlowComponent } from './pages/visualflow/visualflow';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'agents', component: AgentListComponent },
  { path: 'agents/create', component: CreateAgentComponent },


  { path: 'agent/details', component: AgentDashboardComponent },

  { path: 'intents', component: IntentsListPageComponent },
  { path: 'intents/create', component: CreateIntentPageComponent },
  { path: 'intents/details/:id', component: IntentDetails },


  { path: 'entities', component: EntitiesPage },
  { path: 'entity/add', component: EntityAddComponent },
  { path: 'entity/details/:id', component: EntityDetailsComponent },


  { path: 'graph-view', component: VisualFlowComponent },


  { path: '**', redirectTo: '/login' },

];