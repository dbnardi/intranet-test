"use strict";
var spsave = require("gulp-spsave");

var siteUrl = "http://dfatsp.australiacentral.cloudapp.azure.com";
var creds = {
  username: "vectiq\\jsmith",
  password: "Friday01"
};

var gulp = require("gulp");

gulp.task("spsave-all", function() {
  return gulp.src(["./dist/*.*"]).pipe(
    spsave(
      {
        siteUrl: siteUrl,
        folder: "/SiteAssets/app/",
        flatten: false,
        checkin: true,
        checkinType: 1
      },
      creds
    )
  );
});

gulp.task("spsave-layouts", function() {
  return gulp.src(["../SharePoint/pagelayouts/*.*"]).pipe(
    spsave(
      {
        siteUrl: siteUrl,
        folder: "_catalogs/masterpage",
        flatten: false,
        checkin: true,
        checkinType: 1
      },
      creds
    )
  );
});

gulp.task("spsave-mpage", function() {
  return gulp.src(["../sharepoint/masterpages/*.*"]).pipe(
    spsave(
      {
        siteUrl: siteUrl,
        folder: "_catalogs/masterpage",
        flatten: false,
        checkin: true,
        checkinType: 1
      },
      creds
    )
  );
});

gulp.task("watch", function() {
  gulp.watch("./dist/*", gulp.series('spsave-all'));
});
