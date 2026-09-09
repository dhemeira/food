# TODO

- [x] Migrate navbar from legacy version
- [ ] Split big components where it makes sense
- [ ] Validate the calorie input as a number (`Number('abc')` yields `NaN`, which Firestore rejects on save).
- [ ] Code-split / lazy-load routes to shrink the initial bundle (build warns ~865 KB chunk).
- [ ] Show the recipe author on the list view (currently only on the detail page).
- [ ] Show a hint on the detail page when ingredients/steps are empty (currently renders empty lists).
- [ ] Make layout max width bigger.
- [ ] Port search field for both home page and desktop navbar from legacy.
- [ ] Change navbar and tabbar to use the actual menu items ("\<\>" is only visible for logged in users):
  - Home, \<New\>, Search, \<Daily menu\>, Avatar/Login
  - Brand, Search, Home, \<New\>, \<Daily menu\>, Avatar/Login
- [ ] Fix the tab bar pill animation on iOS (it jumps to the target instead of sliding, and the squash effect is lost).
- [ ] Fix the search keyboard not opening on iOS when the search tab is tapped from another page (the input mounts after the tap gesture ends).
- [ ] On recipe edit and add page change the steps and ingredients from a textarea to a list of text fields that can be added and deleted.
- [ ] On add and edit page change the file upload to contain the image inside and clicking that should bring up the dialog.
- [ ] Publish npm ui library package.
- [ ] Change english defaults to hungarian.
