// var screen_mapping = {
//     '/up-tsu-desktop-dev/': 'Desktop - Home',
//     '/up-tsu-desktop-dev/login': 'Desktop - Login',
//     '/up-tsu-desktop-dev/table': 'Desktop - Table',
//     '/up-tsu-desktop-dev/niti_table': 'Desktop - Niti Table',
//     '/up-tsu-desktop-dev/compare': 'Desktop - Analytics',
//     '/up-tsu-desktop-dev/executive-summary': 'Desktop - Executive Summary',
//     '/up-tsu-desktop-dev/map_view': 'Desktop - Map',
//     '/up-tsu-desktop-dev/amethi_map': 'Desktop - Amethi Map View',
//     '/up-tsu-desktop-dev/amethi_table': 'Desktop - Amethi Table View',
//     '/up-tsu-desktop-dev/admin': 'Desktop - Admin Page',
//     '/up-tsu-desktop-dev/logs': 'Desktop - Logviewer',
//     '/up-tsu-desktop-dev/analysis': 'Desktop - User Analysis',
//     '/up-tsu-desktop-dev/pa-landing': 'Desktop - PA Landing',
//     '/up-tsu-desktop-dev/pa-overview': 'Desktop - PA Overview',
//     '/up-tsu-desktop-dev/pa-compare': 'Desktop - PA Compare',
//     '/up-tsu-desktop-dev/pa': 'Desktop - PA Home',
//     '/up-tsu-desktop-dev/comicgen': 'Desktop - Comicgen',
//     '/up-tsu-desktop-dev/cmo_new': 'Desktop - Cmo',
//     '/up-tsu-desktop-dev/landing': 'Desktop - Cm Landing',
//     '/up-tsu-desktop-dev/table_noauth': 'Desktop - Cm Table'
// }
// function parse_url() {
//     return g1.url.parse(location.href)
//   }

// $(document).ready(function() {
//     log_feeder()
//     time_loop()
// })

// function time_loop() {
//     setInterval(log_feeder, 60000);
// }

// function log_feeder() {
//     let page_url = parse_url()
//     let data = {
//         url: location.href,
//         screen: screen_mapping[page_url.pathname],
//         application: "Desktop",
//         time: moment().format('YYYY-MM-DD HH:mm:ss'),
//         status: 200
//     }
//     $.ajax({
//         type: 'POST',
//         url: 'store_logs',
//         data: data
//     })
//     .done()
// }
