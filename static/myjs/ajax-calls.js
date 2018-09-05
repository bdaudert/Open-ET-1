function clearOut_URL() {
    var new_url = window.location.href.split('?')[0];
    //clears out the query string stuff in URL, but doesn't reload hte page
    if (history.pushState) {
        window.history.pushState({ path: new_url }, '', new_url);
    }
    return new_url;
}

function start_progressbar(msg=null, msg_sub=null) {
    //Progress Bars after Buttons are Pushed
    /*********************************
     *     DEFAULT MESSAGE            *
     *********************************/
    //default processing message
    var p_msg = 'Processing Request',
        p_msg_sub = '',
        opts = {
            dialogSize: 'sm',
            progressType: 'warning'
        };

    if (msg){
        p_msg = msg;
    }
    if (msg_sub){
        p_msg_sub = msg_sub;
    }
    waitingDialog.show(p_msg, p_msg_sub, opts);
}

function end_progressbar(){
    waitingDialog.hide();
}

function set_error(error, cause, resolution, method) {
    var generalErrorMessage = error,
        generalCauseMessage = cause,
        generalResolutionMessage = resolution;
    if (cause === ""){
        //use default message defined in dataStore
        if (js_statics.default_generalCauseMessage.hasOwnProperty(method)){
            generalCauseMessage = js_statics.default_generalCauseMessage[method];
        }
    }
    if (resolution === ""){
        //use default message defined in dataStore
        if (js_statics.default_generalResolutionMessage.hasOwnProperty(method)){
            generalResolutionMessage = js_statics.default_generalResolutionMessage[method];
        }
    }
    //Show error dialog
    $('#generalErrorMessage').html(generalErrorMessage);
    $('#generalCauseMessage').html(generalCauseMessage);
    $('#generalResolutionMessage').html(generalResolutionMessage);
    $('#generalErrorModal').modal('show');
}


function ajax_update_etdata_and_map(auto_set_region=false){
    //Only used when single year request
    var tool_action = 'update_data',
        url = clearOut_URL(),
        form_data, jqXHR,
        err_code, r, method = 'ajax', error, cause, i, tv_var;
    //Update the tool_action
    $('#tool_action').val(tool_action);
    //Get the form data
    form_data = $("#form_all").serialize();
    var msg = 'Switching region';
    start_progressbar(mgs=msg);
    jqXHR = $.ajax({
        url: url,
        method: "POST",
        timeout: 60 * 5 * 1000,
        data: form_data,

    })
    .done(function(response) {
        r = $.parseJSON(response);
        if (r.hasOwnProperty('error')) {
            error = r.error;
            set_error( error, '', '', method);
            end_progressbar();
        }
        //Set the new template variables
        for (i=0; i < statics.response_vars[tool_action].length; i++){
            tv_var = statics.response_vars[tool_action][i];
            window.DATA[tv_var] = $.parseJSON(r[tv_var]);

        }
        //Set new map layer
        LF_MAP_APP.update_mapLayer(auto_set_region=auto_set_region);
        //LF_MAP_APP.set_map_zoom_pan_listener(auto_set_region=auto_set_region);
        end_progressbar();
    })
    .fail(function(jqXHR) {
        err_code = jqXHR.status;
        error = 'Server request failed with code ' + String(err_code) + '!'
        set_error(error, '', '', method)
        end_progressbar();
    });
}

function ajax_set_featdata_on_feature_click(evt){
    //Sets feature data on map click of single feature
    var tool_action = 'get_feat_data',
        url = clearOut_URL(),
        form_data, jqXHR, f_idx,
        err_code, r, method = 'ajax', error, cause, i, tv_var;
    //Update the tool_action
    $('#tool_action').val(tool_action);
    //Get the form data
    form_data = $("#form_all").serialize();
    var msg = 'Obtaining feature data';
    start_progressbar(mgs=msg);
    jqXHR = $.ajax({
        url: url,
        method: "POST",
        timeout: 60 * 5 * 1000,
        data: form_data,

    })
    .done(function(response) {
        var r = $.parseJSON(response),
            feat_idx_list, feat_idx, year, html = '';
        if (r.hasOwnProperty('error')) {
            error = r.error;
            set_error( error, '', '', method);
            end_progressbar();
        }
        //Set the new template variables
        for (i=0; i < statics.response_vars[tool_action].length; i++){
            tv_var = statics.response_vars[tool_action][i];
            //FIX ME, not sure why featsdata do not need to be json parsed
            if (tv_var.is_in(['featsdata', 'featsgeomdata'])) {
                window.DATA[tv_var] = r[tv_var];
            }
            else{
                window.DATA[tv_var] = $.parseJSON(r[tv_var]);
            }
        }
        year = $('#years').val()[0];
        feat_idx_list = get_feat_index_from_featdata(year);
        if (feat_idx_list.length != 0){
            html += MAP_APP.set_dataModalHeader();
            html += LF_MAP_APP.set_popup_data(r['featsdata'], r['featsgeomdata']);
        }
        window.popup_html = html;
        end_progressbar();
    }) // successfully got JSON response
    .fail(function(jqXHR) {
        err_code = jqXHR.status;
        error = 'Server request failed with code ' + String(err_code) + '!'
        set_error(error, '', '', method)
        end_progressbar();
    });
}


function ajax_set_featdata_on_dragbox(selectedFeatures){
    //Sets feature data on map click single eature
    var tool_action = 'get_feat_data',
        url = clearOut_URL(),
        form_data, jqXHR, f_idx,
        err_code, r, method = 'ajax', error, cause, i, tv_var,
        popup_content = document.getElementById('popup-content');
    //Update the tool_action
    $('#tool_action').val(tool_action);
    //Get the form data
    form_data = $("#form_all").serialize();
    var msg = 'Obtaining feature data';
    start_progressbar(mgs=msg);
    jqXHR = $.ajax({
        url: url,
        method: "POST",
        timeout: 60 * 5 * 1000,
        data: form_data,

    })
    .done(function(response) {
        var r = $.parseJSON(response),
            feat_idx_list, feat_idx, year, html = '';
        if (r.hasOwnProperty('error')) {
            error = r.error;
            set_error( error, '', '', method);
            end_progressbar();
        }
        //Set the new template variables
        for (i=0; i < statics.response_vars[tool_action].length; i++){
            tv_var = statics.response_vars[tool_action][i];
            //FIX ME, not sure why featsdata do not need to be json parsed
            if (tv_var.is_in(['featsdata', 'featsgeomdata'])) {
                window.DATA[tv_var] = r[tv_var];
            }
            else{
                window.DATA[tv_var] = $.parseJSON(r[tv_var]);
            }
        }
        year = $('#years').val()[0];
        feat_idx_list = $('#feat_indices').val().replace(', ', ',').split(',');
        if (feat_idx_list.length != 0){
            // Set the popup data
            html += MAP_APP.set_dataModalHeader();
            html += LF_MAP_APP.set_popup_data(r['featsdata'], r['featsgeomdata']);
            // Show the popup
            popup_content.innerHTML = html;
            var feats = selectedFeatures.getArray(),
                coordinate = feats[0].getGeometry().getCoordinates()[0];
            while (coordinate.length != 2){
                coordinate = coordinate[0]
            }
            window.popup_layer.setPosition(coordinate);
        }
        end_progressbar();
    }) // successfully got JSON response
    .fail(function(jqXHR) {
        err_code = jqXHR.status;
        error = 'Server request failed with code ' + String(err_code) + '!'
        set_error(error, '', '', method)
        end_progressbar();
    });
}
