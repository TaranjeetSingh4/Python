/* global url, render_dashboard,trigger_common */
/* exported load_pa_calendar, trigger_submit */

// Loads the calendar component
function load_pa_calendar() {
  $(".calendar")
    .on("template", function () {
      // If pa url is hit, hide the quarters in calendar and disable click event on year
      if (url.file == "executive-summary") {
        $(".quarter_row").hide();
        $(".year").removeClass("cursor-pointer");
        $(".year").click(false);
      }
      if (url.file != "executive-summary") {
        // Grey out chevron symbol for all previous/successive years except '2018-2019' (data-attr = 2018)
        if (parseInt($(".year").attr("data-attr")) == 2018) {
          $(".fa-chevron-left, .fa-chevron-right").addClass("opacity-40");
          $(".fa-chevron-left, .fa-chevron-right").removeClass(
            "cursor-pointer"
          );
          $(".fa-chevron-left, .fa-chevron-right").click(false);
        }
      }
    })
    .template({
      months: [
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
        "Jan",
        "Feb",
        "Mar",
      ],
      quarter: { Q1: "Apr-Jun", Q2: "Jul-Sep", Q3: "Oct-Dec", Q4: "Jan-Mar" },
      current_month: moment().format("MMM"),
      current_year: parseInt(moment().format("YYYY")),
    });
}

// Triggered when Submit button on calendar is hit
function trigger_submit() {
  trigger_common();
  if (url.file === "pa" || url.file == "executive-summary") {
    render_dashboard();
  }
}
