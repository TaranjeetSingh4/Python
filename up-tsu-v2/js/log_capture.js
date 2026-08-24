// var screen_mapping = {
//   "/up-tsu-v2-test/": "Mobile - Home",
//   "/up-tsu-v2-test/summary": "Mobile - Summary",
//   "/up-tsu-v2-test/deepdive": "Mobile - Deepdive",
//   "/up-tsu-v2-test/analytics": "Mobile - Analytics",
//   "/up-tsu-v2-test/executive-summary": "Mobile - Executive-Summary",
//   "/up-tsu-v2-test/niti_deepdive": "Mobile - Niti Deepdive",
//   "/up-tsu-v2-test/pa-landing": "Mobile - PA Landing",
//   "/up-tsu-v2-test/pa-overview": "Mobile - PA  Overview",
//   "/up-tsu-v2-test/pa-compare": "Mobile - PA  Compare",
//   "/up-tsu-v2-test/pa": "Mobile - PA Home",
//   "/up-tsu-v2-test/cmo_new": "Mobile - Cmo",
//   "/up-tsu-v2-test/landing": "Mobile - Cm Landing",
//   "/up-tsu-v2-test/deepdive_cm": "Mobile - Cm Deepdive",
// };
// function parse_url() {
//   return g1.url.parse(location.href);
// }

// $(document).ready(function () {
//   log_feeder();
//   time_loop();
// });

// function time_loop() {
//   setInterval(log_feeder, 60000);
// }

// function log_feeder() {
//   let page_url = parse_url();
//   let data = {
//     url: location.href,
//     screen: screen_mapping[page_url.pathname],
//     application: "Mobile",
//     time: moment().format("YYYY-MM-DD HH:mm:ss"),
//     status: 200,
//   };
//   $.ajax({
//     type: "POST",
//     url: "store_logs",
//     data: data,
//   }).done();
// }
