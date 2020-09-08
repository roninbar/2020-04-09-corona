String.prototype.capitalize = function () {
    return this.replace(/^\w/, c => c.toUpperCase());
};

$(function () {

    $('form').submit(function (e) {

        e.preventDefault();

        const name1 = $('#country1').val(), name2 = $('#country2').val(), days = $('#days').val();

        $.when(
            $.getJSON(`https://corona.lmao.ninja/v2/historical/${name1},${name2}?lastdays=${days}`),
            $.getJSON(`https://restcountries.eu/rest/v2/name/${name1}`),
            $.getJSON(`https://restcountries.eu/rest/v2/name/${name2}`)
        )
            .done(function (corona, ...country) {

                const metric = $('#compare-by').val();
                Highcharts.chart('chart', {

                    title: {
                        text: `COVID-19 in ${corona[0][0].country} vs. ${corona[0][1].country}`,
                    },

                    subtitle: {
                        text: 'Source: https://github.com/novelcovid/api',
                    },

                    yAxis: {
                        type: 'logarithmic',
                        minorTickInterval: 0.1,
                        title: {
                            text: metric.capitalize(),
                            // text: 'Deaths / 1M Pop',
                        }
                    },

                    xAxis: {
                        type: 'datetime',
                        title: {
                            text: 'Date',
                        },
                        dateTimeLabelFormats: {
                            week: '%b %d',
                            day: '%b %d',
                        },
                        minorTickInterval: 86400000,
                        accessibility: {
                            rangeDescription: 'Range: 2010 to 2017'
                        }
                    },

                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle'
                    },

                    plotOptions: {
                        series: {
                            label: {
                                connectorAllowed: false
                            },
                            pointStart: 2010
                        }
                    },

                    series: corona[0]
                        .map((c, i) => [
                            // makeSeries(c, 'cases'),
                            makeSeries(c, 'deaths', country[i][0][0].population),
                            // makeSeries(c, 'deaths'),
                            // makeSeries(c, 'deaths', country[i][0][0].population),
                        ])
                        .reduce((a, b) => a.concat(b)),

                    responsive: {
                        rules: [{
                            condition: {
                                maxWidth: 500
                            },
                            chartOptions: {
                                legend: {
                                    layout: 'horizontal',
                                    align: 'center',
                                    verticalAlign: 'bottom'
                                }
                            }
                        }]
                    },

                    tooltip: {
                        pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:.2f}</b><br/>',
                    },

                });

            });
    });
    
});

function makeSeries(c, metric, population = 1, per = 1000000) {
    return {
        name: `${c.country} ${metric.capitalize()}` + (population > 1 ? ` per ${per}` : ''),
        data: Object.keys(c.timeline[metric])
            .sort(function (a, b) {
                let aa = a.split('/'), bb = b.split('/');
                return aa[2] - bb[2] || aa[0] - bb[0] || aa[1] - bb[1];
            })
            .map(date => ({
                name: date,
                x: Date.parse(date),
                y: c.timeline[metric][date] / population * (population > 1 ? per : 1),
            })),
    };
}
