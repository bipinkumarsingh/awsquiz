import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from "../../shared/authorization.service";
import { Router } from '@angular/router';
import * as Rellax from 'rellax';
import {RestApiservice} from "../../shared/rest-api.service";
import {GlobalService} from "../../shared/global.service";
import { NgForm } from "@angular/forms";


@Component({
  selector: 'app-scoremanagement',
  templateUrl: './scoremanagement.component.html',
  styleUrls: ['./scoremanagement.component.scss']
})
export class ScoremanagementComponent implements OnInit {

  GET_ALL_TEAMS="https://csq4s4nraf.execute-api.ap-south-1.amazonaws.com/dev/teams";
  constructor(private auth: AuthorizationService,private _router: Router,private restApi: RestApiservice, private globalservice:GlobalService) { }

  _data:any;
  isDataLoaded=false;
  error='';

  p: number = 1;
  
  ngOnInit() {
    this.getTeam();
  }


  getTeam() 
	{
    this.restApi.get(this.GET_ALL_TEAMS).subscribe(
      (data) => { 
        this._data=data;       
       console.log("Data"+data);
       this.isDataLoaded=true;
      },
      (err) => {
        console.log(err);
        this.error = "Not able to find team. Please try again.";
      }
    );
	}


}
