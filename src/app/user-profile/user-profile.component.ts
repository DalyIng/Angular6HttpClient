import { Component, OnInit } from "@angular/core";
import { UserService } from "../shared/user.service";
import { Router } from "@angular/router";
import { NgForm } from "@angular/forms";
import {
  ScrollToService,
  ScrollToConfigOptions
} from "@nicky-lenaers/ngx-scroll-to";

declare var M: any;

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"]
})
export class UserProfileComponent implements OnInit {
  emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  showSucessMessage: boolean;
  update: boolean;
  addFriend: boolean;
  serverErrorMessages: string;
  userDetails;
  friend: string;
  friendsObject: any;
  isSingleClick: boolean;
  constructor(
    public userService: UserService,
    private _scrollToService: ScrollToService,
    private router: Router
  ) {}

  ngOnInit() {
    this.refreshUserDetails();
  }

  onUpdate() {
    this.addFriend = false;
    this.update = true;
    const config: ScrollToConfigOptions = {
      target: "updateFormDetails"
    };
    this._scrollToService.scrollTo(config);
  }

  onAddFriend() {
    this.update = false;
    this.addFriend = true;
    const config: ScrollToConfigOptions = {
      target: "addFriendForm"
    };
    this._scrollToService.scrollTo(config);
  }

  onSubmit(form: NgForm) {
    this.userService.putUser(form.value).subscribe(
      res => {
        setTimeout(() => (this.showSucessMessage = false), 4000);
        this.refreshUserDetails();
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join("<br/>");
        } else
          this.serverErrorMessages =
            "Something went wrong.Please contact admin.";
      }
    );

    this.update = false;
    M.toast({
      html: "Alien's details Updated successfully",
      classes: "rounded"
    });
  }

  onLogout() {
    this.userService.deleteToken();
    this.router.navigate(["/login"]);
  }

  refreshUserDetails() {
    this.userService.getUserProfile().subscribe(
      res => {
        this.userDetails = res["user"];
        this.userService.modifiedUser = this.userDetails;
        this.friendsObject = this.userDetails.friends.map(({ fullName }) => ({
          fullName
        }));
      },
      err => {
        console.log(err);
      }
    );
  }

  onAdd(form: NgForm) {
    this.userService.addFriend(form.value).subscribe(
      res => {
        setTimeout(() => (this.showSucessMessage = false), 4000);
        this.addFriend = false;
        this.userService.newFriendModel.fullName = "";
        this.userService.newFriendModel.email = "";
        this.userService.newFriendModel.password = "";
        this.friendsObject.push({ fullName: form.value.fullName });
        M.toast({ html: "Friend added successfully", classes: "rounded" });
      },
      err => {
        if (err.status === 422) {
          this.serverErrorMessages = err.error.join("<br/>");
        }
        M.toast({ html: "Inexistant Friend", classes: "rounded" });
        this.addFriend = false;
      }
    );
  }

  onDelete(name: string) {
    let deletedFriend = {
      _id: this.userDetails._id,
      fullName: name
    };
    if (confirm("Are you sure to delete this friend ?") == true) {
      this.userService.deleteFriend(deletedFriend).subscribe(
        res => {
          setTimeout(() => (this.showSucessMessage = false), 4000);
          let removeIndex = this.friendsObject
            .map(function(item) {
              return item.fullName;
            })
            .indexOf(deletedFriend.fullName);
          this.friendsObject.splice(removeIndex, 1);
          M.toast({ html: "Friend Deleted", classes: "rounded" });
        },
        err => {
          if (err.status === 422) {
            this.serverErrorMessages = err.error.join("<br/>");
          } else
            this.serverErrorMessages =
              "Something went wrong.Please contact admin.";
        }
      );
    }
  }
}
