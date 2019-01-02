import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthorizationService } from "../../shared/authorization.service";
import { Router } from "@angular/router";
import { Http } from "@angular/http";
import { Question } from "../../shared/question.model";
import { httpFactory } from "@angular/http/src/http_module";
import {GlobalService} from "../../shared/global.service"

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss']
})
export class QuestionsComponent implements OnInit {

	@ViewChild("regform") questionForm: NgForm;

	questionList: Question[] = [];
	isDataLoaded: boolean = true;
	submitQuestionText: string = "ADD QUESTION";
	currentQuestion: Question;
	public questionInputBox: string;

	CREATE_QUESTION_URL =
		"https://0sn0th0du1.execute-api.ap-south-1.amazonaws.com/dev/question/create";
	READ_ALL_QUESTION_URL =
		"https://0sn0th0du1.execute-api.ap-south-1.amazonaws.com/dev/question/read/all";
	GET_CHOICES_URL =
		"https://0sn0th0du1.execute-api.ap-south-1.amazonaws.com/dev/question/read/choice";
	UPDATE_QUESTION_URL =
		"https://0sn0th0du1.execute-api.ap-south-1.amazonaws.com/dev/question/update";
	DELETE_QUESTION_URL = "https://0sn0th0du1.execute-api.ap-south-1.amazonaws.com/dev/question/delete";

	constructor(
		public auth: AuthorizationService,
		private _router: Router,
    private http: Http,
    private globalservice:GlobalService
	) { }

	ngOnInit() {
		this.currentQuestion = new Question();
		this.refreshQuestionList();
	}

	createQuestion(questionForm: NgForm) 
	{
		if(!this.isFormValid())
			return;

		var question = questionForm.value;
		var correct_choice = question[question["correct_choice"]];

		question["is_active"] = 0;
		question["correct_choice"] = correct_choice;

		if (this.submitQuestionText == "ADD QUESTION") {
			this.http.post(this.CREATE_QUESTION_URL, question).subscribe(
				response => {
					this.resetForm();
				},
				error => console.log(error)
			);
		} else if (this.submitQuestionText == "SAVE CHANGES") {

			question.question_id = this.currentQuestion.question_id;

			console.log("UPDATE REQUEST BODY: " + JSON.stringify(question));

			this.http.put(this.UPDATE_QUESTION_URL, question).subscribe(
				(response) => {
					console.log("RESPONSE FOR UPDATE QUESTION: " + response);
					this.resetForm();
				},
				(error) => console.log(error)
			);
		}
	}

	onEditQuestion(question: Question) {
		this.submitQuestionText = "SAVE CHANGES";
		this.currentQuestion = question;

		console.log("SELECTED QUESTION FOR EDITING: " + JSON.stringify(question));

		this.http
			.get(this.GET_CHOICES_URL + "?question_id=" + question.question_id)
			.subscribe(
				response => {
					console.log("ON EDIT QUESTION RESPONSE: " + JSON.stringify(response.json()));
					var responseData = response.json();

					this.questionForm.controls["choice_1"].setValue(responseData[0].choice);
					this.questionForm.controls["choice_2"].setValue(responseData[1].choice);
					this.questionForm.controls["choice_3"].setValue(responseData[2].choice);
					this.questionForm.controls["choice_4"].setValue(responseData[3].choice);

					if (responseData[0].is_correct == 1) {
						this.questionForm.controls["correct_choice"].setValue("choice_1");
					}
					else if (responseData[1].is_correct == 1) {
						this.questionForm.controls["correct_choice"].setValue("choice_2");
					}
					else if (responseData[2].is_correct == 1) {
						this.questionForm.controls["correct_choice"].setValue("choice_3");
					}
					else if (responseData[3].is_correct == 1) {
						this.questionForm.controls["correct_choice"].setValue("choice_4");
					}
				},
				error => {
					console.log(error);
				}
			);

		this.questionForm.controls["question"].setValue(question.question);
		this.currentQuestion.question_id = question.question_id;
	}

	refreshQuestionList() {
		//	read all the questions
		this.http.get(this.READ_ALL_QUESTION_URL).subscribe(
			response => {
				console.log("READ ALL QUESTIONS RESPONSE: " + JSON.stringify(response));

				var data = response.json();

				console.log(data);

				data.forEach(element => {
					var question = new Question();

					question.question_id = element.question_id;
					question.question = element.question;
					question.is_active = element.is_active;

					this.questionList.push(question);
				});
			},
			error => {
				console.log(error);
			}
		);
	}

	deleteQuestion()	{
		console.log("QUESTIO ID FOR DELETION: " + this.currentQuestion.question_id);

		this.http.delete(this.DELETE_QUESTION_URL + "?question_id=" + this.currentQuestion.question_id).subscribe(
			(response) => {
				console.log(response);
				this.resetForm();
			},
			(error) => {
				console.log(error);
			}
		);
	}

	resetForm() {
		this.questionForm.reset();
		this.submitQuestionText = "ADD QUESTION";
		this.questionList = [];
		this.refreshQuestionList();
	}

	isFormValid()
	{
		if(this.questionForm.controls["question"].value != null &&
			this.questionForm.controls["question"].value.trim() != "" &&
			this.questionForm.controls["choice_1"].value != null &&
			this.questionForm.controls["choice_1"].value.trim() != "" &&
			this.questionForm.controls["choice_2"].value != null &&
			this.questionForm.controls["choice_2"].value.trim() != "" &&
			this.questionForm.controls["choice_3"].value != null &&
			this.questionForm.controls["choice_3"].value.trim() != "" &&
			this.questionForm.controls["choice_4"].value != null &&
			this.questionForm.controls["choice_4"].value.trim() != "" &&
			this.questionForm.controls["correct_choice"].value != null &&
			this.questionForm.controls["correct_choice"].value.trim() != "")
			{
				console.log(this.questionForm.controls["question"].value);
				console.log(this.questionForm.controls["choice_1"].value);
				console.log(this.questionForm.controls["choice_2"].value);
				console.log(this.questionForm.controls["choice_3"].value);
				console.log(this.questionForm.controls["choice_4"].value);
				console.log(this.questionForm.controls["correct_choice"].value);

				return true;
			}

			else
			{
				alert("Please enter all the required fields");

				return false;
			}
	}

}
