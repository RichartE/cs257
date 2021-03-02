'''
    astronaut_webapp
    Etienne Richart
'''
import sys
import flask
import json
import config
import psycopg2

api = flask.Blueprint('api', __name__)

def get_connection():
    ''' Returns a connection to the database described in the
        config module. May raise an exception as described in the
        documentation for psycopg2.connect. '''
    return psycopg2.connect(database=config.database,
                            user=config.user,
                            password=config.password)


########### The API endpoints ###########
@api.route('/help/')
def get_help():
    '''API Documentation'''
    with open('./doc/api-design.txt', 'r') as helpfile:
        return helpfile.read()

@api.route('/features/')
def get_features():
    '''An JSON list of dictionaries, each which represent a column in a table.'''
    query = '''SELECT column_name, data_type, table_name
                FROM information_schema.columns
                WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
                ORDER BY table_name, ordinal_position;'''
    feature_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            feature = {'name':row[0],
                      'type':row[1],
                      'table':row[2]}
            if feature['name'] == 'nationality':
                feature['type'] = 'text'
            feature_list.append(feature)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(feature_list)

@api.route('/astronauts/raw/') 
def get_astronauts():
    ''' Returns a list of all the astronauts in the database'''
    query = '''SELECT * FROM astronauts;'''

    features = flask.request.args.get('features', '*')
    print(features)
    select = []
    if 'id' in features:
        select.append('id')
    if 'english_name' in features:
        select.append('english_name')
    if 'original_name' in features:
        select.append('original_name')
    if 'nwnumber' in features:
        select.append('nwnumber')
    if 'sex' in features:
        select.append('sex')
    if 'yob' in features:
        select.append('yob')
    if 'nationality' in features:
        select.append('nationality')
    if 'mil_civ' in features:
        select.append('mil_civ')
    if 'yos' in features:
        select.append('yos')
    if 'total_missions' in features:
        select.append('total_missions')
    if 'total_mission_hours' in features:
        select.append('total_mission_hours')
    if 'total_eva_hours' in features:
        select.append('total_eva_hours')
    if len(select) == 0:
        select = '*'
    else:
        select = ', '.join(select)  
    
    query = 'SELECT ' + select + ' FROM astronauts;'

    astronaut_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            astronaut = {'id':row[0],
                      'english_name':row[1], 'original_name':row[2],
                      'nwnumber':row[3], 'sex':row[4], 'yob':row[5],
                      'nationality':row[6], 'mil_civ':row[7], 'yos':row[8], 
                      'total_missions':row[9], 'total_mission_hours':str(row[10]), 
                      'total_eva_hours':str(row[11])}
            astronaut_list.append(astronaut)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(astronaut_list)

@api.route('/astronauts/list/') 
def get_astronauts_list_raw():
    ''' Returns a list of all the astronauts in the database sorter by name'''
    query = '''SELECT astronauts.english_name, astronauts.yos, nationality.nation, nationality.code FROM astronauts, nationality WHERE astronauts.nationality = nationality.id ORDER BY '''

    features = flask.request.args.get('order', 'name')
    if 'year' in features:
        query += 'astronauts.yos;'
    else:
        query += 'astronauts.english_name;'
    
    astronaut_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            astronaut = {'english_name':row[0], 'yos':row[1],
                      'nationality':row[2], 'country_code':row[3]}
            astronaut_list.append(astronaut)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(astronaut_list)

@api.route('/missions/raw/') 
def get_missions():
    ''' Returns a list of all the missions in the database'''
    query = '''SELECT * FROM missions;'''

    features = flask.request.args.get('features', None)
    if features is not None:
        pass
    
    mission_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            mission = {'id':str(row[0]),
                      'title':row[1], 'mission_year':row[2],
                      'ascent':row[3], 'orbit':row[4], 'decent':row[5],
                      'duration':str(row[6]), 'combined_eva':str(row[7]), 
                      'composition':row[8]}
            mission_list.append(mission)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)

    return json.dumps(mission_list)

@api.route('/missions/list/') 
def get_missions_list_raw():
    ''' Returns a list of all the astronauts in the database sorter by name'''
    query = '''SELECT title, mission_year FROM missions ORDER BY '''

    features = flask.request.args.get('order', 'name')
    if 'year' in features:
        query += 'mission_year;'
    else:
        query += 'title;'
    
    mission_list = []
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute(query)
        for row in cursor:
            mission = {'title':row[0], 'year':row[1]}
            mission_list.append(mission)
        cursor.close()
        connection.close()
    except Exception as e:
        print(e, file=sys.stderr)
    return json.dumps(mission_list)



