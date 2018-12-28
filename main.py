#!/usr/bin/env python
"""MAIN script for OpenET connecting to Earth Engine using App Engine."""



# Works in the local development environment and when deployed.
# If successful, shows a single web page with the SRTM DEM
# displayed in a Google Map.  See accompanying README file for
# instructions on how to set up authentication.

import config

import httplib2
import json
import logging

import ee
import flask

# Jordan's db
from sqlalchemy import create_engine

from mypython import templateMethods
from mypython import databaseMethods
from mypython import JinjaFilters

import config

# SET STATICS
httplib2.Http(timeout=180000)

# Set the flask app
app = flask.Flask(__name__)

# Set the template filters
from inspect import getmembers, isfunction
template_filters = {name: function
                for name, function in getmembers(JinjaFilters)
                if isfunction(function)}
app.jinja_env.filters.update(template_filters)

#####################################################
#   RUN APP - RUNS THE APPLICATION AND SETS WEBPAGE
####################################################


def runApp(req_args, app_name, method, db_type=None):
    # Set the database engine
    if db_type == 'TEST_SERVER':
        # Set up database
        db_string = "postgresql+psycopg2://" + config.DB_USER + ":" + config.DB_PASSWORD
        db_string += "@" + config.DB_HOST + ":" + str(config.DB_PORT) + '/' + config.DB_NAME
        db_engine = create_engine(db_string, pool_size=20, max_overflow=0)
    elif db_type == 'cloudSQL':
        db_engine = None # FIX ME: what is db engine for cloudSQL?
    else:
        db_engine = None

    try:
        tv = templateMethods.set_template_values(req_args, app_name, method, db_type,  db_engine)
    except Exception as e:
        # This will trigger a hard 500 error
        # We can't set error and load the default page
        raise
    return tv

@app.route('/', methods=['GET', 'POST'])
def home():
    '''
    defaultApplication, defines:
        - get and post responses
        - error handling
        - logging
    tv: template_variables
    '''
    # Initialize Earth Engine
    ee.Initialize(config.EE_CREDENTIALS)
    ee.data.setDeadline(180000)

    #db_type= 'TEST_SERVER' # Jordan's or DRI test db
    db_type = 'FAKE'
    app_name = 'main'
    method = flask.request.method
    if method == 'POST':
        req_args = flask.request.form
    if method == 'GET':
        req_args = flask.request.args
        if req_args:
            method =  'shareLink'

    try:
        tv = runApp(req_args, app_name, method, db_type=db_type)
    except Exception as e:
        tv = runApp(req_args, app_name, 'GET', db_type=db_type)
        tv['error'] = str(e)
    if method in ['GET', 'shareLink']:
        return flask.render_template('nasa-roses.html', **tv)
    else:
        # Ajax requests
        response = {}
        # Only pick the relevant template variables
        if ('error' in tv.keys() and tv['error']):
            response['error'] = tv['error']
        else:
            for var in config.statics['response_vars'][tv['variables']['tool_action']]:
                try:
                    response[var] = tv[var]
                except KeyError:
                    response[var] = []
        return json.dumps(response, ensure_ascii=False)


@app.route('/databaseTasks', methods=['GET'])
def databaseTasks():
    '''
    Populates DATASTORE
    FIX ME: depriciated??
    Currently we use Jordan's database and populate it standalone
    see SANDBOX/POSTGIS
    :return:
    '''
    app_name = 'databaseTask'
    ee.Initialize(config.EE_CREDENTIALS)
    ee.data.setDeadline(180000)
    req_args = flask.request.args
    tv = templateMethods.set_template_values(
        req_args, 'databaseTask', 'GET')
    tv['json_data'] = {}
    for region in ['US_states_west_500k', 'Mason', 'US_counties_west_500k']:
        for year in ['2003']:
            logging.info('PROCESSING Region/Year ' + region + '/' + year)
            for ds in ['SSEBop']:
                DU = databaseMethods.Datatstore_Util(region, year, ds)
                DU.add_to_db()
            logging.info(region + '/' + year + ' PROCESSED!')
    return flask.render_template('databaseTasks.html', **tv)

@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    logging.exception('A 404 error occurred during a request.')
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    logging.exception('A 500 error occurred during a request.')
    # return 'Sorry, unexpected error: {}'.format(e), 500
    # return flask.redirect(flask.url_for('home'))
    tv = {}
    tv = runApp({}, 'main', 'ERROR', db_type='TEST_SERVER')
    tv['error'] = str(e)
    return flask.render_template('nasa-roses.html', **tv)

if __name__ == '__main__':
    # This is used when running locally. Gunicorn is used to run the
    # application on Google App Engine. See entrypoint in app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True, use_reloader=False)