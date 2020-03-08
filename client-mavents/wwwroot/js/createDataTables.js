//USE BELOW TO CHECK COLUMN TYPE IN DATA TABLE

function makeSelectorsFromColNames(colNames, ulColID, ulXID, ulYID, radioSelector) {
    $('#ulcols *').detach();

    colNames.forEach(function (colName) {
        var elem = '<li>' + colName + "<a></a></li>";
        //var elem = '<li class="liCols>' + colName + "</li>";
        $('#ulcols').append(elem)
       // console.log($(elem))

    })
    $(document).on("click", "a.remove", function () {
        $(this).parent().remove();
    });

    $(document).on("click", "#ulcols li", function () {
        var elem = '<li>' + $(this).text() + "<a href='javascript: void(0); ' class='remove'>&times;</a></li>";

        if ($("input[name='optradio']:checked").val().includes("X")) {
            if ($('#ulXvals li').parent().length != 0) {
                $('#ulXvals').append(elem)
            } else {
                if (!$('#ulXvals').html().includes($(this).html())) {
                    console.log('me thinks it doesnt include el')
                    $('#ulXvals').append(elem)
                }
                //if (!$('#ulXvals').html().includes(elem)) {
                //    console.log('doesnt include el')
                //    $('#ulXvals').append(elem)
                //}
            }

            
        } else {
            //console.log($("input[name='optradio']:checked").val())
            //$('#ulYvals').append(elem)
            if (!$('#ulYvals').html().includes($(this).html())) {
                $('#ulYvals').append(elem)
            }
        }
        
    });

}

function makeSelectorsFromDTcols(DTcolSettings0aoColummns, ulColID, ulXID, ulYID, radioSelector) {
    //$('.chartSelector').children().remove()
    if ($('#ulcols li').length) {
        $('#ulcols li').remove()
    }
    
    DTcolSettings0aoColummns.forEach(function (col) {
        var elem = '<li>' + col.sTitle + "<a>  (" + col.sType + ")  </a></li>";
        $('#ulcols').append(elem)
    })
    $(document).on("click", "a.remove", function () {
        $(this).parent().remove();
    });
    $(document).on("click", "#ulcols li", function () {
        var elem = '<li>' + $(this).html() + "<a href='javascript: void(0); ' class='remove'>&times;</a></li>";
        console.log($('#ulXvals *')[0])
        if ($("input[name='optradio']:checked").val().includes("X")) {
            if ($('#ulXvals *').length < 1) {
                $('#ulXvals').append(elem)
            } else {
                //remember me added attributes to the <a> element so we cannot check elem
                if (!$('#ulXvals').html().includes($(this).html())) {
                    console.log("false")
                    $('#ulXvals').append(elem)
                }
            }
        } else {
            //$('#ulYvals').append(elem)
            if (!$('#ulYvals').html().includes($(this).html())) {
                $('#ulYvals').append(elem)
            }
        }
    });
}

//AsyncTableLoad().done(makeSelectorsFromCols());
function buildEmptyHtmlTable(preExistingContainerID, outputTableID, outputTableClass, colnames) {
    //clearout any old table
    $("#" + preExistingContainerID + ' *').remove();
    var strHtmlTable = '<table id="' + outputTableID + '"' + 'class= "' + outputTableClass + '">';
    strHtmlTable += '<thead><tr>';
    colnames.forEach(function (x) {
        strHtmlTable += '<th>'
        strHtmlTable += x
        strHtmlTable += '</th>'
    })
    strHtmlTable += "</tr></thead>";

    strHtmlTable += '<tfoot><tr>';
    colnames.forEach(function (x) {
        strHtmlTable += '<th>'
        strHtmlTable += x
        strHtmlTable += '</th>'
    })
    strHtmlTable += "</tr></tfoot>";
    strHtmlTable += "<table>";
    $("#" + preExistingContainerID).html(strHtmlTable);
    return $('#' + outputTableID)
}

function sizeQueryResultTable(containerID) {
    $('#' + containerID).css("max-height", $($('#tableChildContainer').css("max-height")))
}

function makeTableSettings(data, dtcolumns, drawbackFunc1 = null, drawbackFunc2 = null) {
    return ({
        responsive: true,
        "iDisplayLength": 10,
        buttons: ['copy', 'excel', 'pdf', 'csv', 'print'],
        "dom": 'Bflrtip',
        data: data,
        columns: dtcolumns,
        "drawCallback": function (settings) {
            var api = this.api();
            if (api.rows().data().toArray().length > 20) {
                //search table on cell click
                //api.$('td').click(function () {
                //    api.search(this.innerHTML).draw();
                //});
                if ($('#ulXvals *').length > 0 && $('#ulYvals *').length > 0) {
                    if (drawbackFunc1 != null) {
                        //using "current" for now to keep things light weight, 
                        //TODO: make current versus all row a parameter
                        drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                    }
                }
                if (drawbackFunc2 != null) {
                    drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                }
            }
            // makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
        },
        initComplete: function () {
            this.api().columns().every(function () {
                var column = this;
                if (column.data().unique().length < 50) {
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });
                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                } else {
                    //var title = $(this).text();
                    var input = $(`<input type = "text" placeholder = "${column.dataSrc()}"></input>`)
                        .appendTo($(column.footer()).empty())
                        .on('keyup change', function () {
                            if (column.search() !== this.value) {
                                column
                                    .search(this.value)
                                    .draw();
                            }
                        });
                    input;
                }
            });
            //makeSelectorsFromCols(cnames, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
        }
    })
}

function clientFileToDataTable(event, drawbackFunc1 = null, drawbackFunc2 = null) {
    alasql('SELECT * FROM FILE(?,{headers:true})', [event], function (data) {
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        buildEmptyHtmlTable("tableContainer", "tblDynamic", "table table-responsive table-hover table-sm compact", cnames)
        var table = $('#tblDynamic').DataTable(
            makeTableSettings(data, dtcolumns, drawbackFunc1, drawbackFunc2)
        )
        makeSelectorsFromDTcols(table.settings()[0].aoColumns, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
    });
}

function loadServerFile(filepath, drawbackFunc1 = null, drawbackFunc2 = null) {
    alasql('SELECT * FROM CSV(?,{headers:true})', [filepath], function (data) {   
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        buildEmptyHtmlTable("tableContainer", "tblDynamic", "table table-responsive table-hover table-sm compact", cnames)
        var table = $('#tblDynamic').DataTable(
            makeTableSettings(data, dtcolumns, drawbackFunc1, drawbackFunc2)
        )
        makeSelectorsFromDTcols(table.settings()[0].aoColumns, "ulcols", "ulXvals", "ulYvals", "input[name='optradio']:checked")
    });
}

//remember to redraw if orginial tbl changes
function buildSecondTableFromQuery(tblqryID, tblresID, qrystr, drawbackFunc1 = null, drawbackFunc2 = null) {
    //get the data in html table from DataTable Api rather than alasql, which would only get data contained on the first pg
    var data = $('#' + tblqryID).DataTable().data().toArray();
    sizeQueryResultTable('tableChildContainer');
    alasql(qrystr, [data], function (data) {
        var cnames = Object.keys(data[0])
        var dtcolumns = [];
        cnames.forEach(colVar => dtcolumns.push({ "data": colVar }))
        buildEmptyHtmlTable("tableChildContainer", tblresID, "table table-responsive table-hover table-sm compact", cnames)
        $('#' + tblresID).DataTable(
            makeTableSettings(data, dtcolumns, drawbackFunc1, drawbackFunc2)
        )
    })
}


function ajaxWebServiceDataTable(contanerID, tableID, varNames, drawbackFunc1 = null, drawbackFunc2 = null) {
    //var table = buildEmptyHtmlTable("tableContainer",
    //    "tblDynamic",
    //    "table table-responsive table-hover", varNames[2]
    //)
    var table = buildEmptyHtmlTable(contanerID,
        tableID,
        "table table-responsive table-hover table-sm compact", varNames[2]
    ).DataTable({
                buttons: ['copy', 'excel', 'pdf', 'csv', 'print'],
                "autoWidth": false,
                "iDisplayLength": 10,
                "dom": 'Bflrtip',
                "drawCallback": function (settings) {
                    var api = this.api();
                    if (api.rows().data().toArray().length > 20) {
                        // drawBarChart(api.rows().data().toArray());//usethis to get full data set
                        //THE FUNCTION DRAW drawBarChart can be found in js/barchartFromArryOfObjects

                        //drawback functions here can be used to update/redraw charts based on tbale data
                        if (drawbackFunc1 != null) {
                            drawbackFunc1(api.rows({ page: 'current' }).data().toArray());
                        }
                        if (drawbackFunc2 != null) {
                            drawbackFunc2(api.rows({ page: 'current' }).data().toArray());
                        }
                    }
                },
                ajax: {
                    type: "POST",
                    //contentType: "application/json; charset=utf-8",
                    url: 'dataService.asmx/getData',
                    data: { cols: varNames[2].toString(), table: varNames[4] },
                    dataSrc: function (json) {
                        console.log(json)
                        return JSON.parse(json)
                    }
                },
                columns: varNames[3],//  scrollY: 400,//  deferRender:    true,//  scroller: {loadingIndicator: true}
                initComplete: function () {
                    this.api().columns().every(function () {
                        var column = this;
                        if (column.data().unique().length < 50) {
                            var select = $('<select><option value=""></option></select>')
                                .appendTo($(column.footer()).empty())
                                .on('change', function () {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );

                                    column
                                        .search(val ? '^' + val + '$' : '', true, false)
                                        .draw();
                                });
                            column.data().unique().sort().each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>')
                            });
                        } else {
                            //var title = $(this).text();
                            var input = $('<input type = "text" placeholder = "Search colName"></input>')
                                .appendTo($(column.footer()).empty())
                                .on('keyup change', function () {
                                    if (column.search() !== this.value) {
                                        column
                                            .search(this.value)
                                            .draw();
                                    }
                                });
                            input;
                        }                    
                    });
                }
            });
    return table;
}