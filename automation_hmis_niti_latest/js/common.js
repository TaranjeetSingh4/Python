/* exported UI */
/*global _, Dropzone */
Dropzone.autoDiscover = false;

var UI = (function () {
  function render_date() {
    _.each($(".cal-btn").find("p"), function (d) {
      if ($(d).css("opacity") == 1) {
        var key = $(d).attr("class").split(" ").pop();
        $("." + key).text($("#active").text() + " " + $(".year").text());
      }
    });
  }

  function load_calendar() {
    $("#calender_template")
      .on("template", function () {
        $("#fromdate")
          .datepicker({
            todayBtn: 1,
            autoclose: true,
            format: "MM-yyyy",
            viewMode: "months",
            minViewMode: "months",
          })
          .on("changeDate", function (selected) {
            var minDate = new Date(selected.date.valueOf());
            $("#todate").datepicker("setStartDate", minDate);
          });

        $("#todate")
          .datepicker({
            autoclose: true,
            format: "MM-yyyy",
            viewMode: "months",
            minViewMode: "months",
          })
          .on("changeDate", function (selected) {
            var maxDate = new Date(selected.date.valueOf());
            $("#fromdate").datepicker("setEndDate", maxDate);
          });
      })
      .template({});
  }
  function set_dropzone(id, upload_url, tracker_id, parent_id, dashboard_id) {
    $("#upload_files")
      .off()
      .on("template", function () {
        let errors = false;
        // set the dropzone container id
        const dropzone = document.querySelector(id);
        // set the preview element template
        var previewNode = dropzone.querySelector(".dropzone-item");
        previewNode.id = "";
        var previewTemplate = previewNode.parentNode.innerHTML;
        previewNode.parentNode.removeChild(previewNode);
        var myDropzone = new Dropzone(id, {
          // Make the whole body a dropzone
          url: upload_url, // Set the url for your upload script location
          parallelUploads: 1,
          previewTemplate: previewTemplate,
          addRemoveLinks: true,
          maxFilesize: 200, // Max filesize in MB
          autoQueue: false, // Make sure the files aren't queued until manually added
          previewsContainer: id + " .dropzone-items", // Define the container to display the previews
          clickable: id + " .dropzone-select", // Define the element that should be used as click trigger to select files.
          acceptedFiles: ".csv",
          params: {
            tracker_id: tracker_id,
            parent_id: parent_id,
            dashboard_id: dashboard_id,
          },
        });

        myDropzone.on("addedfile", function (file) {
          // Hookup the start button
          // file.previewElement.querySelector(id + " .dropzone-start").onclick = function () { myDropzone.enqueueFile(file); };
          const dropzoneItems = dropzone.querySelectorAll(".dropzone-item");
          dropzoneItems.forEach((dropzoneItem) => {
            dropzoneItem.style.display = "";
          });
          dropzone.querySelector(".dropzone-upload").style.display =
            "inline-block";
          dropzone.querySelector(".dropzone-remove-all").style.display =
            "inline-block";
        });

        // Update the total progress bar
        myDropzone.on("totaluploadprogress", function (progress) {
          const progressBars = dropzone.querySelectorAll(".progress-bar");
          progressBars.forEach((progressBar) => {
            progressBar.style.width = progress + "%";
          });
        });

        myDropzone.on("sending", function (file) {
          // Show the total progress bar when upload starts
          const progressBars = dropzone.querySelectorAll(".progress-bar");
          progressBars.forEach((progressBar) => {
            progressBar.style.opacity = "1";
          });
          // And disable the start button
          file.previewElement
            .querySelector(id + " .dropzone-start")
            .setAttribute("disabled", "disabled");
        });

        // Hide the total progress bar when nothing's uploading anymore
        myDropzone.on("complete", function (progress) {
          const progressBars = dropzone.querySelectorAll(".dz-complete");
          setTimeout(function () {
            progressBars.forEach((progressBar) => {
              progressBar.querySelector(".progress-bar").style.opacity = "0";
              progressBar.querySelector(".progress").style.opacity = "0";
              progressBar.querySelector(".dropzone-start").style.opacity = "0";
            });
          }, 300);
        });

        // Setup the buttons for all transfers
        dropzone
          .querySelector(".dropzone-upload")
          .addEventListener("click", function () {
            myDropzone.enqueueFiles(
              myDropzone.getFilesWithStatus(Dropzone.ADDED)
            );
          });

        // Setup the button for remove all files
        dropzone
          .querySelector(".dropzone-remove-all")
          .addEventListener("click", function () {
            dropzone.querySelector(".dropzone-upload").style.display = "none";
            dropzone.querySelector(".dropzone-remove-all").style.display =
              "none";
            myDropzone.removeAllFiles(true);
          });

        myDropzone.on("error", function (e) {
          errors = e;
        });

        // On all files completed upload
        myDropzone.on("queuecomplete", function (progress) {
          if (errors.status == "error" && errors.accepted == false) {
            console.log("Error", errors);
            alert("only CSV files are allowed");
          } else {
            $("#FileUploadModal").modal("hide");
            setTimeout(function () {
              alert("Uploaded Successfully!");
            }, 300);
          }
          const uploadIcons = dropzone.querySelectorAll(".dropzone-upload");
          uploadIcons.forEach((uploadIcon) => {
            uploadIcon.style.display = "none";
          });
        });

        // On all files removed
        myDropzone.on("removedfile", function (file) {
          if (myDropzone.files.length < 1) {
            dropzone.querySelector(".dropzone-upload").style.display = "none";
            dropzone.querySelector(".dropzone-remove-all").style.display =
              "none";
          }

          const progressBars = dropzone.querySelectorAll(".progress-bar");
          progressBars.forEach((progressBar) => {
            progressBar.style.width = "0%";
          });
        });

        $("#FileUploadModal").modal("toggle");
      })
      .template({});
  }
  return {
    load_calendar: load_calendar,
    render_date: render_date,
    set_dropzone: set_dropzone,
  };
})();
